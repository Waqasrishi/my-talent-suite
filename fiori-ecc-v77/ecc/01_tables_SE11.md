# 1. Database tables (transaction SE11)

Package `ZAJMN`. Delivery class **A**, data class **APPL1**, size category 1, buffering off. `MANDT` (CLNT 3) is the first key field of every table.
The tables keep **exactly what the page sends** (the display texts too), so nothing is lost on a save and read back. Where a real SAP type is useful
(`DUE_DATE`, `DONE_ON` as DATS, `OCCURRED_AT` as TIMESTAMPL) the service fills it as well, from the text.

Employees are **not copied**. `PERNR` (data element `PERNR_D`, NUMC 8) points at the existing employee: PA0001 / PA0002 / HRP1001.

Field names below are also the **ABAP names** of the service properties (`02_gateway_service_SEGW.md`) and the names used in the ABAP code.

## ZAJMN_GOAL: one row per goal

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT | X | CLNT 3 | |
| GOAL_ID | X | NUMC 10 | number range `ZAJMN_GOAL`, handed out by `GetIds` |
| PERNR | | PERNR_D | owner |
| TITLE | | CHAR 255 | |
| DESCRIPTION | | STRING | |
| MEASURE | | STRING | |
| DUE_TEXT | | CHAR 40 | as shown, e.g. `31 December 2027` |
| DUE_DATE | | DATS | filled by the service from `DUE_TEXT` (empty if it cannot be read) |
| WEIGHT | | INT2 | `-1` = not set, else 0 to 100 |
| PROGRESS | | INT2 | 0 to 100 |
| STATUS | | CHAR 3 | `neu` **draft** (v77), `att` awaiting review, `ok` approved, `ret` returned (lower case, as the page sends) |
| STATUS_TEXT | | CHAR 40 | `Draft`, `Edited, not sent`, `Awaiting review`, `Approved`, `Returned for changes` |
| PARENT_TITLE | | CHAR 255 | the goal above it supports (title) |
| PUSHED_FROM_GOAL | | NUMC 10 | set on a copy made by Push down |
| PUSHED_FROM_PERNR | | PERNR_D | who pushed it |
| EXTRA | | STRING | JSON the page owns: `cto` (contributing to), `also`, `approvals`, `draft` (v77), `sentOn` (date a goal was sent, v77), `done` (`awaiting` / `confirmed`, v77), `broken` {t, by, d} (link broken by a delete, v77), `unlinked` {by, t, d} (removed as contributor, v77), `recv` (a receiver changed their copy, v77), `note` (return reason). No new column is needed: the reminder job reads these keys from the JSON |
| CREATED_BY / CREATED_AT | | UNAME / TIMESTAMPL | |
| CHANGED_BY / CHANGED_AT | | UNAME / TIMESTAMPL | |
| DELETED_BY / DELETED_AT | | UNAME / TIMESTAMPL | **soft delete**: never removed; reads skip rows with `DELETED_AT` set |

Secondary indexes: `PERNR`; `PUSHED_FROM_GOAL`.

## ZAJMN_ACT: activities

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, GOAL_ID, ACT_ID | X | CLNT 3, NUMC 10, NUMC 10 | `ACT_ID` from `GetIds` |
| PERNR | | PERNR_D | owner of the goal |
| PROGRESS | | INT2 | |
| NOTE | | STRING | |
| HAS_NOTE | | ABAP_BOOLEAN (CHAR 1, `X` / space) | Edm.Boolean in the service |
| DONE_TEXT | | CHAR 40 | as shown |
| DONE_ON | | DATS | from `DONE_TEXT` |
| FILES | | STRING | JSON list of attachments `[{id,name,size}]`; the bytes are in `ZAJMN_ATT` |
| POSITION | | INT2 | order on the page (0 = newest) |

## ZAJMN_ATT: attachment files

`MANDT`*, `ATT_ID`* NUMC 10 (number range `ZAJMN_ATT`), `GOAL_ID` NUMC 10 (set when a saved activity lists the file; used for the download check), `FILE_NAME` CHAR 255, `FILE_SIZE` INT4, `MIMETYPE` CHAR 128, `CONTENT` RAWSTRING, `UPLOADED_BY` UNAME, `UPLOADED_AT` TIMESTAMPL.
Pilot only; production keeps the bytes in the content server / DMS and stores the document id here. 10 MB limit in the service.

## ZAJMN_PUSH: who a goal was pushed down to

| Field | Key | Type |
|---|---|---|
| MANDT, GOAL_ID, TO_PERNR | X | CLNT 3, NUMC 10, PERNR_D |
| PROGRESS | | INT2 |
| NOTE | | CHAR 255 |
| DUE_TEXT | | CHAR 40 |
| UPDATED_TEXT | | CHAR 40 |
| POSITION | | INT2 |

## ZAJMN_CONTR: contributors of a goal

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, GOAL_ID, POSITION | X | CLNT 3, NUMC 10, INT2 | |
| PERNR | | PERNR_D | the contributor |
| STATUS | | CHAR 20 | copied from `DATA` for reporting: `Invited`, `Linked`, `Declined` (data from before v62 may hold `Awaiting approval`, `Returned`) |
| LINKED_GOAL_ID | | NUMC 10 | their goal, once linked (from `DATA.myId`) |
| DATA | | STRING | the whole contributor entry as JSON (status, linked goal, reason, dates). The page reads this back |

## ZAJMN_LOG: the workflow log. Insert only

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, LOG_ID | X | CLNT 3, NUMC 12 | number range `ZAJMN_LOG` |
| GOAL_ID | | NUMC 10 | |
| ACTOR_PERNR | | PERNR_D | who did it |
| ACTION | | CHAR 40 | action code (`05_workflows_v77.md`) |
| TEXT | | STRING | the line as shown |
| DATE_TEXT | | CHAR 40 | as shown, e.g. `18 Nov 2026` |
| DETAIL | | STRING | JSON |
| CLIENT_TS | | CHAR 30 | the page's ISO timestamp of the step; with `TEXT` it identifies a step, so a save never writes a step twice |
| OCCURRED_AT | | TIMESTAMPL | from `CLIENT_TS` (server time if empty) |

Index on `GOAL_ID`; on `OCCURRED_AT`. No update, no delete, no UI that changes it. Retention through an archiving object.

## ZAJMN_AILOG: every AI call (option B in `04_ai.md`)

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, LOG_ID | X | CLNT 3, NUMC 12 | number range `ZAJMN_AILOG` |
| PERNR | | PERNR_D | who the call was for |
| TASK | | CHAR 20 | `goals`, `measures`, `review`, `comment`, `translate` |
| MODEL | | CHAR 40 | e.g. `qwen-flash` |
| REQUEST | | STRING | the context sent, JSON |
| RESPONSE | | STRING | the cleaned answer, or `{"error":"..."}` |
| STATUS | | CHAR 10 | `ok` / `error` |
| LATENCY_MS | | INT4 | |
| TOKENS | | INT4 | |
| ACCEPTED | | STRING | the text the person took (filled by `AcceptAI`) |
| ASKED_BY | | UNAME | |
| CREATED_AT | | TIMESTAMPL | |

Insert only, plus the one `ACCEPTED` update. Index on `CREATED_AT`; on `PERNR`.

## ZAJMN_AICONF: AI settings (option B only)

`MANDT`*, `CONF_ID`* CHAR 10 (one row, `DEFAULT`), `MODEL` CHAR 40 (`qwen-flash`), `API_KEY` CHAR 255.
Maintenance view in SM30 with an authorization group only basis holds; the key is issued by the platform's `llm` resource. Never put the key in code or a transport of client data.
The SM59 destination `ZAJMN_LLM` (type G, HTTPS, SSL client anonymous/standard) points at the model gateway base URL; the class adds `/chat/completions`.

## Number ranges (SNRO)

| Object | Length | Used for |
|---|---|---|
| `ZAJMN_GOAL` | 10 | goal and activity ids (`GetIds`) — one sequence, like Canvas |
| `ZAJMN_ATT` | 10 | attachment ids |
| `ZAJMN_LOG` | 12 | workflow log rows |
| `ZAJMN_AILOG` | 12 | AI log rows |

Interval `01`, no subobject, buffering 100 in main memory (gaps are fine). After loading the prototype's data raise `ZAJMN_GOAL` above the highest id.

## Lock object

`EZAJMN_GOAL` on `ZAJMN_GOAL`, lock argument `MANDT`, `GOAL_ID`, mode E. Taken around every save of a goal.


## New in v77: configuration, notifications, delegation

### ZAJMN_CONFIG: settings an admin changes without code (SM30 maintenance view `ZAJMN_CONFIG_V`)

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT | X | CLNT 3 | |
| CFG_KEY | X | CHAR 30 | see `06_config_notifications.md` for every key and its default |
| CFG_VALUE | | CHAR 255 | |
| CHANGED_BY / CHANGED_AT | | UNAME / TIMESTAMPL | |

### ZAJMN_NOTIF: what was sent, to whom, when (insert only; the weekly digest and audits read it)

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, NOTIF_ID | X | CLNT 3, NUMC 12 | number range `ZAJMN_NOTIF` |
| PERNR | | PERNR_D | who was told |
| GOAL_ID | | NUMC 10 | |
| KIND | | CHAR 20 | `REMIND`, `ESCALATE`, `DRAFT`, `LINK`, `CHECKIN`, `SENT`, `APPROVED`, `RETURNED`, `INVITED`, `REMOVED`, `LINKBROKEN` |
| SENT_ON / SENT_AT | | DATS / TIMS | |

### ZAJMN_DELEG: HR (or a colleague) approves for a manager who is away

| Field | Key | Type | Notes |
|---|---|---|---|
| MANDT, APPROVER_PERNR, DELEGATE_PERNR | X | CLNT 3, PERNR_D, PERNR_D | |
| VALID_FROM / VALID_TO | | DATS | the service treats the delegate as the approver between these dates |
| CREATED_BY | | UNAME | |

`MAY_CHANGE` and the review rule read this table: a delegate may save the decision on goals of the approver's reports.
