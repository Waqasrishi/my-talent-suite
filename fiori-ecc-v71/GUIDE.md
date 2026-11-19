# Quick guide — Goals v71 on Fiori + SAP ECC

Short version of README.md. Each step names the file that has the detail.

## 0. Try it first (10 minutes, no SAP needed)
1. Install Node.js 20 or later.
2. Run `MOCK_AI=1 node developer/mock-gateway.mjs`.
3. Open `http://localhost:8094/` — the real app against a stand-in of the SAP service.
4. Use **Proxy Now** (avatar menu) to act as different people.

## 1. Prepare
1. Get the real personnel numbers (PERNR) of the people who will use it.
2. Put them in `migration/pernr-map.json` and `app/webapp/model/Scenario.js` (replace every number starting with 9).
3. Create package `ZAJMN` and one transport per layer.

## 2. ECC objects — `ecc/01_tables_SE11.md`
1. SE11: tables `ZAJMN_GOAL`, `_ACT`, `_ATT`, `_PUSH`, `_CONTR`, `_LOG`, `_AILOG`, `_AICONF`, and new in v71 `_CONFIG` (SM30 view `ZAJMN_CONFIG_V`), `_NOTIF`, `_DELEG`.
2. SE11: lock object `EZAJMN_GOAL`.
3. SNRO: number ranges `ZAJMN_GOAL`, `ZAJMN_ATT`, `ZAJMN_LOG`, `ZAJMN_AILOG`, `ZAJMN_NOTIF` (interval 01).
4. SM30: fill `ZAJMN_CONFIG` (at least `DG_PERNR`; the other keys have defaults, `ecc/06_config_notifications.md`).

## 3. The service — `ecc/02_gateway_service_SEGW.md`
0. v71: also paste `ZCL_ZAJMN_RULES` and `ZCL_ZAJMN_NOTIFY` after `ZCL_ZAJMN_UTIL`, and schedule `ZAJMN_REMINDERS` in SM36 after a test run (`ecc/06_config_notifications.md`).
1. SEGW: project `ZAJMN_GOALS`, service `ZAJMN_GOALS_SRV`, OData V2.
2. Create every entity, property and function import **with exactly the names in ecc/02**.
3. Generate, then paste the classes in this order: `ZCL_ZAJMN_UTIL`, `ZCL_ZAJMN_AI`, `ZCL_ZAJMN_GOALS_DPC_EXT`.
4. Activate; fix what the syntax check reports (spots to check are marked in the code).
5. `/IWFND/MAINT_SERVICE`: register the service.

## 4. Test the service
1. `/IWFND/GW_CLIENT`: `GET .../$metadata` — all names from ecc/02 appear.
2. `GET .../GetIds?count=3` — three ids.
3. `POST .../Goals` with `developer/sample-goal.json` — answer 201.
4. `GET .../Goals?$expand=Activities,Pushes,Contributors,Log` — the goal comes back with the same values.
5. Unsure what correct looks like? Send the same requests to the stand-in (step 0).

## 5. Roles — `ecc/03_authorizations_and_ids.md`
1. SU21: authorization object `Z_AJMN_GOAL` (`ACTVT`, `ZAJMNROLE`).
2. PFCG: roles Employee, Manager, HR, each with `S_SERVICE` for `ZAJMN_GOALS_SRV`.
3. Check every user has infotype 0105 subtype 0001 (user name → PERNR).

## 6. AI (optional) — `ecc/04_ai.md`
1. Agree with security and data protection what goal text may go to the company model.
2. SM59: destination `ZAJMN_LLM` (HTTPS, to the model gateway).
3. SM30: one row in `ZAJMN_AICONF` (`DEFAULT`, model, key). Never put the key in code.
4. No AI? Skip this: the app falls back to the goal library.

## 7. The app
1. Set `AJMN_CONFIG = { serviceUrl: "/sap/opu/odata/sap/ZAJMN_GOALS_SRV", aiOnEcc: true }` (already in `app/webapp/index.html`; in the launchpad, set it in a plugin).
2. In `app/`: `npm install`, then `npm run build` → `dist/`.
3. Upload `dist/` with `/UI5/UI5_REPOSITORY_LOAD`.
4. Launchpad: target mapping `ZAJMNGOALS-display`, tile, catalog, assign to the roles.

## 8. Move the prototype's data — `migration/`
1. `node migration/export-from-canvas.mjs <canvas url> <cookie>` → `out/`.
2. `node migration/check-csv.mjs out` — every file must say "rows ok".
3. Copy `out/` to the application server folder in `ZAJMN_IMPORT`'s parameter.
4. Run `ZAJMN_IMPORT` with **Test run**, then without.
5. SNRO: raise `ZAJMN_GOAL` above the highest goal and activity id.

## 9. Go-live check
1. A person creates a goal, reloads: it is still there with its activities.
2. `ZAJMN_LOG` has the steps; `ZAJMN_AILOG` has the AI calls (if on).
3. A manager sees their team's goals; an employee cannot see a colleague's.
4. Remove **Proxy Now** and **Reset test data** from the app.
5. Decide the open rules first: goal-setting window and lock date, minimum standard, review deadline, who reviews the Director General, retention (`ecc/05_workflows_v71.md`).

## Where to look when something fails
| Symptom | Look at |
|---|---|
| App shows "Could not reach the database" | service not registered, wrong `serviceUrl`, or no `S_SERVICE` in the role |
| Save gives "Not saved. Retrying…" | `/IWFND/ERROR_LOG` — usually a name or type differing from ecc/02 |
| Reload loses activities or contributors | the child reads in `ZCL_ZAJMN_GOALS_DPC_EXT` (navigation from `Goals`) |
| "You may not change this goal" | reporting line in HRP1001 / `RH_GET_LEADER`, or missing infotype 0105 |
| AI says it could not answer | SM59 `ZAJMN_LLM` connection test, key in `ZAJMN_AICONF`, `ZAJMN_AILOG` response column |
