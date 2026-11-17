*&---------------------------------------------------------------------*
*& ZAJMN_IMPORT: loads the CSV files written by export-from-canvas.mjs into the ZAJMN_* tables.
*& NOT RUN against a system. Test in a sandbox client first, with a test run (p_test = X).
*&---------------------------------------------------------------------*
REPORT zajmn_import.
PARAMETERS: p_dir  TYPE string LOWER CASE DEFAULT '/usr/sap/trans/tmp/ajmn/',
            p_test AS CHECKBOX DEFAULT 'X'.

CLASS lcl_csv DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS read IMPORTING iv_file TYPE string RETURNING VALUE(rt_rows) TYPE string_table.
    CLASS-METHODS split IMPORTING iv_line TYPE string RETURNING VALUE(rt_cells) TYPE string_table.
ENDCLASS.
CLASS lcl_csv IMPLEMENTATION.
  METHOD read.
    DATA lv_line TYPE string.
    OPEN DATASET iv_file FOR INPUT IN TEXT MODE ENCODING UTF-8 SKIPPING BYTE-ORDER MARK.
    IF sy-subrc <> 0. MESSAGE |Cannot open { iv_file }| TYPE 'E'. ENDIF.
    DO.
      READ DATASET iv_file INTO lv_line.
      IF sy-subrc <> 0. EXIT. ENDIF.
      APPEND lv_line TO rt_rows.
    ENDDO.
    CLOSE DATASET iv_file.
    DELETE rt_rows INDEX 1.            " header row
  ENDMETHOD.
  METHOD split.
    " fields are "quoted", separated by ;, a quote inside a field is doubled
    DATA(lv_rest) = iv_line.
    WHILE lv_rest IS NOT INITIAL.
      IF lv_rest(1) = '"'.
        lv_rest = lv_rest+1.
        FIND REGEX '^((?:[^"]|"")*)"(;|$)' IN lv_rest SUBMATCHES DATA(lv_cell).
        REPLACE ALL OCCURRENCES OF '""' IN lv_cell WITH '"'.
        APPEND lv_cell TO rt_cells.
        lv_rest = substring( val = lv_rest off = strlen( lv_cell ) + 2 ).
        IF lv_rest IS NOT INITIAL AND lv_rest(1) = ';'. lv_rest = lv_rest+1. ENDIF.
      ELSE. EXIT. ENDIF.
    ENDWHILE.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  " goals: GOAL_ID;PERNR;TITLE;DESCRIPTION;MEASURE;DUE_DATE;WEIGHT;PROGRESS;STATUS;STATUS_TEXT;PARENT_TITLE;PUSHED_FROM_GOAL;PUSHED_FROM_PERNR;EXTRA
  DATA lt_goal TYPE STANDARD TABLE OF zajmn_goal WITH DEFAULT KEY.
  LOOP AT lcl_csv=>read( p_dir && 'goals.csv' ) INTO DATA(lv_row).
    DATA(lt_c) = lcl_csv=>split( lv_row ).
    APPEND VALUE zajmn_goal( goal_id = lt_c[ 1 ] pernr = lt_c[ 2 ] title = lt_c[ 3 ] description = lt_c[ 4 ] measure = lt_c[ 5 ]
      due_date = lt_c[ 6 ] weight = lt_c[ 7 ] progress = lt_c[ 8 ] status = lt_c[ 9 ] status_text = lt_c[ 10 ]
      pushed_from_goal = lt_c[ 12 ] pushed_from_pernr = lt_c[ 13 ] extra = lt_c[ 14 ]
      created_by = sy-uname changed_by = sy-uname ) TO lt_goal.
  ENDLOOP.
  " activities, pushes, contributors and log: the same pattern, one table each. Keep the ids from the files: do NOT draw new numbers.
  " After the load, set each number range (SNRO) above the highest id so new ids never clash.
  IF p_test = abap_true.
    WRITE: / |Test run: { lines( lt_goal ) } goals would be loaded|.
  ELSE.
    MODIFY zajmn_goal FROM TABLE lt_goal.
    COMMIT WORK.
    WRITE: / |{ lines( lt_goal ) } goals loaded|.
  ENDIF.
