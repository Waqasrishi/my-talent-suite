---
name: add-aj
audience: end-user
description: >-
  Use when the user wants Al Jazeera's own vendored brand templates (`ajnkit-aj`) — its dashboard,
  AJ assistant chat, gallery or calendar pages — in a Python app. Just the AJ look or colours on the normal components
  ("AJ style", "make it look like Al Jazeera", "ستايل الجزيرة") is not this: that is `{% block look %}aj{% endblock %}` (add-ui).
---

Code: `ajnkit-aj` (Python, `from ajnkit.aj import install, STATIC_DIR, TEMPLATES_DIR`). Its reference skill,
`ajnkit-aj`, is the how. Vendored from the sandbox UI base reference app.

## Choosing

| The need | Use |
|---|---|
| the AJ look on the existing design system's components (`ajnkit-ui`'s 580 Jinja + React components) | `add-ui`, then `{% block look %}aj{% endblock %}` |
| a page built from the AJ brand's own templates — the dashboard, the AJ assistant chat, the gallery, cards, forms, charts | **this skill**: `canvas app add aj` |
| a look of the app's own, a brand not Al Jazeera's | neither: the app's own Tailwind classes on the platform's colours |

## Steps

1. **Run `canvas app add aj`.** It drops `ajnkit_aj-<version>-py3-none-any.whl` into `packages/`, pins it in
   `pyproject.toml`'s `[tool.uv.sources]` and `uv.lock`, and copies the `ajnkit-aj` reference skill into
   `.agents/skills/`.
2. **Install it in `src/app.py`:**
   ```python
   from ajnkit.aj import install as install_aj, STATIC_DIR as AJ_STATIC
   from ajnkit.web import templates
   from fastapi.staticfiles import StaticFiles

   install_aj(templates.env)                           # the aj/ templates become findable
   app.mount("/aj", StaticFiles(directory=AJ_STATIC), name="aj_static")
   ```
   Every page of the reference app is then live at `/aj/preview/index.html` — show it to the person to
   pick the pages they want.
3. **Extend the templates:** in a page, `{% extends "base.html" %}` or any of the brand pages listed in the
   reference skill (`dashboard.html`, `cards.html`, `aj-assistant.html`, `charts.html`, `tables.html`,
   `forms.html`, `calendar.html`, `gallery.html`, `typography.html`, etc.).
4. **Check it:** `uv run python run.py` and look at the page in English and Arabic, light and dark.

Read the `ajnkit-aj` reference skill (shipped with the package) for the template map, the components it
exposes, and the follow-up on `url_for` rewrites inside vendored templates.
