*&---------------------------------------------------------------------*
*& ZCL_ZAJMN_UTIL: who is calling, who reports to whom, and text <-> SAP dates
*& Used by ZCL_ZAJMN_GOALS_DPC_EXT and ZCL_ZAJMN_AI. ABAP 7.40 SP08 or later.
*& Written without a system: activate in SE24 and fix what the syntax check reports
*& (names of FM parameters can differ by release; marked "check on your release").
*&---------------------------------------------------------------------*
CLASS zcl_zajmn_util DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    "! The logged-on user's personnel number: infotype 0105, subtype 0001 (system user name)
    CLASS-METHODS pernr_of_user
      IMPORTING iv_uname        TYPE syuname DEFAULT sy-uname
      RETURNING VALUE(rv_pernr) TYPE pernr_d.
    "! The direct manager of a person (chief of the person's org unit, or of the unit above)
    CLASS-METHODS manager_of
      IMPORTING iv_pernr        TYPE pernr_d
      RETURNING VALUE(rv_pernr) TYPE pernr_d.
    "! True when iv_upper is somewhere above iv_lower in the reporting line (up to 10 levels)
    CLASS-METHODS is_above
      IMPORTING iv_upper     TYPE pernr_d
                iv_lower     TYPE pernr_d
      RETURNING VALUE(rv_ok) TYPE abap_bool.
    "! First name and last name from infotype 0002
    CLASS-METHODS name_of
      IMPORTING iv_pernr       TYPE pernr_d
      RETURNING VALUE(rv_name) TYPE string.
    "! '31 December 2027' or '18 Nov 2026' -> 20271231; initial when it cannot be read
    CLASS-METHODS text_to_dats
      IMPORTING iv_text        TYPE csequence
      RETURNING VALUE(rv_date) TYPE dats.
    "! '2026-11-18T10:05:03.123Z' -> time stamp; initial when it cannot be read
    CLASS-METHODS iso_to_ts
      IMPORTING iv_iso       TYPE csequence
      RETURNING VALUE(rv_ts) TYPE timestampl.
    "! time stamp -> '2026-11-18T10:05:03Z' (what the page's JavaScript reads)
    CLASS-METHODS ts_to_iso
      IMPORTING iv_ts         TYPE timestampl
      RETURNING VALUE(rv_iso) TYPE string.
ENDCLASS.

CLASS zcl_zajmn_util IMPLEMENTATION.

  METHOD pernr_of_user.
    SELECT SINGLE pernr FROM pa0105
      WHERE usrty = '0001' AND usrid = @iv_uname AND begda <= @sy-datum AND endda >= @sy-datum
      INTO @rv_pernr.
  ENDMETHOD.

  METHOD manager_of.
    " The chief of the person's org unit. When the person is that chief, the chief of the unit above.
    " Check on your release: RH_GET_LEADER and its parameters (standard in ECC 6.0 HR; some systems use A012 'manages').
    DATA: lv_type TYPE otype, lv_id TYPE realo.
    CALL FUNCTION 'RH_GET_LEADER'
      EXPORTING plvar = '01' keydate = sy-datum otype = 'P' objid = CONV hrobjid( iv_pernr )
      IMPORTING leader_type = lv_type leader_id = lv_id
      EXCEPTIONS no_leader_found = 1 no_leading_position_found = 2 OTHERS = 3.
    IF sy-subrc = 0 AND lv_type = 'P' AND CONV pernr_d( lv_id ) <> iv_pernr.
      rv_pernr = CONV #( lv_id ).
      RETURN.
    ENDIF.
    " the person leads their own unit: go one unit up (A002 'reports to')
    SELECT SINGLE orgeh FROM pa0001
      WHERE pernr = @iv_pernr AND begda <= @sy-datum AND endda >= @sy-datum INTO @DATA(lv_orgeh).
    CHECK sy-subrc = 0.
    SELECT SINGLE sobid FROM hrp1001
      WHERE plvar = '01' AND otype = 'O' AND objid = @lv_orgeh AND rsign = 'A' AND relat = '002' AND sclas = 'O'
        AND begda <= @sy-datum AND endda >= @sy-datum INTO @DATA(lv_parent).
    CHECK sy-subrc = 0.
    CALL FUNCTION 'RH_GET_LEADER'
      EXPORTING plvar = '01' keydate = sy-datum otype = 'O' objid = CONV hrobjid( lv_parent )
      IMPORTING leader_type = lv_type leader_id = lv_id
      EXCEPTIONS no_leader_found = 1 no_leading_position_found = 2 OTHERS = 3.
    IF sy-subrc = 0 AND lv_type = 'P'.
      rv_pernr = CONV #( lv_id ).
    ENDIF.
  ENDMETHOD.

  METHOD is_above.
    CHECK iv_upper IS NOT INITIAL AND iv_lower IS NOT INITIAL.
    DATA(lv_cur) = iv_lower.
    DO 10 TIMES.
      lv_cur = manager_of( lv_cur ).
      IF lv_cur IS INITIAL.
        RETURN.
      ENDIF.
      IF lv_cur = iv_upper.
        rv_ok = abap_true.
        RETURN.
      ENDIF.
    ENDDO.
  ENDMETHOD.

  METHOD name_of.
    SELECT SINGLE vorna, nachn FROM pa0002
      WHERE pernr = @iv_pernr AND begda <= @sy-datum AND endda >= @sy-datum
      INTO @DATA(ls_n).
    IF sy-subrc = 0.
      rv_name = condense( |{ ls_n-vorna } { ls_n-nachn }| ).
    ENDIF.
  ENDMETHOD.

  METHOD text_to_dats.
    DATA: lv_day TYPE string, lv_mon TYPE string, lv_year TYPE string.
    SPLIT condense( to_upper( iv_text ) ) AT space INTO lv_day lv_mon lv_year.
    CHECK lv_day CO '0123456789' AND lv_year CO '0123456789' AND strlen( lv_year ) = 4 AND strlen( lv_mon ) >= 3.
    DATA(lv_m) = find( val = `JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC` sub = substring( val = lv_mon len = 3 ) ).
    CHECK lv_m >= 0 AND lv_m MOD 3 = 0.
    DATA(lv_month) = lv_m DIV 3 + 1.
    rv_date = |{ lv_year }{ lv_month WIDTH = 2 ALIGN = RIGHT PAD = '0' }{ CONV i( lv_day ) WIDTH = 2 ALIGN = RIGHT PAD = '0' }|.
    " an impossible date such as 31 February is not accepted
    CALL FUNCTION 'DATE_CHECK_PLAUSIBILITY' EXPORTING date = rv_date EXCEPTIONS OTHERS = 1.
    IF sy-subrc <> 0.
      CLEAR rv_date.
    ENDIF.
  ENDMETHOD.

  METHOD iso_to_ts.
    CHECK strlen( iv_iso ) >= 19.
    DATA(lv_c14) = |{ iv_iso+0(4) }{ iv_iso+5(2) }{ iv_iso+8(2) }{ iv_iso+11(2) }{ iv_iso+14(2) }{ iv_iso+17(2) }|.
    CHECK lv_c14 CO '0123456789'.
    rv_ts = CONV timestamp( lv_c14 ).
  ENDMETHOD.

  METHOD ts_to_iso.
    CHECK iv_ts IS NOT INITIAL.
    CONVERT TIME STAMP iv_ts TIME ZONE 'UTC' INTO DATE DATA(lv_d) TIME DATA(lv_t).
    rv_iso = |{ lv_d+0(4) }-{ lv_d+4(2) }-{ lv_d+6(2) }T{ lv_t+0(2) }:{ lv_t+2(2) }:{ lv_t+4(2) }Z|.
  ENDMETHOD.

ENDCLASS.
