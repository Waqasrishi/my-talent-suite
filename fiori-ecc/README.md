# AJMN Goals on SAP Fiori with the data in SAP ECC

This is the Goals app (v49) with its data layer pointed at **SAP ECC** through SAP Gateway (OData V2), plus everything the ECC side needs.
It was built from the Canvas prototype, where the same data lives in Postgres. **Nothing here has been run against a real ECC or Gateway system yet.**

```
 Fiori launchpad page (app/webapp, UI5)
        |  OData V2 JSON  (CSRF token, same host)
 SAP Gateway: ZAJMN_GOALS_SRV  (ecc/02, ZCL_ZAJMN_GOALS_DPC_EXT)
        |  authority checks (ecc/03), enqueue, number ranges
 ECC tables ZAJMN_GOAL / _ACT / _ATT / _PUSH / _CONTR / _LOG   (ecc/01)
        |  PERNR only: names and org structure are read from PA0001/PA0002/HRP1001, never copied
 AI: stays the company model behind the Canvas app (ai.mjs). Set AJMN_CONFIG.aiUrl to reach it.
```

## What is in the zip

| Folder | What |
|---|---|
| `app/` | the Fiori project (UI5, `zajmn.hr.goals.hk`, v49). `webapp/model/Store.js` is the **OData** data layer; everything else is the same app as on Canvas |
| `ecc/01_tables_SE11.md` | the tables, number ranges and lock object |
| `ecc/02_gateway_service_SEGW.md` | the entity model of the service and how to activate it |
| `ecc/ZCL_ZAJMN_GOALS_DPC_EXT.abap` | the service implementation (a starting point for the ABAP developer) |
| `ecc/03_authorizations_and_ids.md` | PERNR as employee id, roles, authorization object, and the best-practice list |
| `migration/export-from-canvas.mjs` | exports the prototype's data to CSV in ECC format, with `pernr-map.json` |
| `migration/ZAJMN_IMPORT.abap` | loads those CSV files into the tables |

## The order to do it in

1. **Personnel numbers.** Fill `migration/pernr-map.json` and the `pernr` values in `app/webapp/model/Scenario.js` with real PERNRs. Until then both hold placeholders starting with 9.
2. **ECC:** create the tables, number ranges and lock object (`ecc/01`); build the service in SEGW (`ecc/02`); paste and finish `ZCL_ZAJMN_GOALS_DPC_EXT` (`ecc/`); create the roles (`ecc/03`). Test the service in `/IWFND/GW_CLIENT`.
3. **First test:** open the page with `window.AJMN_CONFIG = { serviceUrl: "/sap/opu/odata/sap/ZAJMN_GOALS_SRV" }` set before UI5 loads (a line in `index.html`), create a goal, reload: it must still be there. Then check `ZAJMN_LOG` has the rows.
4. **Move the data:** `node migration/export-from-canvas.mjs <canvas url> <cookie>`, load with `ZAJMN_IMPORT` (test run first), then raise the number ranges above the highest id.
5. **Launchpad:** deploy the UI5 app (BSP / ABAP repository, `/UI5/UI5_REPOSITORY_LOAD`), add the target mapping for `ZAJMNGOALS-display`, assign it to a catalog and the roles.

## What still differs from the Canvas version, on purpose or not yet done

* The scenario "view as" switch (proxy) exists for the demo. On ECC the service must decide from the logon user: remove the switch before go-live.
* Attachments are stored in `ZAJMN_ATT` (RAWSTRING). Production should use the content server or DMS.
* The date shown on a goal is text in the page (`DueText`); the table has a real date (`DUE_DATE`). The deep save needs the conversion written (marked in the ABAP).
* The ETag check for two people saving at once is marked in the ABAP, not written.
* AI is not part of ECC. It calls the Canvas app's company model (`aiUrl`). Whether goal text may go there from the production system is a decision for security and data protection.
* Employees are not synced into the tables on purpose. If you want the "contributors" dropdown to come from ECC, add an `Employees` entity set reading HRP1001 below the logged-on manager.
