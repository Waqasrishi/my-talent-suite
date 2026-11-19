# Developer guide — tables and API side by side

The v72 app runs today on Canvas: a static UI5 app, a small Node server (`server.mjs`), the goals API (`api.mjs`, `db.mjs`),
the AI (`ai.mjs`) and a Postgres database (`db/migrations/*.sql`). On SAP the same app runs against ECC.
The page never changes: only its data layer, `app/webapp/model/Store.js`, does (REST on Canvas, OData on ECC). Both offer the same functions:
`load, queue, remember, remove, upload, fileUrl, log, ai, aiAccept, reset, isOffline, install`.

## Tables

| Canvas Postgres | ECC table | OData (ZAJMN_GOALS_SRV) | Notes |
|---|---|---|---|
| `employees` (employee_id, label, level, manager_id) | — (read from PA0001 / PA0002 / HRP1001) | — | Never copied to ECC. PERNR is the id |
| `goals` (id, code `G-000123`, employee_id, title, description, measure, due, weight, progress, status, status_text, parent_title, pushed_from_goal_id, pushed_from_employee_id, extra jsonb, deleted_at/by) | `ZAJMN_GOAL` | `Goals` | `extra` holds what has no column (contributing-to, also-supports, approvals, legacy pending change). Soft delete |
| `activities` (id `A-000123`, goal_id, employee_id, progress, note, has_note, done_on, files jsonb, position) | `ZAJMN_ACT` | `Goals/Activities` | |
| `files` (id, name, size, type, uploaded_by, complete) | `ZAJMN_ATT` | `Attachments` (media) | Canvas keeps the bytes on its disk volume; ECC: RAWSTRING for the pilot, content server for production |
| `pushes` (goal_id, to_employee_id, progress, note, due, updated_on, position) | `ZAJMN_PUSH` | `Goals/Pushes` | |
| `contributors` (goal_id, employee_id, position, data jsonb) | `ZAJMN_CONTR` | `Goals/Contributors` | `data`: status, linked goal id, reason, dates |
| `audit_log` (goal_id, position, on_date, entry, actor_employee_id, action, detail, occurred_at) | `ZAJMN_LOG` | `Goals/Log`, `WorkflowLog` | Insert only. Action codes: `ecc/05_workflows_v62.md` |
| `ai_log` (employee_id, task, model, request, response, status, latency_ms, tokens, accepted, asked_by, created_at) | `ZAJMN_AILOG` | `AiRequests`, `AcceptAI` (option B) | `ecc/04_ai.md` |
| sequence `ts_id` | number ranges `ZAJMN_*` | `GetIds` | The page asks for ids in blocks of 100; it never makes its own |

## API

| Canvas route (`api.mjs`) | OData on ECC | What |
|---|---|---|
| `GET /api/state` | `GET Goals?$expand=Activities,Pushes,Contributors,Log` | everything the page shows |
| `GET /api/ids?n=100` | `GetIds(count=100)` | a block of new ids |
| `PUT /api/goals/:id` | `POST Goals` (deep, upsert) | save one goal with its children, one lock, one commit |
| `DELETE /api/goals/:id` | `DeleteGoal(GoalId, Reason)` | soft delete, log row `goal_deleted` |
| `GET /api/log` | `GET WorkflowLog?$orderby=OccurredAt desc&$top=…` | Workflow log tab, CSV download |
| `POST /api/files/start`, `PUT /api/files/:id/chunk`, `POST /api/files/:id/finish` | `POST Attachments` (Slug header) | upload in pieces (Canvas) / one media POST (ECC) |
| `GET /api/files/:id` | `GET Attachments('…')/$value` | download |
| `POST /api/ai`, `POST /api/ai/:id/accept` | option B: `POST AiRequests`, `AcceptAI(LogId, Text)`; option A: the Canvas routes | AI |
| `PUT /api/employees` | — | Canvas keeps the test people in sync; ECC reads HR master data |
| `POST /api/reset` | — | test data only. Never on ECC |

## Running the Fiori app without ECC

```
node developer/mock-gateway.mjs            # http://localhost:8094/  — the app against a strict stand-in of ZAJMN_GOALS_SRV
MOCK_AI=1 node developer/mock-gateway.mjs  # with canned AI answers through AiRequests (option B)
```
The stand-in keeps data in memory and refuses any property or type that is not in `ecc/02`, so it is also the reference for what the ABAP service must accept and return.
It does no authorization checks (the ABAP does).

## Running the Canvas reference on a laptop

```
npm install
PORT=8092 node server.mjs      # no DATABASE_URL: PGlite, a real Postgres in the process, kept in .data/ and migrated on start
# with DATABASE_URL=postgres://… it uses that database (on Canvas the platform applies db/migrations)
# AI: OPENAI_BASE_URL and OPENAI_API_KEY from the platform's llm resource; without them the AI parts fall back
```
`server.mjs` serves the app folders by name (`zajmn.hr.goals.hk-v72/` and earlier versions) from the Canvas project's root, so it runs there, not from this folder: in this pack the back end is reference reading. In the Canvas project, open `http://localhost:8092/goals-module/`.

## Where the logic lives in the page

`app/webapp/model/Goals.js` holds the screens and the workflow rules (the service must enforce the same rules — `ecc/05`).
`Scenario.js` is the test people table (with placeholder PERNRs). `I18n.js` holds the Arabic screen words; goal text is translated by the AI, never stored translated.
`css/goals.css` is the look (AJ fonts in `webapp/fonts`).
