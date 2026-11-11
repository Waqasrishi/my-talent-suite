---
name: choose-frontend
audience: end-user
description: Use when an app has no pages yet and needs its first user interface (once, before
  its first page), or when the user asks for React, Next.js or a SPA. Every page after the first is
  `add-page`, not this.
---

> Adapted or ported app: AGENTS.md §1 first.

## Choosing

**Jinja, with HTMX, inside the platform's shell, drawn by the design system (`ajnkit-ui`) in the Expressive look**,
unless the person asks for another look. It behaves like a single-page app — the shell's `hx-boost` swaps each page
without a full reload — and stays one Python process. A React UI is the other stack, `canvas app create --stack next`,
chosen when the app is made, not added to this one; a separate SPA is not available. Say so plainly when asked, and
build it this way.

## Files

| | |
|---|---|
| `platform/shell.html` (in ajnkit-core) | the page shell: header, nav, footer, sign-out, theme button. **Never edit it** |
| `src/templates/base.html` | every page extends it; it names the look (`{% block look %}expressive{% endblock %}`). Add to `<head>` here |
| `src/templates/<page>.html` | a page: its `content` block only, built from the components |
| `src/nav.py` | the app's pages, in the header's order, one line each |
| `src/views.py` | the routes; `from ajnkit.web import templates` |
| `src/static/tw.css` | Tailwind source for classes of your own; `app.css` is generated from it |

## What to do

1. The first page: `add-page`. How to call each component: the `ajnkit-ui` skill. What makes a page good: its `design.md`.
2. Write the look in `NOTES.md` (Expressive unless asked).
3. After using a utility class no component uses: `tailwindcss -i src/static/tw.css -o src/static/app.css --minify`.
   The components' own styles ship with the kit.

## HTMX: three patterns, and the trap

| Want | Do |
|---|---|
| A part that keeps itself current | The partial's own root carries `hx-get` (its URL), `hx-trigger="every 15s"` and `hx-swap="outerHTML"`; the view returns that same partial. Each refresh replaces it, so the server picks the next interval from the state — `every 3s` while something is still moving |
| Other places that show the same state | Carry them in that refresh: `<span hx-swap-oob="innerHTML:[data-x='…']">`. A selector, not an id, when the same thing is drawn twice. Send only what the page has — an out-of-band swap with no target is an error |
| Load a part on a click | `hx-get` and `hx-target` on the link, its `href` the same page rendered whole — so it also works without JavaScript |

**`hx-swap` and `hx-target` are inherited.** A link inside a part that swaps `outerHTML` swaps `outerHTML` too, and
replaces its target instead of filling it. Set both on the link itself.

A part that changes in place sits in an element with `aria-live="polite"` (or returns a `ui.alert`), and a request that
can take over a second shows a `ui.spinner` while its button keeps its label.

## What NOT to do

- No header, footer, nav or user menu in a page — the shell has them. Top bar, sidebar or the app's own: the frame
  (`{% block frame %}` in `base.html`; the `ajnkit-ui` skill, "The frame").
- No bundler, no second CSS framework, no script from a CDN.
