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
- **Writing assistance**: Improve, shorten, list, translate between English and Arabic, or analyse a comment; nothing changes until Apply.
- **Performance Insights**: A manager sees observations from permitted evidence with the source beside each, and what is missing; the rating stays theirs.
- **Tests and parity**: Fifteen acceptance tests run in the page, beside the template's permissions and the list of tenant behaviour not yet verified.
- **Development plan**: Career development goals with statuses, comments and manager approval.
- **Performance forms**: The 2026 goal form, which moves the goal plan between its states, and the appraisal form with up to three training needs and an overall rating.
- **Calibration**: A session with rating columns, drag between them, save, undo and finalize.

### Goals Cycle Hub
- **Measured key results**: Each key result is a number from a start to a target (higher or lower is better), done or not done, or a list of milestones, with an optional weight.
- **Progress calculated**: Goal progress is the weighted result of its key results, or the average of the goals aligned to it; no data, behind start and exceeded are shown as such.
- **Check-ins**: Owners record current values, how it is going and a note; a check-in older than 30 days shows as overdue.
- **Goal cycles**: Switch between the 2025 and 2026 cycles; closed cycles are read-only.
- **Goal types and weights**: Organisation, team and individual goals, with a due date inside the cycle and a weight; your weights are checked against 100%.
- **Outbound and inbound alignment**: Link a goal to the goals it supports, in any department, and accept or reject links to yours with a reason.
- **Approval and changes**: Submit, send back, revise and approve; editing an approved goal sends it back for approval and asks the owners of aligned goals to review theirs.
- **Archive**: Archive and unarchive approved goals instead of deleting them; goals aligned to an archived goal are flagged.
- **All goals**: Search, filter by department, type, approval and health, sort, and export the same list to CSV.
- **Strategy map and dashboard**: Pillars to staff as connected boxes, health of goals, coverage by level, progress by pillar, unaligned goals and who is waiting on what.
- **Suggest and review goals**: Scripted suggestions and a draft review in the goal form.

## Pages
- **Talent Suite**: / — Goals, performance, talent, growth, configuration and audit, by role.
- **Strategy Room**: /strategy.html — Decisions, commitments, delivery plans and the strategy tree.
- **Goals Cycle Hub**: /goals-hub.html — Measured goals with check-ins, cycles and inbound and outbound alignment, from strategy pillars down to staff.
- **SuccessFactors replica**: /successfactors.html — Goals, performance forms and calibration as they are set up today.

## Decisions
- The answers marked "Prototype · scripted" are seeded, not from a model.
- Data lives in the browser only; "Reset sandbox" restores the seed.
- The server serves these four pages and nothing else in the folder.
- The Goals Cycle Hub checks every action against the viewer's role in the page, but with no backend those checks can be bypassed by editing browser storage.
- The SuccessFactors replica talks to a simulated SAP adapter in the page; role codes such as ED are SAP codes relative to the goal owner, not job titles.
- A 100% weight total is off until confirmed and can be switched on under Tests and parity. Entry limits by step are set in the Admin Center.
- User screens, admin previews and the adapter's checks all read the published configuration, never the draft.
- Every AI response is scripted in the page and labelled as simulated; no model is called.
- Route maps are not in the SAP exports, so their step names and owners are assumed.
