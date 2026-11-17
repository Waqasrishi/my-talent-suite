zajmn.hr.sucfac1.hk  (version 6, Goals theme, company Al Jazeera fonts)  -  AJMN People home as a SAPUI5 component project
===================================================================
Project / component ID:   zajmn.hr.sucfac1.hk
Launchpad intent:         ZAJMNHR-display   (webapp/manifest.json, sap.app > crossNavigation)
Opens the Goals module by: ZAJMNGOALS-display (project zajmn.hr.goals.hk, version 5)
Needs from SAPUI5:        sap.ui.core only. Minimum version 1.44.
Data:                     sample data only. No backend, no OData service.

WHAT IT IS
  The new AJMN People home page (15 Nov 2026, homepage/home.dc.html): navy and gold, Inter font, hero, quick actions,
  "Needs attention", and "Explore and take action". My Goals, Create Goal (start=new), Update Progress (start=goal),
  Review Team and Approvals (start=approvals), Strategy (start=align) and Reports (start=dash) open the Goals module.
  Areas not built yet (performance, development, learning, training needs) show a "not set up yet" notice.

FONTS: see VERSION 6 below (the company Al Jazeera fonts replaced the earlier Source Serif, Inter and Noto).
  in AJ Arabic (webapp/fonts/AlJazeera-Arabic-Bold.ttf, (c) Tarek Atrissi Design) and Arabic text in Noto Naskh Arabic.

STRUCTURE (standard Web IDE layout)
  neo-app.json, webapp/manifest.json, Component.js, view/App.view.xml, controller/App.controller.js (the page markup),
  model/Home.js (links and notice), util/Nav.js (launchpad navigation or plain link), css/home.css (scoped to .ajmnh),
  i18n/i18n.properties, index.html (Web IDE), index-standalone.html (anywhere else, SAPUI5 from ui5.sap.com)

1. IMPORT:  SAP Web IDE > File > Import > From File System > zajmn.hr.sucfac1.hk-v4.zip (Extract Archive ticked).
   Import zajmn.hr.goals.hk-v5.zip into the same workspace so the links work.
2. RUN:     right-click webapp/index.html > Run > Run as Web Application.
3. DEPLOY:  right-click the project > Deploy > Deploy to SAPUI5 ABAP Repository (name at most 15 characters, e.g. ZAJMN_HR_HOME).
4. LAUNCHPAD: target mapping Semantic Object ZAJMNHR, Action display, SAPUI5 Fiori App, URL /sap/bc/ui5_ui5/sap/zajmn_hr_home,
   ID zajmn.hr.sucfac1.hk; static tile "AJMN People". Give both apps' catalogs to the users' roles.

VERSION 6: all fonts are the company Al Jazeera fonts (Latin and Arabic) in webapp/fonts, declared in webapp/css/home.css. Nothing loads from Google Fonts.
