zajmn.hr.goals.hk  (version 15, Al Jazeera brand fonts)  -  Goals module (demo 1) as a SAPUI5 component project
==========================================================================
Project / component ID:   zajmn.hr.goals.hk
Launchpad intent:         ZAJMNGOALS-display   (webapp/manifest.json, sap.app > crossNavigation)
Opens the home page by:   ZAJMNHR-display      (the AJMN People home project, zajmn.hr.sucfac1.hk, version 4)
Needs from SAPUI5:        sap.ui.core only. Minimum version 1.44.
Data:                     sample data only (as in the prototype); nothing is saved. No backend, no OData service.

WHAT IT IS
  The third clickable prototype (goals-module (3).zip, 15 Nov 2026), as a component: Al Jazeera gradient look (navy and gold),
  My goals, an editable goal page, one owner per goal (a second owner shows an error) with any number of contributors,
  Push down to managers with their own plans and a progress roll-up, change after approval, per-goal Alignment with a progress
  ring on every box, a goal library of 427 ideas with type-ahead in the wizards, the New goal and Push down wizards, Dashboard,
  and Approvals (view as the Director, a Manager, an Employee or the ED). Its design is unchanged. The AI suggestions are scripted.
  The 427 ideas are embedded in webapp/model/Goals.js (LIBT). The full library, 3,204 draft goals, is library/goal-library.xlsx in
  the original zip and is not part of this project; its numbers are placeholders that HR must review (decision D-50).
  The ring values on levels other than the Director's own goals are sample numbers. Colours are approximate, not official.
  The zip's older design screens (screens/) and notes (CLAUDE.md, START-HERE.md) are not part of this project.

THE TEST SCENARIO (version 7): model/Scenario.js
  The people in the demo are one table in webapp/model/Scenario.js: Director General, Executive Directors, Directors, Managers and
  Employees, each with a level, a label and who they report to. "Viewing as" lists everyone. Edit the table to add or remove people.
  The Director General is the top of the organization: the New goal wizard has no role step and no parent step (Goal, Measure, Due date,
  Review), goals need no approval, and the Alignment chart shows names without "Owner".
  Every goal is shown in Arabic first, then English (lists, goal page, approvals, Alignment chart, wizard). A goal keeps its title in
  Arabic with the English beside it. Known goals are translated already (the DG strategy goals and the three starter ideas). For any
  goal typed or picked in one language, the review step fills in the other with the company model (qwen-flash) through the Canvas
  app's POST /api/translate, and the person can edit it or press the Translate buttons. The address is sap.ui5 > config > translateUrl
  in webapp/manifest.json: outside the Canvas app (for example on an SAP server) point it at a translation service that accepts
  {text, from, to} and returns {text}, or leave it empty and the two versions are typed by hand.
  Layout (version 14): every goal is a two-row block with a language tag in the left gutter (ع and EN), the Arabic large and right-aligned in
  IBM Plex Sans Arabic, the English below it, both in the same colour, with one golden line under the editable area.
  Fonts (version 15), from the company's Al Jazeera Design System: Source Serif 4 for English headlines and goal text, Inter for the
  interface, AJ Arabic (webapp/fonts/AlJazeera-Arabic-Bold.ttf, the house Arabic Thuluth, Bold only) for Arabic headlines and goal
  titles, and Noto Naskh Arabic for other Arabic text. Source Serif 4, Inter and Noto Naskh come from Google Fonts; AJ Arabic is in the
  project. The font file is (c) Tarek Atrissi Design: keep it inside company systems.
  No goals are preloaded. Everyone, at every level, creates goals with New goal: the DG creates the top goals (no approval needed),
  and each person below links theirs to a goal of the person above, who approves them (Approvals tab). Anyone with direct reports
  can push a goal down to them; it appears under "Pushed down to you" where they update progress. Alignment shows the whole cascade
  from the DG to the employee. Everything is sample data and nothing is saved: a refresh empties the slate.

DEEP LINKS (version 5)
  The home page can open the module at a given place with ?start=...  (or the launchpad parameter start):
  new (New goal wizard), align (Alignment), dash (Dashboard), goal (the first goal's page, with its progress update),
  approvals (the approvals queue, as the ED). With no parameter it opens My goals.

HOW IT CONNECTS TO THE HOME PAGE
  - The top-left link "AJMN People home" goes back to the home page.
  - On the home page (project zajmn.hr.sucfac1.hk, version 2), "My Goals" opens this module and "Create Goal" opens it
    directly in the New goal wizard (parameter start=new).
  - Inside the Fiori launchpad both use cross-application navigation, so each app needs its own target mapping and tile.
  - Outside the launchpad (Web IDE preview, a plain web server) the link opens the url in webapp/manifest.json,
    sap.ui5 > config > nav > home. It assumes both projects sit side by side in the same workspace.
  - The two apps keep separate sample data. They are connected by navigation, not by shared records.

STRUCTURE (standard Web IDE layout)
  neo-app.json                  routes /webapp/resources to the SAPUI5 runtime in Web IDE
  webapp/
    manifest.json               app descriptor: ID, launchpad intent, link to the home page
    Component.js                the UI5 component
    view/App.view.xml           root view
    controller/App.controller.js draws the prototype's page and loads its fonts
    model/Goals.js              the prototype's screens and sample data
    util/Nav.js                 opens another app (launchpad navigation, or a plain link)
    css/goals.css               the look (every rule scoped to the app, so it cannot restyle the launchpad)
    i18n/i18n.properties        app title and description
    index.html                  start page for SAP Web IDE
    index-standalone.html       start page for anywhere else (SAPUI5 from ui5.sap.com)

1. IMPORT INTO SAP WEB IDE
   File > Import > From File System > zajmn.hr.goals.hk-v5.zip, keep "Extract Archive" ticked.
   Import zajmn.hr.sucfac1.hk-v4.zip into the same workspace too, so the links between them work.

2. RUN IT
   Right-click webapp/index.html > Run > Run as Web Application.

3. DEPLOY TO THE ABAP FRONT-END SERVER
   Right-click the project > Deploy > Deploy to SAPUI5 ABAP Repository.
   The ABAP application name is separate from the component ID: at most 15 characters, starting with Z, for example
   ZAJMN_HR_GOALS. It is then served at /sap/bc/ui5_ui5/sap/zajmn_hr_goals

4. SHOW IT IN THE FIORI LAUNCHPAD
   Target mapping:  Semantic Object ZAJMNGOALS, Action display, Application Type SAPUI5 Fiori App,
                    URL /sap/bc/ui5_ui5/sap/zajmn_hr_goals, ID (component) zajmn.hr.goals.hk
   Tile:            a static tile with the same semantic object and action, title "Goals 2027".
   The home page's target mapping (ZAJMNHR-display) comes with the home project's README.
   Give both catalogs to the users' roles, or the links between the apps will say the target is not available.

NOTES
  - The app draws its own header, so inside the launchpad you will see two headers.
  - The page loads the prototype's fonts (Inter and Manrope) from Google Fonts; without internet it falls back to system fonts.
  - The browser console may show 404s for Component-preload.js and language files. They are optional; the app works without them.
  - This project has been run here on its own with SAPUI5 1.144, and linked to the home project. It has not been opened in
    SAP Web IDE or inside a launchpad yet.
  - Do not enter real employee data.
