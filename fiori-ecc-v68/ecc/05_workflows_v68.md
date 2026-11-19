# 5. Workflows as built in v68 (19 Nov 2026; v62 changes marked)

One rule runs through all of them: **what a person does takes effect at once; review is optional and comes afterwards.**
Nothing waits for an approval before it counts. Where `01_tables_SE11.md` or `02_gateway_service_SEGW.md` still describe approval steps
(change requests, links awaiting approval, deletion requests), this file wins.

| Workflow | What happens | Status after | Log action(s) |
|---|---|---|---|
| **Create a goal** | Saved at once. The Director General's goals are approved at once; everyone else's go to their manager to review | `ATT` "Awaiting review" (DG: `OK` "Approved") | `goal_created` |
| **Review** | The approver opens it from *Needs your attention* or *Approvals*: **Approve** or **Return** with a reason (AI can draft the reason) | `OK` "Approved" / `RET` "Returned for changes" | `approved` / `returned` |
| **Edit a goal** | Saved at once. If the goal had been reviewed, it goes back to the approver to review again | `ATT` "Awaiting review" | `goal_edited` |
| **Push down** | **v68: one grid** of people against goals (tap a cell, a name or a goal heading; Edit wording under a goal; a Director General or Executive Director can open *Their team* to pick people one level down). Each person gets their own copy, **already approved**, with no weight. Pushing again refreshes title, measure and due date and keeps progress, weight and activities | copy: `OK` "Approved" | `pushed_down`, `pushed_down_again` |
| **Invite a contributor** | The owner searches a name or title (Executive Directors, Directors, Managers; never the Director General) on the goal page | contributor `IN` invited | `contributor_invited` |
| **Respond to an invitation** | The invitee sees **View goal** (popup with details and *See alignment*), **Decline**, **Accept**. **v68:** Accept creates their own goal (copy of the invited goal, `Contributing to` set), links it at once and opens it in edit mode with a Contributor tab; no tailoring window | contributor `LK` linked / `DC` declined; new goal `ATT` | `contributor_linked`, `contributor_declined`, `goal_edited` (if tailored) |
| **Remove a contributor** | The owner removes a linked or invited person | row removed | `contributor_removed` |
| **Delete a goal** | **v68: always available to the owner, also for a goal pushed to them.** Removes that goal and the links to it. People it was pushed to keep their copy, which gets `EXTRA.broken` {title, by, date}, no parent and no source link, a log line, and an item *The goal you were linked to was deleted* in Needs your attention. The deleter sees who was told. Soft delete, history kept | `DELETED_AT` set | `goal_deleted`, `contributor_removed`, `push_removed`, `source_deleted` |
| **Progress** | Drag the bar; a popup asks for an activity note (attachments allowed). Activities can be edited and deleted | — | `progress`, `activity_added`, `activity_edited`, `activity_deleted` |
| **Weights** | Each person sets their own; the total should be 100% (shown, not enforced yet). **v68:** with two or more goals unweighted, *Split evenly* sets equal weights (the rest goes to the last goal) | — | `weight_set` |
| **Approve all** | **v68:** asks *Are you sure?* before approving every waiting goal | `OK` | `approved` |
| **AI fix** | One click on an AI review suggestion changes that field | — | `ai_fix_applied` |

## Codes for ECC

* Goal `STATUS`: `ATT` awaiting review, `OK` approved, `RET` returned. `STATUS_TEXT` holds the words shown.
* Contributor `STATUS`: `IN` invited, `LK` linked, `DC` declined (v62 and later no longer create `AP` awaiting approval or `RT` returned; keep them readable for old data).
* `ZAJMN_LOG.ACTION`: the action codes in the table above. Insert only.
* Older data may still hold `deletion_requested`, `change_requested`, `contributor_link_approved` rows; the page applies any leftover change request and treats a link awaiting approval as linked when it loads.

## Who may do what (enforce in the service, not only in the page)

| Action | Who |
|---|---|
| Create, edit, delete own goals | the person (v68: delete includes goals pushed to them) |
| Push down | a manager, to their direct reports; v68: a Director General or Executive Director may also pick people one level further down |
| Approve / return | the owner's manager |
| Invite / remove contributors | the goal's owner |
| Remove own row from a goal pushed to you (deleting your copy) | the person it was pushed to (`MAY_CHANGE` allows it, v68) |
| Accept / decline an invitation | the invited person |
| Read the workflow log | HR, and each person for their own goals |

## Still being decided (19 Nov 2026)

Possible changes: pushed copies live with no review; only title or measure edits go back to review; deleting goals pushed to you;
due-date reminders; compliance checks (goal-setting window and lock, minimum standard, review deadline, who reviews the DG, retention, visibility).
