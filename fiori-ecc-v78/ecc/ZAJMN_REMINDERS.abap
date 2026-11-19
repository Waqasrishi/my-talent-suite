*&---------------------------------------------------------------------*
*& ZAJMN_REMINDERS: schedule daily in SM36 (and weekly with P_DIGEST = X).
*& Reminders and escalations for the Goals app (v70). Not compiled: there is no SAP system here.
*& Rules (ZAJMN_CONFIG, defaults): approver reminded after 5 days; goal goes to the approver's manager after 10 days;
*& a broken link is reminded after 14 days; no progress for 30 days is a monthly check-in reminder.
*& Messages go three ways, each switched on in ZAJMN_CONFIG: SAP Business Workplace inbox, e-mail, Teams webhook.
*&---------------------------------------------------------------------*
REPORT zajmn_reminders.
PARAMETERS: p_digest AS CHECKBOX, p_test AS CHECKBOX DEFAULT 'X'.

TYPES: BEGIN OF ty_msg,
         pernr   TYPE pernr_d,
         subject TYPE string,
         text    TYPE string,
         goal_id TYPE numc10,
         kind    TYPE char20,
       END OF ty_msg.
DATA gt_msg TYPE STANDARD TABLE OF ty_msg WITH EMPTY KEY.

CLASS lcl_json DEFINITION.
  PUBLIC SECTION.
    "! the parts of ZAJMN_GOAL-EXTRA the reminders need
    TYPES: BEGIN OF ty_extra,
             sent_on TYPE string,
             draft   TYPE abap_bool,
             done    TYPE string,
             BEGIN OF broken,
               d TYPE string,
               t TYPE string,
             END OF broken,
           END OF ty_extra.
    CLASS-METHODS parse IMPORTING iv_json TYPE string RETURNING VALUE(rs) TYPE ty_extra.
    CLASS-METHODS to_date IMPORTING iv_text TYPE string RETURNING VALUE(rv_d) TYPE d.
ENDCLASS.
CLASS lcl_json IMPLEMENTATION.
  METHOD parse.
    /ui2/cl_json=>deserialize( EXPORTING json = iv_json pretty_name = /ui2/cl_json=>pretty_mode-camel_case CHANGING data = rs ).
  ENDMETHOD.
  METHOD to_date.
    rv_d = zcl_zajmn_util=>text_to_dats( iv_text ).
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lv_d_appr)  = CONV i( zcl_zajmn_rules=>cfg( iv_key = 'REMIND_APPROVER_DAYS' iv_default = '5' ) ).
  DATA(lv_d_esc)   = CONV i( zcl_zajmn_rules=>cfg( iv_key = 'ESCALATE_DAYS' iv_default = '10' ) ).
  DATA(lv_d_link)  = CONV i( zcl_zajmn_rules=>cfg( iv_key = 'BROKEN_LINK_DAYS' iv_default = '14' ) ).
  DATA(lv_d_check) = CONV i( zcl_zajmn_rules=>cfg( iv_key = 'CHECKIN_DAYS' iv_default = '30' ) ).

  SELECT goal_id, pernr, title, status, extra, changed_at FROM zajmn_goal WHERE deleted_at = 0 INTO TABLE @DATA(lt_goal).
  LOOP AT lt_goal INTO DATA(ls_g).
    DATA(ls_x) = lcl_json=>parse( ls_g-extra ).
    DATA(lv_boss) = zcl_zajmn_util=>manager_of( ls_g-pernr ).

    " 1. waiting for the approver
    IF ls_g-status = 'att' AND ls_x-sent_on IS NOT INITIAL.
      DATA(lv_wait) = sy-datum - lcl_json=>to_date( ls_x-sent_on ).
      IF lv_wait >= lv_d_esc AND lv_boss IS NOT INITIAL.
        APPEND VALUE #( pernr = zcl_zajmn_util=>manager_of( lv_boss ) goal_id = ls_g-goal_id kind = 'ESCALATE'
          subject = |Not reviewed in { lv_wait } days: { ls_g-title }|
          text = |This goal was sent to { lv_boss } { lv_wait } days ago and nobody has decided. It is now with you.| ) TO gt_msg.
      ELSEIF lv_wait >= lv_d_appr AND lv_boss IS NOT INITIAL.
        APPEND VALUE #( pernr = lv_boss goal_id = ls_g-goal_id kind = 'REMIND'
          subject = |A goal is waiting { lv_wait } days for your decision|
          text = |{ ls_g-title }: please approve it or return it with a reason.| ) TO gt_msg.
      ENDIF.
    ENDIF.

    " 2. a draft the owner never sent
    IF ls_x-draft = abap_true.
      APPEND VALUE #( pernr = ls_g-pernr goal_id = ls_g-goal_id kind = 'DRAFT'
        subject = |Not sent yet: { ls_g-title }| text = |This goal is still a draft. Send it for approval when you are ready.| ) TO gt_msg.
    ENDIF.

    " 3. a broken link nobody repaired
    IF ls_x-broken-d IS NOT INITIAL AND sy-datum - lcl_json=>to_date( ls_x-broken-d ) >= lv_d_link.
      APPEND VALUE #( pernr = ls_g-pernr goal_id = ls_g-goal_id kind = 'LINK'
        subject = |Link still broken: { ls_g-title }|
        text = |The goal this one was linked to was deleted. Link it to something else, or delete it.| ) TO gt_msg.
    ENDIF.

    " 4. monthly check-in: no update for 30 days
    IF ls_g-status = 'ok' AND ls_g-changed_at > 0.
      DATA(lv_changed) = CONV d( ls_g-changed_at(8) ).
      IF sy-datum - lv_changed >= lv_d_check.
        APPEND VALUE #( pernr = ls_g-pernr goal_id = ls_g-goal_id kind = 'CHECKIN'
          subject = |Monthly check-in: { ls_g-title }| text = |There has been no update for { sy-datum - lv_changed } days.| ) TO gt_msg.
      ENDIF.
    ENDIF.
  ENDLOOP.

  " Send. A weekly digest groups all messages of one person into one mail.
  DATA lt_sent TYPE STANDARD TABLE OF zajmn_notif WITH EMPTY KEY.
  LOOP AT gt_msg INTO DATA(ls_m) GROUP BY ls_m-pernr INTO DATA(lv_person).
    DATA lt_mine TYPE STANDARD TABLE OF ty_msg WITH EMPTY KEY.
    CLEAR lt_mine.
    LOOP AT GROUP lv_person INTO DATA(ls_p).
      APPEND ls_p TO lt_mine.
    ENDLOOP.
    DATA(lv_subject) = COND string( WHEN p_digest = abap_true OR lines( lt_mine ) > 1
                                     THEN |Goals: { lines( lt_mine ) } things need your attention|
                                     ELSE lt_mine[ 1 ]-subject ).
    DATA(lv_body) = REDUCE string( INIT s = `` FOR m IN lt_mine NEXT s = s && m-subject && cl_abap_char_utilities=>newline && m-text && cl_abap_char_utilities=>newline && cl_abap_char_utilities=>newline ).
    IF p_test = abap_true.
      WRITE: / lv_person, lv_subject.
    ELSE.
      zcl_zajmn_notify=>send( iv_pernr = lv_person iv_subject = lv_subject iv_text = lv_body ).
    ENDIF.
    LOOP AT lt_mine INTO ls_p.
      APPEND VALUE #( pernr = lv_person goal_id = ls_p-goal_id kind = ls_p-kind sent_on = sy-datum sent_at = sy-uzeit ) TO lt_sent.
    ENDLOOP.
  ENDLOOP.
  IF p_test = abap_false AND lt_sent IS NOT INITIAL.
    INSERT zajmn_notif FROM TABLE @lt_sent.
    COMMIT WORK.
  ENDIF.
