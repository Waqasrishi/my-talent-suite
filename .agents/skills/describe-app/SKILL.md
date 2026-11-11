---
name: describe-app
audience: end-user
description: Use after a new app's first feature (not straight after `canvas init`) and at the end of every
  `build-feature`; when score.yaml lacks `canvas.dev/title` or `canvas.dev/tags`; when the user renames,
  describes or tags the app ("call it…", "tag it sport", "not ai"); when BRIEF.md is missing, lists no
  features or has neither `## Pages` nor `## API`; when the user says "Complete the architecture map" or "complete the architecture info", the words the portal's Architecture tab gives them; and once per app before a deploy, to ask for an icon and cover. Writes the title, description,
  category and tags the portal shows and filters by, and BRIEF.md, the brief its team reads and the map of how it is built. Who sees it and opens it is share-app.
---

## Files

| What | Where |
|---|---|
| the title, description, category and tags | `score.yaml`, under `metadata.annotations` |
| the categories and tags there are | `.canvas/contracts/score-extensions.schema.json` — `$defs/category`, `$defs/tag` |
| the icon and the cover picture | `src/static/icon.png`, `src/static/cover.jpg` — named in `score.yaml` as `canvas.dev/icon`, `canvas.dev/cover` |
| the same words for people reading the repo | `README.md` — its `#` heading and first line |
| the brief the team reads on the portal's Info tab, and what its Architecture tab draws | `BRIEF.md` — at most 8,000 bytes |

```yaml
metadata:
  name: motion-graphics                 # the address — never changed by this skill
  annotations:
    canvas.dev/title: Motion Graphics Studio
    canvas.dev/description: Turns a short script into an animated explainer for social posts.
    canvas.dev/category: graphics
    canvas.dev/tags: short-form, social, ai
```

The portal shows them to the team and filters by category and tag. `name` is only the address (`<name>--<team>.<base>`); the title is free text and need not match it.
A shorter address (`<name>.<base>`, beside that one) is `canvas domain request <name> "<why>"` — a platform admin approves it. Not a line in score.yaml, and no build. The app keeps the address it was made with.

## What to do

1. **Work out what the app is for**, from the user's own words in this conversation first, then
   `README.md`, then `src/lib/` and the app's pages — what a person does with it.
2. **Work out all four** — the tags as surely as the title; an app is never left without them:
   - the **title** — 2 to 5 words, what people would call it: "Expense Approvals", not
     `expense-app`, not "AI-Powered Expense Platform". Up to 60 characters
   - the **description** — one sentence: what it does, and for whom. Plain words, up to 280
     characters. "Lets the newsroom check a clip's rights before it airs."
   - the **category** — exactly one from `$defs/category`, each with what it covers: what the app
     is *for* in the newsroom (a subtitle checker is `video`, not `editorial`). Unsure between two:
     the one whose people use it
   - the **tags** — **always one to three** from `$defs/tag`, the three that say most: its coverage
     (`sport`), language (`arabic`), format (`podcast`) or craft (`subtitles`, `ai`). Only what is
     true of it — but something always is: an app that calls a model is `ai`, one that shows
     numbers is `dashboard` or `charts`, a step in a process is `workflow`. A tag the list lacks is
     not invented — pick the nearest, and tell the user it can be added to the platform's list
3. **Ask when it is not clear — and only then.**
   - What the app is for — still unclear from what it does, or a slug like `test01`: one question,
     with three titles to pick from:
     > What will this app do? Some names, if one fits: **Clip Rights Check**, **Rights Desk**,
     > **Clearance Board** — or tell me your own.
   - Which tags — the purpose is clear, but more than three fit as well as each other, or none fits well: one question,
     offering the likeliest few to pick from: "Tag it **video**, **rights** or **verification**?"
   Anything the user has said about it — "it's for the sports desk", "tag it arabic", "not ai" —
   decides it over your own reading, now and at every later re-check.
4. **Otherwise write all four — no yes needed.** Then say what you wrote, in one line: "Titled it
   **Clip Rights Check** — *Lets the newsroom check a clip's rights before it airs.* · video ·
   rights, verification". The user changes any of it by saying so.
5. Uncomment `annotations:` if it is still a comment; keep the keys and any others already there.
6. Set the README's heading to the title and its first line to the description.
7. Write `BRIEF.md` (below) — made, if the app has none.
8. `canvas validate`, then the change ships with the next `canvas deploy` — the portal shows it once
   the source is uploaded.

**At the end of every `build-feature`** — re-evaluate, do not assume. Read the title, description and
tags against the app as it now is, with the feature just added, changed, expanded or removed:

| The change | Then |
|---|---|
| a fix, a tweak, a page for the same job | all still true — say nothing, change nothing |
| it does more, or for more people — "now also exports to PDF", "now for the whole newsroom" | a new description that covers it, still one sentence, and any tag it now earns (`arabic` once it handles Arabic) — at three already, it replaces the one that says least |
| its main job moved — a notes app that became a task tracker | a new title and category as well — **ask first** (below) |
| a feature the description or a tag names is gone | them without it |
| it has no tags | its one to three, now |

A **new description or tags** is written, then said in one line, "Title → …, description → …, tags → …".
A **new title or category** changes what the team already calls the app, so it is asked, not written:
> The app has become a task tracker, more than the notes app **Team Notes** it is titled. I'd like to
> call it **Team Tasks** (category `workflow`) — what do you think?

On a yes, or a title of their own, write it; on a no, keep the title and still update the description.
The user's own words, said once, decide it at every later re-check — never ask again about what they refused.

Wanting to list each feature means the sentence is too narrow, not too short: say the job they share.
The features themselves go in `BRIEF.md`.

## The brief: `BRIEF.md`

What the app is, what a person can do with it and how it is built, for the app's team on the portal's
Info and Architecture tabs.
Written with no yes needed, at the same times as the description, and said in the same line
("…, and the brief's Features and API"). `NOTES.md` holds what the person decided; the brief holds what the app does.

```markdown
# Clip Rights Check
For producers before a clip goes on air. One check gives the owner, the regions and the dates, so
nothing airs that may not.

## Features
### Paste
- **Paste a link**: From any of the newsroom's systems, or the clip's own address.
### Check
- **Rights verdict**: Who owns it, where it may air and until when.
- **History** (Rights desk): Every check made, searchable by date and desk.
### Decide
- **Flag to the desk**: A clip that may not air goes to the rights desk.

## Who uses it
- **Producers**: Check their own clips before they air.
- **Rights desk**: Check any clip, and read every check made.

## Pages
- **Check a clip**: / — Paste a link and read the verdict. Calls: /api/checks, /api/checks/{id}/flag
- **History** (Rights desk): /history — Every check made, by date and desk. Calls: /api/checks

## API
- POST /api/checks: Check a clip by its link
- GET /api/checks/{id}: One check and its verdict
- GET /api/checks (Rights desk): Every check made
- POST /api/checks/{id}/flag: Flag a clip to the rights desk

## Tables
- **clip**: id, url, title
- **check**: id, verdict, regions, expires_at, clip_id -> clip

## Lifecycle
- Open -> Cleared: the rights verdict says it may air
- Open -> Flagged: the producer flags it to the desk
- Flagged -> Cleared: the rights desk clears it

## Decisions
- A check is kept after its clip is gone, so the history stays whole.
```

One shape for every app; write only what is true of this one. The portal draws the Info tab from
what is there: steps and roles as swimlanes, steps alone as one line, roles alone as a column each,
neither as tiles. Its Architecture tab draws the map from Pages, API, Tables, Lifecycle and Decisions,
and asks for what is not there yet.

- `#` — the title, the same words as `canvas.dev/title`, changed whenever it is.
- Under it, **one to three sentences that say more than the description, never the same words**: who
  it is for and why it helps. The portal shows them under the description. No "used to…" story.
- `## Features` — one bullet for each thing a person can do **today**: `- **Name**: one sentence`,
  about twelve words, never a list of actions run together with semicolons. At the end of every
  `build-feature`, add what was just built and remove what was taken out; a fix or a tweak changes
  nothing. Plans are not features.
  - `### Step` headings, two to six, when using the app has an order (prepare, then seat, then print):
    each feature under the step it belongs to. A dashboard, a chat or a search has none.
  - `(Role)` after the name when only some people do it, named as in `## Who uses it`; none, and
    everyone who may open the app can.
- `## Who uses it` — one bullet for each kind of person, `- **Role**: what they do`, the roles of
  `score.yaml`'s `access.rules`. Only when different people do different things.
- `## Pages`, `## API`, `## Tables`, `## Lifecycle`, `## Decisions` — **read from the code as it is now**,
  never from the plan or from memory, and only what it has. A line in any other form is left off the map:
  - `## Pages` — `- **Name** (Role): /path — what it is for. Calls: /api/a, /api/b`: the pages of
    `src/views.py` and `src/nav.py` (Next: `src/app/**/page.tsx` and `src/nav.ts`). Only real pages, what a
    person opens: a form's POST, an HTMX fragment and an address that only redirects are not, because the
    portal takes the pages named here as the app's pages and the rest as what they do.
    - What it is for: a few words in the person's language, optional.
    - `Calls:`, optional: the `/api/...` routes the page calls, exactly as in `## API`. Read them from the
      code: the `api.py` function its view calls (Next: the `src/api/` module it imports), the page's template and what it
      extends and includes in `src/templates/` (`hx-*` attributes, links, `chat("/api/...")`), and the
      `src/static/*.js` they load (`fetch(`). Next: the page, its layouts and the components they import.
      A route in `base.html` is called by every page that extends it. None, and it is left out; never a guess.
  - `## API` — `- GET,POST /api/path (Role): what it does`: the routes of `src/api.py` (Next:
    `src/app/api/**/route.ts`). Methods joined by commas. To keep it short, one line for a resource's
    routes, `GET,PATCH,DELETE /api/checks/{id}`; never a `*`, which is not read.
  - `## Tables` — only with a database, `- **table**: column, other_id -> other_table`: the tables of
    `src/models.py` (Next: `src/db/schema.ts`), the columns that say what it holds, and every reference
    with `->` and the table it points at.
  - `## Lifecycle` — only when a record really moves through states (a status column, an approval),
    `- State -> Next state: what moves it`, a line for each move. A rating, an edit or a deletion is no
    state. None, and the section is left out: the tab then asks for nothing and draws no box.
  - `## Decisions` — at most about five, one line each: what someone might otherwise undo, from
    `NOTES.md` and the code. None worth saying, and the section is left out; never invented.
  - In a pair the portal reads the web app's brief: there, Pages from `web/` and API and Tables from
    `../api/`. The API app's own brief says the same API and Tables, without Pages.
  - At the end of every `build-feature`, as for Features: a page, route, table, state or call added or
    removed is added or removed here; a fix or a tweak changes nothing.
- Features, roles and sentences in the person's language (Arabic when the app is), with no file names,
  routes or code. Paths, methods, tables and columns exactly as in the code. Headings exactly as here.
- At most 8,000 bytes in all: over that, the app ships with no brief at all, on either tab. Merge
  features and routes, leave out lesser columns and then the `Calls:` of the Python blueprint's pages,
  which the portal also reads from the code, rather than cut a page, a table or a feature.
- A brief in an older form (a long paragraph, `## How it works` or `## How to use`, features run
  together, neither `## Pages` nor `## API`) is rewritten in this one at the next re-check; an empty section of the stub is removed.

**"Complete the architecture map"** (or "complete the architecture info") is this brief, nothing else:
read the code, fill in whatever of `BRIEF.md` is missing or no longer true, keep the rest, then
`canvas validate` and `canvas deploy`, and say what was added. The portal shows it once the source is uploaded.

## The pictures: an icon and a cover

The portal shows a **cover** on the app's card and its page, and an **icon** beside its name. With
neither, it draws a cover from the app's name — that is fine, and nothing waits for one.

**Ask once per app, before a deploy**, when `score.yaml` names neither `canvas.dev/icon` nor `canvas.dev/cover` and
`.canvas/pictures-asked` does not exist. Then write that file (`asked <date>`), whatever the answer:
it is what makes it once — never again, on later deploys or in a new conversation, unless the user
brings it up.
> Do you have an icon and a cover picture for it? Give me the files, or I'll leave the one the
> portal draws — you can add them any time.

| They | Then |
|---|---|
| give a file | copy it to `src/static/icon.png` (square, 512×512, at most 100 KB) or `src/static/cover.jpg` (**1600×600**, at most 300 KB) — keep its own type: `.png`, `.jpg` or `.webp` — and name it in `score.yaml`. Not that shape: crop it to it, with their OK |
| say no, later, or nothing | deploy as it is; do not ask again |
| ask you to make one | read `pictures.md` beside this skill, make it in that house style at that size, show it, and write it only on a yes |

**Where a cover is seen**: on the app's card at about 2:1, and across its page as a wide band — so
of a 1600×600 cover, only the **centre 1200×240** is always seen. Put what matters there (the
subject, any words); the rest is background that may be cut. `canvas validate` checks the real
size: a cover 2:1 to 3.2:1 and at least 1200 wide, an icon square and at least 256.

## What NOT to do

- Do not change `metadata.name` — it is the URL, and renaming it is a new app.
- Do not write marketing copy or emoji, nor list the features in the description: one sentence says what it is, and the features are the brief's.
- Do not use a category or tag outside the contract's list — `canvas validate` refuses it, and a
  filter would never find the app.
- Do not describe what the code does not do yet — not the plan, the app as it is, in the brief too.
- Do not put a person's name, a secret or a customer's data in any of them: the whole team sees them.
- **Do not make a picture by default** — no icon, no cover, unless the user asks for one. With
  none, the portal's drawn cover is the answer.
- Do not take a picture from the web or a search result: a newsroom shows only what it owns or has
  licensed. Ask before using one with a recognisable person in it.
- Do not use SVG for either: it can carry script, and the portal shows it to everyone.
