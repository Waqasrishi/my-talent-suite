---
name: add-job
audience: end-user
description: >-
  Use when work should happen outside the request, or on a clock: "in the background", "send it
  later", "a queue", "a job", "job status", "retry if it fails", "run every night", "every hour",
  "a cron job", "a scheduled task", "schedule", "a nightly import", "a digest email", "clean up old
  rows", "a worker", "Celery", "BullMQ" — or when a request takes too long and should answer first
  and finish after. Something slow that only needs to be remembered is `add-cache`.
---

## Files

| | |
|---|---|
| `score.yaml` | a schedule: `schedules` under `containers.app`. A job: `postgres` — `request-database`. Nothing for work after the response |
| `src/jobs.py` (or a `src/jobs/` module) in a Python app, `scripts/<name>.mjs` in a Next.js app | what a schedule runs |
| *the schema* (AGENTS.md's Stack table) | a job: one `job` table |
| *background work* (the Stack table) | a job: the loop, `src/tasks.py` in a Python app, `src/lib/jobs.ts` in a Next.js app |
| `src/app.py` / `src/instrumentation.ts` | starts the loop with the app |
| `src/lib/` | what each job does — a plain function, the same one a page or a test can call |

## Choosing

**Auto-deploy restarts the app on every change**: anything only in memory is lost.

| The work | Use |
|---|---|
| a few seconds, fine to lose — a log line, a notification, a cache warmed | **after the response**: `BackgroundTasks` in Python, `after()` in Next.js |
| must happen after a request, even across a restart — an email, an import, a report, a model call that costs | **a job**: a row in the `job` table, worked by the loop |
| someone waits for the result — "Generate report" | a job; the page shows its row's `status` and `error`, refreshed every few seconds |
| at a time — "every night at 7", "every hour": a nightly import, a digest email, a clean-up | **a schedule**: a `schedules` entry in `score.yaml` that runs a command of the app's own code. Each run is seen — `canvas status`, `canvas logs --schedule <name>`, the app's page — so a failure is not silent |
| longer than ten minutes | a job that does one part and enqueues the next — see What NOT to do |

What a restart or a deploy does to each:

| | On a restart |
|---|---|
| after the response | finished if it takes under ~30 s from the stop signal; otherwise **lost**, never retried |
| a job | **kept**. One cut off mid-run runs again ten minutes later — so it must be safe to run twice |
| a schedule | untouched: a run is its own copy of the app, beside it, not the app's process |
| a timer or a thread of your own (`setInterval`, `sleep` in a loop) | **lost**, and a missed run never happens — do not use one |

## What to do

### After the response

```python
from fastapi import BackgroundTasks

@router.post("/notes")
def add(note: NoteIn, background: BackgroundTasks, db: Annotated[Session, Depends(session)]):
    saved = lib.notes.add(db, note)
    background.add_task(lib.notes.notify, saved.id)    # runs once the answer is sent
    return saved
```
```ts
import { after } from "next/server";

export async function POST(request: Request) {
  const saved = await addNote(await request.json());
  after(() => notify(saved.id));                     // runs once the answer is sent
  return Response.json(saved);
}
```
`after()` works the same in a server action. That is all — no table, no loop.

### A schedule

1. In `score.yaml`, under the container — at most 5, each a name of lowercase letters, digits and
   hyphens, at most 20:
   ```yaml
   containers:
     app:
       schedules:
         nightly-digest:
           cron: "0 4 * * *"                               # every day at 04:00 UTC — 07:00 in Doha
           command: ["python", "-m", "src.jobs", "digest"]
   ```
   `cron` is five fields, **in UTC** (Doha is UTC+3, all year): numbers, `*`, `a-b`, `/n` and lists —
   no names (`MON`, `JAN`), no `@daily`. Every hour is `"0 * * * *"`. Runs are at least 15 minutes apart.
   In a Next.js app the command runs a script: `["node", "--conditions=react-server", "scripts/<name>.mjs"]`.

2. The command is the app's own code. A run is the app's image with its whole environment — the
   database, the cache, the secrets, the egress — but not the app's process: no lifespan, no loop, no
   request. It ends when the work is done; an exception, or an exit that is not 0, is a failed run.
   ```python
   """What the app's schedules run — `python -m src.jobs <name>` in score.yaml. The add-job skill."""

   import sys
   from contextlib import contextmanager

   from ajnkit.db import session
   from ajnkit.logger import log

   from src.lib import reports

   open_session = contextmanager(session)   # `session` is the request dependency; a job opens it itself


   def digest() -> None:
       with open_session() as db:
           reports.digest(db)              # the same function a page or a test calls
           db.commit()


   JOBS = {"digest": digest}               # a name in the command → what it does

   if __name__ == "__main__":
       name = sys.argv[1]
       log.info("schedule %s: started", name)
       JOBS[name]()
       log.info("schedule %s: done", name)
   ```
   A Next.js script is plain JavaScript run by `node`: it cannot import the app's `.ts` files or
   `@/…`. It imports `@ajnkit/*` by subpath (`@ajnkit/core/config/env`, `@ajnkit/core/services/logger`,
   `@ajnkit/email`, …), never `@ajnkit/core` itself, which needs Next; `--conditions=react-server` lets
   the server-only ones load. `node`, not `npm run` or `npx`: those write to a home folder, and the
   disk is read-only.
   ```js
   // scripts/clean-up.mjs — `node --conditions=react-server scripts/clean-up.mjs` in score.yaml. The add-job skill.
   import pg from "pg";

   import { env } from "@ajnkit/core/config/env";
   import { log } from "@ajnkit/core/services/logger";

   const db = new pg.Client({ connectionString: env.DATABASE_URL });
   await db.connect();
   try {
     const { rowCount } = await db.query("DELETE FROM job WHERE status = 'done' AND run_at < now() - interval '30 days'");
     log.info("schedule clean-up: done", { deleted: rowCount });
   } finally {
     await db.end();
   }
   ```

3. What the platform does with each run:

   | | |
   |---|---|
   | two at once | never: one still running when the next is due, the next is skipped |
   | a failed run | **not retried** — the next run is the retry. So it must be safe to run twice: upsert, key what it writes, check before sending |
   | longer than 60 minutes | stopped, and failed. Keep a run short; a big import does a part each run |
   | seeing it | `canvas status` shows each schedule's last run; `canvas logs --schedule nightly-digest` its output; the app's page in the portal, its Schedules row |

4. Tests (*the tests*) call the function directly (`digest()`), as a plain function. Try the schedule on
   the deployed app: deploy, wait for its first run, then `canvas status` and `canvas logs --schedule`.

### A job

1. `postgres` in `score.yaml` (`request-database`), then the table in *the schema*:
   ```python
   from sqlalchemy import Index, text
   from sqlalchemy.dialects.postgresql import JSONB

   class Job(Base):
       __tablename__ = "job"
       id: Mapped[int] = mapped_column(primary_key=True)
       kind: Mapped[str]                                     # which handler runs it
       key: Mapped[str | None] = mapped_column(unique=True)  # the same key twice is one job
       payload: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'"))
       run_at: Mapped[datetime] = mapped_column(server_default=func.now())
       status: Mapped[str] = mapped_column(server_default="pending")   # pending, running, done, failed
       attempts: Mapped[int] = mapped_column(server_default="0")
       started_at: Mapped[datetime | None]
       error: Mapped[str | None]
       __table_args__ = (Index("ix_job_due", "status", "run_at"),)
   ```
   ```ts
   import { index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

   export const job = pgTable("job", {
     id: serial("id").primaryKey(),
     kind: text("kind").notNull(),                         // which handler runs it
     key: text("key").unique(),                            // the same key twice is one job
     payload: jsonb("payload").notNull().default({}),
     runAt: timestamp("run_at").notNull().defaultNow(),
     status: text("status").notNull().default("pending"),  // pending, running, done, failed
     attempts: integer("attempts").notNull().default(0),
     startedAt: timestamp("started_at"),
     error: text("error"),
   }, (t) => [index("job_due").on(t.status, t.runAt)]);
   ```
   `canvas db revision "add job"`.

2. The loop, in *background work*. `HANDLERS` is the only line that changes from app to app; each
   handler is a function of `src/lib/` taking the payload.
   ```python
   """Background work that must not be lost — the add-job skill."""

   import json
   import threading
   from contextlib import contextmanager
   from datetime import UTC, datetime

   from sqlalchemy import text

   from src.lib import reports
   from ajnkit.db import session
   from ajnkit.logger import log

   open_session = contextmanager(session)   # `session` is the request dependency; a job opens it itself
   HANDLERS = {"report": reports.build}            # a kind → what does it
   ATTEMPTS = 3
   stop = threading.Event()

   CLAIM = """
   UPDATE job SET status = 'running', attempts = attempts + 1, started_at = now()
   WHERE id = (SELECT id FROM job
               WHERE run_at <= now() AND attempts < :attempts
                 AND (status = 'pending' OR (status = 'running' AND started_at < now() - interval '10 minutes'))
               ORDER BY run_at LIMIT 1 FOR UPDATE SKIP LOCKED)
   RETURNING id, kind, payload"""
   DONE = "UPDATE job SET status = 'done', error = NULL WHERE id = :id"
   FAILED = """
   UPDATE job SET error = :error, run_at = now() + attempts * interval '1 minute',
     status = CASE WHEN attempts >= :attempts THEN 'failed' ELSE 'pending' END
   WHERE id = :id"""
   ENQUEUE = """
   INSERT INTO job (kind, key, payload, run_at) VALUES (:kind, :key, CAST(:payload AS jsonb), :run_at)
   ON CONFLICT (key) DO NOTHING"""


   def enqueue(db, kind: str, payload: dict | None = None, key: str | None = None,
               run_at: datetime | None = None) -> None:
       """Add a job; the caller commits — with the rows it is about, so neither exists without the other."""
       db.execute(text(ENQUEUE), {"kind": kind, "key": key, "payload": json.dumps(payload or {}),
                                  "run_at": run_at or datetime.now(UTC)})


   def run(job) -> None:
       try:
           HANDLERS[job.kind](job.payload)
           sql, args = DONE, {"id": job.id}
       except Exception as e:
           log.exception("job %s (%s) failed", job.id, job.kind)
           sql, args = FAILED, {"id": job.id, "error": str(e)[:500], "attempts": ATTEMPTS}
       with open_session() as db:
           db.execute(text(sql), args)
           db.commit()


   def work() -> None:
       """The loop — started with the app (src/app.py), until it stops."""
       while not stop.is_set():
           try:
               with open_session() as db:
                   job = db.execute(text(CLAIM), {"attempts": ATTEMPTS}).first()
                   db.commit()
               if job:
                   run(job)
                   continue                      # straight to the next one
           except Exception:
               log.exception("jobs: the loop failed; trying again")
           stop.wait(5)
   ```
   ```ts
   import { sql } from "drizzle-orm";

   import { env, log } from "@ajnkit/core";
   import { db } from "@/canvas/db";
   import { buildReport } from "@/lib/reports";

   type Handler = (payload: Record<string, unknown>) => Promise<void>;
   const HANDLERS: Record<string, Handler> = { report: buildReport };  // a kind → what does it
   const ATTEMPTS = 3;

   export async function enqueue(kind: string, payload: object = {}, key: string | null = null, runAt = new Date()) {
     await db().execute(sql`INSERT INTO job (kind, key, payload, run_at)
       VALUES (${kind}, ${key}, ${JSON.stringify(payload)}::jsonb, ${runAt.toISOString()}::timestamptz)
       ON CONFLICT (key) DO NOTHING`);
   }

   async function run(job: { id: number; kind: string; payload: Record<string, unknown> }) {
     try {
       await HANDLERS[job.kind](job.payload);
       await db().execute(sql`UPDATE job SET status = 'done', error = NULL WHERE id = ${job.id}`);
     } catch (error) {
       log.error(`job ${job.id} (${job.kind}) failed`, { error });
       await db().execute(sql`UPDATE job SET error = ${String(error).slice(0, 500)},
         run_at = now() + attempts * interval '1 minute',
         status = CASE WHEN attempts >= ${ATTEMPTS} THEN 'failed' ELSE 'pending' END
         WHERE id = ${job.id}`);
     }
   }

   async function work() {
     for (;;) {
       try {
         const { rows: [job] } = await db().execute(sql`
           UPDATE job SET status = 'running', attempts = attempts + 1, started_at = now()
           WHERE id = (SELECT id FROM job
                       WHERE run_at <= now() AND attempts < ${ATTEMPTS}
                         AND (status = 'pending' OR (status = 'running' AND started_at < now() - interval '10 minutes'))
                       ORDER BY run_at LIMIT 1 FOR UPDATE SKIP LOCKED)
           RETURNING id, kind, payload`);
         if (job) {
           await run(job as Parameters<typeof run>[0]);
           continue;                                          // straight to the next one
         }
       } catch (error) {
         log.error("jobs: the loop failed; trying again", { error });
       }
       await new Promise((done) => setTimeout(done, 5_000));
     }
   }

   let started = false;

   /** The loop — started with the app (src/instrumentation.ts), once. */
   export function start() {
     if (started || !env.DATABASE_URL) return;
     started = true;
     void work();
   }
   ```

3. Start it with the app — with no `DATABASE_URL` (your computer, the tests, `next build`) it does
   not start:
   ```python
   # src/app.py
   import threading
   from contextlib import asynccontextmanager

   from src import envs, tasks

   @asynccontextmanager
   async def lifespan(app: FastAPI):
       if envs.DATABASE_URL:
           threading.Thread(target=tasks.work, daemon=True).start()
       yield
       tasks.stop.set()

   app = FastAPI(lifespan=lifespan, docs_url=…)       # the arguments it already has, unchanged
   ```
   ```ts
   // src/instrumentation.ts — Next.js calls register() once, when the server starts
   export async function register() {
     if (process.env.NEXT_RUNTIME === "nodejs") (await import("@/lib/jobs")).start();
   }
   ```
   (`NEXT_RUNTIME` is Next's, not `env`.)

4. Enqueue where the work starts — a route, an action, another job:
   ```python
   tasks.enqueue(db, "report", {"month": "2026-09"}, key="report:2026-09")
   db.commit()
   ```
   ```ts
   await enqueue("report", { month: "2026-09" }, "report:2026-09");
   ```
   A `key` makes asking twice one job — a double click, a retried request. Leave it out when every
   call is new work.

5. Tests (*the tests*) call each handler directly, as a plain function — the loop needs the database,
   which is not on your computer. Try the loop itself on the deployed app: enqueue, then read the row.

## What NOT to do

- Do not add Celery, RQ, BullMQ, Redis or a scheduler library: a schedule is `schedules` in
  `score.yaml`, a job the table and the loop.
- No `worker:` Procfile line, no second app for jobs, no timer in the app for a schedule.
- Do not write a job that breaks when it runs twice — a restart re-runs one that was cut off. Upsert,
  check before sending, or key what it writes.
- Do not let one job run past ten minutes — it would be taken as cut off and run again beside itself.
  Do a part, then `enqueue` the next part.
- Do not hold the claim's transaction open while the job runs: claim, commit, then work — as above.
  Every page waits on the same few connections (`use-database`).
- Do not start the loop at import, or once per request — once, with the app, as in step 3.
- Do not keep `done` rows forever if there are many a day: a schedule may `DELETE FROM job WHERE
  status = 'done' AND run_at < now() - interval '30 days'` once a day, as the script above does.
