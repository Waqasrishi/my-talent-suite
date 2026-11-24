---
name: helm-chart
description: >-
  Use when the user wants the app ready to run outside Canvas, on a Kubernetes cluster of their own
  or their company's: "a Helm chart", "deploy it to our cluster", "make it deployable to Kubernetes",
  "hand it to DevOps / IT", "a Dockerfile for it", "run it outside the sandbox". Writes
  custom-deploy/ — a Dockerfile and a Helm chart made from score.yaml — and changes nothing Canvas
  reads: `canvas deploy` works as before.
---

## Files

Reads `score.yaml` (a pair: `api/score.yaml` and `web/score.yaml`), `.python-version` or
`package.json`, and `db/migrations/`. Writes **only under `custom-deploy/`**, from this skill's own
folder — copied, never written from memory:

| From this skill | To the app |
|---|---|
| `assets/docker/python.Dockerfile` or `assets/docker/next.Dockerfile` | `custom-deploy/docker/Dockerfile` (a pair: `api.Dockerfile`, `web.Dockerfile`) |
| `assets/docker/python.dockerignore` or `assets/docker/next.dockerignore` | beside it, as `<the Dockerfile's name>.dockerignore` |
| `assets/chart/` | `custom-deploy/helm/` itself — no folder of the app's name (a pair: `custom-deploy/helm/charts/api/` and `…/charts/web/`) |
| `assets/umbrella/` | a pair only: `custom-deploy/helm/` itself |
| `db/migrations/*.sql` | the chart's `files/migrations/` (a pair: the API's) |

Plus, written by you: `custom-deploy/README.md` (below) and `custom-deploy/.gitignore`, which keeps
the filled-in secrets and downloaded charts out of git:

```
helm/secret.yaml
**/charts/*.tgz
```

Canvas never reads `custom-deploy/`, so this is the one place AGENTS.md's "never write a Dockerfile or
a Helm chart" does not apply.

## Choosing

**A single app or a pair**: `.canvas/pair.yaml` at the root is a pair — one umbrella chart, its API
and its web app as subcharts, one `helm install`. Otherwise one chart. **The stack**: `pyproject.toml`
→ python, `package.json` → next (a pair: `api/` is python, `web/` next).

**score.yaml → the chart's values.yaml** (a pair: under `api:` or `web:` in the umbrella's), and the
keys `secret.example.yaml` lists:

| Declared | In values.yaml | In secret.example.yaml | What the user provides |
|---|---|---|---|
| `metadata.name` | `Chart.yaml` `name` (a pair: the umbrella's; the subcharts stay `api`, `web`); `image.repository`: the name (a pair: `<name>-api`, `<name>-web`), `image.tag: latest` | — | a registry to push to (`global.imageRegistry`) |
| `containers.app.replicas` | `replicaCount` | — | — |
| `containers.app.variables` | `env` (leave out `PORT`, `DATA_DIR`: the chart sets them) | — | — |
| `containers.app.egress.proxy` | `egress.proxy: true`, `egress.url` (not known: ask the user) | — | the company egress proxy's address |
| `route.port`, `route.path` | `port`, `healthPath` | — | — |
| `route` (`scope: cluster`) | `ingress.enabled: true`, `ingress.host: <name>.example.com` | — | the real host, its DNS and certificate |
| `route.auth: sso` | `authentik.enabled: true`, `networkPolicy.enabled: true` | — | Traefik and Authentik in the cluster, an Authentik Proxy Provider + Application for the host, `authentik.signOutUrl` |
| `route.auth: none` | `authentik.enabled: false` | — | — |
| `route.access` | `access` (as it is) | — | their Authentik's own groups in place of Canvas's `canvas-<team>-members` / `-owners` |
| `route.docs: public` | `docs: public` | — | — |
| service accounts (`canvas sa`) | nothing | — | the same machine callers, made again in their Authentik |
| `route.scope: internal-cluster` (a pair's API) | the umbrella already says so: no ingress, `identity.fromCaller`, a NetworkPolicy from web only | — | — |
| `secret` `keys` / `files` | `secrets.keys` / `secrets.files` | each key | each value — Canvas cannot give them back |
| `postgres` (`size`) | `postgresql.enabled: true`, `postgresql.primary.persistence.size` | `password`, `postgres-password` | two new passwords (letters and digits); which PostgreSQL image their team may use (`postgresql.image`) |
| `cache` | `redis.enabled: true` (Bitnami's); or, for a Redis they have, `externalRedis.enabled: true` | `redis-password`; or `REDIS_URL` | a new password, or their Redis's URL. Bitnami's Redis has no query engine: `@cached` works, `SemanticCache` always misses — a Redis 8 with it, as on Canvas, does not |
| `volume` (`size`) | `persistence.enabled: true`, `persistence.size` | — | a storage class; one replica only |
| `llm` (`models`) | `llm.enabled: true`, `llm.baseUrl`: the company LiteLLM's `/v1` (not known: ask the user — never guess one), `llm.models` | `OPENAI_API_KEY` | a key for the app from the company LiteLLM — it serves the same model names and web search as Canvas's |
| `email` | nothing | — | **not available**: sending goes through Canvas's controller. `send()` only logs |
| `service` (a pair's `api`) | `links` — the umbrella already says so | — | — |
| `service` (another app) | `links`: `{name, url}` | — | that app's address in their cluster |

Anything in score.yaml not in this table: say so in the README's table as not carried over — never
guess a mapping.

## What to do

1. **Copy, then name** — the table in *Files*, then replace the templates' placeholders with the
   app's real names **in every copied file** — subcharts included, so a subchart's own values agree
   with the umbrella's and no generic name is left to wonder about (`<name>` is score.yaml's
   `metadata.name`; a pair's, the root folder's):

   | Placeholder | A single app | A pair: the umbrella | A pair: `charts/api` / `charts/web` |
   |---|---|---|---|
   | `canvas-app-secrets`, `canvas-pair-secrets` | `<name>-secrets` | `<name>-secrets` | `<name>-secrets` |
   | `Chart.yaml` `name: canvas-app` / `canvas-pair` | `<name>` | `<name>` | stays `api` / `web` |
   | `image.repository: canvas-app` | `<name>` | — | `<name>-api` / `<name>-web` |
   | `canvas-pair-api`, `canvas-pair-web`, `canvas-pair.example.com` | — | `<name>-api`, `<name>-web`, `<name>.example.com` | — |

2. **Fill** `values.yaml` from score.yaml with the table in *Choosing*, and `stack`. Python's
   Dockerfile: `PYTHON_VERSION` from `.python-version`. Copy `db/migrations/*.sql` into
   `files/migrations/`.
3. **Write `secret.example.yaml`** (`custom-deploy/helm/`): a Secret named `<name>-secrets` whose
   `stringData` has **every key of its column in *Choosing*, one line each, `""`**, with a comment saying
   what it is and where it comes from (the partner's console, a new password…) — and nothing else,
   no placeholder key. The user copies it to `secret.yaml`, fills it in and `kubectl apply`s it before
   the install; the install stops, naming each one, if a key the app needs is not in it.
4. **Write `custom-deploy/README.md`**: what is here, then the install as commands to copy, in order:
   ```
   cp custom-deploy/helm/secret.example.yaml custom-deploy/helm/secret.yaml   # then fill it in
   kubectl create namespace <name>
   kubectl apply -n <name> -f custom-deploy/helm/secret.yaml
   docker build -f custom-deploy/docker/Dockerfile -t <registry>/<name>:latest .
   docker push <registry>/<name>:latest
   helm dependency build custom-deploy/helm
   helm upgrade --install <name> custom-deploy/helm -n <name> \
     --set global.imageRegistry=<registry> --set ingress.host=<host>
   helm test <name> -n <name>
   ```
   A pair: one build and push per part (`-f custom-deploy/docker/api.Dockerfile … api/`, the same for
   `web/`); `helm dependency build custom-deploy/helm/charts/api` before the umbrella's; and
   `--set web.ingress.host=<host>`. Then a table of each declared resource as **ready**, **you
   provide** or **not available**, from the table in *Choosing*.
5. **Check it** — all three, every time, and fix a value, never a template:
   - **No placeholder left**: nothing in `custom-deploy/` still says `canvas-app` or `canvas-pair`
     (search for both) — step 1's table, applied everywhere.
   - **The secret's keys**: the keys in `secret.example.yaml` are exactly `secrets.keys` and
     `secrets.files`, plus `password` and `postgres-password` with `postgresql.enabled`,
     `redis-password` with `redis.enabled`, `DATABASE_URL` with `externalDatabase.enabled`,
     `OPENAI_API_KEY` with `llm.enabled` — none
     missing, none extra (a pair: both parts', once each).
   - **The chart**, with `helm`: `helm dependency build` (a pair: `charts/api` first), then
     `helm lint --strict` and `helm template` on `custom-deploy/helm`. No `helm` on this computer:
     say so — in the README and in your answer, the chart is **not yet verified**, with those three
     commands for the user to run.
6. **Say what is left**: the README's "you provide" rows, in one short list; whether the chart was
   verified (step 5); and that `canvas deploy` is unchanged.

**Run again** after score.yaml or a migration changes: copy the templates and migrations again, refill
the values the table owns and rewrite `secret.example.yaml`; keep every other value the user changed
in `values.yaml`, and never touch their `secret.yaml`.

## What NOT to do

- Do not write anything outside `custom-deploy/`, or change `score.yaml` or the app's code to make it fit.
- Do not edit the copied templates, Dockerfiles or `files/migrate.sh` — they are tested as they are.
  A need they do not meet: say so, and offer `report-issue`.
- Do not write a secret's value anywhere — values.yaml, the example, the README — or read or edit
  the user's `secret.yaml`. Names only.
- Do not run `docker push`, `kubectl apply` or `helm install` unless the user asks: this skill
  prepares; deploying to their cluster is theirs.
- Do not write a compose file, a Cloud Run service or Kubernetes YAML outside the chart.
