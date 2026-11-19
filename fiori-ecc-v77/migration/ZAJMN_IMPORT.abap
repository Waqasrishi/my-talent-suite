*&---------------------------------------------------------------------*
*& ZAJMN_IMPORT: loads the CSV files of export-from-canvas.mjs into the tables of ecc/01.
*& goals.csv -> ZAJMN_GOAL, activities.csv -> ZAJMN_ACT, pushes.csv -> ZAJMN_PUSH,
*& contributors.csv -> ZAJMN_CONTR, log.csv -> ZAJMN_LOG (new LOG_IDs from the number range).
*& Goal and activity ids are kept as they are: afterwards raise number range ZAJMN_GOAL above the highest id.
*& Run with "Test run" first: it reads and checks every file and writes nothing.
*& Written without a system: activate in SE38 and fix what the syntax check reports. ABAP 7.40 SP08 or later.
*&---------------------------------------------------------------------*
REPORT zajmn_import.

PARAMETERS: p_dir  TYPE string LOWER CASE DEFAULT '/usr/sap/trans/tmp/ajmn/',
            p_test AS CHECKBOX DEFAULT 'X'.

CLASS lcl_csv DEFINITION FINAL.
  PUBLIC SECTION.
    "! rows of a file (header row dropped), each split into its cells
    CLASS-METHODS read IMPORTING iv_file TYPE string RETURNING VALUE(rt_rows) TYPE string_table.
    CLASS-METHODS split IMPORTING iv_line TYPE string RETURNING VALUE(rt_cells) TYPE string_table.
    "! \n back to a line break, \\ back to a backslash
    CLASS-METHODS unescape IMPORTING iv TYPE string RETURNING VALUE(rv) TYPE string.
ENDCLASS.

CLASS lcl_csv IMPLEMENTATION.
  METHOD read.
    DATA lv_line TYPE string.
    OPEN DATASET iv_file FOR INPUT IN TEXT MODE ENCODING UTF-8 SKIPPING BYTE-ORDER MARK.
    IF sy-subrc <> 0.
      MESSAGE |Cannot open { iv_file }| TYPE 'E'.
    ENDIF.
    DO.
      READ DATASET iv_file INTO lv_line.
      IF sy-subrc <> 0.
        EXIT.
      ENDIF.
      " the files end lines with CR LF: drop the CR
      DATA(lv_len) = strlen( lv_line ).
      DATA(lv_cr) = substring( val = cl_abap_char_utilities=>cr_lf len = 1 ).
      IF lv_len > 0 AND substring( val = lv_line off = lv_len - 1 len = 1 ) = lv_cr.
        lv_line = substring( val = lv_line len = lv_len - 1 ).
      ENDIF.
      IF lv_line IS NOT INITIAL.
        APPEND lv_line TO rt_rows.
      ENDIF.
    ENDDO.
    CLOSE DATASET iv_file.
    DELETE rt_rows INDEX 1.   " header row
  ENDMETHOD.

  " Every cell is "quoted"; a quote inside is doubled; cells are separated by ;
  METHOD split.
    DATA: lv_cell TYPE string, lv_in TYPE abap_bool, lv_i TYPE i.
    DATA(lv_n) = strlen( iv_line ).
    WHILE lv_i < lv_n.
      DATA(lv_ch) = substring( val = iv_line off = lv_i len = 1 ).
      IF lv_in = abap_true.
        IF lv_ch = '"'.
          IF lv_i + 1 < lv_n AND substring( val = iv_line off = lv_i + 1 len = 1 ) = '"'.
            lv_cell = lv_cell && '"'.
            lv_i = lv_i + 1.
          ELSE.
            lv_in = abap_false.
          ENDIF.
        ELSE.
          lv_cell = lv_cell && lv_ch.
        ENDIF.
      ELSEIF lv_ch = '"'.
        lv_in = abap_true.
      ELSEIF lv_ch = ';'.
        APPEND unescape( lv_cell ) TO rt_cells.
        CLEAR lv_cell.
      ENDIF.
      lv_i = lv_i + 1.
    ENDWHILE.
    APPEND unescape( lv_cell ) TO rt_cells.
  ENDMETHOD.

  METHOD unescape.
    DATA: lv_i TYPE i.
    DATA(lv_n) = strlen( iv ).
    WHILE lv_i < lv_n.
      DATA(lv_ch) = substring( val = iv off = lv_i len = 1 ).
      IF lv_ch = '\' AND lv_i + 1 < lv_n.
        DATA(lv_next) = substring( val = iv off = lv_i + 1 len = 1 ).
        rv = rv && COND string( WHEN lv_next = 'n' THEN cl_abap_char_utilities=>newline ELSE lv_next ).
        lv_i = lv_i + 2.
      ELSE.
        rv = rv && lv_ch.
        lv_i = lv_i + 1.
      ENDIF.
    ENDWHILE.
  ENDMETHOD.
ENDCLASS.

CLASS lcl_load DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS run.
  PRIVATE SECTION.
    "! cell n of a row, initial when the row is shorter
    CLASS-METHODS c IMPORTING it TYPE string_table iv_n TYPE i RETURNING VALUE(rv) TYPE string.
    CLASS-METHODS num IMPORTING iv TYPE string RETURNING VALUE(rv) TYPE i.
    CLASS-METHODS check_cols IMPORTING it_rows TYPE string_table iv_cols TYPE i iv_file TYPE string.
ENDCLASS.

CLASS lcl_load IMPLEMENTATION.
  METHOD c.
    READ TABLE it INDEX iv_n INTO rv.
  ENDMETHOD.

  METHOD num.
    rv = COND #( WHEN iv IS NOT INITIAL AND condense( iv ) CO '-0123456789' THEN CONV i( condense( iv ) ) ELSE 0 ).
  ENDMETHOD.

  METHOD check_cols.
    LOOP AT it_rows INTO DATA(lv_row).
      DATA(lv_cols) = lines( lcl_csv=>split( lv_row ) ).
      IF lv_cols <> iv_cols.
        MESSAGE |{ iv_file }, row { sy-tabix + 1 }: { lv_cols } fields instead of { iv_cols }| TYPE 'E'.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD run.
    DATA: lt_goal  TYPE STANDARD TABLE OF zajmn_goal WITH EMPTY KEY,
          lt_act   TYPE STANDARD TABLE OF zajmn_act WITH EMPTY KEY,
          lt_push  TYPE STANDARD TABLE OF zajmn_push WITH EMPTY KEY,
          lt_contr TYPE STANDARD TABLE OF zajmn_contr WITH EMPTY KEY,
          lt_log   TYPE STANDARD TABLE OF zajmn_log WITH EMPTY KEY.
    GET TIME STAMP FIELD DATA(lv_now).

    " goals: GOAL_ID PERNR TITLE DESCRIPTION MEASURE DUE_TEXT DUE_DATE WEIGHT PROGRESS STATUS STATUS_TEXT PARENT_TITLE PUSHED_FROM_GOAL PUSHED_FROM_PERNR EXTRA
    DATA(lt_rows) = lcl_csv=>read( p_dir && `goals.csv` ).
    check_cols( it_rows = lt_rows iv_cols = 15 iv_file = `goals.csv` ).
    LOOP AT lt_rows INTO DATA(lv_row).
      DATA(lt_c) = lcl_csv=>split( lv_row ).
      APPEND VALUE #( goal_id = |{ c( it = lt_c iv_n = 1 ) ALPHA = IN }| pernr = c( it = lt_c iv_n = 2 ) title = c( it = lt_c iv_n = 3 )
        description = c( it = lt_c iv_n = 4 ) measure = c( it = lt_c iv_n = 5 ) due_text = c( it = lt_c iv_n = 6 ) due_date = c( it = lt_c iv_n = 7 )
        weight = num( c( it = lt_c iv_n = 8 ) ) progress = num( c( it = lt_c iv_n = 9 ) ) status = c( it = lt_c iv_n = 10 )
        status_text = c( it = lt_c iv_n = 11 ) parent_title = c( it = lt_c iv_n = 12 )
        pushed_from_goal = |{ c( it = lt_c iv_n = 13 ) ALPHA = IN }| pushed_from_pernr = c( it = lt_c iv_n = 14 ) extra = c( it = lt_c iv_n = 15 )
        created_by = sy-uname created_at = lv_now changed_by = sy-uname changed_at = lv_now ) TO lt_goal.
    ENDLOOP.

    " activities: GOAL_ID ACT_ID PERNR PROGRESS NOTE HAS_NOTE DONE_TEXT DONE_ON FILES POSITION
    lt_rows = lcl_csv=>read( p_dir && `activities.csv` ).
    check_cols( it_rows = lt_rows iv_cols = 10 iv_file = `activities.csv` ).
    LOOP AT lt_rows INTO lv_row.
      lt_c = lcl_csv=>split( lv_row ).
      APPEND VALUE #( goal_id = |{ c( it = lt_c iv_n = 1 ) ALPHA = IN }| act_id = |{ c( it = lt_c iv_n = 2 ) ALPHA = IN }| pernr = c( it = lt_c iv_n = 3 )
        progress = num( c( it = lt_c iv_n = 4 ) ) note = c( it = lt_c iv_n = 5 ) has_note = c( it = lt_c iv_n = 6 )
        done_text = c( it = lt_c iv_n = 7 ) done_on = c( it = lt_c iv_n = 8 ) files = c( it = lt_c iv_n = 9 ) position = num( c( it = lt_c iv_n = 10 ) ) ) TO lt_act.
    ENDLOOP.

    " pushes: GOAL_ID TO_PERNR PROGRESS NOTE DUE_TEXT UPDATED_TEXT POSITION
    lt_rows = lcl_csv=>read( p_dir && `pushes.csv` ).
    check_cols( it_rows = lt_rows iv_cols = 7 iv_file = `pushes.csv` ).
    LOOP AT lt_rows INTO lv_row.
      lt_c = lcl_csv=>split( lv_row ).
      CHECK c( it = lt_c iv_n = 2 ) IS NOT INITIAL.   " a person without a personnel number cannot be loaded
      APPEND VALUE #( goal_id = |{ c( it = lt_c iv_n = 1 ) ALPHA = IN }| to_pernr = c( it = lt_c iv_n = 2 ) progress = num( c( it = lt_c iv_n = 3 ) )
        note = c( it = lt_c iv_n = 4 ) due_text = c( it = lt_c iv_n = 5 ) updated_text = c( it = lt_c iv_n = 6 ) position = num( c( it = lt_c iv_n = 7 ) ) ) TO lt_push.
    ENDLOOP.

    " contributors: GOAL_ID POSITION PERNR STATUS LINKED_GOAL_ID DATA
    lt_rows = lcl_csv=>read( p_dir && `contributors.csv` ).
    check_cols( it_rows = lt_rows iv_cols = 6 iv_file = `contributors.csv` ).
    LOOP AT lt_rows INTO lv_row.
      lt_c = lcl_csv=>split( lv_row ).
      APPEND VALUE #( goal_id = |{ c( it = lt_c iv_n = 1 ) ALPHA = IN }| position = num( c( it = lt_c iv_n = 2 ) ) pernr = c( it = lt_c iv_n = 3 )
        status = c( it = lt_c iv_n = 4 ) linked_goal_id = |{ c( it = lt_c iv_n = 5 ) ALPHA = IN }| data = c( it = lt_c iv_n = 6 ) ) TO lt_contr.
    ENDLOOP.

    " log: GOAL_ID ACTOR_PERNR ACTION TEXT DATE_TEXT DETAIL CLIENT_TS OCCURRED_AT (LOG_ID from the number range)
    lt_rows = lcl_csv=>read( p_dir && `log.csv` ).
    check_cols( it_rows = lt_rows iv_cols = 8 iv_file = `log.csv` ).
    LOOP AT lt_rows INTO lv_row.
      lt_c = lcl_csv=>split( lv_row ).
      DATA(lv_ts14) = c( it = lt_c iv_n = 8 ).
      APPEND VALUE #( goal_id = |{ c( it = lt_c iv_n = 1 ) ALPHA = IN }| actor_pernr = c( it = lt_c iv_n = 2 ) action = c( it = lt_c iv_n = 3 )
        text = c( it = lt_c iv_n = 4 ) date_text = c( it = lt_c iv_n = 5 ) detail = c( it = lt_c iv_n = 6 ) client_ts = c( it = lt_c iv_n = 7 )
        occurred_at = COND #( WHEN strlen( lv_ts14 ) = 14 AND lv_ts14 CO '0123456789' THEN CONV timestamp( lv_ts14 ) ELSE lv_now ) ) TO lt_log.
    ENDLOOP.

    WRITE: / |goals { lines( lt_goal ) }, activities { lines( lt_act ) }, pushes { lines( lt_push ) }, contributors { lines( lt_contr ) }, log rows { lines( lt_log ) }|.
    IF p_test = abap_true.
      WRITE: / `Test run: every file was read and checked. Nothing was written.`.
      RETURN.
    ENDIF.

    DATA lv_num TYPE char20.
    LOOP AT lt_log ASSIGNING FIELD-SYMBOL(<l>).
      CALL FUNCTION 'NUMBER_GET_NEXT' EXPORTING nr_range_nr = '01' object = 'ZAJMN_LOG' IMPORTING number = lv_num EXCEPTIONS OTHERS = 1.
      IF sy-subrc <> 0.
        MESSAGE `No number from range ZAJMN_LOG` TYPE 'E'.
      ENDIF.
      <l>-log_id = condense( lv_num ).
    ENDLOOP.
    MODIFY zajmn_goal  FROM TABLE @lt_goal.
    MODIFY zajmn_act   FROM TABLE @lt_act.
    MODIFY zajmn_push  FROM TABLE @lt_push.
    MODIFY zajmn_contr FROM TABLE @lt_contr.
    INSERT zajmn_log   FROM TABLE @lt_log.
    COMMIT WORK.
    WRITE: / `Loaded. Now raise number range ZAJMN_GOAL (SNRO) above the highest GOAL_ID / ACT_ID.`.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_load=>run( ).
