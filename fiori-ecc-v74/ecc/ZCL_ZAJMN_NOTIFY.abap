"! One place that sends a message to a person: SAP inbox, e-mail and Teams, each switched on in ZAJMN_CONFIG (v70).
"! Not compiled: there is no SAP system here. Written for ABAP 7.40 SP08+ with CL_BCS.
CLASS zcl_zajmn_notify DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS send IMPORTING iv_pernr TYPE pernr_d iv_subject TYPE string iv_text TYPE string.
ENDCLASS.

CLASS zcl_zajmn_notify IMPLEMENTATION.
  METHOD send.
    DATA(lv_uname) = zcl_zajmn_util=>pernr_to_uname( iv_pernr ).
    DATA(lv_mail)  = zcl_zajmn_util=>pernr_to_mail( iv_pernr ).
    TRY.
        DATA(lo_req) = cl_bcs=>create_persistent( ).
        DATA(lt_body) = cl_bcs_convert=>string_to_soli( iv_text ).
        lo_req->set_document( cl_document_bcs=>create_document( i_type = 'RAW' i_text = lt_body i_subject = CONV so_obj_des( iv_subject ) ) ).
        " 1. SAP Business Workplace inbox
        IF zcl_zajmn_rules=>cfg( iv_key = 'NOTIFY_INBOX' iv_default = 'X' ) = 'X' AND lv_uname IS NOT INITIAL.
          lo_req->add_recipient( cl_sapuser_bcs=>create( lv_uname ) ).
        ENDIF.
        " 2. e-mail
        IF zcl_zajmn_rules=>cfg( iv_key = 'NOTIFY_MAIL' iv_default = 'X' ) = 'X' AND lv_mail IS NOT INITIAL.
          lo_req->add_recipient( cl_cam_address_bcs=>create_internet_address( CONV adr6-smtp_addr( lv_mail ) ) ).
        ENDIF.
        lo_req->set_send_immediately( abap_true ).
        lo_req->send( ).
      CATCH cx_bcs INTO DATA(lx).
        MESSAGE lx->get_text( ) TYPE 'I'.
    ENDTRY.

    " 3. Teams: an incoming webhook, destination ZAJMN_TEAMS in SM59, one JSON post per person
    IF zcl_zajmn_rules=>cfg( iv_key = 'NOTIFY_TEAMS' iv_default = '' ) = 'X'.
      TRY.
          cl_http_client=>create_by_destination( EXPORTING destination = 'ZAJMN_TEAMS' IMPORTING client = DATA(lo_http) ).
          lo_http->request->set_method( 'POST' ).
          lo_http->request->set_header_field( name = 'Content-Type' value = 'application/json' ).
          lo_http->request->set_cdata( |\{"text":"{ escape( val = iv_subject format = cl_abap_format=>e_json_string ) }"\}| ).
          lo_http->send( ).
          lo_http->receive( ).
          lo_http->close( ).
        CATCH cx_root.
          " a failed Teams post never stops the job
      ENDTRY.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
