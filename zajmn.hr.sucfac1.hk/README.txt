zajmn.hr.sucfac1.hk  -  AJMN People as a SAPUI5 component project
===================================================================
Project / component ID:   zajmn.hr.sucfac1.hk
Launchpad intent:         ZAJMNHR-display   (set in webapp/manifest.json, sap.app > crossNavigation)
Needs from SAPUI5:        sap.ui.core only. Minimum version 1.44.
Data:                     sample data only, kept in each browser. No backend, no OData service.

STRUCTURE (standard Web IDE layout)
  neo-app.json                  routes /webapp/resources to the SAPUI5 runtime in Web IDE
  webapp/
    manifest.json               app descriptor: ID, router, i18n, libraries, launchpad intent
    Component.js                the UI5 component
    view/App.view.xml           root view
    controller/App.controller.js starts the screens once the view is drawn
    model/People.js             the screens, rules and sample data
    css/people.css              the look (every rule is scoped to the app, so it cannot restyle the launchpad)
    i18n/i18n.properties        app title and description
    index.html                  start page for SAP Web IDE (SAPUI5 comes from the Web IDE runtime)
    index-standalone.html       start page for anywhere else (SAPUI5 comes from ui5.sap.com)

HOW THE APP MOVES AROUND
  The screens navigate through the component's UI5 router (route "page", pattern {all*}:?query:).
  Inside the Fiori launchpad the address belongs to the shell; the app's own part sits after "&/".
  Links in the page never change the browser address directly.

1. IMPORT INTO SAP WEB IDE
   File > Import > From File System > choose zajmn.hr.sucfac1.hk-v1.zip, keep "Extract Archive" ticked.
   The project zajmn.hr.sucfac1.hk appears in the workspace.

2. RUN IT
   Right-click webapp/index.html > Run > Run as Web Application.

3. DEPLOY TO THE ABAP FRONT-END SERVER
   Right-click the project > Deploy > Deploy to SAPUI5 ABAP Repository.
   Choose the system, then give an application name. The ABAP name is separate from the component ID and
   is limited to 15 characters, starting with Z, for example:   ZAJMN_HR_SF1_HK
   Then package and transport request, and deploy. The app is served at
       /sap/bc/ui5_ui5/sap/zajmn_hr_sf1_hk

4. SHOW IT IN THE FIORI LAUNCHPAD
   Launchpad Designer (or the Fiori launchpad content manager):
     a. Target mapping
          Semantic Object:       ZAJMNHR
          Action:                display
          Application Type:      SAPUI5 Fiori App
          URL:                   /sap/bc/ui5_ui5/sap/zajmn_hr_sf1_hk
          ID (component):        zajmn.hr.sucfac1.hk
          Device Types:          desktop, tablet, phone
     b. Tile: a static tile with the same semantic object and action, title "AJMN People".
     c. Add the tile to a catalog and give the catalog to the users' roles.

NOTES
  - The app draws its own header and side menu. Inside the launchpad you will see two headers.
  - Use the person icon (top right) to switch demo persona and review cycle, and to reset the demo data.
  - The browser console may show 404s for Component-preload.js and language files such as i18n_en.properties.
    They are optional files that UI5 looks for first; the app works without them.
  - This project has been run here on its own with SAPUI5 1.144. It has not been opened in SAP Web IDE
    or inside a launchpad yet, so the first import and run there is its first real test.
  - Do not enter real employee data.
