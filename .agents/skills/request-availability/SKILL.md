---
name: request-availability
audience: end-user
description: >-
  Use when the app must keep serving through a deploy, a restart or a lost node, or the user wants
  more than one copy of it — "replicas", "high availability", "HA", "two copies", "it goes down when
  we deploy", "survive a node", "scale out" — or wants the database to survive a lost node: "a
  standby", "failover", "database replicas". Not more CPU or memory for each copy (a bigger size,
  asked for on the app's page), nor more disk (`request-database`, `request-volume`).
---

## Files

| | |
|---|---|
| `score.yaml` | `replicas` under `containers.app`; `instances` in the `postgres` resource's `params` |
| *the code* | whatever runs once for each copy: the job loop, anything kept in memory |

## Choosing

The app and its database are separate: the user can have either without the other. Left alone, each is
one copy, and a restart or a lost node is a short outage.

| The user wants | Set | Approval |
|---|---|---|
| the app to survive a deploy or a lost node | `replicas: 2` | none — 1 or 2 is the app's own |
| the database to survive a lost node | `instances: 2` | none — the same |
| a third copy of either | `replicas: 3` / `instances: 3` | a team owner's, asked on the app's page (Resources → Request more) |

Three is the most. A database copy is a standby on another node with a disk of its own.

## Before `replicas` goes above 1

Each copy is the whole app, so what the app keeps or does in its own process now happens once for each:

- **Kept in memory** — sessions, a cache, a counter, an upload waiting in `/tmp`: another copy does not see
  it. Keep it in `postgres` (or a signed cookie for a session).
- **The job loop** (`src/tasks.py`) starts in every copy. Make it safe to run twice, or take a row
  lock in `postgres` first (`FOR UPDATE SKIP LOCKED`). A `schedules` run is once, whatever the copies.
- **A `volume`** is one disk for one pod: the platform refuses `replicas` above 1 with one. Keep the data in
  `postgres`, or stay at one copy.
- **The database pool** is per copy, up to 10 connections: three copies are thirty. Do not raise it.

Say what will run twice before changing the file.

## What to do

1. Check the code against the list above; fix what it breaks.
2. In `score.yaml`:
   ```yaml
   containers:
     app:
       replicas: 2                      # copies of the app: 2 is the app's own
   resources:
     db:
       type: postgres
       params: {size: 1Gi, instances: 2}   # copies of the database: a primary and a standby
   ```
3. `canvas validate`, then `canvas deploy`. The app's page (Resources → Capacity) shows
   "small × 2 copies".
4. A third copy: `canvas deploy` stops with "approved first". Tell the user to ask on the app's page
   (Resources → Request more), a team owner approves, and it applies at once. Then write the same number in
   `score.yaml`, or the next deploy puts it back.

## What it gives, and what it does not

- A deploy replaces one copy at a time and never goes below what is serving; a lost node leaves a copy
  serving. The copies are spread over nodes.
- The database: if the primary's node is lost, the standby takes over within about half a minute, and
  writes fail meanwhile. Replication is asynchronous: the last moments before a crash may be lost.
- **Copies are not a backup.** The database is still deleted with the app (AGENTS.md §9).
- Each copy counts against the team's CPU and memory; each database copy, against its storage. Say so.

## What NOT to do

- Do not add copies for speed. One copy answers a few people; move slow work out of the request
  (`add-job`) first.
- Do not set `replicas` above 1 with a `volume`, or keep sessions or a cache in memory with more than one.
- Do not call a standby a backup.
