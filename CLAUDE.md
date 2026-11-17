# talent-suite

This folder is the AJMN Talent Suite sandbox prototype: one static page, index.html, with synthetic data.
Deploy it to Canvas (canvas.ajnai.net) as a static site named `talent-suite` in team `erp`.
Keep index.html exactly as it is. The Goals module keeps its goals, activities, pushes and contributors in the app's own Canvas Postgres (the owner approved this on 17 Nov 2026): db/migrations/*.sql, db.mjs, api.mjs, and the /api/* routes server.mjs hands to it (state, ids, employees, goals, reset). Add no other backend piece without asking. The older POST /api/translate (Arabic and English translation of goals through the platform's `llm` resource) is switched off.

<!-- canvas -->
@AGENTS.md
