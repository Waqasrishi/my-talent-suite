zajmn.hr.goals.hk  (v71, 19 Nov 2026)  -  AJMN Goals module as a SAPUI5 component, data in SAP ECC
================================================================================================
Component ID:      zajmn.hr.goals.hk
Launchpad intent:  ZAJMNGOALS-display  (webapp/manifest.json)
Needs:             sap.ui.core only, SAPUI5 1.44 or later. The screens are drawn by webapp/model/Goals.js.
Data:              SAP Gateway OData V2 service ZAJMN_GOALS_SRV  (webapp/model/Store.js)
AI:                optional; see ../ecc/04_ai.md  (aiOnEcc: the service's AiRequests; or aiUrl: the Canvas app)

Configure before UI5 loads (index.html, or a launchpad plugin):
  window.AJMN_CONFIG = { serviceUrl: "/sap/opu/odata/sap/ZAJMN_GOALS_SRV", aiOnEcc: true };

Build for the launchpad:  npm install && npm run build   ->  dist/ with Component-preload.js; upload dist/ (/UI5/UI5_REPOSITORY_LOAD)
Run without ECC:          node ../developer/mock-gateway.mjs   ->  http://localhost:8094/

Files
  model/Goals.js      screens and workflow rules (same file as the Canvas v71 app)
  model/Store.js      the ECC data layer (OData V2, CSRF token, ids from GetIds)        <- differs from Canvas
  model/Scenario.js   the test people, each with a PLACEHOLDER PERNR starting with 9     <- differs from Canvas
  model/I18n.js       English / Arabic screen words (goal text is translated by the AI, never stored)
  model/Weights.js, Slider.js, Datepicker.js, Motion.js, Morph.js, Tip.js   small UI parts
  css/goals.css       the look;  fonts/  Al Jazeera Latin and Arabic company fonts

What a person can do (v71): create, edit and delete their own goals (all saved at once, reviewed afterwards),
push goals down to their team, invite contributors and answer invitations (View goal / Decline / Accept),
update progress with activities and attachments, set weights, see the full-width alignment chart and goal popups,
read the history of a goal, switch goal text between English and Arabic, and use AI suggestions and reviews.
Rules in detail: ../ecc/05_workflows_v71.md

Before go-live: remove the "Proxy Now" demo switch and "Reset test data" (the service decides from the logon user) and replace the placeholder PERNRs.
