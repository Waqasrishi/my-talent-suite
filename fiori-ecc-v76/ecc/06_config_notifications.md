# 6. Settings, reminders and notifications (v76)

Everything an admin may want to change is a row in `ZAJMN_CONFIG` (SM30, view `ZAJMN_CONFIG_V`), so IT does not change code. Missing row = the default.

| `CFG_KEY` | Default | Meaning |
|---|---|---|
| `DG_PERNR` | (none) | personnel number of the Director General: his goals need no approval |
| `MIN_GOALS` / `MAX_GOALS` | 3 / 5 | the standard checked when a goal is sent |
| `WEIGHTS_100` | X | weights must add up to 100% before a send |
| `WINDOW_OPEN` / `WINDOW_CLOSE` | (none) | goal-setting window, `YYYYMMDD`; empty = always open |
| `CONTRIB_LEVELS` | `ed,dir,mgr` | who may be invited as a contributor (the page reads it from the service as a function import `GetConfig`, see below) |
| `REMIND_APPROVER_DAYS` | 5 | approver reminded after this many days without a decision |
| `ESCALATE_DAYS` | 10 | the goal also goes to the approver's manager |
| `BROKEN_LINK_DAYS` | 14 | reminder when a deleted-goal link is still broken |
| `CHECKIN_DAYS` | 30 | monthly check-in reminder |
| `NOTIFY_INBOX` | X | SAP Business Workplace |
| `NOTIFY_MAIL` | X | e-mail through SAPconnect (SCOT must send to the internet) |
| `NOTIFY_TEAMS` | (off) | `X` = also post to a Teams incoming webhook through RFC/HTTP destination `ZAJMN_TEAMS` (SM59) |

## Messages sent outside the page

| Event | Sent by | To |
|---|---|---|
| Goal sent for approval, approved, returned | the service, when it saves a new status (`ZCL_ZAJMN_NOTIFY=>send`) | approver / owner |
| Invited to contribute, declined, removed | the service | the other person |
| A link broke because a goal was deleted | the service | everyone whose copy was linked |
| 5, 10, 14 and 30 day reminders; drafts never sent | `ZAJMN_REMINDERS`, daily | owner, approver, approver's manager |
| Weekly digest | `ZAJMN_REMINDERS` with `P_DIGEST = X`, weekly | one mail per person, all items |

Run `ZAJMN_REMINDERS` first with **Test run** (`P_TEST` = X): it lists who would be told and sends nothing. Then schedule it in SM36 (daily, plus weekly with `P_DIGEST`).

## One thing to add to the service before go-live

The page reads the settings it needs (`CONTRIB_LEVELS`, the minimum standard) from the constants at the top of `Goals.js` today. To make them real admin settings, add a function import `GetConfig` (GET, returns key/value pairs from `ZAJMN_CONFIG`) in SEGW and have `Store.js` load it once at start. Until then, change the constants and the table together.
