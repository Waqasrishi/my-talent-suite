# 3. Who may do what, and how people are identified

## Employee ids are personnel numbers

* `PERNR` (8 digits, `PERNR_D`) is the only employee id stored. Names, org unit, position and the reporting line are **read from ECC**, never copied.
* The page works with short scenario ids (`dg`, `ed1`...). `Scenario.js` now has a `pernr` for each person; `Store.js` translates both ways.
  The values are **placeholders starting with 9**. Replace each with the real PERNR (list in `migration/pernr-map.json`).
* For real users the logon user maps to a PERNR through infotype 0105 subtype 0001 (`PA0105-USRID`). That is `ZCL_ZAJMN_UTIL=>PERNR_OF_USER` (included).
  When the page is opened by a real person the scenario "view as" switch should be turned off: the service must decide from `SY-UNAME`, never from what the browser says.

## Authorization object `Z_AJMN_GOAL` (SU21)

| Field | Values |
|---|---|
| `ACTVT` | 01 create, 02 change, 03 display |
| `ZAJMNROLE` | `SELF`, `MANAGER`, `HR` |

Roles (PFCG):

* `Z_AJMN_GOALS_EMPLOYEE`: SELF with 01, 02, 03. Sees and changes their own goals only.
* `Z_AJMN_GOALS_MANAGER`: SELF plus MANAGER with 01, 02, 03 for the org structure below them (structural authorization profile, `RH_GET_...`/`HR_CHECK_AUTHORITY_INFTY`), and approvals of their direct reports.
* `Z_AJMN_GOALS_HR`: HR with 03 across the company, and read access to the workflow log.
* `Z_AJMN_GOALS_ADMIN` (v77): `Z_AJMN_GOAL` with `ZAJMNROLE = ADMIN`, `ACTVT` 02 and 03; maintains `ZAJMN_CONFIG` and `ZAJMN_DELEG` (SM30) and schedules the reminder job. Holds no goal data rights.
* `Z_AJMN_GOALS_HR` (v77) also covers: reading deleted goals (the service returns rows with `DELETED_AT` set when `is_hr( )`), and approving on behalf of an absent manager through `ZAJMN_DELEG`.
* Add `S_SERVICE` for the OData service `ZAJMN_GOALS_SRV` to each role.

What `ZCL_ZAJMN_GOALS_DPC_EXT` enforces (`MAY_SEE`, `MAY_CHANGE`, `DeleteGoal`), with the reporting line from `ZCL_ZAJMN_UTIL` (RH_GET_LEADER / HRP1001):

| Action | Who |
|---|---|
| See a goal | its owner; anyone above or below the owner in the reporting line; a person invited to contribute to it; HR (`Z_AJMN_GOAL` with `ZAJMNROLE = HR`, `ACTVT = 03`) |
| Save a goal (create, edit, progress, push a copy, review) | its owner; anyone above the owner in the reporting line (push down creates the copy in the receiver's name; the reviewer saves the decision); a person invited to it (accept / decline writes to the owner's goal); v68: a person a goal was pushed to (only to remove their own row when they delete their copy) |
| Peers see each other's goals | **no** (v77): `MAY_SEE` allows only the owner, people above and below in the reporting line, invited contributors and HR |
| Delete a goal | only its owner, also a goal pushed down to them (v68 rule; the page breaks the link for the people it was linked to) |
| Read the workflow log | HR: everything; everyone else: the steps of goals they may see |
| Download an attachment | whoever may see the goal the file belongs to, or the person who uploaded it |
| Log entries | written as the logged-on user (`ACTOR_PERNR` = PERNR of `SY-UNAME`), whatever the page sends |

## Other practice that matters on ECC

* **Locking:** enqueue `EZAJMN_GOAL` around every save. Add the ETag check (`CHANGED_AT`, `If-Match`) so a stale page cannot overwrite a newer save.
* **Time:** store `TIMESTAMPL` in UTC, show in the user's zone in the page.
* **Log:** `ZAJMN_LOG` is insert-only. No `UPDATE`, no `DELETE`, no UI. Retention by an archiving object.
* **Attachments:** content server or DMS in production. Scan files (virus scan interface `VSCAN`) before saving.
* **Personal data:** goals and the log hold personal data. Register the tables in the data protection / ILM setup and the deletion concept (ILM object).
* **CSRF and CORS:** the service uses the standard CSRF token. Do not enable CORS. Serve the page from the same host as the Gateway (Fiori launchpad), so cookies and the token just work.
* **Transport:** one package `ZAJMN`, one transport per layer (tables and number ranges, service, authorizations, UI5 BSP). Never edit in production.
* **Testing:** unit tests (ABAP Unit) for `MAY_SEE`, `MAY_CHANGE`, the deep save and the number range; run the page against QA with real roles before go-live.
