---
name: add-api-endpoint
audience: end-user
description: Use for the API step of every feature (`build-feature`), or when the user asks for an
  endpoint, a JSON route, or "an API for…".
---

## Files

| | |
|---|---|
| `src/lib/<feature>.py` | the logic the endpoint runs — write it first |
| `src/api.py` | the endpoint: Pydantic models in and out, a docstring, a status code for each failure |
| `src/app.py` | nothing — the router is already mounted at `/api` |
| `tests/` | the endpoint through `TestClient`: success, and each refusal |
| `/api/docs` | generated from the models and docstrings — check it reads right |

## Choosing

Every feature has an endpoint, even when a page is all that was asked for: the page in `views.py`
calls this function, and this function calls `lib/`, so they cannot disagree.

| Who calls it | Today |
|---|---|
| this app's pages | a view calls this function, in the same process: `api.list_notes(db)`, never over HTTP. A rule goes on the function (`@require`). If that would complicate the page, it calls `lib/`, with `# direct: why` (`build-feature`) |
| a person's browser, or the Swagger page | works; with `auth: sso` they are signed in, and `ajnkit.identity` says who |
| a script, another app, an internal system | with `auth: sso`, as a **service account** — `canvas sa create`, then listed in `access` like a person (`add-auth`, "Machine callers"). Never open the app with `auth: none` for it |

```python
# src/api.py — `from typing import Annotated`, `from ajnkit.db import session`, `from src.lib import notes`
class NoteIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)

class NoteOut(BaseModel):
    id: int
    text: str

@router.post("/notes", response_model=NoteOut, status_code=201)
def add_note(body: NoteIn, db: Annotated[Session, Depends(session)]) -> NoteOut:   # Annotated, as FastAPI asks
    """Keep a note."""
    return notes.add(db, body.text)          # src/lib/notes.py does the work
```

A route that returns a file (a document, an export, a report) answers with `ajnkit.download`, never a bare
`Response(bytes)`: without it the browser shows the file's insides instead of saving it.

```python
from ajnkit.download import download
return download(doc.data, doc.filename)          # bytes, a Path, or an iterator of bytes; the type comes from the name
```

## What to do

1. The `lib/` function, if it is not there yet
2. Request and response models, then the handler — thin: validate, call `lib/`, return
3. A test per outcome; `uv run pytest`
4. Open `/api/docs` locally (`local-run`) and check the endpoint is described as intended

## What NOT to do

- Do not put logic in the handler. It belongs in `lib/`; the view calls the handler.
- Do not return a file as a bare `Response`, `HTMLResponse` or decoded text — `download(...)`.
- Do not return bare dicts — a response model is what documents it and keeps it stable.
- Do not add a second listening port. One container, one port.
- Do not leave an endpoint open that returns data without saying so: `/api/docs` advertises it to
  everyone who can reach the app, "Try it out" included.
