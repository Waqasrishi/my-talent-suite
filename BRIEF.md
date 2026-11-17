# AJMN Talent Suite
For the people deciding whether to build the Talent Suite. Every screen can be clicked through as a different person, so a demo shows what each one would see and do. Nothing is real: each browser keeps its own copy of made-up data.

## Features
### Talent Suite
- **View as a role**: Switch between employee, manager, HR partner, talent, executive and admin.
- **Goals**: Add goals, update progress and approve a team's plans.
- **Performance**: Move a review through its steps and give or request feedback.
- **Talent**: Place people on the calibration grid and nominate successors.
- **Growth and opportunities**: Development items, learning and an internal opportunity marketplace.
- **Configuration and audit**: Edit scales, routes and labels as drafts, publish them, and read the audit log.
- **English and Arabic**: The Talent Suite pages switch language and direction.
### Strategy Room
- **Decisions for the DG**: Conflicts between divisional plans, with the source passages side by side.
- **Preview a decision**: See every milestone, commitment and date that would change before recording it.
- **My commitments**: An ED sees what they own, owe and wait on, and confirms or proposes a change.
- **My delivery plan**: A director sees the deliverable, what must arrive first and the goal it serves.
- **Strategy tree**: One editable hierarchy from DG priority to deliverable, with owners changed in place.
- **Record**: Who decided or confirmed what, and when.
### SuccessFactors replica
- **Goal plan**: The 2026 Individual Goal Plan with its states, weights, milestones and goal details, in English and Arabic.
- **View as a person**: Sign in as the employee, manager, matrix manager, HR representative or a peer to see what each may read and change.
- **Permissions by state**: What can be edited, created, deleted or shared follows the plan 14 template in each state, with the reason shown when something is read-only.
- **Goal editor**: Errors beside the field, a live weight total, autosaved drafts kept apart from saved goals, and a retry when a save fails.
- **Suggest a measure**: A scripted helper flags what a measure of success lacks and drafts one to confirm.
- **Assign a linked goal**: A four-step wizard that previews the change for each eligible recipient before creating linked goals.
- **Alignment**: Link a goal to another goal or to a published strategy priority and open the chart of connected boxes.
- **Ready to Submit**: A summary of what blocks the goal form, linked to the failing field.
- **Admin Center**: A searchable catalogue of tools by category, with favourites, recently used tools and a mark on each tool that works in the sandbox.
- **Configuration editors**: Edit the goal plan template, plan states and permissions, route maps, performance form templates, and launch forms. Changes stay in a draft until published.
- **Version history**: Every publish is a numbered version with what changed; an older version can be loaded into the draft.
- **Entry limits and required fields by step**: Set the minimum and maximum entries of a form section at each workflow step, with the message shown, and required fields by role and step.
- **Route maps as boxes**: Each route map is drawn as connected steps with their owners, on the editor and on the form.
- **AI Services Administration**: Switch each AI feature on, set who is eligible, preview by role and publish, with what SAP documents, what AJMN adds and what needs tenant checks.
- **Create with AI**: Draft a goal name and measure from a short brief, then enter the weight and save through the normal checks.
- **Writing assistance**: Improve, shorten, list, or analyse a comment; nothing changes until Apply.
- **Performance Insights**: A manager sees observations from permitted evidence with the source beside each, and what is missing; the rating stays theirs.
- **Tests and parity**: Fifteen acceptance tests run in the page, beside the template's permissions and the list of tenant behaviour not yet verified.
- **Development plan**: Career development goals with statuses, comments and manager approval.
- **Performance forms**: The 2026 goal form, which moves the goal plan between its states, and the appraisal form with up to three training needs and an overall rating.
- **Calibration**: A session with rating columns, drag between them, save, undo and finalize.

### AJMN People (the connected platform)
- **Homepage**: A greeting, quick actions, Needs Attention cards built from your real tasks, and tiles for every area, marked when an area is not set up.
- **One shell**: Search, notifications, an application launcher, your demo persona and cycle, a sidebar and breadcrumbs on every screen; every screen has its own address.
- **Goals and strategy**: Measured key results, check-ins, cycles, inbound and outbound alignment, approvals, archive, a goal list with CSV export, and a strategy map that can focus one goal's path to its pillar.
- **Performance appraisal**: Self-assessment, manager review, calibration, employee acknowledgement and an HR appeal, with ratings kept separate from achievement, weights checked against 100%, and a snapshot of goals once the manager review is submitted.
- **Training needs**: The manager records up to three per appraisal; each becomes a record in the Training Needs Assessment plan, linked to a course in the sample catalogue.
- **Two form themes**: Broadcast Light and Executive Gold show the same record.
- **Continuous performance**: Activities and feedback requests linked to goals.
- **Team, approvals and reports**: A manager's team view, one list of everything waiting on you, and reports that open the records behind each figure.
- **Admin Center**: Application registry with addresses for external applications, workflow steps, training-need rules, rating decimals, section numbering and the default theme.
- **Suggest and review goals**: Scripted suggestions and a draft review in the goal form.

## Pages
- **Goals module**: My Goals on the home page opens /goals-module/. More UI5 projects: /aj/, /latest/.
- **Talent Suite**: /index.html — Goals, performance, talent, growth, configuration and audit, by role.
- **Strategy Room**: /strategy.html — Decisions, commitments, delivery plans and the strategy tree.
- **AJMN People home (Fiori)**: / opens the UI5 home /latest/zajmn.hr.sucfac1.hk/ — its Goals links open the UI5 Goals module /latest/zajmn.hr.goals.hk/ (also /goals-module/).
- **AJMN People home (plain HTML)**: /home.html — The Goals-theme home page (navy and gold): quick actions, items needing attention, and links into Goals and the other areas (not-yet-built ones say so). Sample data.
- **Test scenario people**: the Goals module (Fiori v39 (equal-sized date fields; draggable progress bars, no description, equal-sized fields; date fields with a calendar, no Contributors or Target for the DG goal page; no "above" links for the DG; suggested due date is 31 December 2027; screens update in place, no flashing or jumps; Proxy Now replaces Viewing as, home page type scale, Goals 2027 in the menu, a loading screen between apps) with home v10 (the AJMN ERP Workspace theme, the home page menu on every screen and the goals sections in a header band: top bar, side menu, centred panel, gold-underlined cards; v27 is the earlier header layout; v25 and v26 header experiments stay at /goals-module-v25 and -v26) (the v9 line with the new header, the DG changes, the company fonts and an English / Arabic switch for the screen words (model/I18n.js; goal text is never translated); v22 stays at /goals-module-v22)) has 30 people to view as — a DG, 3 EDs, 6 Directors, 8 Managers and 12 Employees — edited in one table, model/Scenario.js. No goals are preloaded: everyone from the DG to the employee creates goals, links them to a goal of the person above, who approves them; goals can be pushed down to direct reports. The DG, as the top of the organization, creates goals with no role or parent step; the wizard suggests his seven 2026 strategy goals from the SuccessFactors report. Goals are shown as typed, in one language (the Arabic-English translation is switched off; the earlier version with it is goals-module-v15). Fonts follow the company Al Jazeera Design System (Source Serif 4 and Inter; AJ Arabic and Noto Naskh Arabic). 
- **Goals prototype**: /goals.html — The 15 Nov clickable goals prototype: editable goals, contributors, push down, per-goal alignment, goal library ideas.
- **AJMN People (earlier)**: /goals-hub-v2.html and /goals-hub.html — The connected platform: homepage, goals and strategy, performance appraisals, development, continuous performance, team, approvals, reports and admin.
- **SuccessFactors replica**: /successfactors.html — Goals, performance forms and calibration as they are set up today.

## Decisions
- The answers marked "Prototype · scripted" are seeded, not from a model.
- Data lives in the browser only; "Reset sandbox" restores the seed.
- The server serves these four pages and /fiori/, nothing else in the folder.
- AJMN People checks every action against the demo persona's role in the page, but with no backend those checks are a demonstration, not access control: the sample data is in the page and can be changed in browser storage.
- Achievement percentages never become ratings; the overall rating is rating × weight ÷ 100, rounded to the configured decimals, and missing ratings give no score.
- Succession & Career and HR Services show as not configured; Learning is a sample catalogue with no learning system behind it.
- The SuccessFactors replica talks to a simulated SAP adapter in the page; role codes such as ED are SAP codes relative to the goal owner, not job titles.
- A 100% weight total is off until confirmed and can be switched on under Tests and parity. Entry limits by step are set in the Admin Center.
- User screens, admin previews and the adapter's checks all read the published configuration, never the draft.
- Every AI response is scripted in the page and labelled as simulated; no model is called.
- Route maps are not in the SAP exports, so their step names and owners are assumed.
