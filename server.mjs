// Serves the one static page (index.html) on Canvas, with the platform's checks: who may open it
// (score.yaml's access, as PLATFORM_ACCESS), /healthz, and the security headers. No dependencies.
// It serves index.html, strategy.html, successfactors.html and goals-hub.html, and the Fiori (UI5) version of the
// Talent Suite under /fiori/ — the files found in fiori/ at start, and nothing else: no other file in this folder is reachable.
// The front page "/" is the Fiori AJMN People home (zajmn.hr.sucfac1.hk-v5) opening the Fiori Goals module (zajmn.hr.goals.hk-v17: goals at every level, no translation; v16 and v15 with it stays at /goals-module-v15, people table in model/Scenario.js); the plain HTML versions are /home.html and /goals.html (the 15 Nov prototype); goals-hub-v2.html stays at its own address; the original
// goals-hub.html stays at /goals-hub.html and the original Talent Suite page at /index.html, both unchanged.
// The two component projects (the AJMN People home and the Goals module, Web IDE layout) are served under /<id>/webapp/.
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { api, checkDisk } from "./api.mjs";
import { join } from "node:path";

const PAGES = { "/": "home.html", "/home.html": "home.html", "/goals.html": "goals.html", "/goals-hub-v2.html": "goals-hub-v2.html", "/index.html": "index.html", "/strategy.html": "strategy.html",
  "/successfactors.html": "successfactors.html", "/goals-hub.html": "goals-hub.html" };
// The Fiori app's own files, listed once at start: a request can only name one of these.
const TYPES = { html: "text/html", js: "text/javascript", json: "application/json", xml: "application/xml", css: "text/css" };
const FIORI = new Set(["fiori", "fiori-people"].flatMap((dir) => readdirSync(join(import.meta.dirname, dir), { recursive: true, withFileTypes: true })
  .filter((f) => f.isFile() && f.name.split(".").pop() in TYPES)
  .map((f) => "/" + join(f.parentPath, f.name).slice(import.meta.dirname.length + 1).split("\\").join("/"))));
// The two component projects: /<id>/webapp/... comes from <folder>/webapp/. Their start page is built below (the project's
// own index.html is the Web IDE one, which needs a Web IDE runtime), loading SAPUI5 from ui5.sap.com like the Fiori pages do.
const PROJECTS = [
  { url: "zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v2" },
  { url: "zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk" },
  // the same two projects in the Al Jazeera theme, beside the plain ones; their links to each other stay inside /aj/
  { url: "aj/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v3" },
  { url: "aj/zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v2" },
  // the latest goals prototype (version 4, its own navy and gold look), with the Al Jazeera themed home page
  { url: "latest-v9/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v9" },
  { url: "latest-v8/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v8" },
  { url: "latest-v7/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v7" },
  { url: "latest-v6/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v6" },
  { url: "latest-v5/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v5" },
  { url: "latest/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v10" },
  { url: "goals-module-v5", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v5", home: "/" },
  { url: "goals-module-v6", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v6", home: "/" },
  { url: "goals-module-v7", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v7", home: "/" },
  { url: "goals-module-v8", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v8", home: "/" },
  { url: "goals-module-v9", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v9", home: "/" },
  { url: "goals-module-v13", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v13", home: "/" },
  { url: "goals-module-v14", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v14", home: "/" },
  { url: "goals-module-v15", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v15", home: "/" },
  { url: "goals-module-v16", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v16", home: "/" },
  { url: "goals-module-v17", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v17", home: "/" },
  { url: "goals-module-v18", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v18", home: "/" },
  { url: "goals-module-v19", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v19", home: "/" },
  { url: "goals-module-v20", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v20", home: "/" },
  { url: "goals-module-v21", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v21", home: "/" },
  { url: "goals-module-v22", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v22", home: "/" },
  { url: "goals-module-v23", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v23", home: "/" },
  { url: "goals-module-v24", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v24", home: "/" },
  { url: "goals-module-v25", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v25", home: "/" },
  { url: "goals-module-v26", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v26", home: "/" },
  { url: "goals-module-v27", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v27", home: "/" },
  { url: "goals-module-v28", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v28", home: "/" },
  { url: "goals-module-v29", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v29", home: "/" },
  { url: "goals-module-v30", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v30", home: "/" },
  { url: "goals-module-v31", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v31", home: "/" },
  { url: "goals-module-v32", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v32", home: "/" },
  { url: "goals-module-v33", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v33", home: "/" },
  { url: "goals-module-v34", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v34", home: "/" },
  { url: "goals-module-v35", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v35", home: "/" },
  { url: "goals-module-v36", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v36", home: "/" },
  { url: "goals-module-v37", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v37", home: "/" },
  { url: "goals-module-v38", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v38", home: "/" },
  { url: "goals-module-v39", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v39", home: "/" },
  { url: "goals-module-v40", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v40", home: "/" },
  { url: "goals-module-v41", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v41", home: "/" },
  { url: "goals-module-v42", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v42", home: "/" },
  { url: "goals-module-v43", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v43", home: "/" },
  { url: "goals-module-v44", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v44", home: "/" },
  { url: "goals-module-v45", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v45", home: "/" },
  { url: "goals-module-v46", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v46", home: "/" },
  { url: "goals-module-v47", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v47", home: "/" },
  { url: "goals-module-v48", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v48", home: "/" },
  { url: "goals-module-v49", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v49", home: "/" },
  { url: "goals-module-v50", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v50", home: "/" },
  { url: "goals-module-v51", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v51", home: "/" },
  { url: "goals-module-v52", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v52", home: "/" },
  { url: "goals-module-v53", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v53", home: "/" },
  { url: "goals-module-v54", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v54", home: "/" },
  { url: "goals-module-v55", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v55", home: "/" },
  { url: "goals-module-v56", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v56", home: "/" },
  { url: "goals-module-v57", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v57", home: "/" },
  { url: "goals-module-v58", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v58", home: "/" },
  { url: "goals-module-v59", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v59", home: "/" },
  { url: "goals-module-v60", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v60", home: "/" },
  { url: "goals-module-v61", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v61", home: "/" },
  { url: "goals-module-v62", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v62", home: "/" },
  // v63 (the process upgrade) was taken off the live link on 19 Nov 2026 at the owner's request; it stays here to look at
  { url: "goals-module-v63", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v63", home: "/" },
  // v64 = v62 with at most 5 suggestions per wizard step (AI first)
  { url: "goals-module-v64", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v64", home: "/" },
  // v65 = v64 with an easier My goals: suggestions in the empty box, attention box only when needed, Approvals count, slimmer banner
  // v66 = v65 with the review answers: Role, Parent and Due date steps filled in, one-screen push down, grouped approvals, DG dashboard by Executive Director, Owner badge
  { url: "goals-module-v66", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v66", home: "/" },
  // v67 = v66 with round 2 answers: calmer Team progress, Contributor tag, Director/ED wizard with Role step, lighter push down, Approve all asks, dashboard drill-down
  { url: "goals-module-v67", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v67", home: "/" },
  // v68 = v67 with round 3 answers: no tags on review rows, hover tips, lighter glow, drill-down Show more, searchable contributor picker, new push down
  { url: "goals-module-v68", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v68", home: "/" },
  // v69 = v68 with workflow round answers (in-app part): draft first, send checks, review rules, reminders
  { url: "goals-module-v69", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v69", home: "/" },
  // v70 = v69 with the new Alignment cascade (cards, tags, dashed contributors, details popup, team performance)
  { url: "goals-module-v70", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v70", home: "/" },
  // v71 = v70 with the ownership rule: the Director General's goals are the strategy (no separate column); Owner only on goals an owner holds; team goals carry no tag
  { url: "goals-module-v71", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v71", home: "/" },
  // v72 = v71 with bigger goal titles, a Goal N badge, and one expandable block for team and contributors
  { url: "goals-module-v72", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v72", home: "/" },
  // v73 = v72 with the Alignment arrows fixed, no column headers, no hover text on cards
  { url: "goals-module-v73", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v73", home: "/" },
  // v74 = v73 with the Goal N tab hanging from the top left of each goal card, a little transparent
  { url: "goals-module-v74", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v74", home: "/" },
  // v75 = v74 with the Alignment chart linking a contributor to the right goal (by the invitation, not by matching titles)
  { url: "goals-module-v75", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v75", home: "/" },
  // v76 = v75 with the Mist surface theme (soft lavender-grey ground, white cards with hairline and soft shadow) and no "Pushed down to N" line
  { url: "goals-module-v76", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v76", home: "/" },
  // v77 = v76 with the Alignment chart keeping the goal you open or close in the middle of the view
  { url: "goals-module-v77", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v77", home: "/" },
  // v78 = v77 with a gold line along the top of each goal portlet, like the overview tiles
  { url: "goals-module-v78", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v78", home: "/" },
  // v79 = v78 in the Portal look (option A): AJ indigo and gold, light side menu, white top bar, soft haze behind the title, AJ fonts only
  { url: "goals-module-v79", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v79", home: "/", skin: "portal" },
  // v80 = v78 in the AJ aurora look (option C): AJ indigo, gold and blue, frosted cards on a faint grid, AJ fonts only
  { url: "goals-module-v80", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v80", home: "/", skin: "aurora" },
  // v81 = v79 (Portal) and v82 = v80 (AJ aurora) with no English / Arabic switch: always English
  { url: "goals-module-v81", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v81", home: "/", skin: "portal" },
  { url: "goals-module-v82", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v82", home: "/", skin: "aurora" },
  // v83 = v81 (Portal) and v84 = v82 (AJ aurora) with no Set weights popup opening by itself after a new goal
  { url: "goals-module-v83", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v83", home: "/", skin: "portal" },
  { url: "goals-module-v84", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v84", home: "/", skin: "aurora" },
  // v85 = v83 revamped in the Indigo rail look (option B): deep indigo side menu, pill tabs, gold main buttons, popups restyled, smaller goal tiles
  { url: "goals-module-v85", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v85", home: "/", skin: "rail" },
  // v86 = v85 rebuilt to the approved Indigo rail mockup (option B): path and person in the top bar, Goals 2027 card in the menu, segmented tabs under the title, goal cards with a sun banner in two columns
  { url: "goals-module-v86", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v86", home: "/", skin: "rail" },
  // v87 = v86 in the clean look approved on 22 Nov 2026 (after SuccessFactors Growth Portfolio): grey page, crisp borders, person strip, welcome banner, same-size goal tiles
  { url: "goals-module-v87", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v87", home: "/", skin: "clean" },
  // v88 = v87 with three goal tiles to a row, no clipped text on the tiles, and a tile that grows a little under the pointer
  { url: "goals-module-v88", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v88", home: "/", skin: "clean" },
  // v89 = v88 with Alignment, Open details and Delete along the bottom of each tile (no ⋯ menu, no triangle), a steady hover, the team panel inside the tile, a see-through welcome panel and a dashed attention bar
  { url: "goals-module-v89", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v89", home: "/", skin: "clean" },
  // v90 = v89 with a steady goal step in the wizard: AI ideas asked for when the wizard opens, a loading state until they come (9 s at most), a list that never changes under the pointer, and a picked option that keeps its text size; no Team view button; the welcome panel light grey and 20% more see-through; random dark themes for the top banner and the tile headers; the earlier Strategy / Owner / Contributor tags back
  { url: "goals-module-v90", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v90", home: "/", skin: "clean" },
  // v91 = v90 standardised: a drawn person for every avatar; one set of buttons (secondary, primary, danger; no underlined links), fields and labels; goal titles at most 500 characters with two-line tiles; a smooth tile hover; attention items that say what to do, which goal, why, and who it is from with their role; one goal status line (badge, then who it is with or from; "Agreed" reads as Approved); a bigger goal number
  { url: "goals-module-v91", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v91", home: "/", skin: "clean" },
  // v92 = v91 with no Approved badge on the Director General's goals (they need no approval)
  { url: "goals-module-v92", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v92", home: "/", skin: "clean" },
  // v93 = v92 with an aligned weight pill; a pushed-down goal is accepted as it is or adjusted by its receiver (adjusted goes to the pusher for approval, accepted tells the pusher); a "Link to a senior goal" pill on tiles and in the goal with a themed popup; Needs your attention collapsed until clicked, each item the action, the goal and who it is from; neutral person icons (no faces or skin colours); tile buttons as in v90; the team panel floats over the goals below (hover shows it, a click keeps it open); measure, current %, knob, days left and Expected show on tile hover
  { url: "goals-module-v93", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v93", home: "/", skin: "clean" },
  // v94 = v93 with the tile from the approved mockup: picture banner, a link strip to the direct senior's goal, progress ring beside the title and the bar under it, no measure, due date or Expected, no hover reveal or tooltips on tiles, even tile heights; the link popup shows the direct senior only
  { url: "goals-module-v94", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v94", home: "/", skin: "clean" },
  // v95 = v94 with Add a goal the same size as the tiles, the due date back, a soft glow on clickable tile parts, the team panel opened by click only and closed by a click outside, a "Top of the cascade" strip on top-level goals, and Needs your attention as the small box on the right (as in v78)
  { url: "goals-module-v95", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v95", home: "/", skin: "clean" },
  // v96 = v95 with no "days left" anywhere (tiles and goal page); only Due today or overdue still show
  { url: "goals-module-v96", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v96", home: "/", skin: "clean" },
  // v97 = v96 with Show all / Show fewer keeping the team panel open (any click outside still closes it), new goals created with no link (the owner picks it from the strip), and the goal number and arrows aligned; Needs your attention items are two lines (action, then who and the goal)
  { url: "goals-module-v97", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v97", home: "/", skin: "clean" },
  // v98 = v97 with the team panel staying open when a popup opened from it (a person's activities) is closed, and the goal screen showing the tile's link strip instead of the old pill
  { url: "goals-module-v98", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v98", home: "/", skin: "clean" },
  // v99 = v98 with a gold glow on the link strip of a goal that is not linked yet (goal page)
  { url: "goals-module-v99", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v99", home: "/", skin: "clean" },
  // v100 = v99 with no maximum number of goals, Needs your attention items showing the goal name in full and who it is from or goes to, and a Send for approval popup with the goal's details and checks
  { url: "goals-module-v100", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v100", home: "/", skin: "clean" },
  // v101 = v100 with the last two 5-goal mentions removed (wizard review check, approver checklist): there is no maximum number of goals
  { url: "goals-module-v101", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v101", home: "/", skin: "clean" },
  // v102 (23 Nov 2026): helper bot for Needs your attention, every screen as a centred popup, push-down roles (Owner for the Director General, Contributor, Team member)
  { url: "goals-module-v102", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v102", home: "/", skin: "clean" },
  // v103 (23 Nov 2026): v102 with the animated floating robot (model/Robot.js): blinks, follows the pointer, speaks up for new or urgent items, confetti when done, sleeps when idle
  { url: "goals-module-v103", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v103", home: "/", skin: "clean" },
  // v104 (23 Nov 2026): the robot floats in its own lane at the right (top bar on smaller screens), never over the goal tiles; a new win animation (rays, stars, confetti rain, victory jump)
  { url: "goals-module-v104", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v104", home: "/", skin: "clean" },
  // v105 (23 Nov 2026): popups zoom forward with the page easing back (soft zoom with depth), New goal steps keep one size and fade, one Close pill in every popup, the robot celebrates with a quiet halo
  { url: "goals-module-v105", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v105", home: "/", skin: "clean" },
  // v106 (23 Nov 2026): Needs your attention popup bigger and richer, its robot is the very same drawing and face as the floating one, the banner very slightly alive (flag, sun, mountains)
  { url: "goals-module-v106", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v106", home: "/", skin: "clean" },
  // v107 (23 Nov 2026): popups open without the page jumping (banner kept), no per-frame blur on the page, steps never blank, Back/Continue a solid bar in the popup
  { url: "goals-module-v107", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v107", home: "/", skin: "clean" },
  { url: "goals-module-v65", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v65", home: "/" },
  { url: "latest/zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v107", skin: "clean" },
  // the latest goals prototype as opened from the home page "/": its link back goes to "/", not to the UI5 home project
  { url: "goals-module", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v107", home: "/", skin: "clean" },
  // the previous goals prototype (version 3), still reachable
  { url: "goals-module-v3", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v3", home: "/" }];
const TITLES = { "zajmn.hr.sucfac1.hk": ["AJMN People", "#F4F7FB"], "zajmn.hr.goals.hk": ["Goals 2027", "#FFFFFF"] };
const PTYPES = { ...TYPES, properties: "text/plain", ttf: "font/ttf", woff2: "font/woff2" };
const PROJECT_FILES = new Set(PROJECTS.flatMap(({ url, folder }) => {
  const base = join(import.meta.dirname, folder, "webapp");
  return readdirSync(base, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split(".").pop() in PTYPES)
    .map((f) => "/" + url + "/webapp/" + join(f.parentPath, f.name).slice(base.length + 1).split("\\").join("/"));
}));
// The start page of each app. Besides loading SAPUI5 it paints a loading screen at once (top bar, menu and a skeleton of the page, in the
// same colours as the app), so there is no blank page while the app is fetched; the app removes it when it is drawn (id="boot").
const SKELETON_CSS = `html,body{margin:0;height:100%;background:#CBD9E8}
#boot{position:fixed;inset:0;z-index:1000;background:#CBD9E8;display:flex;flex-direction:column;font-family:system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;transition:opacity .35s ease}
#boot.done{opacity:0;pointer-events:none}
#boot .bt{height:44px;background:#14264B;display:flex;align-items:center;padding:0 18px;color:#fff;font-weight:800;font-size:15px;gap:14px;flex-shrink:0}
#boot .bt i{display:block;width:20px;height:2px;background:#fff;box-shadow:0 6px #fff,0 -6px #fff}
#boot .gn{height:46px;background:#1B3366;flex-shrink:0;display:flex;align-items:center;padding:0 18px;color:#fff;font-weight:900;font-size:17px}
#boot .bd{flex:1;display:flex;min-height:0}
#boot .sd{width:210px;background:#14264B;padding:18px 14px;flex-shrink:0;box-sizing:border-box;color:#F3DC9A;font-weight:900;font-size:20px}
#boot .sd u{display:block;height:11px;border-radius:6px;background:#2B3F78;margin:20px 8px 0;text-decoration:none}
#boot .pn{flex:1;display:flex;justify-content:center}
#boot .pp{width:min(900px,100%);background:#F6F7FB;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}
#boot .sk{border-radius:4px;background:linear-gradient(90deg,#E8ECF4 25%,#F6F7FB 50%,#E8ECF4 75%);background-size:200% 100%;animation:bsh 1.2s ease-in-out infinite}
@keyframes bsh{from{background-position:200% 0}to{background-position:-200% 0}}
#boot .bar{position:absolute;left:0;top:0;height:3px;width:0;background:linear-gradient(90deg,#F3DC9A,#C99A2E);animation:bld 2.4s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes bld{from{width:0}to{width:90%}}
@media(max-width:900px){#boot .sd{display:none}}
@media(prefers-reduced-motion:reduce){#boot .sk,#boot .bar{animation:none}}`;
// the loading screen in the colours of a skinned version (v79 Portal, v80 AJ aurora), in the AJ fonts
const SKIN_FONTS = `@font-face{font-family:"AJ Latin";src:url(./fonts/AlJazeeraRegular.woff2) format("woff2");font-weight:400}@font-face{font-family:"AJ Latin";src:url(./fonts/AlJazeeraBold.woff2) format("woff2");font-weight:700}@font-face{font-family:"AJ Latin";src:url(./fonts/AlJazeeraHeavy.woff2) format("woff2");font-weight:900}`;
const SKIN_CSS = {
  portal: `html,body,#boot{background:#FBFBFD}#boot{font-family:"AJ Latin","AJ Arabic"}#boot .bt{height:56px;background:#fff;color:#1D174E;border-bottom:1px solid #E5E7EB}#boot .bt i{background:#1D174E;box-shadow:0 6px #1D174E,0 -6px #1D174E}#boot .gn{height:48px;background:#fff;color:#1D174E;border-bottom:1px solid #E5E7EB}#boot .sd{background:#F7F7FA;color:#1D174E;border-right:1px solid #E5E7EB}#boot .sd u{background:#E5E7EB}#boot .pp{background:transparent}#boot .sk{background:linear-gradient(90deg,#EDEEF2 25%,#F7F7FA 50%,#EDEEF2 75%);background-size:200% 100%;border-radius:12px}#boot .bar{background:linear-gradient(90deg,#F2D38A,#D69D10)}`,
  clean: `html,body,#boot{background:#F4F5F7}#boot{font-family:"AJ Latin","AJ Arabic"}#boot .bt{height:52px;background:#fff;color:#1D174E;border-bottom:1px solid #DADDE3}#boot .bt i{background:#1D174E;box-shadow:0 6px #1D174E,0 -6px #1D174E}#boot .gn{height:96px;background:#fff;color:#16152B;border-bottom:1px solid #DADDE3}#boot .sd{display:none}#boot .pp{background:transparent;width:min(1360px,100%)}#boot .sk{background:linear-gradient(90deg,#E6E8EC 25%,#F4F5F7 50%,#E6E8EC 75%);background-size:200% 100%;border-radius:12px}#boot .bar{background:linear-gradient(90deg,#1D174E,#D69A1E)}`,
  rail: `html,body,#boot{background:#F7F7FA}#boot{font-family:"AJ Latin","AJ Arabic"}#boot .bt{height:56px;background:#fff;color:#1D174E;border-bottom:1px solid #E5E7EB}#boot .bt i{background:#1D174E;box-shadow:0 6px #1D174E,0 -6px #1D174E}#boot .gn{height:54px;background:#fff;color:#1D174E;border-bottom:1px solid #E5E7EB}#boot .sd{width:236px;background:linear-gradient(180deg,#241D60,#150F3C);color:#fff}#boot .sd u{background:rgba(255,255,255,.12)}#boot .pp{background:transparent}#boot .sk{background:linear-gradient(90deg,#ECECF2 25%,#F7F7FA 50%,#ECECF2 75%);background-size:200% 100%;border-radius:14px}#boot .bar{background:linear-gradient(90deg,#1D174E,#D69D10)}`,
  aurora: `html,body,#boot{background:#F6F7FB}#boot{font-family:"AJ Latin","AJ Arabic"}#boot .bt{height:56px;background:rgba(255,255,255,.7);color:#1D174E;border-bottom:1px solid rgba(29,23,78,.07)}#boot .bt i{background:#1D174E;box-shadow:0 6px #1D174E,0 -6px #1D174E}#boot .gn{height:48px;background:rgba(255,255,255,.55);color:#1D174E;border-bottom:1px solid rgba(29,23,78,.07)}#boot .sd{background:rgba(255,255,255,.62);color:#1D174E}#boot .sd u{background:#D9EEF8}#boot .pp{background:transparent}#boot .sk{background:linear-gradient(90deg,#E9EBF3 25%,#F6F7FB 50%,#E9EBF3 75%);background-size:200% 100%;border-radius:16px}#boot .bar{background:linear-gradient(90deg,#0083C7,#D69D10)}`,
};
const bootPage = ({ id, skin }) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLES[id][0]}</title><style>${SKELETON_CSS}${skin ? SKIN_FONTS + SKIN_CSS[skin] : ""}</style>
<link rel="preconnect" href="https://ui5.sap.com" crossorigin>
<link rel="preload" href="./fonts/AlJazeeraBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="./fonts/AlJazeeraHeavy.woff2" as="font" type="font/woff2" crossorigin>
<script id="sap-ui-bootstrap" src="https://ui5.sap.com/1.144.1/resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"
  data-sap-ui-async="true" data-sap-ui-resource-roots='{"${id}": "./"}' data-sap-ui-on-init="module:sap/ui/core/ComponentSupport"></script>
</head><body><div id="boot" aria-hidden="true"><div class="bar"></div><div class="bt"><i></i>AJMN Home</div>${id === "zajmn.hr.goals.hk" ? '<div class="gn">Goals <span style="color:#F3DC9A;margin-left:6px">2027</span></div>' : ""}
<div class="bd"><div class="sd">AJMN<u></u><u></u><u></u><u></u><u></u><u></u><u></u></div><div class="pn"><div class="pp"><div class="sk" style="height:34px"></div><div class="sk" style="height:120px"></div><div class="sk" style="height:34px;width:60%"></div><div class="sk" style="height:90px"></div><div class="sk" style="height:90px"></div></div></div></div></div>
<div data-sap-ui-component data-name="${id}" data-id="container" data-settings='{"id": "app"}'></div></body></html>`;
const RULES = JSON.parse(process.env.PLATFORM_ACCESS || "{}");
const SSO = process.env.PLATFORM_AUTH === "sso";
// index.html is kept exactly as it is: one inline script, one inline style block, and its fonts
// from Google Fonts. The policy allows those and nothing more.
const HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin",
};

// The Fiori page has no inline script; UI5 itself, its themes, fonts and texts come from ui5.sap.com.
const UI5 = "https://ui5.sap.com";
const FIORI_HEADERS = { ...HEADERS, "Content-Security-Policy": `default-src 'self'; script-src 'self' ${UI5}; ` +
  `style-src 'self' 'unsafe-inline' ${UI5}; font-src 'self' data: ${UI5}; img-src 'self' data: ${UI5}; ` +
  `connect-src 'self' ${UI5}; frame-ancestors 'none'` };

const PROJECT_HEADERS = { ...FIORI_HEADERS, "Content-Security-Policy": `default-src 'self'; script-src 'self' ${UI5}; ` +
  `style-src 'self' 'unsafe-inline' ${UI5} https://fonts.googleapis.com; font-src 'self' data: ${UI5} https://fonts.gstatic.com; ` +
  `img-src 'self' data: ${UI5}; connect-src 'self' ${UI5}; frame-ancestors 'none'` };

// Who is calling, as the platform's sign-in says — trusted only behind it (PLATFORM_AUTH=sso).
const text = (v) => Buffer.from(v ?? "", "latin1").toString("utf8");
function caller(h) {
  return { email: text(h["x-authentik-email"]) || null, groups: text(h["x-authentik-groups"]).split("|").filter(Boolean) };
}
const matches = (who, entries = []) => entries.some((e) =>
  e.includes("@") ? e.toLowerCase() === (who.email ?? "").toLowerCase() : who.groups.includes(e));
// A static site only reads: `read` (or `write`, which may also read), never `deny`.
function mayRead(who) {
  if (!SSO || Object.keys(RULES).length === 0) return true;
  if (!who.email || matches(who, RULES.deny)) return false;
  return RULES.read === undefined || matches(who, RULES.read) || matches(who, RULES.write);
}

createServer(async (req, res) => {
  const path = new URL(req.url, "http://app").pathname;
  if (path === "/healthz") return res.writeHead(200, HEADERS).end("ok");
  const who = caller(req.headers);
  if (!mayRead(who)) {
    return res.writeHead(403, { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" })
      .end("You do not have access to this app. Ask its owners to add you.\n");
  }
  if (await api(req, res, path, who, HEADERS)) return;
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405, { ...HEADERS, Allow: "GET, HEAD" }).end();
  // the front page is the Fiori (UI5) AJMN People home; the plain HTML home stays at /home.html
  if (path === "/") return res.writeHead(308, { ...HEADERS, Location: "/latest/zajmn.hr.sucfac1.hk/webapp/index.html" }).end();
  const proj = PROJECTS.find((p) => path === "/" + p.url || path === "/" + p.url + "/");
  if (proj) return res.writeHead(308, { ...HEADERS, Location: `/${proj.url}/webapp/index.html` }).end();
  const boot = PROJECTS.find((p) => path === `/${p.url}/webapp/index.html`);
  if (boot) {
    res.writeHead(200, { ...PROJECT_HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : bootPage(boot));
  }
  // UI5 asks for an optional preload bundle and for translation files of the visitor's language (i18n_en_US, i18n_en, i18n_ar...).
  // This demo has neither, so answer with an empty bundle and the base texts instead of a 404 that fills the console with errors.
  const opt = !PROJECT_FILES.has(path) && path.match(/^(\/.+?\/webapp)\/(Component-preload\.js|i18n\/i18n_[A-Za-z_]+\.properties)$/);
  const optProj = opt && PROJECTS.filter((x) => path.startsWith(`/${x.url}/webapp/`)).sort((x, y) => y.url.length - x.url.length)[0];
  if (optProj) {
    const isJs = opt[2].endsWith(".js");
    const body = isJs ? "sap.ui.require.preload({});" : await readFile(join(import.meta.dirname, optProj.folder, "webapp/i18n/i18n.properties")).catch(() => "");
    res.writeHead(200, { ...PROJECT_HEADERS, "Content-Type": isJs ? "text/javascript; charset=utf-8" : "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  if (PROJECT_FILES.has(path)) {
    const p = PROJECTS.find((x) => path.startsWith(`/${x.url}/webapp/`));
    const body = await readFile(join(import.meta.dirname, p.folder, path.slice(p.url.length + 2))).catch(() => null);
    if (!body) return res.writeHead(500, HEADERS).end();
    let out = body;
    if (p.home && path.endsWith("/webapp/manifest.json")) {
      const m = JSON.parse(body);
      m["sap.ui5"].config.nav.home.url = p.home;
      out = JSON.stringify(m);
    }
    const isFont = /\.(ttf|woff2)$/.test(path), etag = `W/"${createHash("sha1").update(out).digest("base64url").slice(0, 20)}"`;
    const head = { ...PROJECT_HEADERS, "Content-Type": isFont ? PTYPES[path.split(".").pop()] : `${PTYPES[path.split(".").pop()]}; charset=utf-8`, "Cache-Control": isFont ? "public, max-age=86400" : "no-cache", ETag: etag };
    if (req.headers["if-none-match"] === etag) { return res.writeHead(304, head).end(); }
    res.writeHead(200, head);
    return res.end(req.method === "HEAD" ? undefined : out);
  }
  const dir = ["/fiori", "/fiori-people"].find((d) => path === d);
  if (dir) return res.writeHead(308, { ...HEADERS, Location: dir + "/" }).end();
  const file = path === "/fiori/" || path === "/fiori-people/" ? path + "index.html" : path;
  if (FIORI.has(file)) {
    const body = await readFile(join(import.meta.dirname, file)).catch(() => null);
    if (!body) return res.writeHead(500, HEADERS).end();
    res.writeHead(200, { ...FIORI_HEADERS, "Content-Type": `${TYPES[file.split(".").pop()]}; charset=utf-8`, "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  if (!Object.hasOwn(PAGES, path)) return res.writeHead(404, HEADERS).end();
  const page = await readFile(join(import.meta.dirname, PAGES[path])).catch(() => null);
  if (!page) return res.writeHead(500, HEADERS).end();
  res.writeHead(200, { ...HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(req.method === "HEAD" ? undefined : page);
}).listen(Number(process.env.PORT ?? 8080), "0.0.0.0");
checkDisk();
