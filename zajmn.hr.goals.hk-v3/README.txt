zajmn.hr.goals.hk  (version 3, latest prototype)  -  Goals module (demo 1) as a SAPUI5 component project
==========================================================================
Project / component ID:   zajmn.hr.goals.hk
Launchpad intent:         ZAJMNGOALS-display   (webapp/manifest.json, sap.app > crossNavigation)
Opens the home page by:   ZAJMNHR-display      (the AJMN People home project, zajmn.hr.sucfac1.hk, version 2)
Needs from SAPUI5:        sap.ui.core only. Minimum version 1.44.
Data:                     sample data only (as in the prototype); nothing is saved. No backend, no OData service.

WHAT IT IS
  The latest clickable prototype (goals-module (2).zip, updated 15 Nov 2026), as a component: Al Jazeera gradient look
  (navy and gold), My goals, an editable goal page, contributors, Push down to managers with their own plans and a
  progress roll-up, change after approval, per-goal Alignment, the New goal and Push down wizards, Dashboard, and
  Approvals (view as the Director, a Manager or the ED). Its design is unchanged. The AI suggestions are scripted.
  The colours are approximate (navy #212D66, gold #D89E11), not official values, as the prototype's notes say.
  Open decision D-44 (how owner, contributor and team progress combine) is still open in the prototype.
  The zip's older design screens (screens/) and notes (CLAUDE.md, START-HERE.md) are not part of this project.

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
   File > Import > From File System > zajmn.hr.goals.hk-v3.zip, keep "Extract Archive" ticked.
   Import zajmn.hr.sucfac1.hk-v3.zip into the same workspace too, so the links between them work.

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
