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
- **Tests and parity**: The nine acceptance tests run in the page, beside the template's permissions and the list of tenant behaviour not yet verified.
- **Development plan**: Career development goals with statuses, comments and manager approval.
- **Performance forms**: The 2026 goal form, which moves the goal plan between its states, and the appraisal form with up to three training needs and an overall rating.
- **Calibration**: A session with rating columns, drag between them, save, undo and finalize.

## Pages
- **Talent Suite**: / — Goals, performance, talent, growth, configuration and audit, by role.
- **Strategy Room**: /strategy.html — Decisions, commitments, delivery plans and the strategy tree.
- **SuccessFactors replica**: /successfactors.html — Goals, performance forms and calibration as they are set up today.

## Decisions
- The answers marked "Prototype · scripted" are seeded, not from a model.
- Data lives in the browser only; "Reset sandbox" restores the seed.
- The server serves these three pages and nothing else in the folder.
- The SuccessFactors replica talks to a simulated SAP adapter in the page; role codes such as ED are SAP codes relative to the goal owner, not job titles.
- A 100% weight total and a manager minimum of one training need are off until confirmed; both can be switched on under Tests and parity.
