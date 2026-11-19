# 2. The OData service (SEGW, then /IWFND/MAINT_SERVICE)

Project `ZAJMN_GOALS`, service **`ZAJMN_GOALS_SRV`**, OData **V2**, classes `ZCL_ZAJMN_GOALS_MPC(_EXT)` / `ZCL_ZAJMN_GOALS_DPC(_EXT)`.
Create the entity types by hand (or import the DDIC tables and rename). Two names matter for every property:
the **external name** (what the page sends and reads, `app/webapp/model/Store.js`) and the **ABAP name** (what `ZCL_ZAJMN_GOALS_DPC_EXT.abap` uses).
They must be exactly as below. `developer/mock-gateway.mjs` implements this same contract and is what the page was tested against.

## Entity types and sets

**Goal** — set `Goals`. Key `GoalId`. Operations: GET list, GET single, **POST = save (deep insert, upsert)**.

| External | ABAP | Edm type |
|---|---|---|
| GoalId | GOAL_ID | String (10) |
| Pernr | PERNR | String (8) |
| Title | TITLE | String (255) |
| Description | DESCRIPTION | String |
| Measure | MEASURE | String |
| DueText | DUE_TEXT | String (40) |
| Weight | WEIGHT | Int16 (-1 = not set) |
| Progress | PROGRESS | Int16 |
| Status | STATUS | String (3) |
| StatusText | STATUS_TEXT | String (40) |
| ParentTitle | PARENT_TITLE | String (255) |
| PushedFromGoal | PUSHED_FROM_GOAL | String (10) |
| PushedFromPernr | PUSHED_FROM_PERNR | String (8) |
| Extra | EXTRA | String |

Navigation properties (1:n): `Activities` → Activity, `Pushes` → Push, `Contributors` → Contributor, `Log` → LogEntry.
ABAP names of the navigation properties: `ACTIVITIES`, `PUSHES`, `CONTRIBUTORS`, `LOG` (they are the deep structure's components).

**Activity** — set `Activities`. Key `GoalId`, `ActId`.

| External | ABAP | Edm |
|---|---|---|
| GoalId | GOAL_ID | String (10) |
| ActId | ACT_ID | String (10) |
| Progress | PROGRESS | Int16 |
| Note | NOTE | String |
| HasNote | HAS_NOTE | Boolean |
| DoneText | DONE_TEXT | String (40) |
| Position | POSITION | Int16 |
| Files | FILES | String (JSON) |

**Push** — set `Pushes`. Key `GoalId`, `ToPernr`. Properties: GoalId GOAL_ID, ToPernr TO_PERNR (String 8), Progress PROGRESS (Int16), Note NOTE (String 255), DueText DUE_TEXT, UpdatedText UPDATED_TEXT (String 40), Position POSITION (Int16).

**Contributor** — set `Contributors`. Key `GoalId`, `Position`. Properties: GoalId GOAL_ID, Position POSITION (Int16), Pernr PERNR (String 8), Data DATA (String, JSON).

**LogEntry** — set `LogEntries`. Key `GoalId`, `Position`. Properties: GoalId GOAL_ID, Position POSITION (Int16; 0 = newest, computed on read),
ActorPernr ACTOR_PERNR (String 8), Action ACTION (String 40), Text TEXT (String), DateText DATE_TEXT (String 40), Detail DETAIL (String, JSON),
OccurredAt OCCURRED_AT (**String**, ISO 8601 — table field `CLIENT_TS`).

**WorkflowLogRow** — set `WorkflowLog`. Key `LogId`. GET only, newest first, `$top` honoured (default 400).
Properties: LogId LOG_ID, GoalId GOAL_ID, GoalTitle GOAL_TITLE, ActorPernr ACTOR_PERNR, ActorName ACTOR_NAME (from PA0002), Action ACTION, Text TEXT, OccurredAt OCCURRED_AT (String ISO).

**Attachment** — set `Attachments`, **media type** (`m:HasStream`). Key `AttId`. Properties: AttId ATT_ID (String 10), FileName FILE_NAME, FileSize FILE_SIZE (Int32), MimeType MIMETYPE.
POST with the file as the body and the `Slug` header (URL-encoded file name) creates it and returns the entity; `GET Attachments('<id>')/$value` returns the bytes.
In the MPC_EXT `DEFINE`, set the media property: `lo_entity->set_is_media( )` and `lo_property->set_as_content_type( )` on `MimeType`.

**AiRequest** — set `AiRequests` (AI option B). Key `LogId`. **POST only** (create). Properties: LogId LOG_ID (String 12), Task TASK (String 20),
Pernr PERNR (String 8), Context CONTEXT (String, JSON), Answer ANSWER (String, JSON). The page sends Task, Pernr and Context; the service returns LogId and Answer
(the job's JSON, or `{"error":"..."}`).

## Function imports

| Name | HTTP | Parameters | Returns |
|---|---|---|---|
| `GetIds` | GET | `count` Int16 | collection of complex type `IdItem` { `Id` String } |
| `DeleteGoal` | POST | `GoalId` String, `Reason` String (255) | nothing |
| `AcceptAI` | POST | `LogId` String, `Text` String (800) | nothing |

`DeleteGoal` is a **soft delete**: sets `DELETED_AT`/`DELETED_BY`, writes log row `goal_deleted`. Only the owner may delete; since v68 that includes a copy that was pushed to them (the page then breaks the link for the people it was linked to: `EXTRA.broken`).

## Why POST = save

OData V2 has no deep update. The page keeps the whole goal and sends it in one request; `CREATE_DEEP_ENTITY` upserts by `GoalId` under one lock and one `COMMIT WORK`.
Children (activities, pushes, contributors) are replaced; log entries are only added (a step already stored is skipped).
`$expand=Activities,Pushes,Contributors,Log` on `Goals` is served by the child `GET_ENTITYSET` methods through navigation (the framework calls them per goal).

## Activate and test

1. `/IWFND/MAINT_SERVICE` > Add Service > `ZAJMN_GOALS_SRV` (system alias of the Gateway hub, or `LOCAL` on an embedded deployment).
2. `/IWFND/GW_CLIENT`:
   * `GET /sap/opu/odata/sap/ZAJMN_GOALS_SRV/$metadata` — every name above appears.
   * `GET .../GetIds?count=3` — three ids.
   * `POST .../Goals` with the body in `developer/sample-goal.json` (after `GET` with `X-CSRF-Token: Fetch`) — 201.
   * `GET .../Goals?$expand=Activities,Pushes,Contributors,Log&$format=json` — the goal comes back with its children, same values.
3. Launchpad: semantic object `ZAJMNGOALS`, action `display` (in `manifest.json`), target mapping to the UI5 app in the ABAP repository.
