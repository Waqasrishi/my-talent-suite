---
name: request-llm
audience: end-user
description: >-
  Use when the app should call an LLM: "use Gemini", "add AI", "summarise this with a
  model", "read it aloud", "text to speech", "a voice", or speech to text — "transcribe", a recording,
  a voice note, an interview — or when the user wants to try a model from their own computer. A chat window is `add-chat`; search by meaning is `add-rag`; searching
  the web or reading a web page is `search-web`.
---

Code: `ajnkit-llm`.

## Files

| | |
|---|---|
| the Stack table's *read a setting* (AGENTS.md) | `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `PLATFORM_LLM_MODELS` — read there, nowhere else |
| `score.yaml` | the `llm` resource, for the deployed app |

## Two keys, for two things

| | Your key | The app's key |
|---|---|---|
| For | trying models and building, on your own computer | the deployed app |
| Made by | `canvas llm init` — one per person, shown once, kept in the keychain | the platform, when the app declares `llm` |
| Spend | your own limit — $50 a month unless an admin changed it | the app's own, inside the team's monthly budget |

A deployed app must never run on a person's key: it would stop the day they leave the team, and
its spend would mix with theirs.

## What to do

For the deployed app:

1. Declare it in `score.yaml`:
   ```yaml
   resources:
     ai:
       type: llm
       params: {models: [gemini-flash-lite]}   # optional — which of the app's models; leave it out for all of them. `rpm` caps requests a minute
   ```
   The platform sets `OPENAI_BASE_URL`, `OPENAI_API_KEY` and `PLATFORM_LLM_MODELS`; the app reads all
   three as *read a setting* says. Do not add them to `variables`.
2. Python or adapted app: `canvas app add llm` once. Call `client()` (`ajnkit-llm`).
3. `canvas validate`, then `canvas deploy` — the first deploy makes the app's key

On your own computer, to try it before deploying:

1. `canvas llm init` once (skip if `canvas llm keys` shows one)
2. `eval "$(canvas llm env)"` — sets `OPENAI_BASE_URL` and `OPENAI_API_KEY`

Models — the portal shows what each app and each person has spent:

| | |
|---|---|
| Chat | `gemini-flash-lite` (fastest and cheapest — default to it), `gemini-flash`, `gemini-pro` — a bigger one only when the user asks. **`qwen-flash`** when the text is secure or confidential: the company's own model, the prompt does not leave the company; thinking is off, so it answers short and fast (`reasoning_effort` `low`, `medium` or `xhigh` turns it on, and then `max_tokens` needs room) |
| Speech | `gemini-flash-lite-tts` (default to it, about 1¢ a minute of audio), `gemini-flash-tts` (more expressive, and Egyptian Arabic as well as Standard; about 1.7¢) |
| Embeddings | `gemini-embedding` — text to 768 numbers, for search by meaning; `add-rag` has the rest. **`qwen-embedding`** for secure documents: 2560 numbers, a different column (`add-rag`) |
| Decisions | **`d3-decision`** — `decide()` from `ajnkit.llm` / `@ajnkit/llm`: the company's own decision model. Which option, how high on a scale, yes or no about a text, as probabilities, never text — "should this be flagged", "which desk", "how urgent", "is this sensitive". One call answers every question about a text. Secure text may use it |
| Speech to text | **`whisper`** — `transcribe()` from `ajnkit.llm` / `@ajnkit/llm`: the company's own Whisper turns a recording into text; the audio stays inside the company, so secure recordings may use it. **Always pass `language`** (`ar`, `en`): it guessed English for an Arabic recording. A large file is split for you |
| Rerank | **`qwen-rerank`** — `rerank()` from `ajnkit.llm` / `@ajnkit/llm` puts what a search found in order of how well it answers |

**Secure documents:** use the company's own models — `qwen-*`, `d3-decision`, `whisper` — and say so in `score.yaml`, so nothing else can be called:

```yaml
resources:
  ai:
    type: llm
    params: {classification: restricted}     # `internal` is the default: every model
```

A `restricted` app's key, and `PLATFORM_LLM_MODELS`, hold the company's own models only; `canvas validate` and the deploy refuse any other in
`models`. Ask the user which it is when the app handles documents and they have not said. A team an admin classified `restricted` makes
all its apps restricted: an app may be stricter than its team, never looser.

A person's model — Claude, `qwen-coder`, gpt-oss (`peopleOnly` in the contract) — is off the app's key until an admin approves it for that app. When the user wants one:

1. Name it in `models` (`params: {models: [claude-sonnet]}`) — `canvas validate` accepts it — then `canvas deploy`. The deploy says `<model>: waiting for an admin`, and the app keeps its default models until then. Or the owner clicks **Request a model** on the app's Resources tab in the portal and says why.
2. A platform admin approves it; the owner hears in the bell. `canvas models show` says where each stands. Once approved, name it in `models` and deploy again.
3. **Not for a `restricted` app** (or a restricted team's): it may call only the company's own models, and no approval changes that. `canvas validate` refuses the name when `score.yaml` says `restricted`; for a restricted team the deploy refuses it. Say so, and offer a `qwen-*` model, or ask the user whether the app really is restricted.

Leaving `models` out gives the app every model it may call now, not these.

## Speech

The same SDK and key, on `audio.speech`:

```python
client().audio.speech.create(model="gemini-flash-lite-tts", voice="Kore", input=text).write_to_file(path)
```
```ts
const speech = await client().audio.speech.create({ model: "gemini-flash-lite-tts", voice: "Kore", input: text });
await writeFile(path, Buffer.from(await speech.arrayBuffer()));
```

- WAV only, Gemini voices, the language read from the text (`ajnkit-llm`). About 8,000 tokens of
  text a call: split a long article by paragraph.
- Audio worth keeping goes on a `volume` (`request-volume`), not in the database.

## What NOT to do

- Do not put a key in `score.yaml`, a file, or `variables` — it is the user's, and lives in their keychain.
- Do not send the model what the person asking could not open themselves: rows, documents and names
  leave for the model's provider. Scope first, then send. Never log a prompt that holds personal data.
- Do not pick the most expensive model by reflex; it spends the team's budget on nothing.
- Do not send a model the wrong kind of request: when picking from `PLATFORM_LLM_MODELS`, the
  `-tts` names speak, `*-embedding` embeds, `qwen-rerank` reranks, `d3-decision` decides (`decide()`, not chat), `whisper` transcribes (`transcribe()`, not chat), and the others chat.
- A lost key cannot be shown again, and the user cannot revoke their own: an admin does, on the
  portal's AI keys page, then `canvas llm init` makes a new one. An app's key that an admin revoked
  is replaced by the app's next `canvas deploy`.
