---
name: add-mcp
audience: end-user
description: >-
  Use when the app's features should be callable by an AI assistant — "make it an MCP server", "let Claude / Cursor
  use the app", "expose tools to my assistant", "an MCP endpoint", "connect it to Claude Desktop" — or when the user
  names FastMCP or the mcp SDK for the app. Python apps, and a pair's API.
---

Code: `ajnkit-mcp`.

## Files

| | |
|---|---|
| `src/mcp.py` | the app's server and its tools — each a call to a function in `src/lib/`. The platform serves it at `/mcp` |
| `score.yaml` | the route's `mcp: true`, so an assistant can sign the person in; `/mcp` is behind the same `auth: sso` and `access` as every page |

## What to do

1. `canvas app add mcp` once.
2. Write `src/mcp.py` from the features the app already has — a tool per thing an assistant would ask for, each a call
   into `src/lib/` (`ajnkit-mcp` has the code). Mark a tool `annotations=mcp.READ` only if it changes nothing.
3. A test in `tests/` that calls a tool through `/mcp` as a reader and as a writer (`ajnkit-mcp`'s tests show how).
4. score.yaml's route: `mcp: true` (beside `auth: sso`), so an assistant can sign the person in.
5. `canvas deploy`. The address is `https://<app>--<team>.<base>/mcp`.

## Connecting an assistant

**As the person — the default** (canvas ADR-75). score.yaml's route says `mcp: true` beside `auth: sso`; the
assistant signs the person in with their company account once, in the browser, and every call is theirs: the app's
`access` and its read/write split apply to them as on a page.

```bash
claude mcp add --transport http notes https://<app>--<team>.<base>/mcp --client-id canvas-mcp
```

Cursor, `.cursor/mcp.json`: `{"mcpServers": {"notes": {"url": "https://…/mcp", "auth": {"CLIENT_ID": "canvas-mcp"}}}}`;
Codex: the same `client_id`. The first call opens the sign-in; nothing to paste, no password. Claude Code, Cursor and
Codex run on the person's computer, which must be on the company network. Claude Desktop's and claude.ai's
connectors call from Anthropic's cloud, which reaches no Canvas app — say so if asked.

**As a service account** — for a script, a scheduled job or another system, which has no person: `canvas sa create
<name>` prints its identity and password (90 days by default); add the identity to `access` (`read` for read tools,
`write` for the rest — `add-auth`, *Machine callers*). Then, with the password as HTTP Basic:

```bash
claude mcp add --transport http notes https://<app>--<team>.<base>/mcp \
  --header "Authorization: Basic $(printf '%s' '<name>--<team>:<password>' | base64)"
```

The password is the user's to paste, never written into the app's files.

A Next.js app has no MCP of its own: its tools belong to a Python API beside it (a pair, `canvas app create --api python`).
