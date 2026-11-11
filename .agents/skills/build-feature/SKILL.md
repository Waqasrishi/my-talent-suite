---
name: build-feature
audience: end-user
description: Use whenever the user asks the app to do something new or different — "let people
  upload…", "show a list of…", "make it…", "build me…". The entry point for any change;
  it hands off to the other skills for the parts it needs.
---

Code: `ajnkit-core`.

## Files

| Step | File | Skill, if it needs one |
|---|---|---|
| the data | `src/models.py` → `canvas db revision` | `request-database` |
| the files it keeps — uploads, generated files, images, videos, audio | a `volume` in `score.yaml` at `/data`, `envs.DATA_DIR` — never in the database | `request-volume` |
| what it says aloud — text to speech | the `llm` resource: `audio.speech` with a `-tts` model, the audio on a `volume` | `request-llm` |
| a recording turned into text — an interview, a voice note, a meeting | the `llm` resource: `transcribe()` from `ajnkit.llm` once, the text in the database | `request-llm` |
| what it answers from its own text — search by meaning, chat with documents | a chunks table with a `vector(768)` column, `gemini-embedding`, then a chat model | `add-rag` |
| what it answers about its own rows — "how many", "which region", in plain words | the model gets tools — named queries, or a read-only `run_sql` — never the database | `ask-data` |
| who it tells — an email when something happens | `email` in `score.yaml`, `send()` from `ajnkit.email` — team and aljazeera.net, 20 an hour | `request-email` |
| something slow it should not repeat, a counter, the same AI answer twice | `cache` in `score.yaml`, `cached`, `client`, `SemanticCache` from `ajnkit.cache` — one Redis, 128 MB unless a team owner approves more, emptied by a restart | `add-cache` |
| **what it does** | `src/lib/<feature>.py` — plain functions, no HTTP, no templates | |
| **the API** | `src/api.py` — the endpoint, Pydantic models in and out | `add-api-endpoint` |
| **the page** | `src/views.py` + `src/templates/` — calls the endpoint's function in `api.py` where it can, built from the shipped components, its line in `src/nav.py` | `add-page` |
| the tests | `tests/` — the function, the endpoint, the page | `write-tests` |
| the security check | the change itself, against the platform's guards | `review-security` |
| infrastructure | `score.yaml` — a database, AI, a disk, sign-in | `request-*`, `add-auth` |

## Choosing

**Linked to GitHub** (`canvas github status` names a repository): before the first edit, `git pull --rebase` and settle any conflict here, so what is pushed sits on the branch's newest commit. A `git push` is then the deploy (`deploy`, *From GitHub*).

**Pages → API → Logic, when it keeps things simple**: build `lib/`, then `api.py`, then `views.py` — even when only a page was
asked for, so a script, another app or an agent can do what the page does. Try having the view call the function
in `api.py`, in the same process, never its own `/api` over HTTP.

Try this first. When the API would make the page more complicated — a screen that joins several things no API needs, steps that must share one
transaction, a streamed answer, a file, something internal that should not be public — skip it: the view calls `lib/` directly, with the
reason on the import, `from src.lib import reports  # direct: joins six tables for one dashboard`.

If the request is vague — who uses it, what it keeps, what "done" looks like — ask one question
before building. Build the smallest thing that does what was asked (AGENTS.md §5).

**Roles:** when the app has more than one kind of user — an admin and a viewer, a page only Finance may open — ask once, with the
question before building: "Should each role be a group the platform keeps, so you add and remove people with `canvas access`
and no deploy, or do you list the people in score.yaml?" Offer it only if `canvas validate` accepts `access.groups` (the team
has groups on); `add-auth` has the steps. One role per group, never one group for everything.

## What to do

1. Say in one or two lines what you will build and where (the table above)
2. The model and its migration, if it stores something new — then read the generated SQL; a
   `volume`, if it keeps files (an upload, an export)
3. The `lib/` function, then its endpoint in `api.py`, then the page in `views.py`
4. Tests for all three; `uv run pytest` until they pass
5. `review-security` when the change takes input, keeps or serves files, calls out, uses an LLM's
   answer or changes who may do what — then `canvas validate`
6. **Auto-deploy** — `auto_deploy` under `[tool.canvas]` in `pyproject.toml`:
   - **true** (the default): `canvas deploy` — a linked app: commit and `git push` (`deploy`) — and give the URL, so the user tries it at
     once. Still ask first when the change cannot be taken back — a migration that drops or renames
   - **false**: ask "See it on your computer first, or put it online?" — then `local-run` or `deploy`
   - "turn auto-deploy off" (or on): change that line, and say it is changed
7. `describe-app` — every time: re-check that the title, description, tags and `BRIEF.md` (its features, pages, routes, tables and states) still say what the app
   does now, and write new ones (then say what changed) if the feature added, changed or expanded what that is

## What NOT to do

- Do not deploy what fails its tests or `canvas validate` — fix it first, auto-deploy or not.
- With auto-deploy off, do not deploy without asking — not even "to check it builds".
- Do not put logic in a view or an endpoint — both call `lib/`, so the two cannot disagree.
- Do not edit the platform's files — `packages/`, `run.py`, `Procfile` (AGENTS.md §2): `canvas app update`
  replaces them. A helper of your own goes in `src/lib/`.
- Do not fetch your own `/api` from a page's JavaScript to render it — render it in the view.
- Do not stop at "it's written": stop when the tests pass and it is deployed, or the user has chosen.
