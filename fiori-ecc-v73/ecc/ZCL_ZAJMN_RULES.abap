"! Business rules the page also checks, enforced here so a script or another front end cannot skip them (v70).
"! Not compiled: there is no SAP system here. Written for ABAP 7.40 SP08+. Settings come from ZAJMN_CONFIG (06_config_notifications.md).
CLASS zcl_zajmn_rules DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS cfg
      IMPORTING iv_key TYPE csequence iv_default TYPE string DEFAULT ``
      RETURNING VALUE(rv_val) TYPE string.
    "! Returns a sentence when the save is not allowed, empty when it is. Called by CREATE_DEEP_ENTITY before the row is written.
    CLASS-METHODS check_save
      IMPORTING iv_goal TYPE numc10 iv_owner TYPE pernr_d iv_status TYPE csequence iv_measure TYPE csequence
                iv_due TYPE dats iv_weight TYPE int2 iv_pushed_from TYPE numc10 OPTIONAL iv_old_status TYPE csequence OPTIONAL
      RETURNING VALUE(rv_text) TYPE string.
    CLASS-METHODS is_dg IMPORTING iv_pernr TYPE pernr_d RETURNING VALUE(rv_ok) TYPE abap_bool.
  PRIVATE SECTION.
    CLASS-METHODS window_closed RETURNING VALUE(rv_closed) TYPE abap_bool.
ENDCLASS.

CLASS zcl_zajmn_rules IMPLEMENTATION.
  METHOD cfg.
    SELECT SINGLE cfg_value FROM zajmn_config WHERE cfg_key = @iv_key INTO @rv_val.
    IF sy-subrc <> 0 OR rv_val IS INITIAL.
      rv_val = iv_default.
    ENDIF.
  ENDMETHOD.

  METHOD is_dg.
    rv_ok = xsdbool( iv_pernr = CONV pernr_d( cfg( iv_key = 'DG_PERNR' ) ) ).
  ENDMETHOD.

  METHOD window_closed.
    DATA(lv_open)  = CONV dats( cfg( 'WINDOW_OPEN' ) ).
    DATA(lv_close) = CONV dats( cfg( 'WINDOW_CLOSE' ) ).
    rv_closed = xsdbool( ( lv_open IS NOT INITIAL AND sy-datum < lv_open ) OR ( lv_close IS NOT INITIAL AND sy-datum > lv_close ) ).
  ENDMETHOD.

  METHOD check_save.
    " 1. A pushed copy may not be due after the goal it came from.
    IF iv_pushed_from IS NOT INITIAL AND iv_due IS NOT INITIAL.
      SELECT SINGLE due_date FROM zajmn_goal WHERE goal_id = @iv_pushed_from AND deleted_at = 0 INTO @DATA(lv_parent_due).
      IF sy-subrc = 0 AND lv_parent_due IS NOT INITIAL AND iv_due > lv_parent_due.
        rv_text = |The due date cannot be later than { lv_parent_due DATE = ENVIRONMENT }, the date of the goal it came from.|.
        RETURN.
      ENDIF.
    ENDIF.

    " 2. Sending for approval (status att, not the Director General): the owner must pass the standard.
    IF iv_status <> 'att' OR is_dg( iv_owner ) = abap_true.
      RETURN.
    ENDIF.
    IF iv_old_status = 'att'.
      RETURN.   " already sent: a later save of progress or weight is not a new send
    ENDIF.
    IF window_closed( ) = abap_true.
      rv_text = |The goal-setting window is closed. Ask your approver for a change request.|.
      RETURN.
    ENDIF.
    IF NOT matches( val = iv_measure regex = '.*\d.*' ).
      rv_text = |Add a number to the measure first, so progress can be tracked.|.
      RETURN.
    ENDIF.
    SELECT goal_id, weight FROM zajmn_goal WHERE pernr = @iv_owner AND deleted_at = 0 AND goal_id <> @iv_goal
      INTO TABLE @DATA(lt_other).
    DATA(lv_count) = lines( lt_other ) + 1.
    DATA(lv_min) = CONV i( cfg( iv_key = 'MIN_GOALS' iv_default = '3' ) ).
    DATA(lv_max) = CONV i( cfg( iv_key = 'MAX_GOALS' iv_default = '5' ) ).
    IF lv_count < lv_min.
      rv_text = |You need at least { lv_min } goals before you send. Add { lv_min - lv_count } more.|.
      RETURN.
    ENDIF.
    IF lv_count > lv_max.
      rv_text = |You have more than { lv_max } goals. Remove or merge some first.|.
      RETURN.
    ENDIF.
    IF cfg( iv_key = 'WEIGHTS_100' iv_default = 'X' ) = 'X'.
      DATA(lv_total) = COND i( WHEN iv_weight > 0 THEN iv_weight ELSE 0 ).
      LOOP AT lt_other INTO DATA(ls_o).
        IF ls_o-weight > 0.
          lv_total = lv_total + ls_o-weight.
        ENDIF.
      ENDLOOP.
      IF lv_total <> 100.
        rv_text = |Your weights add up to { lv_total }%. Make them 100% before you send.|.
      ENDIF.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
