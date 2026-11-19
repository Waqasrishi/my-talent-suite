# AJMN Goals v68 — SAP Fiori front end, SAP ECC back end, developer pack

> **In a hurry? Read `GUIDE.md`** — the same steps, point by point, one page.

The Goals app as it is on Canvas today (v68, 19 Nov 2026), ready for an SAP team: the UI5 app for the Fiori launchpad, the ECC tables, the OData service
and its ABAP, roles, the AI (both ways of running it), the migration of the prototype's data, and a stand-in Gateway to run and test the app without ECC.

```
 Fiori launchpad page            app/webapp  (UI5 component zajmn.hr.goals.hk)
        |  OData V2 JSON, CSRF token, same host
 SAP Gateway  ZAJMN_GOALS_SRV     ecc/02 + ZCL_ZAJMN_GOALS_DPC_EXT.abap  (+ ZCL_ZAJMN_UTIL.abap)
        |  who may see / change (reporting line, contributors, HR), lock EZAJMN_GOAL, number ranges
 ECC tables ZAJMN_GOAL / _ACT / _ATT / _PUSH / _CONTR / _LOG / _AILOG / _AICONF      ecc/01
        |  PERNR only: names and reporting line read from PA0001 / PA0002 / PA0105 / HRP1001
 AI     option B: AiRequests -> ZCL_ZAJMN_AI.abap -> SM59 ZAJMN_LLM -> company model (logged in ZAJMN_AILOG)
        option A: the page calls the Canvas app's /api/ai                                  ecc/04
```

## What changed since the v62 pack

Same tables, same OData service, same names. Nothing to re-create in SE11 or SEGW. The new page data (`broken`, contributor tab, review notes) lives in `EXTRA`.

| Area | v68 |
|---|---|
| Push down | Three quick steps (goals, people, check); Director General and Executive Director can reach people one level down; copies arrive already approved |
| Delete | Always the owner's choice; people linked to the goal are told and their link is broken, with an item to relink |
| Contributors | Search box (Executive Directors, Directors, Managers), a Contributor tab, Accept opens an editable copy, no tailoring window |
| Director General | Dashboard of Executive Directors with expected progress, a drill-down with Show more (activities and files), Split evenly for weights, Approve all asks first |
| Wizard | Role step back for Executive Directors and Directors, calmer look, plain review rows, due date taken from the measure |
| Look | Al Jazeera fonts bundled in `app/webapp/fonts`, hover tips, lighter Team progress, see-through messages |
| ABAP | `DeleteGoal` no longer refuses a pushed copy; `MAY_CHANGE` also allows a person a goal was pushed to (`IS_PUSHED_TO`). Not compiled (no SAP system here) |

## What was tested, and what was not

| Part | Status |
|---|---|
| Fiori app (`app/webapp`) against the service contract | **Tested end to end** against `developer/mock-gateway.mjs`, a strict stand-in for `ZAJMN_GOALS_SRV` that refuses any property name or type not in `ecc/02`: load, CSRF token, new goal with AI suggestions, push down to three people, edit, AI review fix, activity with an attachment (upload and download), contributor invite, accept with AI tailoring, delete, review and approve, Workflow log, English/Arabic translation, and a reload that brings every field back unchanged (no re-save after reload). No failed requests and no script errors. |
| Migration export (`migration/export-from-canvas.mjs`) | **Run** against a copy of the Canvas data; every row checked with `migration/check-csv.mjs`, which splits the files exactly as `ZAJMN_IMPORT` does |
| ABAP (`ecc/*.abap`, `migration/ZAJMN_IMPORT.abap`) | **Not compiled: there is no SAP system here.** Written for ABAP 7.40 SP08+ on the same contract the app was tested against, reviewed line by line. Expect the first activation in SE24/SE38 to report small things (names of generated MPC types, release-specific function parameters such as `RH_GET_LEADER`); each is marked in the code |
| `npm run build` (UI5 tooling, `Component-preload.js`) | Not run here (installing the tool was not allowed in this environment). Standard UI5 tooling; the app also runs without it |

## What is in the zip

| Folder / file | What |
|---|---|
| `app/` | The Fiori project (`zajmn.hr.goals.hk`, v68). Same screens as Canvas. `model/Store.js` talks OData to ECC; `model/Scenario.js` has a placeholder PERNR per test person. `ui5.yaml` + `package.json`: `npm run build` → `dist/` with `Component-preload.js` for the launchpad |
| `ecc/01_tables_SE11.md` | Tables, number ranges, lock object — the page's fields 1:1, so nothing is lost on save |
| `ecc/02_gateway_service_SEGW.md` | Every entity, property (external and ABAP name, Edm type), navigation and function import |
| `ecc/ZCL_ZAJMN_GOALS_DPC_EXT.abap` | The whole service: reads with `$expand`, deep save, delete, ids, workflow log, attachments, AI |
| `ecc/ZCL_ZAJMN_UTIL.abap` | Logon user → PERNR, reporting line, names, text ↔ SAP dates and times |
| `ecc/ZCL_ZAJMN_AI.abap` | The five AI jobs from ABAP, same prompts and checks as Canvas, logged in `ZAJMN_AILOG` |
| `ecc/03_authorizations_and_ids.md` | PERNR as employee id, roles, authorization object, who may see and change what |
| `ecc/04_ai.md` | AI: every job, input and output, logging, option A or B |
| `ecc/05_workflows_v68.md` | The v68 workflows, status codes and log action codes |
| `developer/mock-gateway.mjs` | The stand-in Gateway. `node developer/mock-gateway.mjs` (add `MOCK_AI=1` for canned AI answers), open `http://localhost:8094/` |
| `developer/sample-goal.json` | A save request (`POST Goals`) to try in `/IWFND/GW_CLIENT` |
| `developer/DEVELOPER.md` | Canvas tables ↔ ECC tables ↔ OData; Canvas routes ↔ OData calls |
| `developer/` (rest) | The Canvas back end that runs v68 today (reference) |
| `migration/` | `export-from-canvas.mjs` → CSV, `check-csv.mjs`, `ZAJMN_IMPORT.abap` (all five tables, test run first), `pernr-map.json` |

## The order to do it in

1. **Personnel numbers.** Replace the placeholders (start with 9) in `migration/pernr-map.json` and `app/webapp/model/Scenario.js`.
2. **ECC objects** (`ecc/01`): tables, number ranges `ZAJMN_GOAL` `ZAJMN_ATT` `ZAJMN_LOG` `ZAJMN_AILOG`, lock object `EZAJMN_GOAL`, table `ZAJMN_AICONF` with its SM30 view.
3. **Service** (`ecc/02`): build `ZAJMN_GOALS_SRV` in SEGW with exactly the names given; generate; paste `ZCL_ZAJMN_UTIL`, `ZCL_ZAJMN_AI`, then `ZCL_ZAJMN_GOALS_DPC_EXT`; activate; register in `/IWFND/MAINT_SERVICE`.
4. **Test the service** in `/IWFND/GW_CLIENT` with `developer/sample-goal.json` (steps in `ecc/02`). The same request against `mock-gateway.mjs` shows what a correct answer looks like.
5. **Roles** (`ecc/03`) and the authorization object `Z_AJMN_GOAL`.
6. **AI** (`ecc/04`): option B needs SM59 destination `ZAJMN_LLM` and the key in `ZAJMN_AICONF`; agree with security and data protection first. Without AI the app works and falls back to the goal library.
7. **App:** set the configuration in the launchpad (one line before UI5 loads, or in the FLP plugin):
   `window.AJMN_CONFIG = { serviceUrl: "/sap/opu/odata/sap/ZAJMN_GOALS_SRV", aiOnEcc: true }`
   (`aiOnEcc: false` and `aiUrl: "https://<canvas app>/api"` for option A; neither for no AI).
   `npm run build` in `app/`, upload `dist/` with `/UI5/UI5_REPOSITORY_LOAD`, target mapping `ZAJMNGOALS-display`, catalog, roles.
8. **Move the data:** `node migration/export-from-canvas.mjs <canvas url> <cookie>`, `node migration/check-csv.mjs out`, copy `out/` to the application server,
   run `ZAJMN_IMPORT` with Test run, then without, then raise number range `ZAJMN_GOAL` above the highest id.
9. **First real test:** create a goal, reload, it must be there with its activities; check `ZAJMN_LOG`.

## Before go-live

* Remove the "Proxy Now" demo switch and the "Reset test data" menu item: on ECC the service decides from `SY-UNAME`.
* Attachments in `ZAJMN_ATT` are for the pilot; production uses the content server / DMS and a virus scan (`VSCAN`).
* The ETag check for two people saving the same goal at the same moment is not built (the lock prevents interleaving, not overwriting).
* **Still being decided** (19 Nov 2026): workflow changes and compliance checks (goal-setting window and lock, minimum standard, review deadline, who reviews the Director General, retention, visibility). Build them in the service, not only in the page.

## What changed from the v49 pack

v62 screens and rules (reviews afterwards instead of approvals first, Accept/Decline invitations, narrower delete, translation, landscape alignment chart);
the ABAP is now complete (child reads, every field stored, attachments, AI); new `ZCL_ZAJMN_UTIL`, `ZCL_ZAJMN_AI`, `ZAJMN_AICONF`; the import loads all five tables;
the data layer sends `Weight -1` for "not set", escapes quotes in OData literals, records accepted AI text, and shows names in the Workflow log.
