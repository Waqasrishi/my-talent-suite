# 5. Workflows as built in v75 (19 Nov 2026)

## List of goals (v75)

Each goal on My goals has a large title and a **Goal 1, Goal 2 …** badge at the top right (the order of the list). The people below a goal sit behind **one** expandable block, *Team and contributors*, which opens the contributors and the team together (a goal with only one of them keeps *Team progress* or *Contributor progress*).

## Ownership rule (v75)

One owner per goal; ownership does not cascade. The **Director General's goals are the strategy** (tag *Strategy*): there is no separate strategy level. An Executive Director or Director is **Owner** (tag *Owner*) of a goal they created or that the Director General pushed to them. Such a goal has either **contributors** (their own goal, tag *Contributor*, dashed in the Alignment chart) or a **team** (the people it is pushed to: their copies carry **no tag**). The tag is derived, not stored: `Goals.js` `tagKind( )` from the goal's owner level, `PUSHED_FROM_PERNR` and the contributing-to link. The Alignment chart has one column per level, starting with the Director General's goals, and an arrow on the right edge of a card opens the goals below it.

Built from the owner's answers to the workflow review. **Where it runs:** *page* = the Fiori app (`Goals.js`), *service* = `ZCL_ZAJMN_RULES` / `ZCL_ZAJMN_GOALS_DPC_EXT`, *job* = `ZAJMN_REMINDERS`.
A rule that is in the page and the service cannot be skipped by a script. A rule only in the page is marked.

| Workflow | What happens | Status after | Log action(s) | Runs in |
|---|---|---|---|---|
| **Create a goal** | The wizard saves a **Draft** (not the Director General: his goals are approved at once). The owner presses **Send for approval** on the goal page, on the goal card, or from *Needs your attention* | `neu` Draft → `att` Awaiting review | `goal_created`, `sent_for_approval` | page |
| **Send checks** | Send is refused unless: the measure has a number; 3 to 5 goals; weights add up to 100%; the goal-setting window is open | stays `neu` | | page and service (`check_save`) |
| **Review** | The approver opens it from *Needs your attention* or *Approvals*: **Approve**, or **Return with a reason** (a reason is always required; the AI can draft it). v75: the approver may **fix small wording** (title, measure) and approve in one step, logged | `ok` / `ret` | `approved` / `returned`, `approver_edited` | page |
| **Not reviewed** | After 5 days the approver is reminded; after 10 days the goal also reaches the approver's manager | | | job (reminders in the page too) |
| **Edit a goal** | Stays editable. Only a change to **title, measure or due date** needs approval again: saving makes it a draft (`Edited, not sent`) and cancels the earlier request; the owner presses Send for approval again, and that send replaces the old one. Description, weight, links and progress never need approval | `neu` → `att` | `goal_edited`, `sent_for_approval` | page |
| **Push down** | One screen in three steps: which goals, who gets them (everyone in my team, or choose, also one level further down), check. Each person gets their own copy, **already approved**, no weight, **no activities copied**. Pushing again refreshes title, measure and due date and keeps progress, weight and activities. A copy's due date cannot be later than the parent's. The pusher is told when a receiver edits or deletes their copy | copy `ok` | `pushed_down`, `pushed_down_again`, `receiver_edited` | page; due date also in service |
| **Contributor** | The owner searches a name or title (Executive Directors, Directors, Managers; never the Director General) and invites. The invitee accepts (a **draft** copy opens in edit mode with a Contributor tab) or **declines with a short reason**. The owner can remove a contributor, who is told. Who may contribute is the admin setting `CONTRIB_LEVELS` | contributor `IN` / `LK` / `DC` | `contributor_invited`, `contributor_linked`, `contributor_declined`, `contributor_removed` | page |
| **Delete a goal** | Always the owner's choice, also for a goal pushed to them. People it was linked to are told, their goal gets `EXTRA.broken`, no parent, and an item to relink; after 14 days they are reminded. Soft delete, history kept; HR can read deleted goals | `DELETED_AT` set | `goal_deleted`, `source_deleted`, `push_removed`, `contributor_removed` | page, service, job |
| **Weights** | Each person sets their own; *Split evenly* gives equal weights. Total must be 100% before Send | | `weight_set` | page and service |
| **Progress and activities** | Drag the bar; a note and files are asked for. At **100%** a note (10 characters or more) or a file is required, and the goal is marked complete **awaiting the approver's confirmation** (`EXTRA.done = awaiting`); the approver confirms in *Needs your attention* (`confirmed`). No update for 30 days: monthly check-in reminder | | `progress`, `activity_added`, `completion_requested`, `completion_confirmed` | page (evidence rule), job |
| **Goal-setting window** | `WINDOW_OPEN` / `WINDOW_CLOSE` in `ZAJMN_CONFIG`. Outside it, sending is refused with a message to ask for a change request | | | service |
| **Notifications** | In the page: *Needs your attention* and messages. Outside the page: SAP inbox, e-mail and Teams, each switched on in `ZAJMN_CONFIG`; one weekly digest instead of many mails | | | job (`ZAJMN_REMINDERS`, `ZCL_ZAJMN_NOTIFY`) |

## What is still decided in the page only (hardening list for the SAP team)

* Evidence at 100% (note or file) and the completion confirmation: add the same check to `check_save` once the activity table is read there.
* Approval of a contributor's copy by the goal's owner as well as the contributor's manager: the page shows the item to both; the service does not yet check that both approved.
* Delete of an approved goal needing the manager's OK: **not built** in the page; the service allows the owner to delete.
* Change requests after the window closes: the service refuses the send; the change-request screen is **not built**.
* HR approving for an absent manager: the table `ZAJMN_DELEG` and the authorization are described; the page does not yet show the delegate's queue.
* The roll-up of parent progress as the average of its pushed copies: **not built** (the Team performance popup on the Alignment chart shows the average of everyone below).

## Codes for ECC

* Goal `STATUS`: `neu` draft, `att` awaiting review, `ok` approved, `ret` returned. `STATUS_TEXT` holds the words shown.
* Contributor `STATUS`: `IN` invited, `LK` linked, `DC` declined.
* `ZAJMN_LOG.ACTION`: the action codes in the table above, plus the older `deletion_requested`, `change_requested`, `contributor_link_approved` rows that old data may still hold.

## Who may do what (enforce in the service, not only in the page)

| Action | Who |
|---|---|
| Create, edit, delete own goals | the person (delete includes goals pushed to them) |
| Push down | a manager, to their direct reports, and one level further down |
| Approve / return | the owner's manager; after 10 days also that manager's manager; HR through `ZAJMN_DELEG` |
| Invite / remove contributors | the goal's owner |
| Accept / decline an invitation | the invited person |
| Remove own row from a goal pushed to you (deleting your copy) | the person it was pushed to (`MAY_CHANGE` allows it) |
| See a goal | owner, people above and below in the reporting line, invited contributors, HR. **Peers do not see each other's goals** |
| Read the workflow log, deleted goals | HR |
| Maintain `ZAJMN_CONFIG`, `ZAJMN_DELEG`, schedule the job | admin role `Z_AJMN_GOALS_ADMIN` |
