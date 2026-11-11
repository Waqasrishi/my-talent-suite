# AGENTS.md — how to build and ship on Canvas

<!-- Kept short: every request reads it. -->

**Canvas is also called the sandbox.** "Put it on the sandbox", "deploy to the sandbox" and "the
sandbox is down" all mean Canvas, and `canvas` is its command.

## 1. The contract

Edit `score.yaml` and `src/`. **When asked for something, build it (`build-feature`), run
`uv run pytest` and `canvas validate`, then — with `auto_deploy = true` in `pyproject.toml` (a Node
app: package.json's `"canvas"`) —
`canvas deploy` and give the URL; otherwise ask: locally (`local-run`) or deploy?** A `describe` line from `canvas validate` is done before the deploy: run `describe-app`, then validate again. Open each
conversation saying whether auto-deploy and sign-in (score.yaml's `auth`) are on, and that "turn it
off" (or on) changes either — sign-in off is `add-auth`: `canvas share everyone` first.

**An app linked to GitHub** (`canvas github status` names a repository) is deployed by `git pull --rebase` and `git push`, not `canvas deploy`, which stops: wherever AGENTS.md or a skill says `canvas deploy`, that is the push (`deploy`, *From GitHub*). The repository's CI only checks pull requests; it never deploys.

**Work of three or more steps gets a board first (`show-progress`)**: every step done, in progress,
pending or blocked, kept current as each lands — a live page where you can publish one, your to-do
list where you cannot — so whoever is with you follows it without reading along.

**The backend is fixed: Python 3.14, FastAPI, SQLAlchemy.** Not a default — the stack. The exact Python
is the platform's `.python-version`, the one the build uses: never edit it. No Flask, no
Django, no second ORM.

**An adapted app** — one with `.canvas/adapted` — was brought onto Canvas as it is, on its own stack
and layout. For it, the stack, UI and file-map rules here (§1–§2) do not apply: keep to its own
conventions, its look, its logic and its workflows, and change only what is asked. Moving it to the
platform's stack is a refactor (`adapt-app`), and only on the user's yes. Everything else holds —
`score.yaml`, one container, the resources in §4, secrets never in files, §9 and §10. The platform's
packages are its too: `canvas app add <feature>` puts ajnkit's core and the feature's package in its own
manifest (`pyproject.toml`, `requirements.txt` or `package.json`) — use them as §2 and §6 say. Its static files: `adapt-app`.

**A ported app** — `.canvas/ported`, or `.canvas/legacy/` from `canvas app adapt` — is moving to the
platform's stack and file map feature by feature (`adapt-app`), but keeps the old app's look and
workflows: its pages keep their own look, not the page shell or the components, unless the user
asks.

**The UI is Jinja + HTMX, inside the platform's page shell, drawn by the design system** (`ajnkit-ui`,
in every app): one header (the app's title, its pages, Sign out under the person's name; a sidebar or the app's
own instead, `{% block frame %}`: the `ajnkit-ui` skill, "The frame") and one footer for every app, and the design system's components (`ui.*`) for everything on a page, **in the Expressive
look** (`{% block look %}` in `base.html`) unless the person asks for another. Read the `ajnkit-ui` skill
and its `design.md` before the first page; `add-page` for each. **Replace the starter home page (`src/templates/index.html`) before the first deploy** — the app does not start while it says "Tell your assistant what to build".

**Never write** a Dockerfile, Kubernetes YAML, a Helm chart or a compose file — the platform renders
all of it (delete an old `Dockerfile`). No `Makefile`: platform commands are `canvas <verb>`; run and
test with `uv run` (`local-run`).

**Exactly one container, named `app`, and one copy of it unless the user asks for more** (`request-availability`).
No sidecars. A second process is a second app — never a second container in the pod.

## 2. Where things live

**One file per job. Put it where it goes, not where it is convenient.**

**ajnkit first.** Whatever a row below gives to ajnkit — who is calling, a rule, the database, a
model, email, uploads, chat, a call outside, the log, the components — is done with ajnkit, never
written again in the app; how a call works is its reference skill. `canvas validate` notes an import that goes around it.

| Need to | File |
|---|---|
| Change infrastructure — a URL, a database, AI models, a disk, auth | `score.yaml` **only** |
| Add a feature | `src/lib/` → `src/api.py` → `src/views.py` + `src/templates/` — `build-feature` |
| Add a page | `src/templates/<page>.html` from the design system's components (`ui.*`), its line in `src/nav.py` — `add-page` |
| Say what the app is called and does — the portal shows it | `score.yaml` `metadata.annotations` — `describe-app`. A new app is listed private until the user shares it: `canvas share` (`share-app`), no build |
| A short address of its own — `<name>.` on the platform's domain | `canvas domain request <name> "<why>"` — a platform admin approves; the app keeps its address too. Not `score.yaml`, no build |
| Catch up with a newer canvas | "update canvas": `canvas update`, then apply what changed — `apply-update` |
| Change the schema | `src/models.py`, then `canvas db revision` |
| Read an injected variable | `src/envs.py` — never `os.environ` elsewhere |
| Talk to the database | `ajnkit.db` — few queries, short transactions, live state in memory: `use-database` |
| Keep a file across restarts — uploads, images, videos, audio | a `volume` in `score.yaml`, mounted at `/data`, read as `envs.DATA_DIR` — `request-volume` |
| Work after the response, a job | `src/tasks.py` — `add-job` |
| Run something on a clock — every night, every hour | `schedules` in `score.yaml`, running the app's own `src/jobs.py` (`python -m src.jobs <name>`) — `add-job` |
| Cache something slow | in the process, the app's `cache` (Redis) for a kept answer, a counter or a semantic cache, or a `postgres` table — `add-cache` |
| Domain logic | `src/lib/` |
| Check a change works, before saying it does | look at it as each of its people — `verify-change` |
| Something in the running app is broken or wrong | find the cause first — `debug-report` (a failed deploy: `debug-deployment`) |
| Remember what the person decided — who it is for, the roles, the words, the look | `NOTES.md`: read it before a change; add a line when they decide something |
| Say what a person can do with the app and how it is built — the brief its team reads on the portal's Info and Architecture tabs | `BRIEF.md` — `describe-app`. What was decided stays in `NOTES.md` |
| Tests | `tests/` |

### The stack, for the skills

The skills about Canvas are shared with the Next.js blueprint (ADR-39). Where one needs a file or a
line of code, it names a row here — this app's answer:

| | In this app |
|---|---|
| read a setting | `envs.NAME`, added to `src/envs.py` beside the others |
| a secret | `envs.secret("PARTNER_API_KEY")` where it is used, never into a constant at import; a file, `envs.secret_file("AZURE_CREDENTIALS")` |
| the volume's folder | `envs.DATA_DIR / "index.db"` — never `"/data/" + name` |
| the schema | `src/models.py` (SQLAlchemy) |
| the database | `db: Annotated[Session, Depends(session)]` — `ajnkit.db` |
| a route's function | `def`. `async def` only when every call inside is awaited: the database, `http.client()` and `client()` are sync, and one inside `async def` stops every other request until it returns |
| the checks on every request | `run.py`, the platform's: it serves the app through `ajnkit.web.platform` — score.yaml's `access`, cross-site writes, the security headers. Never bypassed: `canvas validate` refuses an app the platform's `Procfile` and `run.py` do not start |
| who is calling | `caller(request.headers)` — `ajnkit.identity` |
| a rule | `@require("dashboard")` on the view — `ajnkit.rbac` |
| email | `send(to, subject, text)` — `ajnkit.email`, after `canvas app add email` once — `request-email` |
| a cache | `@cached(ttl=300)` on a function, `client()` for counters, `SemanticCache("faq").ask(q, call)` — `from ajnkit.cache import …`, after `canvas app add cache` once; with `fast: {type: cache}` in score.yaml — `add-cache` |
| a model | `client().chat.completions.create(…)` — `from ajnkit.llm import client`, after `canvas app add llm` once; with `type: llm` in score.yaml — `request-llm`. Secure documents: `params: {classification: restricted}` keeps the app to the company's own models — `qwen-*`, `d3-decision`, `whisper` |
| a rerank of what a search found | `rerank(question, passages, top_n=5)` — `from ajnkit.llm import rerank`; `qwen-rerank`, the company's own — `request-llm`, `add-rag` |
| a recording turned into text (an interview, a voice note, a meeting) | `transcribe(path, language="ar")` — `from ajnkit.llm import transcribe`; `whisper`, the company's own; pass the language, large files are split for you — `request-llm`, `ajnkit-llm` |
| a decision about a text: which option, how urgent, yes or no | `decide(text, {"urgency": {"type": "score", "criteria": [...]}})` — `from ajnkit.llm import decide`; `d3-decision`, the company's own, probabilities not text — `request-llm` |
| a web search | `search(query, max_results=5)` — `from ajnkit.llm import search`, as *a model*; in a chat, `chat.WEB_SEARCH_TOOL` among `converse()`'s tools — `search-web` |
| a web page's text | `load_page(url)` — `from ajnkit.llm import load_page`: title and readable text as Markdown, public addresses only, with `egress: {proxy: true}` in `score.yaml`; in a chat, `chat.WEB_PAGE_TOOL` — `search-web` |
| a chat | `{% from "platform/ui.html" import chat %}{% block docked %}{{ chat("/api/ask", "Ask the notes") }}{% endblock %}` in `base.html` — the import too, as base.html imports nothing; the endpoint returns `chat.stream(…)` — `ajnkit-chat`, `add-chat` |
| uploads | `media.save(upload)` → a name; `media.serve(name)` on a route — `ajnkit.media` (`canvas app add media`); documents (PDF, Office, text, CSV) with `kinds=media.DOCUMENTS`; to 2 GB, `file_input(…, large=True)`, then `media.uploaded(name)` |
| a call outside | `with http.client() as c:` — `ajnkit.http`, never a request with no timeout. A site the network does not let through: `egress: {proxy: true}` in `score.yaml` (`call-api`) |
| a cache in the process | `@cached(TTLCache(maxsize=256, ttl=300))` (`cachetools`), or `functools.lru_cache` for a pure function |
| background work | after the response, `BackgroundTasks`; a job, `src/tasks.py`, started by `src/app.py`'s lifespan; a schedule, `src/jobs.py`, run by `schedules` in score.yaml — `add-job` |
| the tests | `uv run pytest` |
| a dependency | `uv add <name>` — `pyproject.toml` and `uv.lock`, both committed |
| run it on your computer | `PORT=8080 uv run python run.py` (`local-run`) |
| auto-deploy and auto-update | `pyproject.toml`'s `[tool.canvas]` |

### Pages → API → Logic → database: `views.py` shows it, `api.py` offers it, `lib/` does it

| File | Job |
|---|---|
| `run.py` (top level) | **serves** — `uvicorn src.app:app` through the platform's checks (`web.platform`); nothing of the app's |
| `src/app.py` | **builds** the app once: mounts `/static`, includes the routers — what every app has, `run.py` adds |
| `src/lib/` | **what the app does** — plain functions, no HTTP. Every feature starts here |
| `src/api.py` | **every feature as JSON**, at `/api`, with Pydantic models in and out — `/api/docs` documents it |
| `src/views.py` | **the pages**, and HTMX partials: HTML, from the functions in `api.py` |

**A feature goes Pages → API → Logic → database, unless that makes it more complicated**: the function in `src/lib/`, then its endpoint in `api.py`, then the
page in `views.py` — all three, even when only the page is asked for, so a script, another app or an
agent can do what the page does. A view calls the endpoint's function in `api.py`, in the same process
(`api.list_notes(db)`), never its own `/api` over HTTP. A rule goes on that function (`@require`): a router's `dependencies=` do not run
when a view calls it. When the API would complicate a page — a screen joining several things no API needs, steps sharing one transaction,
a stream, a file, something internal — skip it: the view calls `lib/`, with the reason on the import (`# direct: why`).
`canvas validate` notes a page that goes straight to `lib/` with no reason. A page never renders JSON in JavaScript — that is the rendering twice Jinja + HTMX exists to avoid. An
HTMX partial is a view. Neither `run.py` nor `app.py` handles a request, and `src/__init__.py` stays
empty (it runs on every `import src.*`).

**In a pair** — a route with `scope: internal-cluster`, a Next.js web app beside this one in `../web/`
(ADR-40): this app is the API, and owns everything the app is — logic, data, checks, who may do what.
Its pages are the web app's: `views.py` and `src/templates/` stay as they are, and every feature is
`lib/` and `api.py`, with Pydantic models the web app's client is generated from (`canvas api pull`
there). A feature starts with the pair's `build-feature`, one folder up.

**Sign-in is on in a new app** (`route.params.auth: sso`): the platform signs people in and says who
they are. `access` in `score.yaml` narrows who may open it; a finer rule is named in code
(`@require("dashboard")`), its people under `access.rules`, never in code. Scripts and other apps call
`/api` as a service account. Under `auth: none` the app is open to the corporate network and identity
headers are forgeable — `add-auth`.

**Only the app's own script files run** (`ajnkit.origin`'s policy): no inline `<script>`, no
`onclick=` — a file under `src/static/`, and a dialog opens with `data-dialog-open`. `canvas validate`
names each line it would refuse.

**The platform's code is packages, `ajnkit`** — `from ajnkit import db, access, llm` — installed from the
app's own `packages/` folder (`pyproject.toml`'s `[tool.uv.sources]`, one line each; never PyPI) and
pinned in `uv.lock`. **`ajnkit-core`** is in every app: who is calling, access and rules, the database,
outside calls, logs and the page shell. So is **`ajnkit-ui`**, the design system: 580 components in four
looks (Expressive by default; Minimal, Lumen, AJ), light and dark, English and Arabic. **A feature is a package its skill adds**:

| Feature | Its package | Added by |
|---|---|---|
| AI — and web search, reading a page | `canvas app add llm` | `request-llm`, `search-web` |
| a chat | `canvas app add chat` | `add-chat` |
| uploads to the volume | `canvas app add media` | `request-volume` |
| email | `canvas app add email` | `request-email` |
| a cache — kept answers, counters, a semantic cache | `canvas app add cache` | `add-cache` |
| its tools, for an AI assistant to call (MCP, at `/mcp`) | `canvas app add mcp` | `add-mcp` |

`canvas app add <feature>` adds its package (and any it needs), its lock line and its reference skill —
never `uv add ajnkit-…` by hand. **Import from `ajnkit`** (`from ajnkit.db import session`); a module
without its package fails with `ajnkit-<name> is not installed — canvas app add <name>`.

**Two kinds of skills.** Task skills (`add-chat`, `request-llm`, `deploy`…) decide and add a package;
each package brings a reference skill (`ajnkit-core`, `ajnkit-llm`, `ajnkit-chat`, `ajnkit-media`,
`ajnkit-email`, `ajnkit-cache`, `ajnkit-mcp`, `ajnkit-ui`) with its code, rules and limits. `canvas update` keeps both current.

**The platform's files — never edit them**: `packages/`, `src/templates/platform/`,
`src/static/platform/` (the house colours your app.css builds on), `run.py`, `Procfile`,
`src/__init__.py`, `tests/conftest.py`, the platform's tests, CI and pre-commit. `canvas update` (and
`canvas app update`) replaces them and brings the next version of the `ajnkit` packages with them — `packages/CHANGELOG.md`
says what changed (`apply-update`). Put what is the app's in the app's own files: code in `lib/`, test
fixtures (a test database, sample data) in `tests/fixtures.py`, which `tests/conftest.py` loads. An
update that finds a platform file edited keeps a copy in `.canvas/replaced/` — move what is the app's
into its own files.

## 3. Naming

Hostnames are not choosable: `<app>--<team>.<base>`, from `score.yaml` and the tenant. `--` is
reserved as the separator and cannot appear inside an app or team name.

## 4. Resources

Nothing declared, nothing provisioned. **Provided today: `route`, `postgres`, `llm`, `cache`, `email`,
`volume`, `secret` and `service`** — `canvas validate` refuses any other type, so do not design around one that is not
here — if the user needs one, say so and offer `report-issue`. Acting as itself in another Google Cloud project is not a type: it is `containers.app.cloudIdentity` (§10). A `secret` declares key names only; the user sets
each value with `canvas secret set` (`add-secret`).

Document data is `postgres` + `jsonb`, never a MongoDB client. A queue is a `postgres` table
(`add-job`). A second process is a second app. If you are installing a database driver the platform
does not provision, stop and ask.

## 5. The durability budget, then the code quality bar

**This app is disposable. The platform is not.** Build the simplest thing that satisfies what was
asked — it has no SLA, no on-call, and may be deleted in a month. Do not add configuration,
abstraction or structure for a requirement nobody has stated. Ask instead.

| Bar | Rule | The smell that it is slipping |
|---|---|---|
| **DRY** | Extract on the third occurrence, not the first | the same 5+ line block, copied, in two files |
| **Structured** | Every file has one job (§2). Fix the shape, not the instance | a growing `if name == "x"` chain where a table belongs |
| **Secure** | Validate at the boundary; never trust forgeable input | authorising on a header under `auth: none`; a secret in a file |
| **Simple** | The fewest moving parts that satisfy what was asked | a config flag or a layer for a need nobody has stated |
| **To the point** | Comments say *why*; the code already says *what* | a comment restating the line beneath it |
| **Not over-engineered** | No abstraction with exactly one caller | a plugin point built for a second implementation that does not exist |
| **Focused** | One change does one thing | a bug fix that also renames and reformats |

**Names:** the shortest unambiguous one; no `-util`, `-helper`, `-impl`; a file says what it holds.

## 6. LLM access

Models, speech, embeddings, web search, reading a page, speech to text, decisions and reranking all go through `ajnkit.llm`
(`client()`, `search()`, `load_page()`, `transcribe()`, `decide()`, `rerank()`) on the key `type: llm` gives the app —
never a client, endpoint or key of the app's own, never a vector database or framework. `request-llm` (a model, speech,
speech to text, decisions), `add-rag` (answers from the app's text), `ask-data` (questions about its rows), `search-web`,
`add-chat`.

## 7. Database changes

Schema: `src/models.py`, then `canvas db revision "<what changed>"`; `canvas deploy` applies it. Read
what it generated; never edit a migration that has run. A drop, rename, type change or new constraint
is refused — `request-database`.

## 8. The failure playbook

Exit codes: `deploy`. A failure that is Canvas's (`debug-deployment` says how to tell) is reported, not
worked around: `report-issue`.

## 9. What is ephemeral

| | |
|---|---|
| Database, volume | deleted **with the app**, and nothing backs them up: `canvas db export` keeps a copy of the database, `canvas db import` puts one back (`export-import-data`) |
| `/tmp` and the container filesystem | gone on every restart, and the root filesystem is read-only |

Say this plainly to the user before they put anything they care about here.

## 10. What you cannot do

| You cannot | Do this instead |
|---|---|
| `kubectl apply` anything | `canvas deploy`; `canvas status` and `canvas logs` to see it. There is no kubeconfig for tenants |
| Push an image and deploy it | `canvas deploy` — the platform builds from your source; there is no image upload |
| Reach another team's app directly | not yet: `service` reaches your own team's apps only |
| Pull requests or code review on the app | keep the folder in a GitHub repository of your own. `canvas github link <owner/repo>` makes a push to its branch the deploy (`deploy`, *From GitHub*); reviews stay on GitHub, and the platform has none: `report-issue` stars the demand |
| Give an app a provider API key — a model's, a search engine's or a scraping service's | the `llm` resource issues a platform key: models, and web search (`search-web`); a page's text is `load_page` / `loadPage`, with no key, through the egress proxy (`search-web`) |
| Send email with your own SMTP server, password or mail service, or to anyone outside the team and aljazeera.net | the `email` resource — team and aljazeera.net, 20 an hour; anyone else after an admin approves (`request-email`) |
| Reach the internet by a tunnel, a VPN or a proxy of your own | `containers.app: {egress: {proxy: true}}` in `score.yaml`: full internet over HTTPS through the company's proxy, which logs the app and pod (`call-api`) |
| Call a Google Cloud API (Vertex AI, Discovery Engine, BigQuery, Storage) with a service-account key or `gcloud` sign-in | `containers.app.cloudIdentity.projects: [<project id>]` in `score.yaml` (confirm the id with the user first): the app acts as itself — also called KSA or Workload Identity — with no key and no secret, not a resource but a setting on the container. A platform admin approves each project, and that project's Google Cloud administrators grant the principal `canvas identity show` prints (the `cloud-identity` skill drafts both requests); Google's client libraries then find the credentials on their own (Platform services §20). It does **not** reach a person's own Google data (Tasks, Drive, Gmail): that needs that person's OAuth consent, so a per-user client ID and secret stay `secret`s |
| Work around Canvas when it breaks, or when it cannot do what the user needs | `canvas report search` first, then `star` the one that is already there or file `bug\|demand` — the `report-issue` skill; the user agrees, the platform's admins act on it |
