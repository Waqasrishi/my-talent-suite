---
name: export-import-data
audience: end-user
description: >-
  Use when a whole database should leave or enter the app: "export the database", "back up the data",
  "keep a copy before this change", "copy the data to another app", "move the data from staging", "load a
  pg_dump", "restore the data". Rows from a spreadsheet are `import-data`; the schema is `request-database`.
---

## What it is

`canvas db export` writes the app's `app` database to a file; `canvas db import <file>` **replaces** it from one.
Both run in the app's own database pod, so there is nothing to install and no connection string to handle.
**Owners of the team and admins only** — a dump is every row. It is **not a backup**: nothing runs it for you and
the platform keeps no copy, so export before a change you cannot undo.

## Commands

| Do | Run |
|---|---|
| keep a copy | `canvas db export` → `<app>.dump` here (`canvas db export keep.dump`; `--format sql` for plain text; `-` to stdout) |
| see what a dump holds | `canvas db import app.dump --dry-run` — lists it, changes nothing |
| replace the data | `canvas db import app.dump` — asks first; `--yes` skips it |

A `.sql` file is imported as plain SQL, anything else as a custom-format dump (`--format` overrides).

## What to do

1. **Say what an import does before running it:** every table in the dump is dropped and made again, so the data
   now in the app is gone. Export first if there is any chance it is wanted. It is one transaction: a dump
   that fails changes nothing, and the reason is printed. A `.sql` file must not hold its own `BEGIN` or `COMMIT`:
   one that does ends the transaction early, and a later error leaves what came before it in place.
2. **Between two apps, the schema must match** — the same tables and columns. Deploy the target with the same
   `db/migrations/` first; the dump carries the `schema_migrations` table, so both then agree on what has run.
3. **A dump from elsewhere** must be made without owners, grants or extensions, or the restore stops on them:
   `pg_dump -Fc --no-owner --no-acl --exclude-extension=vector`. pgvector is already in every app's database.
4. After an import, `canvas restart` if the app caches what it read; its open connections stay.

## What a dump holds

Every table in every schema — `jsonb` and vector columns, indexes, sequences — as the `app` role owns them.
Not roles or grants, not files on a volume, not a cache. Capped at 2 GiB a transfer, two transfers at a time.

## What NOT to do

- Do not export to a shared or synced folder, or commit the dump: it is the app's data, including anything
  personal. Delete it when done.
- Do not import into a team's real app to "try it" — export that app first.
- Do not offer this for a few rows to seed a table: that is a seed migration (`import-data`).
- Do not try it from Canvas Studio: it cannot, and the person runs it (STUDIO.md).

## If it fails

| Said | Means |
|---|---|
| `only an owner of the team may…` (403) | ask a team owner, or have one run it |
| `has no database` (404) | `score.yaml` has no `postgres` resource |
| `database … is not ready` (409) | `canvas status` shows why; try again when it is up |
| `the dump is over 2048 MB` (413) | too big for one transfer; ask the platform team |
| `the database did not take the dump (nothing was changed)` (422) | the line after it is Postgres's reason: usually a different schema, or a dump made with owners |
| `database transfers are running right now` (429) | try again in a minute |
