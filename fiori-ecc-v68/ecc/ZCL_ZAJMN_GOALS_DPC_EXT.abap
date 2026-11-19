*&---------------------------------------------------------------------*
*& ZCL_ZAJMN_GOALS_DPC_EXT: the service ZAJMN_GOALS_SRV (ecc/02) on the tables of ecc/01.
*& Every operation the page uses is implemented here; developer/mock-gateway.mjs does the same
*& in JavaScript and is what the page was tested against. ABAP 7.40 SP08 or later.
*& Written without a system: activate in SE24 and fix what the syntax check reports.
*& Type names zcl_zajmn_goals_mpc=>ts_* / tt_* are the ones SEGW generates for the entity types of ecc/02.
*&---------------------------------------------------------------------*
CLASS zcl_zajmn_goals_dpc_ext DEFINITION PUBLIC INHERITING FROM zcl_zajmn_goals_dpc CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~create_deep_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~execute_action REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~create_stream REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~get_stream REDEFINITION.
  PROTECTED SECTION.
    METHODS goals_get_entityset REDEFINITION.
    METHODS goals_get_entity REDEFINITION.
    METHODS activities_get_entityset REDEFINITION.
    METHODS pushes_get_entityset REDEFINITION.
    METHODS contributors_get_entityset REDEFINITION.
    METHODS logentries_get_entityset REDEFINITION.
    METHODS workflowlog_get_entityset REDEFINITION.
    METHODS airequests_create_entity REDEFINITION.
  PRIVATE SECTION.
    TYPES: BEGIN OF ty_deep.
             INCLUDE TYPE zcl_zajmn_goals_mpc=>ts_goal.
    TYPES:   activities   TYPE zcl_zajmn_goals_mpc=>tt_activity,
             pushes       TYPE zcl_zajmn_goals_mpc=>tt_push,
             contributors TYPE zcl_zajmn_goals_mpc=>tt_contributor,
             log          TYPE zcl_zajmn_goals_mpc=>tt_logentry,
           END OF ty_deep.
    "! the part of a contributor's JSON the table keeps for reporting
    TYPES: BEGIN OF ty_contr_json,
             status TYPE string,
             my_id  TYPE string,
           END OF ty_contr_json,
           BEGIN OF ty_file,
             id   TYPE string,
             name TYPE string,
           END OF ty_file,
           tt_file TYPE STANDARD TABLE OF ty_file WITH EMPTY KEY.
    DATA mv_me TYPE pernr_d.
    METHODS me RETURNING VALUE(rv_pernr) TYPE pernr_d.
    METHODS fail IMPORTING iv_text TYPE csequence RAISING /iwbep/cx_mgw_busi_exception.
    METHODS next_id IMPORTING iv_object TYPE nrobj RETURNING VALUE(rv_id) TYPE char12 RAISING /iwbep/cx_mgw_busi_exception.
    METHODS is_hr RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS is_contributor IMPORTING iv_goal TYPE numc10 RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS is_pushed_to   IMPORTING iv_goal TYPE numc10 RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS may_see IMPORTING iv_owner TYPE pernr_d iv_goal TYPE numc10 RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS may_change IMPORTING iv_owner TYPE pernr_d iv_goal TYPE numc10 RETURNING VALUE(rv_ok) TYPE abap_bool.
    METHODS goal_key IMPORTING it_key_tab TYPE /iwbep/t_mgw_name_value_pair RETURNING VALUE(rv_id) TYPE numc10.
    METHODS check_goal IMPORTING iv_goal TYPE numc10 RAISING /iwbep/cx_mgw_busi_exception.
    METHODS param IMPORTING it_parameter TYPE /iwbep/t_mgw_name_value_pair iv_name TYPE string RETURNING VALUE(rv_value) TYPE string.
ENDCLASS.

CLASS zcl_zajmn_goals_dpc_ext IMPLEMENTATION.

  " ---------------------------------------------------------------- helpers
  METHOD me.
    IF mv_me IS INITIAL.
      mv_me = zcl_zajmn_util=>pernr_of_user( ).
    ENDIF.
    rv_pernr = mv_me.
  ENDMETHOD.

  METHOD fail.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING textid = /iwbep/cx_mgw_busi_exception=>business_error message_unlimited = CONV #( iv_text ).
  ENDMETHOD.

  METHOD next_id.
    DATA lv_num TYPE char20.
    CALL FUNCTION 'NUMBER_GET_NEXT'
      EXPORTING nr_range_nr = '01' object = iv_object
      IMPORTING number = lv_num
      EXCEPTIONS OTHERS = 1.
    IF sy-subrc <> 0.
      fail( |No number could be drawn from { iv_object }| ).
    ENDIF.
    rv_id = condense( lv_num ).
  ENDMETHOD.

  METHOD is_hr.
    AUTHORITY-CHECK OBJECT 'Z_AJMN_GOAL' ID 'ACTVT' FIELD '03' ID 'ZAJMNROLE' FIELD 'HR'.
    rv_ok = xsdbool( sy-subrc = 0 ).
  ENDMETHOD.

  METHOD is_contributor.
    DATA(lv_me) = me( ).
    SELECT COUNT(*) FROM zajmn_contr WHERE goal_id = @iv_goal AND pernr = @lv_me.
    rv_ok = xsdbool( sy-dbcnt > 0 ).
  ENDMETHOD.

  " v68: a person a goal was pushed to may save that goal, only so that deleting their own copy can remove their row from it.
  METHOD is_pushed_to.
    DATA(lv_me) = me( ).
    SELECT COUNT(*) FROM zajmn_push WHERE goal_id = @iv_goal AND to_pernr = @lv_me.
    rv_ok = xsdbool( sy-dbcnt > 0 ).
  ENDMETHOD.

  " See: own goals, goals of people below you or above you in the reporting line, goals you are invited to, and HR.
  METHOD may_see.
    rv_ok = xsdbool( iv_owner = me( )
                  OR zcl_zajmn_util=>is_above( iv_upper = me( ) iv_lower = iv_owner )
                  OR zcl_zajmn_util=>is_above( iv_upper = iv_owner iv_lower = me( ) )
                  OR is_contributor( iv_goal )
                  OR is_hr( ) ).
  ENDMETHOD.

  " Change: your own goals; goals of people below you (push down, review); a goal you are invited to (accept, decline).
  METHOD may_change.
    rv_ok = xsdbool( iv_owner = me( )
                  OR zcl_zajmn_util=>is_above( iv_upper = me( ) iv_lower = iv_owner )
                  OR is_contributor( iv_goal )
                  OR is_pushed_to( iv_goal ) ).
  ENDMETHOD.

  METHOD goal_key.
    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'GoalId'.
    IF sy-subrc = 0.
      rv_id = |{ ls_key-value ALPHA = IN }|.
    ENDIF.
  ENDMETHOD.

  METHOD check_goal.
    SELECT SINGLE pernr FROM zajmn_goal WHERE goal_id = @iv_goal AND deleted_at = 0 INTO @DATA(lv_owner).
    IF sy-subrc <> 0 OR may_see( iv_owner = lv_owner iv_goal = iv_goal ) = abap_false.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.
  ENDMETHOD.

  METHOD param.
    READ TABLE it_parameter INTO DATA(ls_p) WITH KEY name = iv_name.
    IF sy-subrc = 0.
      rv_value = ls_p-value.
    ENDIF.
  ENDMETHOD.

  " ---------------------------------------------------------------- reads
  METHOD goals_get_entityset.
    SELECT * FROM zajmn_goal WHERE deleted_at = 0 ORDER BY goal_id DESCENDING INTO TABLE @DATA(lt_goal).
    LOOP AT lt_goal INTO DATA(ls_goal).
      CHECK may_see( iv_owner = ls_goal-pernr iv_goal = ls_goal-goal_id ) = abap_true.
      APPEND VALUE #( goal_id = |{ ls_goal-goal_id ALPHA = OUT }| pernr = ls_goal-pernr title = ls_goal-title
                      description = ls_goal-description measure = ls_goal-measure due_text = ls_goal-due_text
                      weight = ls_goal-weight progress = ls_goal-progress status = ls_goal-status status_text = ls_goal-status_text
                      parent_title = ls_goal-parent_title
                      pushed_from_goal = COND #( WHEN ls_goal-pushed_from_goal IS NOT INITIAL THEN |{ ls_goal-pushed_from_goal ALPHA = OUT }| )
                      pushed_from_pernr = ls_goal-pushed_from_pernr extra = ls_goal-extra ) TO et_entityset.
    ENDLOOP.
    " $expand=Activities,Pushes,Contributors,Log: the framework calls the child methods below for each goal.
    " For many goals redefine GET_EXPANDED_ENTITYSET later and read the children in one SELECT each.
  ENDMETHOD.

  METHOD goals_get_entity.
    DATA(lv_id) = goal_key( it_key_tab ).
    check_goal( lv_id ).
    SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_id INTO @DATA(ls_goal).
    er_entity = VALUE #( goal_id = |{ ls_goal-goal_id ALPHA = OUT }| pernr = ls_goal-pernr title = ls_goal-title
                         description = ls_goal-description measure = ls_goal-measure due_text = ls_goal-due_text
                         weight = ls_goal-weight progress = ls_goal-progress status = ls_goal-status status_text = ls_goal-status_text
                         parent_title = ls_goal-parent_title
                         pushed_from_goal = COND #( WHEN ls_goal-pushed_from_goal IS NOT INITIAL THEN |{ ls_goal-pushed_from_goal ALPHA = OUT }| )
                         pushed_from_pernr = ls_goal-pushed_from_pernr extra = ls_goal-extra ).
  ENDMETHOD.

  " Children are read through navigation from a goal: it_key_tab holds the goal's GoalId.
  METHOD activities_get_entityset.
    DATA(lv_id) = goal_key( it_key_tab ).
    CHECK lv_id IS NOT INITIAL.
    check_goal( lv_id ).
    SELECT * FROM zajmn_act WHERE goal_id = @lv_id ORDER BY position INTO TABLE @DATA(lt_act).
    et_entityset = VALUE #( FOR a IN lt_act ( goal_id = |{ a-goal_id ALPHA = OUT }| act_id = |{ a-act_id ALPHA = OUT }|
      progress = a-progress note = a-note has_note = a-has_note done_text = a-done_text position = a-position files = a-files ) ).
  ENDMETHOD.

  METHOD pushes_get_entityset.
    DATA(lv_id) = goal_key( it_key_tab ).
    CHECK lv_id IS NOT INITIAL.
    check_goal( lv_id ).
    SELECT * FROM zajmn_push WHERE goal_id = @lv_id ORDER BY position INTO TABLE @DATA(lt_push).
    et_entityset = VALUE #( FOR p IN lt_push ( goal_id = |{ p-goal_id ALPHA = OUT }| to_pernr = p-to_pernr progress = p-progress
      note = p-note due_text = p-due_text updated_text = p-updated_text position = p-position ) ).
  ENDMETHOD.

  METHOD contributors_get_entityset.
    DATA(lv_id) = goal_key( it_key_tab ).
    CHECK lv_id IS NOT INITIAL.
    check_goal( lv_id ).
    SELECT * FROM zajmn_contr WHERE goal_id = @lv_id ORDER BY position INTO TABLE @DATA(lt_contr).
    et_entityset = VALUE #( FOR c IN lt_contr ( goal_id = |{ c-goal_id ALPHA = OUT }| position = c-position pernr = c-pernr data = c-data ) ).
  ENDMETHOD.

  METHOD logentries_get_entityset.
    DATA(lv_id) = goal_key( it_key_tab ).
    CHECK lv_id IS NOT INITIAL.
    check_goal( lv_id ).
    " newest first: position 0 is the newest step, as on the page
    SELECT * FROM zajmn_log WHERE goal_id = @lv_id ORDER BY occurred_at DESCENDING, log_id DESCENDING INTO TABLE @DATA(lt_log).
    LOOP AT lt_log INTO DATA(ls_log).
      APPEND VALUE #( goal_id = |{ ls_log-goal_id ALPHA = OUT }| position = sy-tabix - 1 actor_pernr = ls_log-actor_pernr
        action = ls_log-action text = ls_log-text date_text = ls_log-date_text detail = ls_log-detail
        occurred_at = COND #( WHEN ls_log-client_ts IS NOT INITIAL THEN ls_log-client_ts ELSE zcl_zajmn_util=>ts_to_iso( ls_log-occurred_at ) ) )
        TO et_entityset.
    ENDLOOP.
  ENDMETHOD.

  METHOD workflowlog_get_entityset.
    DATA(lv_top) = COND i( WHEN is_paging-top > 0 THEN is_paging-top ELSE 400 ).
    SELECT l~log_id, l~goal_id, g~title, g~pernr AS owner, l~actor_pernr, l~action, l~text, l~client_ts, l~occurred_at
      FROM zajmn_log AS l INNER JOIN zajmn_goal AS g ON g~goal_id = l~goal_id
      ORDER BY l~occurred_at DESCENDING, l~log_id DESCENDING
      INTO TABLE @DATA(lt_rows) UP TO 2000 ROWS.
    DATA(lv_all) = is_hr( ).
    LOOP AT lt_rows INTO DATA(ls_r).
      " HR reads everything; everyone else the steps of goals they may see
      CHECK lv_all = abap_true OR may_see( iv_owner = ls_r-owner iv_goal = ls_r-goal_id ) = abap_true.
      APPEND VALUE #( log_id = |{ ls_r-log_id ALPHA = OUT }| goal_id = |{ ls_r-goal_id ALPHA = OUT }| goal_title = ls_r-title
        actor_pernr = ls_r-actor_pernr actor_name = zcl_zajmn_util=>name_of( ls_r-actor_pernr )
        action = ls_r-action text = ls_r-text
        occurred_at = COND #( WHEN ls_r-client_ts IS NOT INITIAL THEN ls_r-client_ts ELSE zcl_zajmn_util=>ts_to_iso( ls_r-occurred_at ) ) )
        TO et_entityset.
      IF lines( et_entityset ) >= lv_top.
        EXIT.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  " ---------------------------------------------------------------- save: POST /Goals (deep, upsert)
  METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
    IF iv_entity_set_name <> 'Goals'.
      fail( |Deep insert is only offered for Goals| ).
    ENDIF.
    DATA ls_in TYPE ty_deep.
    io_data_provider->read_entry_data( IMPORTING es_data = ls_in ).
    DATA(lv_id) = CONV numc10( |{ ls_in-goal_id ALPHA = IN }| ).
    IF lv_id IS INITIAL OR ls_in-pernr IS INITIAL.
      fail( |A goal needs GoalId and Pernr| ).
    ENDIF.

    CALL FUNCTION 'ENQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id EXCEPTIONS foreign_lock = 1 OTHERS = 2.
    IF sy-subrc <> 0.
      fail( |Someone else is saving this goal. Try again.| ).
    ENDIF.

    SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_id INTO @DATA(ls_old).
    DATA(lv_exists) = xsdbool( sy-subrc = 0 ).
    IF lv_exists = abap_true AND ls_old-deleted_at <> 0.
      " a deleted goal stays deleted: a page that has not reloaded yet must not bring it back
      CALL FUNCTION 'DEQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id.
      copy_data_to_ref( EXPORTING is_data = ls_in CHANGING cr_data = er_deep_entity ).
      RETURN.
    ENDIF.
    DATA(lv_owner) = COND pernr_d( WHEN lv_exists = abap_true THEN ls_old-pernr ELSE ls_in-pernr ).
    IF may_change( iv_owner = lv_owner iv_goal = lv_id ) = abap_false.
      CALL FUNCTION 'DEQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id.
      fail( |You may not change this goal| ).
    ENDIF.

    GET TIME STAMP FIELD DATA(lv_now).
    DATA(ls_goal) = VALUE zajmn_goal(
      goal_id = lv_id pernr = lv_owner title = ls_in-title description = ls_in-description measure = ls_in-measure
      due_text = ls_in-due_text due_date = zcl_zajmn_util=>text_to_dats( ls_in-due_text )
      weight = COND #( WHEN ls_in-weight < 0 OR ls_in-weight > 100 THEN -1 ELSE ls_in-weight )
      progress = nmax( val1 = 0 val2 = nmin( val1 = 100 val2 = ls_in-progress ) )
      status = ls_in-status status_text = ls_in-status_text parent_title = ls_in-parent_title
      pushed_from_goal = |{ ls_in-pushed_from_goal ALPHA = IN }| pushed_from_pernr = ls_in-pushed_from_pernr extra = ls_in-extra
      created_by = COND #( WHEN lv_exists = abap_true THEN ls_old-created_by ELSE sy-uname )
      created_at = COND #( WHEN lv_exists = abap_true THEN ls_old-created_at ELSE lv_now )
      changed_by = sy-uname changed_at = lv_now ).
    MODIFY zajmn_goal FROM @ls_goal.

    " children: the page sends the full set, so replace it
    DELETE FROM zajmn_act   WHERE goal_id = @lv_id.
    DELETE FROM zajmn_push  WHERE goal_id = @lv_id.
    DELETE FROM zajmn_contr WHERE goal_id = @lv_id.
    DATA lt_act TYPE STANDARD TABLE OF zajmn_act WITH EMPTY KEY.
    lt_act = VALUE #( FOR a IN ls_in-activities ( goal_id = lv_id act_id = |{ a-act_id ALPHA = IN }| pernr = lv_owner
      progress = a-progress note = a-note has_note = a-has_note done_text = a-done_text
      done_on = zcl_zajmn_util=>text_to_dats( a-done_text ) files = a-files position = a-position ) ).
    INSERT zajmn_act FROM TABLE @lt_act.
    " the files listed on the activities belong to this goal (used by the download check)
    LOOP AT ls_in-activities INTO DATA(ls_a).
      DATA lt_files TYPE tt_file.
      CLEAR lt_files.
      /ui2/cl_json=>deserialize( EXPORTING json = ls_a-files CHANGING data = lt_files ).
      LOOP AT lt_files INTO DATA(ls_f) WHERE id CO '0123456789' AND id IS NOT INITIAL.
        DATA(lv_att) = CONV numc10( |{ ls_f-id ALPHA = IN }| ).
        UPDATE zajmn_att SET goal_id = @lv_id WHERE att_id = @lv_att.
      ENDLOOP.
    ENDLOOP.
    DATA lt_push TYPE STANDARD TABLE OF zajmn_push WITH EMPTY KEY.
    lt_push = VALUE #( FOR p IN ls_in-pushes WHERE ( to_pernr IS NOT INITIAL ) ( goal_id = lv_id to_pernr = p-to_pernr
      progress = p-progress note = p-note due_text = p-due_text updated_text = p-updated_text position = p-position ) ).
    SORT lt_push BY to_pernr.
    DELETE ADJACENT DUPLICATES FROM lt_push COMPARING to_pernr.
    INSERT zajmn_push FROM TABLE @lt_push.
    DATA lt_contr TYPE STANDARD TABLE OF zajmn_contr WITH EMPTY KEY.
    LOOP AT ls_in-contributors INTO DATA(ls_c).
      DATA(ls_cj) = VALUE ty_contr_json( ).
      /ui2/cl_json=>deserialize( EXPORTING json = ls_c-data pretty_name = /ui2/cl_json=>pretty_mode-camel_case CHANGING data = ls_cj ).
      APPEND VALUE #( goal_id = lv_id position = ls_c-position pernr = ls_c-pernr status = ls_cj-status
        linked_goal_id = COND #( WHEN ls_cj-my_id CO '0123456789' AND ls_cj-my_id IS NOT INITIAL THEN |{ ls_cj-my_id ALPHA = IN }| )
        data = ls_c-data ) TO lt_contr.
    ENDLOOP.
    INSERT zajmn_contr FROM TABLE @lt_contr.

    " the workflow log only grows: a step already stored (same page timestamp and text) is skipped
    SELECT client_ts, text FROM zajmn_log WHERE goal_id = @lv_id INTO TABLE @DATA(lt_have).
    DATA(lv_actor) = me( ).
    LOOP AT ls_in-log INTO DATA(ls_l).
      CHECK NOT line_exists( lt_have[ client_ts = ls_l-occurred_at text = ls_l-text ] ).
      DATA(lv_at) = zcl_zajmn_util=>iso_to_ts( ls_l-occurred_at ).
      DATA(ls_row) = VALUE zajmn_log( log_id = next_id( 'ZAJMN_LOG' ) goal_id = lv_id
        actor_pernr = COND #( WHEN lv_actor IS NOT INITIAL THEN lv_actor ELSE ls_l-actor_pernr )
        action = ls_l-action text = ls_l-text date_text = ls_l-date_text detail = ls_l-detail
        client_ts = ls_l-occurred_at occurred_at = COND #( WHEN lv_at IS NOT INITIAL THEN lv_at ELSE lv_now ) ).
      INSERT zajmn_log FROM @ls_row.
      APPEND VALUE #( client_ts = ls_l-occurred_at text = ls_l-text ) TO lt_have.
    ENDLOOP.

    COMMIT WORK AND WAIT.
    CALL FUNCTION 'DEQUEUE_EZAJMN_GOAL' EXPORTING goal_id = lv_id.
    copy_data_to_ref( EXPORTING is_data = ls_in CHANGING cr_data = er_deep_entity ).
  ENDMETHOD.

  " ---------------------------------------------------------------- function imports
  METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.
    CASE iv_action_name.

      WHEN 'GetIds'.
        DATA(lv_cnt) = param( it_parameter = it_parameter iv_name = `count` ).
        DATA(lv_count) = COND i( WHEN lv_cnt CO '0123456789' AND lv_cnt IS NOT INITIAL THEN CONV i( lv_cnt ) ELSE 100 ).
        lv_count = nmax( val1 = 1 val2 = nmin( val1 = lv_count val2 = 200 ) ).
        DATA lt_ids TYPE zcl_zajmn_goals_mpc=>tt_iditem.
        DO lv_count TIMES.
          DATA(lv_new) = CONV numc10( next_id( 'ZAJMN_GOAL' ) ).
          APPEND VALUE #( id = |{ lv_new ALPHA = OUT }| ) TO lt_ids.
        ENDDO.
        copy_data_to_ref( EXPORTING is_data = lt_ids CHANGING cr_data = er_data ).

      WHEN 'DeleteGoal'.
        DATA(lv_gtxt) = param( it_parameter = it_parameter iv_name = `GoalId` ).
        DATA(lv_gid) = CONV numc10( |{ lv_gtxt ALPHA = IN }| ).
        DATA(lv_why) = param( it_parameter = it_parameter iv_name = `Reason` ).
        SELECT SINGLE * FROM zajmn_goal WHERE goal_id = @lv_gid AND deleted_at = 0 INTO @DATA(ls_del).
        IF sy-subrc <> 0.
          RETURN.   " already deleted: nothing to do
        ENDIF.
        " v68 rule: only the owner deletes, always, including a goal that was pushed down to them.
        " The page tells the people it was linked to and breaks the link (EXTRA.broken on their copies).
        IF ls_del-pernr <> me( ).
          fail( |You may not delete this goal| ).
        ENDIF.
        GET TIME STAMP FIELD DATA(lv_ts).
        UPDATE zajmn_goal SET deleted_at = @lv_ts, deleted_by = @sy-uname WHERE goal_id = @lv_gid.
        DATA(ls_dlog) = VALUE zajmn_log( log_id = next_id( 'ZAJMN_LOG' ) goal_id = lv_gid actor_pernr = me( ) action = 'goal_deleted'
          text = COND #( WHEN lv_why IS INITIAL THEN `Goal deleted` ELSE lv_why ) detail = `{}`
          client_ts = zcl_zajmn_util=>ts_to_iso( lv_ts ) occurred_at = lv_ts ).
        INSERT zajmn_log FROM @ls_dlog.
        COMMIT WORK.

      WHEN 'AcceptAI'.
        zcl_zajmn_ai=>accept( iv_log_id = CONV #( param( it_parameter = it_parameter iv_name = `LogId` ) )
                              iv_text   = param( it_parameter = it_parameter iv_name = `Text` ) ).

      WHEN OTHERS.
        fail( |Unknown function { iv_action_name }| ).
    ENDCASE.
  ENDMETHOD.

  " ---------------------------------------------------------------- AI: POST /AiRequests (option B in ecc/04_ai.md)
  METHOD airequests_create_entity.
    io_data_provider->read_entry_data( IMPORTING es_data = er_entity ).
    DATA(ls_answer) = zcl_zajmn_ai=>ask( iv_task = er_entity-task iv_pernr = COND #( WHEN er_entity-pernr IS NOT INITIAL THEN er_entity-pernr ELSE me( ) )
                                         iv_context = er_entity-context ).
    er_entity-log_id = ls_answer-log_id.
    er_entity-answer = ls_answer-json.
    CLEAR er_entity-context.   " the page does not need it back
  ENDMETHOD.

  " ---------------------------------------------------------------- attachments: media entity Attachments
  METHOD /iwbep/if_mgw_appl_srv_runtime~create_stream.
    IF iv_entity_set_name <> 'Attachments'.
      fail( |Files can only be added to Attachments| ).
    ENDIF.
    IF xstrlen( is_media_resource-value ) > 10485760.
      fail( |That file is over 10 MB| ).
    ENDIF.
    DATA(lv_id) = CONV numc10( next_id( 'ZAJMN_ATT' ) ).
    GET TIME STAMP FIELD DATA(lv_now).
    DATA(lv_name) = cl_http_utility=>unescape_url( escaped = iv_slug ).
    DATA(ls_att) = VALUE zajmn_att( att_id = lv_id file_name = lv_name file_size = xstrlen( is_media_resource-value )
      mimetype = is_media_resource-mime_type content = is_media_resource-value uploaded_by = sy-uname uploaded_at = lv_now ).
    INSERT zajmn_att FROM @ls_att.
    COMMIT WORK.
    copy_data_to_ref( EXPORTING is_data = VALUE zcl_zajmn_goals_mpc=>ts_attachment(
                        att_id = |{ lv_id ALPHA = OUT }| file_name = lv_name file_size = xstrlen( is_media_resource-value )
                        mimetype = is_media_resource-mime_type )
                      CHANGING cr_data = er_entity ).
  ENDMETHOD.

  METHOD /iwbep/if_mgw_appl_srv_runtime~get_stream.
    IF iv_entity_set_name <> 'Attachments'.
      fail( |Only Attachments have content| ).
    ENDIF.
    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'AttId'.
    DATA(lv_id) = CONV numc10( |{ ls_key-value ALPHA = IN }| ).
    SELECT SINGLE * FROM zajmn_att WHERE att_id = @lv_id INTO @DATA(ls_att).
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception EXPORTING textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.
    " only someone who may see the goal the file belongs to (or who uploaded it) may download it
    DATA(lv_ok) = abap_false.
    IF ls_att-goal_id IS NOT INITIAL.
      SELECT SINGLE pernr FROM zajmn_goal WHERE goal_id = @ls_att-goal_id INTO @DATA(lv_owner).
      lv_ok = xsdbool( sy-subrc = 0 AND may_see( iv_owner = lv_owner iv_goal = ls_att-goal_id ) = abap_true ).
    ENDIF.
    IF lv_ok = abap_false AND ls_att-uploaded_by <> sy-uname.
      fail( |You may not open this file| ).
    ENDIF.
    set_header( is_header = VALUE #( name = 'Content-Disposition'
      value = |attachment; filename="{ cl_http_utility=>escape_url( CONV #( ls_att-file_name ) ) }"| ) ).
    copy_data_to_ref( EXPORTING is_data = VALUE /iwbep/if_mgw_appl_types=>ty_s_media_resource(
                        value = ls_att-content mime_type = ls_att-mimetype )
                      CHANGING cr_data = er_stream ).
  ENDMETHOD.

ENDCLASS.
