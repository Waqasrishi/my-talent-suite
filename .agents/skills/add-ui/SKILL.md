---
name: add-ui
audience: end-user
description: Use when a page's look or the design system itself is the question — "change the look", "make it Minimal",
  "make it impressive", "a dark mode", "restyle this page", "the UI kit is missing", an app made before the design system
  shipped in every app, or the same in Arabic ("نظام التصميم", "الواجهة", "ثيم") — or when you reach for Bootstrap,
  Material UI, Chakra, Ant or a hand-built modal, table or tabs.
---

Every new app is drawn by the design system, `ajnkit-ui`, in the **Expressive** look. How to use it is the `ajnkit-ui`
skill; this one is only for adding it or changing the look.

1. **An app without it** (no `ajnkit-ui` in `pyproject.toml`): `canvas app add ui`, then in `src/app.py`
   `install(templates.env)` (`from ajnkit.ui import install`, `from ajnkit.web import templates`). A Next.js app has it.
2. **Another look**: `{% block look %}minimal{% endblock %}` (or `lumen`, `aj`) in `src/templates/base.html`; Next.js
   `<Shell look="…">`. The `ajnkit-ui` skill's `looks.md` says which look is for what. Write the choice in `NOTES.md`.
3. **A colour of the app's own**: `python -m ajnkit.ui.brand "#hex"` (writes `src/brand.yaml`), never a stylesheet
   over the kit's classes (`looks.md`).
4. **A UI library** (Bootstrap, Material, a hand-built modal or tabs): no. The kit has the part; search its index
   (`ajnkit-ui`, §1).
5. **An app with a look of its own moving to a kit look** (its own CSS, an adapted or ported app — "use Expressive",
   "the default style"): the block in step 2 changes only what the kit draws, so the app's own cards, grids and spacing
   stay as they were, now beside the kit's, and fall out of line. Page by page, swap them for the kit's components
   (`ajnkit-ui`'s `porting.md`, *Map the controls*) and delete the CSS they leave unused. Then run `ajnkit-ui`'s
   `audit.md` on every page you changed, and open each screenshot: a page is not done until you have.
