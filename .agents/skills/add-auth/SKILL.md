---
name: add-auth
audience: end-user
description: Use when the user wants an app to require login, says "lock this down", asks who can
  reach their app, or wants to know who is calling — and when something that is not a person must
  call an app's API — another app, an outside system, a script, in either direction — and when the
  user says "use managed groups", "a group for each role", or "convert the list to groups". The platform
  signs people and service accounts in for the app — the app does not do OIDC itself.
---

Code: `ajnkit-core`.

## Sign-in, on or off

**On in a new app**: every request needs a company sign-in (Authentik, the same account as the
portal), and the platform tells the app who is calling. It is one line in `score.yaml`:

```yaml
resources:
  www:
    type: route
    params:
      auth: sso            # none: no sign-in
```

**A request or spec that says people sign in** — "with email and password", "log in", "accounts" — means this sign-in, with each role a rule in `access.rules` (below) listing its starting accounts' emails; someone with no company account gets a Canvas local account (ADR-86). The app never keeps passwords or a login of its own unless the person insists on one after hearing this.

"Turn sign-in off" (or on) is that line, then `canvas deploy` (or auto-deploy). Off needs no
`access` left: a new app opens only for its maker, so first `canvas share everyone` — `canvas validate`
refuses `access` without `auth: sso`. Off, the app is open
to everyone on the corporate network — never the internet — and nobody is known. Say so before
turning it off: anyone on the network can then use it, and anything it shows.

## The API docs, without the sign-in

A Python app only — a Next.js app has no API docs yet, and `canvas validate` refuses this there.
With `auth: sso`, `/api/docs` needs a sign-in like everything else. To let anyone on the company
network read the docs, add `docs: public` beside `auth` and deploy:

```yaml
    params:
      auth: sso
      docs: public         # /api/docs, /api/redoc, /api/openapi.json — nothing else
```

Only those docs pages open; every endpoint stays behind the sign-in, so "Try it out" works only
for someone signed in. The docs list every endpoint the app has — ask the user before turning it on.

## A page for people with no company account — a guest's link

Someone with no company sign-in (a guest confirming they will come, an outside signer) can open
chosen paths of an `auth: sso` app: list them as `public` beside `auth`, and deploy.

```yaml
    params:
      auth: sso
      public: [/v]          # /v and everything under it (/v/<event>/<token>) — not /video
```

Nobody is signed in there: *who is calling* is no one, and a caller cannot claim to be someone. So the
app checks its own proof on those paths — a token in the link, made unguessable and checked in constant
time (`hmac.compare_digest`, `crypto.timingSafeEqual`), with an expiry and a rate limit — and shows only
what that token is for. Everything else stays behind the sign-in, and the platform's own paths cannot
be listed. On Canvas today these paths open on the company network (and VPN) like every app — not
the internet. Ask the user before adding one: anyone who has the link opens it.

## Who is calling

*Who is calling* (AGENTS.md's Stack table) gives `email`, `name` and `groups`: real under
`auth: sso`, absent and **forgeable** under `auth: none` — never decide anything on them there.

## Only some people or groups

The platform lets any employee sign in. **Who may open it** — `access.read` — is `canvas share`
(below), never written by hand. Beside it, by hand, who may also change things and who never:

```yaml
    params:
      auth: sso
      access:
        read: ["Innovation and R&D"]         # `canvas share with "Innovation and R&D"` writes this
        write: ["someone@aljazeera.net"]     # may also POST/PUT/PATCH/DELETE; absent: same as read
        deny: ["contractor@aljazeera.net"]   # never, whatever read and write say
```

No `access`: anyone who signs in. **"Make it private"**, "share it with the team", "everyone" or
"with Finance" is `canvas share private | team | everyone | with <who…>` — never by hand (`share-app`); it changes the
running app at once, without a build. `canvas deploy` refuses `access` without `auth: sso` before it uploads anything. It is
enforced on every request by the platform's checks in the app — nothing to write. (An app brought on beside its own code, `adapt-app`, enforces it in its own code: `access.enforce`, or `PLATFORM_ACCESS` read by hand.) Writers can always read.

## Only some people on one page — a rule

"Only Finance should see the dashboard", "the export is for Ann", "admins only on /settings": a
**rule**. Write WHO in `score.yaml`, under the route's `access.rules`, and only the rule's NAME in the
code. `score.yaml` is the one place people are written: the platform hands the rules to the app,
and the portal shows them on the app's page — so what it shows is what the app enforces.

```yaml
    params:
      auth: sso
      access:
        rules:
          dashboard: ["Finance", "ann@aljazeera.net"]   # a name, then who: Entra groups or emails
```

```python
from ajnkit.rbac import require

@router.get("/dashboard")
@require("dashboard")
def dashboard(request: Request): ...    # @require below the route decorator; a view under it takes the Request, or every call fails

# or once for a router; a view that calls an api.py function needs the rule on that function too:
router = APIRouter(prefix="/dashboard", dependencies=[Depends(require("dashboard"))])
```

**Check what each role sees, as them.** List yourself (or the testers) under `access.rules.view-as` and the account menu offers
"View the app as a role" — and, after a redeploy, as a person (type a name or email; their real groups) — read only, a banner says so; nothing in the code to write. Never build a "switch user" of your own.

**Each role sees its own menu.** A page only a rule may open is only in that rule's menu — name the
rule as the third item of its line in `src/nav.py`, and the header shows it to who the rule lets in:

```python
PAGES = [("Take a test", "/"), ("Questions", "/questions", "admin"), ("Results", "/results", "admin")]
```

A Python app only: a Next.js app's `src/nav.ts` takes a label and a path, and its menu is the same for
everyone — the page's own `permit("admin")` keeps it closed, and a person the rule leaves out who
follows the link gets the 403 page. Never filter `PAGES` yourself in a Next app.

Anything else a role alone may see — a button, a column — is `allowed(who, "admin")` (`from
ajnkit.rbac import allowed`, `who = caller(request.headers)` from `ajnkit.identity`), passed to the template; never an
email compared in code. Who is in the rule stays score.yaml's.
```tsx
import { permit } from "@ajnkit/core";

export default async function Dashboard() {
  await permit("dashboard");          // first, before anything is read
  …
}
```

Who goes in a rule is written by hand, so look each person up: their email from
`canvas team members --json`, or from the user — **never guessed from a name** (`momin@` is
nobody; Momin Bannani is `bannanim@`), as a wrong one locks them out. The whole team is its groups,
`canvas-<team>-owners` and `canvas-<team>-members`, which keep up as people join and leave.

Every time the user asks for something like this, **record it as a rule** — a new name, or more
people on an existing one — never as a list of groups or emails in the code. A rule's name is lowercase
letters, numbers and hyphens; say which page it guards in a comment beside it if the name does not.

`canvas validate` and `canvas deploy` refuse a rule the code names (*a rule*) that `score.yaml` does
not declare, before anything is uploaded. On your computer a guarded page refuses everyone.
A page that tells someone they may not see it uses the notice component, as an error, inside the
shell like any page — never a page of its own making (a Next app's `permit` shows the platform's own
403 page by itself). Sign out is the shell's, under their name.

## People who change without a deploy — a managed group behind the role

A **managed group** is the platform's own Authentik group for one role of this app, `canvas-<team>--<app>--<role>`, kept with
`canvas access` — not an Entra group (Entra's are the company's: read only here, named with `use`). Ask for one when the people
for a role change often ("let me add people without redeploying", "give each role a group"). Under the route's `access`,
`groups` names the role — `read`, `write`, `deny` or `rules.<name>` — and the code stays the same; only the people move:

```yaml
      access:
        groups:
          read: {managed: true}                    # the platform makes canvas-<team>--<app>--read
          rules.dashboard: {use: ["Finance"]}      # an Entra group that exists: read, never changed
```

- **First deploy:** `canvas deploy` makes the group and puts the person deploying in it, so the owner is not shut out.
- **The people:** `canvas access add <role> <email>` · `remove` · `list` — an owner of the team or an admin; it reaches the person
  at their next sign-in, and they must have opened Canvas once (`canvas team members` shows who has; never guess an email).
- **One group per role**, never one for everything. At a pair's root these act on the API, which holds the access.
- **It goes with the app:** taking the app down deletes its groups; dropping a role from `groups` deletes that group at the next
  `canvas deploy` (`--yes` when people are in it). While a role comes from a group, `canvas share … with` cannot change it.
- **Not provided?** If `canvas validate` says groups are not provided, or the team has them off, list the people in `access` as
  above and offer `report-issue`.

### "Use managed groups" is a whole instruction

Said with no more detail, work out what is needed and do it end to end:

1. **The roles:** `read` always; `write` and `deny` when score.yaml has them; and every rule — each key under `access.rules` and
   each `@require("name")` in the code (search `src/`). One managed group each.
2. **Each role that already lists people:** convert it (the steps below). A role with no list gets a fresh group.
3. **Ask only what you cannot see:** which roles, when the app has no rules and the user may mean more than `read`; and whether to
   convert the people who are listed.
4. Then `canvas validate`, `canvas deploy`, `canvas access list`, and tell the user the group names and the command to add
   someone (`canvas access add <role> <email>`).

If `canvas validate` says groups are not provided, say so and stop: nothing was changed.

### Roles at the start, and a list that grows

An app with more than one role (admin and viewer, a page for Finance): when building it, ask once whether each role should be its
own managed group (`build-feature` does). A list of emails in `access` (`read`, `write`, a rule) that reaches **5 people**, a
request to add one more person to a list that already has 5 or more, or "people keep coming and going": say a managed group is
better — each change is a command, not an edit and a deploy — and offer to convert it, once, not on every message. Only when
`canvas validate` accepts `access.groups`.

### Convert a list of people to a managed group

Do it **role by role** (`read`, `write`, `deny`, each `rules.<name>`), in this order, so nobody loses access on the way:

1. **Sort the list.** Emails and people's names go into the group. An Entra group name stays in the list or moves to
   `use: [name]`; `canvas-<team>-owners` / `-members` stay as they are. Turn a name into an email with `canvas team members`.
2. **Add the group, keep the list.** `groups: {<role>: {managed: true}}` beside the existing list; `canvas validate`, `canvas deploy`.
   Both are let in now: the old list and the new, empty group (with you in it).
3. **Move the people.** `canvas access add <role> <email>` for each one. "has not signed in to Canvas yet" is not an error to
   work around: tell the user whom to ask to open the portal once, leave that person's email in the list, and add them later.
4. **Check.** `canvas access list` names everyone who was in the list.
5. **Drop the emails.** Delete the converted emails from the role's list (an emptied list is removed, never left as `[]`),
   `canvas deploy`. The Entra groups left in it still count.
6. **Say what changed:** from now on `canvas access add/remove`, no deploy; the group is `canvas-<team>--<app>--<role>`.

To go back: put the emails in the list, remove the role from `groups` and `canvas deploy --yes` (deletes the group).

## Machine callers — a service account

Something that is not a person — another app, an outside system, a script — cannot follow a sign-in
redirect. It gets a **service account** instead, and the app keeps `auth: sso`: a caller is never a
reason to turn sign-in off.

**Being called.** Whoever runs the caller makes the account in their team, and you list it in this
app's `access` like a person — with an `access` block, it reaches nothing until you do (an app with
none lets in anyone signed in, a service account included):

```yaml
    params:
      auth: sso
      access:
        read: ["Innovation and R&D", "orders-sync--growth@svc.<base>"]
```

`canvas sa create` prints the identity to add. `read` alone lets it change things too, as it does
for people; to keep it to GET, there must be a `write` list — and a `write` list takes changing
things away from everyone only in `read`, so name in it every person who still needs to. Adding
it to an existing list keeps the people already there; an `access.read` that names only the
service account shuts everyone else out.

**Calling another app.** Run in the CALLING app's folder; the credential goes straight into its
secret and is never shown:

```
canvas sa create orders-sync --secret ORDERS_API
```

Declare `ORDERS_API` like any secret (`add-secret`), and the other app's URL —
`https://<app>--<team>.<base>`, as its page in the portal shows it — as a plain variable,
`ORDERS_URL`; read both as *a secret* and *read a setting* say. Always that URL, never the app's in-cluster Service, which
the platform blocks for an `auth: sso` app:

```python
user, password = envs.secret("ORDERS_API").split(":", 1)
with http.client() as c:
    c.post(f"{envs.ORDERS_URL}/api/orders", auth=(user, password), json=order)
```
```ts
await call(`${setting("ORDERS_URL")}/api/orders`, {
  method: "POST",
  headers: { authorization: `Basic ${btoa(secret("ORDERS_API"))}`, "content-type": "application/json" },
  body: JSON.stringify(order),
});
```

**An outside system or a script:** `canvas sa create <name>` without `--secret` shows the password
once, for its owner to keep in that system's own secret store. It sends
`Authorization: Basic <username>:<password>` (`curl -u`). `canvas sa list` shows when each expires;
`canvas sa rotate <name>` makes a new password, and the old one stops within a minute. Rotating and
deleting are for whoever made the account, or an owner of the team.

**A third party's webhook** — GitHub, a SaaS — is not for Canvas: a sandbox has no public address.
Never open the app with `auth: none` for one; poll their API instead (`call-api`).

## What NOT to do

- **Do not implement OIDC in the app.** The platform does it; app-side auth drifts from it.
- **Do not list people in `ALLOWED_GROUPS`-style variables, or in the code.** `access`
  and its `rules` are the one place; the portal reads them.
- **Do not loosen the platform's access or rule checks to make them pass.** Failing closed is the intended behaviour.
- **Do not turn sign-in off so a script or another app can call in.** Give it a service account.
- **Do not print, log or commit a service account's password.** `--secret` keeps it out of sight.
- **Do not put `@require` above the route decorator.** `@router.get` (or post, put, …) comes first and `@require` below it, next to the function. Above, it protects nothing — the route is registered without it — and `canvas validate` refuses the app.
