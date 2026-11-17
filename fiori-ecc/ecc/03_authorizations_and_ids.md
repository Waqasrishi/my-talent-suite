# 3. Who may do what, and how people are identified

## Employee ids are personnel numbers

* `PERNR` (8 digits, `PERNR_D`) is the only employee id stored. Names, org unit, position and the reporting line are **read from ECC**, never copied.
* The page works with short scenario ids (`dg`, `ed1`...). `Scenario.js` now has a `pernr` for each person; `Store.js` translates both ways.
  The values are **placeholders starting with 9**. Replace each with the real PERNR (list in `migration/pernr-map.json`).
* For real users the logon user maps to a PERNR through infotype 0105 subtype 0001 (`PA0105-USRID`). Put that in `ZCL_ZAJMN_UTIL=>PERNR_OF_USER`.
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
* Add `S_SERVICE` for the OData service `ZAJMN_GOALS_SRV` to each role.

The rule the prototype follows, to be enforced in `MAY_SEE` / `MAY_CHANGE`:

| Action | Who |
|---|---|
| Create a goal for yourself | the person |
| Push down | the manager of the receiver, one level down only |
| Approve or return a goal or a contributor link | the owner's manager / the goal's owner |
| Change a goal after approval | goes through a change request the approver decides |
| Read the workflow log | HR role, and each person for their own goals |

## Other practice that matters on ECC

* **Locking:** enqueue `EZAJMN_GOAL` around every save. Add the ETag check (`CHANGED_AT`, `If-Match`) so a stale page cannot overwrite a newer save.
* **Time:** store `TIMESTAMPL` in UTC, show in the user's zone in the page.
* **Log:** `ZAJMN_LOG` is insert-only. No `UPDATE`, no `DELETE`, no UI. Retention by an archiving object.
* **Attachments:** content server or DMS in production. Scan files (virus scan interface `VSCAN`) before saving.
* **Personal data:** goals and the log hold personal data. Register the tables in the data protection / ILM setup and the deletion concept (ILM object).
* **CSRF and CORS:** the service uses the standard CSRF token. Do not enable CORS. Serve the page from the same host as the Gateway (Fiori launchpad), so cookies and the token just work.
* **Transport:** one package `ZAJMN`, one transport per layer (tables and number ranges, service, authorizations, UI5 BSP). Never edit in production.
* **Testing:** unit tests (ABAP Unit) for `MAY_SEE`, `MAY_CHANGE`, the deep save and the number range; run the page against QA with real roles before go-live.
