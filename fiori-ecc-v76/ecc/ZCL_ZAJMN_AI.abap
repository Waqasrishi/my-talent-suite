*&---------------------------------------------------------------------*
*& ZCL_ZAJMN_AI: the five AI jobs of the Goals app, called from ABAP (option B, ecc/04_ai.md).
*& Same prompts, same answer shapes and same checks as developer/ai.mjs on Canvas, word for word.
*& Every call is logged in ZAJMN_AILOG. ABAP 7.40 SP08 or later, /UI2/CL_JSON.
*& Needs: SM59 destination ZAJMN_LLM (type G, HTTPS, to the company model gateway) and one row in
*& table ZAJMN_AICONF (MODEL, API_KEY; maintained in SM30, authorization group restricted to basis).
*& Written without a system: activate in SE24 and fix what the syntax check reports.
*&---------------------------------------------------------------------*
CLASS zcl_zajmn_ai DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_answer,
             log_id TYPE string,
             json   TYPE string,   " the job's answer, or {"error":"..."}
           END OF ty_answer.
    CLASS-METHODS ask
      IMPORTING iv_task          TYPE string
                iv_pernr         TYPE pernr_d
                iv_context       TYPE string
      RETURNING VALUE(rs_answer) TYPE ty_answer.
    CLASS-METHODS accept
      IMPORTING iv_log_id TYPE numc12
                iv_text   TYPE string.
  PRIVATE SECTION.
    TYPES: BEGIN OF ty_ctx,
             role    TYPE string,
             goal    TYPE string,
             title   TYPE string,
             measure TYPE string,
             due     TYPE string,
             parent  TYPE string,
             hint    TYPE string,
             text    TYPE string,
             to      TYPE string,
             top     TYPE abap_bool,
             above   TYPE string_table,
             mine    TYPE string_table,
             issues  TYPE string_table,
           END OF ty_ctx.
    CLASS-METHODS prompt IMPORTING iv_task TYPE string is_c TYPE ty_ctx RETURNING VALUE(rv) TYPE string.
    CLASS-METHODS shape IMPORTING iv_task TYPE string iv_json TYPE string is_c TYPE ty_ctx RETURNING VALUE(rv) TYPE string
                        RAISING cx_static_check.
    CLASS-METHODS clip IMPORTING iv TYPE string iv_len TYPE i RETURNING VALUE(rv) TYPE string.
    CLASS-METHODS arr IMPORTING it TYPE string_table iv_n TYPE i iv_len TYPE i RETURNING VALUE(rv) TYPE string.
    CLASS-METHODS call_model IMPORTING iv_user TYPE string EXPORTING ev_content TYPE string ev_tokens TYPE i ev_model TYPE string
                             RAISING cx_static_check.
ENDCLASS.

CLASS zcl_zajmn_ai IMPLEMENTATION.

  METHOD clip.
    rv = COND #( WHEN strlen( iv ) > iv_len THEN substring( val = iv len = iv_len ) ELSE iv ).
  ENDMETHOD.

  " JSON.stringify of the first n entries, each cut to len characters, empty ones left out
  METHOD arr.
    DATA lt TYPE string_table.
    LOOP AT it INTO DATA(lv) TO iv_n.
      DATA(lv_c) = clip( iv = lv iv_len = iv_len ).
      IF lv_c IS NOT INITIAL.
        APPEND lv_c TO lt.
      ENDIF.
    ENDLOOP.
    rv = /ui2/cl_json=>serialize( data = lt ).
    IF rv IS INITIAL.
      rv = `[]`.
    ENDIF.
  ENDMETHOD.

  METHOD prompt.
    DATA(nl) = cl_abap_char_utilities=>newline.
    CASE iv_task.
      WHEN 'goals'.
        rv = `The person is: ` && clip( iv = is_c-role iv_len = 60 ) && `.` && nl &&
             `Goals of the person above them: ` && arr( it = is_c-above iv_n = 6 iv_len = 200 ) && `.` && nl &&
             `Goals this person already has: ` && arr( it = is_c-mine iv_n = 6 iv_len = 200 ) && `.` && nl &&
             COND string( WHEN is_c-hint IS NOT INITIAL THEN `They started typing: "` && clip( iv = is_c-hint iv_len = 200 ) && `".` ) && nl &&
             `Suggest 5 different goals for this person. Each one must support one of the goals above when there is one.` && nl &&
             `JSON: {"options":[{"text":"<the goal, one sentence>","why":"<which goal above it supports, or why it matters, under 14 words>"}]}`.
      WHEN 'measures'.
        rv = `The person is: ` && clip( iv = is_c-role iv_len = 60 ) && `. Their goal: "` && clip( iv = is_c-goal iv_len = 300 ) && `".` && nl &&
             `Suggest 4 ways to measure when this goal is done. Each has a number, a starting value if you can say it, a target and the date 31 December 2027, ` &&
             `for example "Median time to publish: from 11 minutes to 6 minutes by 31 December 2027".` && nl &&
             `JSON: {"options":[{"text":"<the measure>","why":"<what it tells you, under 12 words>"}]}`.
      WHEN 'review'.
        DATA(lv_parent) = clip( iv = is_c-parent iv_len = 300 ).
        rv = `Review this goal written by ` && clip( iv = is_c-role iv_len = 60 ) && `.` && nl &&
             `Goal: "` && clip( iv = is_c-title iv_len = 300 ) && `"` && nl &&
             `Measure: "` && clip( iv = is_c-measure iv_len = 400 ) && `"` && nl &&
             `Due: "` && clip( iv = is_c-due iv_len = 40 ) && `"` && nl &&
             COND string( WHEN is_c-top = abap_true
               THEN `This person is the Director General, the highest role. There is NO goal above it. Do not check, mention or ask for alignment to a higher goal. ` &&
                    `Instead check that it sets a clear direction for the whole organisation.`
               ELSE `Supports: "` && COND string( WHEN lv_parent IS INITIAL THEN `nothing yet` ELSE lv_parent ) && `". Goals above: ` &&
                    arr( it = is_c-above iv_n = 8 iv_len = 200 ) && `. Check that it supports one of them.` ) && nl &&
             `Check: is it measurable with a number, is it one clear outcome (not an activity), does it have a date.` && nl &&
             `JSON: {"ready":true|false,"checks":[{"ok":true|false,"text":"<one short sentence>","fix":{"field":"title|measure|due|parent","value":"<the corrected value>"}}],` &&
             `"better":"<a better wording of the goal in one sentence, or an empty string if it is already good>"}` && nl &&
             `Give 3 or 4 checks. Add "fix" only to a check that fails and only when you can write the exact corrected value: for title the improved goal sentence, ` &&
             `for measure the improved measure with a number, a start value, a target and a date, for due a date written like "31 December 2027", ` &&
             `for parent one of the goals above copied exactly. Leave "fix" out otherwise.`.
      WHEN 'translate'.
        rv = `Translate this text from a goal into ` && COND string( WHEN is_c-to = 'en' THEN `English` ELSE `Modern Standard Arabic` ) &&
             `. Keep numbers, dates and names as they are. Translate only; do not improve or explain it.` && nl &&
             `Text: "` && clip( iv = is_c-text iv_len = 800 ) && `"` && nl &&
             `JSON: {"text":"<the translation>"}`.
      WHEN 'comment'.
        rv = `A manager is returning this goal for changes. Goal: "` && clip( iv = is_c-title iv_len = 300 ) && `". Measure: "` &&
             clip( iv = is_c-measure iv_len = 400 ) && `". Problems found: ` && arr( it = is_c-issues iv_n = 6 iv_len = 200 ) && `.` && nl &&
             `Write 3 short, polite comments (one or two sentences each) that tell the owner what to change.` && nl &&
             `JSON: {"options":[{"text":"<the comment>"}]}`.
    ENDCASE.
  ENDMETHOD.

  METHOD call_model.
    CONSTANTS lc_rules TYPE string VALUE
      `You help managers at Al Jazeera Media Network write goals for the year 2027, using the cascade Director General > Executive Director > Director > Manager > Employee.`.
    TYPES: BEGIN OF ty_msg, role TYPE string, content TYPE string, END OF ty_msg,
           BEGIN OF ty_req, model TYPE string, temperature TYPE p LENGTH 3 DECIMALS 1, max_tokens TYPE i,
                            messages TYPE STANDARD TABLE OF ty_msg WITH EMPTY KEY, END OF ty_req,
           BEGIN OF ty_m, content TYPE string, END OF ty_m,
           BEGIN OF ty_choice, message TYPE ty_m, END OF ty_choice,
           BEGIN OF ty_usage, total_tokens TYPE i, END OF ty_usage,
           BEGIN OF ty_resp, choices TYPE STANDARD TABLE OF ty_choice WITH EMPTY KEY, usage TYPE ty_usage, END OF ty_resp.
    DATA(nl) = cl_abap_char_utilities=>newline.
    SELECT SINGLE model, api_key FROM zajmn_aiconf WHERE conf_id = 'DEFAULT' INTO @DATA(ls_conf).
    ev_model = COND #( WHEN ls_conf-model IS NOT INITIAL THEN ls_conf-model ELSE `qwen-flash` ).
    DATA(lv_system) = lc_rules && nl &&
      `A good goal: one sentence, starts with a verb, says what changes, is measurable with a number and a date, and supports the goal of the person above. A person has 3 to 5 goals.` && nl &&
      `Write in plain English. Never invent names of people. Answer with JSON only, no other text.`.
    DATA(ls_req) = VALUE ty_req( model = ev_model temperature = '0.4' max_tokens = 900
      messages = VALUE #( ( role = `system` content = lv_system ) ( role = `user` content = iv_user ) ) ).
    DATA(lv_body) = /ui2/cl_json=>serialize( data = ls_req pretty_name = /ui2/cl_json=>pretty_mode-low_case ).

    DATA lo_http TYPE REF TO if_http_client.
    cl_http_client=>create_by_destination( EXPORTING destination = 'ZAJMN_LLM' IMPORTING client = lo_http EXCEPTIONS OTHERS = 1 ).
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE cx_sy_create_object_error.   " destination missing
    ENDIF.
    lo_http->request->set_method( 'POST' ).
    cl_http_utility=>set_request_uri( request = lo_http->request uri = '/chat/completions' ).
    lo_http->request->set_header_field( name = 'Content-Type' value = 'application/json' ).
    lo_http->request->set_header_field( name = 'Authorization' value = |Bearer { ls_conf-api_key }| ).
    lo_http->request->set_cdata( lv_body ).
    lo_http->send( EXPORTING timeout = 25 EXCEPTIONS OTHERS = 1 ).
    IF sy-subrc = 0.
      lo_http->receive( EXCEPTIONS OTHERS = 1 ).
    ENDIF.
    DATA lv_code TYPE i.
    IF sy-subrc = 0.
      lo_http->response->get_status( IMPORTING code = lv_code ).
    ENDIF.
    DATA(lv_resp) = COND string( WHEN lv_code = 200 THEN lo_http->response->get_cdata( ) ).
    lo_http->close( ).
    IF lv_code <> 200.
      RAISE EXCEPTION TYPE cx_sy_conversion_no_number.   " the model did not answer
    ENDIF.
    DATA ls_resp TYPE ty_resp.
    /ui2/cl_json=>deserialize( EXPORTING json = lv_resp pretty_name = /ui2/cl_json=>pretty_mode-low_case CHANGING data = ls_resp ).
    ev_tokens = ls_resp-usage-total_tokens.
    READ TABLE ls_resp-choices INTO DATA(ls_first) INDEX 1.
    IF sy-subrc = 0.
      ev_content = ls_first-message-content.
    ENDIF.
  ENDMETHOD.

  " Parse the model's JSON, keep only what the page expects, cut it to size: the same rules as shape() in ai.mjs
  METHOD shape.
    TYPES: BEGIN OF ty_opt, text TYPE string, why TYPE string, END OF ty_opt,
           BEGIN OF ty_opts, options TYPE STANDARD TABLE OF ty_opt WITH EMPTY KEY, END OF ty_opts,
           BEGIN OF ty_fix, field TYPE string, value TYPE string, END OF ty_fix,
           BEGIN OF ty_check, ok TYPE abap_bool, text TYPE string, fix TYPE ty_fix, END OF ty_check,
           BEGIN OF ty_review, ready TYPE abap_bool, checks TYPE STANDARD TABLE OF ty_check WITH EMPTY KEY, better TYPE string, END OF ty_review,
           BEGIN OF ty_tr, text TYPE string, END OF ty_tr.
    " the answer may have words around the JSON: take from the first { to the last }
    DATA(lv_from) = find( val = iv_json sub = `{` ).
    DATA(lv_to) = find( val = iv_json sub = `}` occ = -1 ).
    IF lv_from < 0 OR lv_to < lv_from.
      RAISE EXCEPTION TYPE cx_sy_conversion_no_number.
    ENDIF.
    DATA(lv_j) = substring( val = iv_json off = lv_from len = lv_to - lv_from + 1 ).
    CASE iv_task.
      WHEN 'review'.
        DATA ls_r TYPE ty_review.
        /ui2/cl_json=>deserialize( EXPORTING json = lv_j CHANGING data = ls_r ).
        DATA ls_out TYPE ty_review.
        ls_out-ready = ls_r-ready.
        ls_out-better = clip( iv = ls_r-better iv_len = 300 ).
        LOOP AT ls_r-checks INTO DATA(ls_c) TO 5.
          DATA(ls_k) = VALUE ty_check( ok = ls_c-ok text = clip( iv = ls_c-text iv_len = 200 ) ).
          CHECK ls_k-text IS NOT INITIAL.
          " a fix only on a failed check, only for these fields, and only when it is exact
          IF ls_c-ok = abap_false AND ls_c-fix-value IS NOT INITIAL.
            DATA(lv_len) = SWITCH i( ls_c-fix-field WHEN 'title' THEN 300 WHEN 'measure' THEN 400 WHEN 'due' THEN 40 WHEN 'parent' THEN 300 ELSE 0 ).
            DATA(lv_val) = condense( clip( iv = ls_c-fix-value iv_len = nmax( val1 = lv_len val2 = 1 ) ) ).
            IF lv_len > 0
               AND NOT ( ls_c-fix-field = 'due' AND NOT matches( val = lv_val regex = `^[0-9]{1,2} [A-Za-z]+ [0-9]{4}$` ) )
               AND NOT ( ls_c-fix-field = 'parent' AND ( is_c-top = abap_true OR NOT line_exists( is_c-above[ table_line = lv_val ] ) ) ).
              ls_k-fix = VALUE #( field = ls_c-fix-field value = lv_val ).
            ENDIF.
          ENDIF.
          APPEND ls_k TO ls_out-checks.
        ENDLOOP.
        IF ls_out-checks IS INITIAL.
          RAISE EXCEPTION TYPE cx_sy_conversion_no_number.
        ENDIF.
        rv = /ui2/cl_json=>serialize( data = ls_out pretty_name = /ui2/cl_json=>pretty_mode-low_case compress = abap_true ).
      WHEN 'translate'.
        DATA ls_t TYPE ty_tr.
        /ui2/cl_json=>deserialize( EXPORTING json = lv_j CHANGING data = ls_t ).
        ls_t-text = condense( clip( iv = ls_t-text iv_len = 1200 ) ).
        IF ls_t-text IS INITIAL.
          RAISE EXCEPTION TYPE cx_sy_conversion_no_number.
        ENDIF.
        rv = /ui2/cl_json=>serialize( data = ls_t pretty_name = /ui2/cl_json=>pretty_mode-low_case ).
      WHEN OTHERS.   " goals, measures, comment
        DATA ls_o TYPE ty_opts.
        /ui2/cl_json=>deserialize( EXPORTING json = lv_j CHANGING data = ls_o ).
        DATA ls_oo TYPE ty_opts.
        LOOP AT ls_o-options INTO DATA(ls_x) TO 6.
          DATA(ls_y) = VALUE ty_opt( text = clip( iv = ls_x-text iv_len = 400 ) why = clip( iv = ls_x-why iv_len = 160 ) ).
          IF ls_y-text IS NOT INITIAL.
            APPEND ls_y TO ls_oo-options.
          ENDIF.
        ENDLOOP.
        IF ls_oo-options IS INITIAL.
          RAISE EXCEPTION TYPE cx_sy_conversion_no_number.
        ENDIF.
        rv = /ui2/cl_json=>serialize( data = ls_oo pretty_name = /ui2/cl_json=>pretty_mode-low_case ).
    ENDCASE.
  ENDMETHOD.

  METHOD ask.
    DATA: ls_c TYPE ty_ctx, lv_content TYPE string, lv_tokens TYPE i, lv_model TYPE string, lv_status TYPE char10, lv_out TYPE string.
    IF iv_task <> 'goals' AND iv_task <> 'measures' AND iv_task <> 'review' AND iv_task <> 'comment' AND iv_task <> 'translate'.
      rs_answer-json = `{"error":"Unknown AI job."}`.
      RETURN.
    ENDIF.
    " 40 calls a minute per person is far more than anyone clicks
    GET TIME STAMP FIELD DATA(lv_t0).
    DATA(lv_minute) = cl_abap_tstmp=>subtractsecs( tstmp = lv_t0 secs = 60 ).
    SELECT COUNT(*) FROM zajmn_ailog WHERE asked_by = @sy-uname AND created_at >= @lv_minute.
    IF sy-dbcnt >= 40.
      rs_answer-json = `{"error":"Too many AI requests. Wait a minute."}`.
      RETURN.
    ENDIF.
    /ui2/cl_json=>deserialize( EXPORTING json = iv_context CHANGING data = ls_c ).
    GET RUN TIME FIELD DATA(lv_r0).
    TRY.
        call_model( EXPORTING iv_user = prompt( iv_task = iv_task is_c = ls_c ) IMPORTING ev_content = lv_content ev_tokens = lv_tokens ev_model = lv_model ).
        lv_out = shape( iv_task = iv_task iv_json = lv_content is_c = ls_c ).
        lv_status = 'ok'.
      CATCH cx_root.
        lv_status = 'error'.
        lv_out = `{"error":"The AI could not answer. Using the goal library."}`.
    ENDTRY.
    GET RUN TIME FIELD DATA(lv_r1).
    DATA lv_num TYPE char20.
    CALL FUNCTION 'NUMBER_GET_NEXT' EXPORTING nr_range_nr = '01' object = 'ZAJMN_AILOG' IMPORTING number = lv_num EXCEPTIONS OTHERS = 1.
    DATA(lv_id) = CONV numc12( condense( lv_num ) ).
    GET TIME STAMP FIELD DATA(lv_now).
    DATA(ls_log) = VALUE zajmn_ailog( log_id = lv_id pernr = iv_pernr task = iv_task model = lv_model
      request = clip( iv = iv_context iv_len = 8000 ) response = lv_out status = lv_status
      latency_ms = ( lv_r1 - lv_r0 ) / 1000 tokens = lv_tokens asked_by = sy-uname created_at = lv_now ).
    INSERT zajmn_ailog FROM @ls_log.
    COMMIT WORK.
    rs_answer = VALUE #( log_id = |{ lv_id ALPHA = OUT }| json = lv_out ).
  ENDMETHOD.

  METHOD accept.
    DATA(lv_text) = clip( iv = iv_text iv_len = 800 ).
    UPDATE zajmn_ailog SET accepted = @lv_text WHERE log_id = @iv_log_id AND asked_by = @sy-uname.
    COMMIT WORK.
  ENDMETHOD.

ENDCLASS.
