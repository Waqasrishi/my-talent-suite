# 1. Database tables (transaction SE11)

Prefix `ZAJMN_`. Delivery class **A** (application data), data class **APPL1**, size category 1, buffering off.
Every table has `MANDT` (CLNT 3) as the first key field. Dates are real `DATS`; the prototype kept them as text, the migration converts them.
Timestamps are `TIMESTAMPL` in UTC.

Employees are **not copied**. `PERNR` (data element `PERNR_D`, NUMC 8) points at the existing employee: master data in PA0001 / PA0002, reporting line in HRP1001 (relationship A002 / B002), names from `PA0002-VORNA/NACHN`.

## ZAJMN_GOAL: one row per goal

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT | X | CLNT | |
| GOAL_ID | X | NUMC 10 | from number range object `ZAJMN_GOAL`. Never made in the browser |
| PERNR | | PERNR_D | the owner |
| TITLE | | CHAR 255 | |
| DESCRIPTION | | STRING | |
| MEASURE | | STRING | |
| DUE_DATE | | DATS | |
| WEIGHT | | INT2 | `-1` = not set (a weight is 0 to 100) |
| PROGRESS | | INT1 | 0 to 100 |
| STATUS | | CHAR 3 | `ATT` awaiting, `OK` approved, `RET` returned |
| STATUS_TEXT | | CHAR 40 | |
| PARENT_GOAL_ID | | NUMC 10 | the goal this one supports (the prototype kept only its title) |
| PUSHED_FROM_GOAL | | NUMC 10 | set on a copy made by Push down |
| PUSHED_FROM_PERNR | | PERNR_D | who pushed it |
| EXTRA | | STRING | JSON: the pending change request and the approval history |
| CREATED_BY / CREATED_AT | | UNAME / TIMESTAMPL | |
| DELETED_BY / DELETED_AT | | UNAME / TIMESTAMPL | **soft delete**: a deleted goal is hidden, never removed, so its history in `ZAJMN_LOG` survives. The service returns only rows with `DELETED_AT` initial; a delete writes a log row `goal_deleted` |
| CHANGED_BY / CHANGED_AT | | UNAME / TIMESTAMPL | `CHANGED_AT` is also the ETag, so two people cannot overwrite each other |

Secondary index on `PERNR`; on `PUSHED_FROM_GOAL`.

## ZAJMN_ACT: activities (one row per activity)

`MANDT`*, `GOAL_ID`*, `ACT_ID`* (NUMC 10, number range `ZAJMN_ACT`), `PERNR`, `PROGRESS` INT1, `NOTE` STRING, `HAS_NOTE` CHAR 1,
`DONE_ON` DATS, `POSITION` INT2, `CREATED_AT` TIMESTAMPL.

## ZAJMN_ATT: attachments of an activity

`MANDT`*, `ATT_ID`* (NUMC 10), `GOAL_ID`, `ACT_ID`, `FILE_NAME` CHAR 255, `FILE_SIZE` INT4, `MIMETYPE` CHAR 128, `CONTENT` RAWSTRING, `UPLOADED_BY`, `UPLOADED_AT`.
**Best practice:** for production keep the bytes in the content server or DMS (ArchiveLink / `SGOSATTR`) and store only the document id here. RAWSTRING is fine for the pilot (10 MB limit enforced in the service).

## ZAJMN_PUSH: who a goal was pushed down to

`MANDT`*, `GOAL_ID`*, `TO_PERNR`*, `COPY_GOAL_ID` NUMC 10 (the receiver's own copy), `PROGRESS` INT1, `NOTE` CHAR 255, `DUE_DATE` DATS, `UPDATED_ON` DATS, `POSITION` INT2.

## ZAJMN_CONTR: contributors

`MANDT`*, `GOAL_ID`*, `CONTR_ID`* (NUMC 10), `PERNR`, `STATUS` CHAR 2 (`IN` invited, `AP` awaiting approval, `LK` linked, `RT` returned, `DC` declined),
`LINKED_GOAL_ID` NUMC 10, `REASON` CHAR 255, `REQUESTED_ON` DATS, `DECIDED_BY` UNAME, `DECIDED_AT` TIMESTAMPL, `POSITION` INT2.

## ZAJMN_LOG: the workflow log. Insert only

`MANDT`*, `LOG_ID`* (NUMC 12, number range `ZAJMN_LOG`), `GOAL_ID`, `ACTOR_PERNR` PERNR_D, `ACTION` CHAR 40, `TEXT` STRING, `DETAIL` STRING (JSON), `OCCURRED_AT` TIMESTAMPL.
The service exposes no update or delete for it. Archive with an archiving object, never with `DELETE`.

## ZAJMN_AILOG: every AI call (only if the AI runs next to ECC)

`MANDT`*, `LOG_ID`*, `PERNR`, `TASK`, `MODEL`, `REQUEST` STRING, `RESPONSE` STRING, `STATUS`, `LATENCY_MS`, `TOKENS`, `ACCEPTED` STRING, `CREATED_AT`.

## Number ranges (SNRO)

`ZAJMN_GOAL`, `ZAJMN_ACT`, `ZAJMN_ATT`, `ZAJMN_CONTR`, `ZAJMN_LOG`: interval 01, no subobject, number length 10 (12 for the log), buffering 100 in main memory
(gaps are fine; ids only have to be unique). The service hands ids to the app in blocks through function import `GetIds`.

## Lock objects (SE11)

`EZAJMN_GOAL` on `ZAJMN_GOAL` (key `GOAL_ID`). The service takes it around every save so two saves of one goal never interleave.
