*&---------------------------------------------------------------------*
*& ZCL_ZAJMN_GOALS_DPC_EXT: redefinitions for service ZAJMN_GOALS_SRV
*& NOT RUN against a system. A starting point for the ABAP developer:
*& check the names against the generated MPC, and add error handling.
*&---------------------------------------------------------------------*
CLASS zcl_zajmn_goals_dpc_ext DEFINITION PUBLIC INHERITING FROM zcl_zajmn_goals_dpc CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~create_deep_entity REDEFINITION.
  PROTECTED SECTION.
    METHODS goals_get_entityset REDEFINITION.
    METHODS goals_get_entity REDEFINITION.
    METHODS workflowlog_get_entityset REDEFINITION.
    METHODS attachments_create_stream REDEFINITION.
    METHODS attachments_get_stream REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~execute_action REDEFINITION.
  PRIVATE SECTION.
    METHODS next_id IMPORTING iv_object TYPE nrobj RETURNING VALUE(rv_id) TYPE numc10.
    METHODS may_see IMPORTING iv_pernr TYPE pernr_d RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS may_change IMPORTING iv_pernr TYPE pernr_d RETURNING VALUE(rv_ok) TYPE abap_bool.
ENDCLASS.

CLASS zcl_zajmn_goals_dpc_ext IMPLEMENTATION.

  METHOD next_id.
    CALL FUNCTION 'NUMBER_GET_NEXT'
      EXPORTING nr_range_nr = '01' object = iv_object
      IMPORTING number = rv_id
      EXCEPTIONS OTHERS = 1.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'No number could be drawn'.
    ENDIF.
  ENDMETHOD.

  " Who may see a person's goals: the person, their manager chain and HR (structural authorization on org structure).
  METHOD may_see.
    " 1. own goals: always
    IF iv_pernr = zcl_zajmn_util=>pernr_of_user( sy-uname ).
      rv_ok = abap_true. RETURN.
    ENDIF.
    " 2. everyone else: authority check on the employee through the HR master data authorization, read access
    AUTHORITY-CHECK OBJECT 'P_ORGIN' ID 'INFTY' FIELD '0001' ID 'SUBTY' DUMMY ID 'AUTHC' FIELD 'R' ID 'PERSA' DUMMY ID 'PERSG' DUMMY ID 'PERSK' DUMMY ID 'VDSK1' DUMMY.
    rv_ok = xsdbool( sy-subrc = 0 ).
    " For managers use the structural check (RH_*): see 03_authorizations.md.
  ENDMETHOD.

  METHOD may_change.
    IF iv_pernr = zcl_zajmn_util=>pernr_of_user( sy-uname ).
      rv_ok = abap_true. RETURN.
    ENDIF.
    AUTHORITY-CHECK OBJECT 'Z_AJMN_GOAL' ID 'ACTVT' FIELD '02'.
    rv_ok = xsdbool( sy-subrc = 0 ).
  ENDMETHOD.

  METHOD goals_get_entityset.
    SELECT * FROM zajmn_goal WHERE deleted_at = 0 INTO TABLE @DATA(lt_goal) ORDER BY goal_id.
    LOOP AT lt_goal INTO DATA(ls_goal).
      CHECK may_see( ls_goal-pernr ) = abap_true.
      APPEND CORRESPONDING #( ls_goal MAPPING goal_id = goal_id ) TO et_entityset.
    ENDLOOP.
    " $expand is handled by the framework through GET_EXPANDED_ENTITYSET: implement it the same way for Activities, Pushes, Contributors and Log.
  ENDMETHOD.

  METHOD goals_get_entity.
    DATA(lv_id) = CONV numc10( it_key_tab[ name = 'GoalId' ]-value ).
    SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_id INTO @DATA(ls_goal).
    IF sy-subrc <> 0 OR may_see( ls_goal-pernr ) = abap_false.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.
    MOVE-CORRESPONDING ls_goal TO er_entity.
  ENDMETHOD.

  " POST /Goals = save the whole goal: upsert by GoalId, one lock, one commit.
  METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
    TYPES: BEGIN OF ty_deep.
             INCLUDE TYPE zcl_zajmn_goals_mpc=>ts_goal.
    TYPES:   activities TYPE STANDARD TABLE OF zcl_zajmn_goals_mpc=>ts_activity WITH DEFAULT KEY,
             pushes TYPE STANDARD TABLE OF zcl_zajmn_goals_mpc=>ts_push WITH DEFAULT KEY,
             contributors TYPE STANDARD TABLE OF zcl_zajmn_goals_mpc=>ts_contributor WITH DEFAULT KEY,
             log TYPE STANDARD TABLE OF zcl_zajmn_goals_mpc=>ts_logentry WITH DEFAULT KEY,
           END OF ty_deep.
    DATA ls_in TYPE ty_deep.
    io_data_provider->read_entry_data( IMPORTING es_data = ls_in ).
    DATA(lv_id) = CONV numc10( ls_in-goalid ).
    SELECT SINGLE goal_id FROM zajmn_goal WHERE goal_id = @lv_id AND deleted_at <> 0 INTO @DATA(lv_gone).
    IF sy-subrc = 0.   " deleted: a stale page must not bring it back
      copy_data_to_ref( EXPORTING is_data = ls_in CHANGING cr_data = er_deep_entity ). RETURN.
    ENDIF.

    CALL FUNCTION 'ENQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id EXCEPTIONS foreign_lock = 1 OTHERS = 2.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'Someone else is saving this goal. Try again.'.
    ENDIF.

    SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_id INTO @DATA(ls_old).
    IF sy-subrc = 0.
      " Optimistic locking: the page sends nothing back for changed_at in this version. Add the ETag check here (If-Match) before going live.
      IF may_change( ls_old-pernr ) = abap_false.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'You may not change this goal'.
      ENDIF.
    ELSEIF may_see( CONV #( ls_in-pernr ) ) = abap_false.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'You may not create goals for this person'.
    ENDIF.

    GET TIME STAMP FIELD DATA(lv_now).
    DATA(ls_goal) = VALUE zajmn_goal( goal_id = lv_id pernr = ls_in-pernr title = ls_in-title description = ls_in-description measure = ls_in-measure
      progress = ls_in-progress weight = ls_in-weight status = ls_in-status status_text = ls_in-statustext extra = ls_in-extra
      changed_by = sy-uname changed_at = lv_now ).
    ls_goal-created_by = COND #( WHEN ls_old IS INITIAL THEN sy-uname ELSE ls_old-created_by ).
    ls_goal-created_at = COND #( WHEN ls_old IS INITIAL THEN lv_now ELSE ls_old-created_at ).
    " DueText is a display string such as '31 December 2027'. Convert it with CONVERT_DATE_TO_INTERNAL or send a DATS field from a later version of the page.
    MODIFY zajmn_goal FROM ls_goal.

    " children: replace the set (activities keep the ids the page sends)
    DELETE FROM zajmn_act   WHERE goal_id = lv_id.
    DELETE FROM zajmn_push  WHERE goal_id = lv_id.
    DELETE FROM zajmn_contr WHERE goal_id = lv_id.
    INSERT zajmn_act   FROM TABLE @( VALUE #( FOR a IN ls_in-activities ( goal_id = lv_id act_id = a-actid pernr = ls_in-pernr progress = a-progress note = a-note has_note = a-hasnote position = a-position ) ) ).
    INSERT zajmn_push  FROM TABLE @( VALUE #( FOR p IN ls_in-pushes ( goal_id = lv_id to_pernr = p-topernr progress = p-progress note = p-note position = p-position ) ) ).
    INSERT zajmn_contr FROM TABLE @( VALUE #( FOR c IN ls_in-contributors ( goal_id = lv_id contr_id = next_id( 'ZAJMN_CONTR' ) position = c-position pernr = c-pernr ) ) ).

    " the workflow log is append-only: add only the entries that are not there yet (same goal, position, occurred_at)
    SELECT log_id, occurred_at FROM zajmn_log WHERE goal_id = @lv_id INTO TABLE @DATA(lt_have).
    LOOP AT ls_in-log INTO DATA(ls_log).
      CHECK NOT line_exists( lt_have[ occurred_at = ls_log-occurredat ] ).
      INSERT zajmn_log FROM @( VALUE #( log_id = next_id( 'ZAJMN_LOG' ) goal_id = lv_id actor_pernr = ls_log-actorpernr action = ls_log-action
        text = ls_log-text detail = ls_log-detail occurred_at = ls_log-occurredat ) ).
    ENDLOOP.

    CALL FUNCTION 'DEQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id.
    COMMIT WORK.
    copy_data_to_ref( EXPORTING is_data = ls_in CHANGING cr_data = er_deep_entity ).
  ENDMETHOD.

  METHOD workflowlog_get_entityset.
    SELECT l~log_id, l~goal_id, g~title AS goal_title, l~actor_pernr, l~action, l~text, l~occurred_at
      FROM zajmn_log AS l INNER JOIN zajmn_goal AS g ON g~goal_id = l~goal_id
      ORDER BY l~occurred_at DESCENDING INTO CORRESPONDING FIELDS OF TABLE @et_entityset UP TO 400 ROWS.
    " ActorName: read PA0002 (VORNA, NACHN) for each distinct ACTOR_PERNR.
  ENDMETHOD.

  METHOD attachments_create_stream.
    CONSTANTS lc_max TYPE i VALUE 10485760.
    IF xstrlen( is_media_resource-value ) > lc_max.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'That file is over 10 MB'.
    ENDIF.
    DATA(lv_id) = next_id( 'ZAJMN_ATT' ).
    INSERT zajmn_att FROM @( VALUE #( att_id = lv_id file_name = cl_http_utility=>unescape_url( iv_slug ) file_size = xstrlen( is_media_resource-value )
      mimetype = is_media_resource-mime_type content = is_media_resource-value uploaded_by = sy-uname ) ).
    COMMIT WORK.
    " return AttId, FileName, FileSize to the page
  ENDMETHOD.

  METHOD attachments_get_stream.
    " read ZAJMN_ATT, check may_see of the goal's owner, return content with Content-Disposition and the stored mime type
  ENDMETHOD.

  " function import GetIds
  METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.
    IF iv_action_name = 'DeleteGoal'.
      DATA(lv_gid) = CONV numc10( it_parameter[ name = 'GoalId' ]-value ).
      DATA(lv_why) = CONV string( it_parameter[ name = 'Reason' ]-value ).
      SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_gid AND deleted_at = 0 INTO @DATA(ls_del).
      IF sy-subrc = 0.
        IF may_change( ls_del-pernr ) = abap_false.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = 'You may not delete this goal'.
        ENDIF.
        GET TIME STAMP FIELD DATA(lv_ts).
        UPDATE zajmn_goal SET deleted_at = @lv_ts, deleted_by = @sy-uname WHERE goal_id = @lv_gid.
        INSERT zajmn_log FROM @( VALUE #( log_id = next_id( 'ZAJMN_LOG' ) goal_id = lv_gid actor_pernr = zcl_zajmn_util=>pernr_of_user( sy-uname )
          action = 'goal_deleted' text = COND #( WHEN lv_why IS INITIAL THEN `Goal deleted` ELSE lv_why ) occurred_at = lv_ts ) ).
        COMMIT WORK.
      ENDIF.
      RETURN.
    ENDIF.
    IF iv_action_name = 'GetIds'.
      DATA(lv_count) = CONV i( it_parameter[ name = 'count' ]-value ).
      lv_count = nmin( val1 = lv_count val2 = 200 ).
      DATA lt_ids TYPE STANDARD TABLE OF string WITH EMPTY KEY.
      DO lv_count TIMES. APPEND |{ next_id( 'ZAJMN_GOAL' ) ALPHA = OUT }| TO lt_ids. ENDDO.
      copy_data_to_ref( EXPORTING is_data = VALUE zcl_zajmn_goals_mpc=>tt_idlist( FOR i IN lt_ids ( id = i ) ) CHANGING cr_data = er_data ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
