---
name: add-cache
audience: end-user
description: Use when the user wants something faster or kept for a while — "cache this", "add
  caching", "semantic cache", "answer similar questions once", "add Redis", "it's slow", "rate limit",
  "remember the last result", "don't ask the AI the same thing twice", or the same in Arabic
  ("كاش", "تخزين مؤقت", "ذاكرة مؤقتة") — or when you reach for Redis, memcached or a cache library. A queue, a job
  or work in the background is `add-job`.
---

Code: `ajnkit-cache`.

## Files

| | |
|---|---|
| `score.yaml` | the `cache` resource — `fast: {type: cache}`, no params |
| *a cache* (AGENTS.md's Stack table) | `cached`, `client`, `SemanticCache` — the platform's; do not edit, do not wrap in a second helper |

## Choosing

An app is one process, so the process often is the cache. The `cache` resource is one Redis of the app's
own — 128 MB, **never persisted**: a restart or a deploy empties it. Keep only what can be made again.
When it fills (`canvas status` shows its memory), a bigger size — 256 MB up to 2 GB — is the user's to ask
for on the app's page, under Resources, with why; a team owner approves it and the cache restarts empty at
that size. Nothing changes in `score.yaml`.
About 15,000 semantic entries fit in 128 MB (about 8 KB each; a long answer takes far fewer). A wrong answer is dropped with
`faq.forget(question)`, a whole cache with `faq.clear()` — no need to wait for the `ttl` or redeploy.

| The need | Use |
|---|---|
| a slow read that is fine to lose on a restart, one process | **in the process** — AGENTS.md's Stack table, *a cache in the process* |
| the same, and it must not be asked twice across restarts, or the AI answers the same question again and again | **`cache`**: `cached` on the function, or a `SemanticCache` for questions that mean the same |
| a counter, a rate limit, a last-seen | **`cache`**: `client().incr(…)`, `client().expire(…)` — lost on a restart, which a limit survives |
| a result that must outlive a restart or a deploy — a report, a decision | **a `postgres` table** keyed by the input, read before computing (`request-database`) |
| a queue, job status | not a cache: `add-job` |
| sessions, who is signed in | nothing: the platform's sign-in is the session (`add-auth`) |
| state shared with another app of the team | that app's API, through `service` (a pair: `canvas app create --stack next --api python`) |

## Ask first

Before writing code, ask the user — the answers decide the design:

1. **What is slow, or costly?** Time it in the log first. A page that takes 40 ms does not want a cache.
2. **Is the answer the same for everyone?** A cache is read by every caller: what depends on who asks
   goes under a key that includes the person, or stays out.
3. **For a semantic cache: how bad is a wrong answer?** Close in meaning is not the same question
   (*"reset my password"* and *"reset my colleague's password"*), and the model does not tell opposites
   apart — *"when does it open"* and *"when does it close"* score higher in Arabic than a rewording does
   (`ajnkit-cache` has the numbers). Use it for questions whose answer is the same however the word falls
   (what is this, how do I, where is) — not for open or close, allow or refuse, a number or a date.
   Anything a person acts on: raise `threshold` to 0.95, and give `scope` where the answer is one person's.
   When opposites could still be asked (open or close, enable or disable, a number), `verify=True`
   (`{ verify: true }`) has `gemini-flash-lite` confirm each close hit before it is returned: about 0.6 s
   more on those hits, a miss when it says no or fails. Ask whether that is worth it; it is off by default.

## What to do

0. Python or adapted app: `canvas app add cache` once — plain or semantic. It brings the AI client
   (`ajnkit-llm`) with it, which a semantic cache embeds with; for a semantic cache `type: llm` goes in
   `score.yaml` too (`request-llm`) — with `gemini-embedding` among its `models` if it names any. A Next.js app has both already.
   **Secure or confidential questions (`classification: restricted`, `request-llm`):** embed with the company's own model, so the text does not leave it —
   `SemanticCache("faq", model="qwen-embedding", dim=2560)` (Next: `{ model: "qwen-embedding", dim: 2560 }`), and `qwen-embedding` in
   `models`. An entry is about 3x the size, so fewer fit; `threshold` is measured again, as with any model.
1. Declare it in `score.yaml`:
   ```yaml
   resources:
     fast:
       type: cache
   ```
2. Cache in `src/lib/`, on the slow function, so the page and the endpoint both get it:
   ```python
   from ajnkit.cache import SemanticCache, cached

   @cached(ttl=300)                               # JSON arguments, JSON answer
   def rota(week: str) -> dict: ...

   faq = SemanticCache("faq")                     # 0.93; Arabic questions only match Arabic ones
   safe = SemanticCache("hours", verify=True)     # a close hit is confirmed by a cheap model first
   answer, from_cache = faq.ask(question, lambda q: ask_the_model(q))
   mine = faq.ask(question, ask_the_model, scope=who.email)   # one person's own entries
   ```
   ```ts
   import { SemanticCache, cached } from "@ajnkit/cache";
   export const rota = cached(async function rota(week: string) { /* … */ }, { ttl: 300 });
   const [answer, fromCache] = await new SemanticCache("faq").ask(question, askTheModel);
   const safe = new SemanticCache("hours", { verify: true });   // a close hit is confirmed by a cheap model first
   const mine = await new SemanticCache("faq").ask(question, askTheModel, who.email);   // one person's own entries
   ```
3. A test that the second call does not recompute (`write-tests`): with `REDIS_URL` unset nothing is kept,
   so test the function and replace `cached`'s Redis (`ajnkit-cache`) — never a real one.
4. On your computer there is no cache: calls go through and a semantic cache always misses. Say so, so the
   user does not read it as broken. `canvas validate`, then `canvas deploy` — the first deploy gives the
   app its cache and password.

## What NOT to do

- Do not add a Redis client, `cachetools` for what must survive a restart, or run Redis beside the app —
  there is no second container; the resource is the Redis.
- Do not keep what must not be lost: it goes in `postgres`. The cache is emptied by every deploy.
- Do not cache what depends on who is calling under a key that leaves the caller out — one person would
  see another's data. That goes double for a semantic cache: it matches on meaning, not on the caller.
- Do not count on `verify` for what a person acts on: it lowers the risk of a wrong hit, it does not remove it.
- Do not set a semantic threshold below 0.9 without telling the user what a wrong hit looks like.
- Do not put a person's data, a secret or a token in the cache: every part of the app reads it.
- Do not declare more than one `cache`; use key prefixes, and a `SemanticCache(name)` for each purpose.
