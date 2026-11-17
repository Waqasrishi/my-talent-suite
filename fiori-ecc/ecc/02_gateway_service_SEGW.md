# 2. The OData service (transaction SEGW, then /IWFND/MAINT_SERVICE)

Project `ZAJMN_GOALS`, service `ZAJMN_GOALS_SRV`, OData V2, generated classes `ZCL_ZAJMN_GOALS_MPC` / `_DPC` / `_DPC_EXT`.
Import the DDIC structures from the tables in `01_tables_SE11.md`, then set these entity types. **Property names must match exactly:** `app/webapp/model/Store.js` maps to and from them.

| Entity type / set | Key | Properties | Operations |
|---|---|---|---|
| `Goal` / `Goals` | `GoalId` | GoalId, Pernr, Title, Description, Measure, DueText (string, display date), Weight (Int16, -1 = not set), Progress (Int16), Status, StatusText, ParentTitle, PushedFromGoal, PushedFromPernr, Extra, ChangedAt (DateTime, ETag) | GET list and single, **POST = save (upsert, deep)**. No DELETE |
| `Activity` | `GoalId`, `ActId` | Progress, Note, HasNote (Boolean), DoneText, Position, Files (JSON string of the attachments) | read through `Goals?$expand=Activities` |
| `Push` | `GoalId`, `ToPernr` | Progress, Note, DueText, UpdatedText, Position | `$expand=Pushes` |
| `Contributor` | `GoalId`, `Position` | Pernr, Data (JSON string: status, linked goal, reason, dates) | `$expand=Contributors` |
| `LogEntry` | `GoalId`, `Position` | ActorPernr, Action, Text, DateText, Detail, OccurredAt | `$expand=Log` |
| `WorkflowLogRow` / `WorkflowLog` | `LogId` | LogId, GoalId, GoalTitle, ActorPernr, ActorName, Action, Text, OccurredAt | GET only, with `$orderby` and `$top` |
| `Attachment` / `Attachments` | `AttId` | AttId, FileName, FileSize, MimeType | **Media entity** (`$value`): POST with the `Slug` header, GET `$value` |

Navigation properties on `Goal`: `Activities`, `Pushes`, `Contributors`, `Log` (1:n).

Function import: **`GetIds`** (GET, parameter `count` Int16, returns a collection of `Id` Edm.String). The client asks for blocks of 100 ids and uses them for new goals and activities.

## Why POST = save

OData V2 has no deep update. The page keeps the whole goal (with its activities, pushes, contributors and log) and sends it in one request. `CREATE_DEEP_ENTITY` treats it as **upsert by `GoalId`**: one logical unit of work, one lock, one `COMMIT WORK`. The client never makes ids: `GoalId` and `ActId` come from `GetIds`.

## Activate

1. `/IWFND/MAINT_SERVICE` > Add Service > `ZAJMN_GOALS_SRV`, system alias of the Gateway hub (or `LOCAL` on an embedded deployment).
2. `/IWFND/GW_CLIENT`: test `GET /sap/opu/odata/sap/ZAJMN_GOALS_SRV/Goals?$expand=Activities&$format=json`.
3. Launchpad: semantic object `ZAJMNGOALS`, action `display` (already in `manifest.json`), target mapping to the BSP/ABAP repository app.
