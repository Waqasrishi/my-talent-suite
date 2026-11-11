---
name: deploy
audience: end-user
description: >-
  Use when the user wants the app live: "deploy", "ship it", "push this", "get me a URL", "put it on
  canvas", "put it on the sandbox" (Canvas's other name) — in an app's folder (a score.yaml). A
  folder with code that is not an app yet is canvas-adapt.
---

## Files

Edits nothing. Runs `canvas deploy` in the app's folder. Needs `canvas login` once per 12 hours.
The team is `--team`, else `CANVAS_TEAM`, else the saved one (chosen at `canvas login`, changed with
`canvas config set team <name>`), else the user's only team. With several and none saved it asks —
but with no terminal, which is how an agent runs it, it stops with exit 17: ask the user which team,
then pass `--team <name>`. Never guess one.

## Choosing

`canvas deploy` stops at the first failure and exits with **that stage's** code. Branch on the code,
fix that one thing, run it again — never run stages individually to get past one.

| Exit | Stage | Usually |
|---|---|---|
| 20 | validate, package | what `canvas validate` names — fix score.yaml or the file |
| 23 | people | an email in score.yaml's `access` no one in the team has, made from a name (`momin@`) — it says the real one: put that in with `canvas share with <email>` (`share-app`), or in the rule (`add-auth`). `--yes` only when the user says it is someone else |
| 17 | team | several teams and none chosen, or not in the one named |
| 1 | sign-in, the controller | `canvas login`, then run it again |
| 50 | upload, build | the build log: `canvas logs --build` |
| 60 | pages | a page answered 500: the FIX names it (`… pages fail: /path (500: …)`). `canvas logs` has the traceback — fix that page and `canvas deploy` again. The app is online meanwhile. Not Argo's, and not `debug-deployment` |
| 60 | deploy, sync | the FIX says which: Argo applied it and it never got ready → `canvas logs` (`debug-deployment`); Argo could not apply it → the platform's, `report-issue`; `exceeded quota` → the team's quota (`onboard-tenant`) |
| 62 | waiting for a secret | **not a failure**: it built, and is not deployed until every key score.yaml declares has a value. Guide the user (`add-secret`, step 4), wait for them to say it is set, then run `canvas deploy` again — the build is kept |

## What to do

1. If `score.yaml` has no `canvas.dev/title` or no `canvas.dev/description` (`canvas deploy` prints a
   `describe` line for it), run `describe-app` first and write them — without, the console shows the app
   as its bare address. With them, read them once against the app as it now is: if features were added
   since, `describe-app`'s re-check applies (a new description is written and said; a new title is asked)
2. If `score.yaml` names neither `canvas.dev/icon` nor `canvas.dev/cover`, and `.canvas/pictures-asked`
   does not exist: ask for them once (`describe-app`, "The pictures"), then write that file — never
   make one unasked. Otherwise do not ask
3. `canvas validate` — fix what it names first; it is the same check `deploy` starts with, in a second
4. `canvas deploy` — validate, package, upload, build, deploy, sync, stopping at the first failure.
   If score.yaml declares a `secret`, check first with `canvas secret list`: a key `NOT SET` means the
   deploy will stop at 62 after the build — ask the user to set it now, so it is ready when the build is
   Pass on what it prints beyond the result — a `needs` line (`apply-update`), `canvas N is out` (the developer
   runs `canvas update`: newest skills and blueprint) — in one plain sentence each; the developer reads you, not it
5. If it stops, read the exit code and the FIX line, fix that, and run it again. If it stops the
   same way again and nothing in the app is to blame, it is Canvas's: `debug-deployment`, then
   `report-issue`
6. **Check it serves, not only that it is up.** Healthy means the process started; the app then opens
   its own pages and `deploy` prints a `pages` line. `N pages open` is done. `… pages fail: /path (500:
   the error)` exits 60: read `canvas logs` for that page's traceback, fix the code, `canvas deploy`
   again — never report a URL whose pages fail. The app is online meanwhile. No `pages` line: the app's ajnkit predates the check
   (`canvas app update`) — open the main page yourself before saying it works
7. Report the URL, and what is running: `canvas status`'s `version` line (`#4 · a1b2c3d "…"`).
   "Is it shipped?" is its `folder` line — `same as deployed`, or the files changed since. `deploy`
   says `nothing new to ship` when the folder is already what runs. With a `volume`, say a deploy has a few seconds of downtime: the new version
   starts once the old one has let go of the disk

## From GitHub instead

If the user keeps the code in GitHub and wants a push to be what ships ("deploy when I push", "connect
this to GitHub"), link the repository once instead of running `canvas deploy` each time:

1. `canvas github link <owner/repo> --branch <branch>`. The organisation's GitHub App reads the repository
   when an admin has listed it for the team (`githubRepos` in the team's file) — no token. When it cannot,
   the command says why and asks for a **fine-grained token** (this one repository, Contents: read-only)
   hidden at the prompt. The user creates and types it — never ask for the token in chat, never put it
   in a file, an argument or score.yaml. A pair cannot be linked: it is deployed from its root with
   `canvas deploy`
2. From then on a push **is** the deploy, as `canvas deploy` is: within a minute the controller reads
   score.yaml as `canvas validate` does, builds the commit and deploys it — the first deploy, a changed
   score.yaml and a new migration included. `canvas github status` says how it stands
3. **Before each change** `git pull --rebase`, settle any conflict in the folder, run the tests and `canvas validate`,
   and `canvas app update --check` (a push never says the app is behind: when it does, tell the developer and offer `canvas app update`),
   then `git push`. Never `git push --force`, and never `canvas deploy` on a linked app: it stops and says so
   (an upload would replace the build the push is waiting for)
4. A state other than `deployed` says why (`waiting` and `building` pass by themselves): `error` — the link itself (the token was revoked, the branch deleted, the person who linked left the team: the message says; `canvas github link` again); `rejected` — the commit fails the checks (the message is
   `canvas validate`'s: fix it and push); `needs` — a secret score.yaml declares has no value yet
   (`canvas secret set <KEY>`, `add-secret`; it deploys by itself once set); `failed` — the build
   (`canvas logs --build`) or a deploy check. `canvas github unlink` goes back to uploading

## What NOT to do

- Do not ask before the app catches up with canvas: `deploy` does it first (`updated … to blueprint`)
  and ships it — say so in one line. Then follow `apply-update` from its step 2 (the files are
  already up): it applies what is new to the app's own code, if anything, and deploys that too — only if it
  changed what the app runs (its step 6). If it printed `note … has your edits`, the user's uncommitted
  changes to those files kept it from running: say so, and that `canvas app update` runs it once
  they are committed. `auto_update` false turns it off, where AGENTS.md's Stack table says the
  switches are (*auto-deploy and auto-update*) — never a pyproject.toml added to a Node app, which
  makes the build Python.
- Do not run the stages individually to 'get past' a failing one.
- Do not retry a non-retryable failure. A schema error or a policy denial will fail identically forever — fix the cause.
- Deploy without asking only when `auto_deploy` is true (*auto-deploy and auto-update*) and the
  tests and `canvas validate` pass (`build-feature`). Otherwise ask: deploying replaces what is running,
  and there is no build-only command yet.
- `canvas status` shows where a deploy stands — the build phase it is on, then sync and health. Use it instead of re-running `deploy`.
