---
name: add-page
audience: end-user
description: Use when the user wants a new page or screen — "add a page", "a settings page", "a
  dashboard", "a page for …", "another tab in the menu" — and for the page step of every
  `build-feature`. Adds the route, the page from the design system's components, and its line in the header.
---

How each component is called: the `ajnkit-ui` skill (its everyday components cover most pages). What makes a page
good: its `design.md`.

> **An adapted app** (`.canvas/adapted`) keeps its own layout and conventions: follow the app's own (AGENTS.md §1).
> **A ported app** (`.canvas/ported`, or `.canvas/legacy/`) keeps the old app's look unless the user asks (AGENTS.md §1).
> **An app without `ajnkit-ui`** in `pyproject.toml`: `add-ui` first.

## Page design rules

- **One page first.** Put the job on one page — sections, tabs, a sheet or a dialog, parts that update in place — and
  add a second page only when the app has separate jobs or audiences, a list with a deep detail, or a flow too long
  for one screen. Before adding a page, say why the existing one cannot hold it.
- **Say it once.** Only the kit's parts, templates and tokens; markup used three times becomes a macro in `src/templates/`; a style or a
  copy of a kit part is a bug.
- **Make it look chosen.** The first screen shows the point: one leading element, real content (not lorem), every
  state drawn (`design.md`). Look at it on phone and desktop before showing it, and fix what looks off
  (`verify-change` says how).
- **Reachable by everyone.** Every control works by keyboard in a sensible order with a visible focus, and the
  kit's colours keep their contrast: never a colour of your own, never information carried by colour alone.
- **Say what will happen.** A button names its action ("Save order", not "Submit"); an error says what went wrong
  and what to do next; a delete or other loss asks first and names what goes (`ui.dialog`).
- **Arabic and English.** In a bilingual app the page reads right to left and left to right with the same layout:
  logical spacing, no text in an image, numbers as the person's language shows them (`arabic`).

## What to do

1. **Start from a template** when one does the page's job: the kit's `page/` group has dashboards, lists, settings,
   sign-in, search results. Use its body only, never its own shell, sidebar or top bar.
2. **The route** in `src/views.py`: its data from the feature's function in `src/api.py`, called in the same process, never `/api` over HTTP; `src/lib/` directly only when the API would complicate it (`build-feature`). Outcomes go
   to the page as `done` / `error`.
3. **The page**, `src/templates/<page>.html`:

   ```jinja
   {% extends "base.html" %}
   {% block title %}Orders · {{ about().title }}{% endblock %}
   {% block content %}
   {% call ui.stack(gap="6") %}
     {% set actions %}{% call ui.button(variant="primary", icon="plus", href="/orders/new") %}New order{% endcall %}{% endset %}
     {{ ui.page_header(title="Orders", lead="Everything placed this week.", actions=actions) }}
     {% if done %}{{ ui.alert(tone="success", text=done) }}{% endif %}
     {% if orders %}
       {% call ui.table(caption="Orders") %}
         <thead>{% call ui.table_row(plain=true) %}{% call ui.table_th() %}Order{% endcall %}{% call ui.table_th() %}By{% endcall %}{% endcall %}</thead>
         <tbody>{% for o in orders %}{% call ui.table_row() %}{{ ui.table_td(main=o.title, sub="#" ~ o.id) }}{% call ui.table_td() %}{{ o.by }}{% endcall %}{% endcall %}{% endfor %}</tbody>
       {% endcall %}
     {% else %}
       {{ ui.empty(title="No orders yet", text="The first one appears here.", action="New order", action_href="/orders/new", action_variant="primary") }}
     {% endif %}
   {% endcall %}
   {% endblock %}
   ```

   A page that needs the whole screen (a workspace, an editor, side-by-side panes) adds
   `{% block width %}wide{% endblock %}`; pages for reading keep the default. Never widen it yourself.
4. **The header**: one line in `src/nav.py`, `("Label", "/path")`, or `("Label", "/path", "rule")` for a page only
   that rule may open (add-auth). A page inside another (an order's detail) gets no line: `ui.breadcrumb` in its
   `page_header`'s `crumbs`. More than five or six top-level pages: ask whether some belong inside others.
5. **Check it** (`design.md`, "Before it ships"): empty, loading and error states, light and dark, phone and
   desktop, Arabic.
6. **A test**: the page answers 200 and shows its title (`tests/`). `uv run pytest`, `canvas validate`, then ship
   it as `build-feature` says.

## A list with search, filters and pages

Everything that shapes the list is in the query string, so a link — or Back — gives the same view:

```python
@router.get("/orders", response_class=HTMLResponse)
def orders(request: Request, db: Annotated[Session, Depends(session)], q: str = "", page: int = Query(1, ge=1)):
    rows, pages = api.find_orders(db, q, page)                # in lib: .where(Order.title.ilike(f"%{q}%")) if q,
    return templates.TemplateResponse(request, "orders.html",  # .limit(PER_PAGE).offset((page - 1) * PER_PAGE)
                                      {"orders": rows, "q": q, "page": page, "pages": pages})
```

The search is `ui.search(id="find", name="q", value=q, label="Search orders", action="/orders", attrs={"hx-get":
"/orders", "hx-trigger": "input delay:300ms, search", "hx-target": "#results", "hx-select": "#results", "hx-swap":
"outerHTML", "hx-push-url": "true"})` — it is a form itself, never inside another. The table and `ui.pagination` sit in
`<div id="results" aria-live="polite">`; the page renders whole, htmx swaps only `#results`, and without JavaScript the
search still works. `ILIKE` is enough for a few thousand rows — a bound parameter, never formatted into the SQL; past
that, full-text search (`request-database`; Arabic: `arabic`). Twenty-five a page.

## What NOT to do

- No page that does not extend `base.html`: it would lose the header, Sign out, the footer and the look.
- No menu or sidebar of your own in a page: the pages are `src/nav.py`, and a sidebar is the frame
  (`{% block frame %}side{% endblock %}` in `base.html`; the `ajnkit-ui` skill, "The frame").
- No chat page of your own (bubbles, a message box): a chat is the platform's chat component (`add-chat`).
