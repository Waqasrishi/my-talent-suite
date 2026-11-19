# 5. Workflows as built in v62

One rule runs through all of them: **what a person does takes effect at once; review is optional and comes afterwards.**
Nothing waits for an approval before it counts. Where `01_tables_SE11.md` or `02_gateway_service_SEGW.md` still describe approval steps
(change requests, links awaiting approval, deletion requests), this file wins.

| Workflow | What happens | Status after | Log action(s) |
|---|---|---|---|
| **Create a goal** | Saved at once. The Director General's goals are approved at once; everyone else's go to their manager to review | `ATT` "Awaiting review" (DG: `OK` "Approved") | `goal_created` |
| **Review** | The approver opens it from *Needs your attention* or *Approvals*: **Approve** or **Return** with a reason (AI can draft the reason) | `OK` "Approved" / `RET` "Returned for changes" | `approved` / `returned` |
| **Edit a goal** | Saved at once. If the goal had been reviewed, it goes back to the approver to review again | `ATT` "Awaiting review" | `goal_edited` |
| **Push down** | The manager picks goals and direct reports in the Push down wizard (goals, people, edit, review). Each person gets their own copy, with no weight. Pushing again refreshes title, measure and due date and keeps progress, weight and activities | copy: `ATT` "Awaiting review" | `pushed_down`, `pushed_down_again` |
| **Invite a contributor** | The owner invites a person on the goal page | contributor `IN` invited | `contributor_invited` |
| **Respond to an invitation** | The invitee sees **View goal** (popup with details and *See alignment*), **Decline**, **Accept**. Accept creates their own goal (copy of the invited goal, `Contributing to` set) and links it at once, then offers *Make this goal your own?* with AI suggestions | contributor `LK` linked / `DC` declined; new goal `ATT` | `contributor_linked`, `contributor_declined`, `goal_edited` (if tailored) |
| **Remove a contributor** | The owner removes a linked or invited person | row removed | `contributor_removed` |
| **Delete a goal** | Only goals on your own list that you created (not pushed to you). Removes **that goal and the links to it**; pushed copies and other people's linked goals stay as they are (each gets a log line). Soft delete, history kept | `DELETED_AT` set | `goal_deleted`, `contributor_removed`, `push_removed`, `source_deleted` |
| **Progress** | Drag the bar; a popup asks for an activity note (attachments allowed). Activities can be edited and deleted | — | `progress`, `activity_added`, `activity_edited`, `activity_deleted` |
| **Weights** | Each person sets their own; the total should be 100% (shown, not enforced yet) | — | `weight_set` |
| **AI fix** | One click on an AI review suggestion changes that field | — | `ai_fix_applied` |

## Codes for ECC

* Goal `STATUS`: `ATT` awaiting review, `OK` approved, `RET` returned. `STATUS_TEXT` holds the words shown.
* Contributor `STATUS`: `IN` invited, `LK` linked, `DC` declined (v62 no longer creates `AP` awaiting approval or `RT` returned; keep them readable for old data).
* `ZAJMN_LOG.ACTION`: the action codes in the table above. Insert only.
* Older data may still hold `deletion_requested`, `change_requested`, `contributor_link_approved` rows; the v62 page applies any leftover change request and treats a link awaiting approval as linked when it loads.

## Who may do what (enforce in the service, not only in the page)

| Action | Who |
|---|---|
| Create, edit, delete own goals | the person (delete: not goals pushed to them) |
| Push down | a manager, to their direct reports |
| Approve / return | the owner's manager |
| Invite / remove contributors | the goal's owner |
| Accept / decline an invitation | the invited person |
| Read the workflow log | HR, and each person for their own goals |

## Still being decided (19 Nov 2026)

Possible changes: pushed copies live with no review; only title or measure edits go back to review; deleting goals pushed to you;
due-date reminders; compliance checks (goal-setting window and lock, minimum standard, review deadline, who reviews the DG, retention, visibility).
