---
name: use-files
audience: end-user
description: >-
  Use when a page needs someone else's code or model running in the browser — face or object detection, pose, OCR,
  a speech or vision model, a WebAssembly runtime (onnxruntime-web, TensorFlow.js, MediaPipe, face-api.js), a font or
  a library "from a CDN", "كشف الوجه", "نموذج في المتصفح" — or when a page's console says WebAssembly, a .wasm or a
  model was refused. Server-side models are `request-llm`; a Python library is a dependency, not this.
---

A file that runs in the visitor's browser and is not the app's own — a library's `.js`/`.mjs`, its `.wasm`, a model's
`.onnx`/`.tflite`/`.bin`/`.json` — lives in `src/static/vendor/`. It comes **only** from the team's Files:

```bash
canvas files list                 # what the team has
canvas files add face-api.js      # copies it into src/static/vendor/ and lists it in files.json
```

`canvas files add` writes `src/static/vendor/files.json` (each name with its sha256); `canvas validate` refuses a
file there that is not listed or does not match. So: never write, edit or download a file into `src/static/vendor/`
yourself, and never load one from a CDN — the page policy runs only the app's own files. A file the team does not
have yet: someone adds it to the team's Files (the portal's **Files** page, or `canvas files fetch <url>`), then
`canvas files add`.

What the page may do with them: run the script, compile WebAssembly (`'wasm-unsafe-eval'` is allowed), fetch the
model. Not `eval` or `new Function`: a library that needs them fails with a CSP error in the console — choose its
build that does not (most ship one).

## Loading them

`asset("vendor/<name>")` is the file's URL with `?v=<its hash>`: the browser keeps it a year and fetches it again
only when `canvas files add` changes it. Use it for every file the page names itself. A file the library fetches by
itself (a model's weights next to its manifest, a runtime's `.wasm`) goes by its plain URL, `/static/vendor/<name>`,
asked again on each load.

Python, in the page's template — the script and the URLs the page's own script needs, never an inline script:

```html
{% block head %}
<script src="{{ asset('vendor/face-api.js') }}" defer></script>
<script src="{{ asset('faces.js') }}" defer></script>
{% endblock %}
...
<video data-faces data-model="/static/vendor/tiny_face_detector_model.json" autoplay muted playsinline></video>
```

Next.js: `asset` from `@ajnkit/core` in a server component, the script through `next/script` (it carries the
request's nonce, which the policy needs); the code that uses it is a client component. The platform's route serves
`src/static/vendor/` at `/static/vendor/`.

```tsx
import Script from "next/script";
import { asset } from "@ajnkit/core";

<Script src={asset("vendor/face-api.js")} strategy="afterInteractive" />
```

A WebAssembly runtime is told where its `.wasm` is, and a model is loaded by URL — onnxruntime-web:

```js
ort.env.wasm.wasmPaths = "/static/vendor/";   // ort-wasm-simd-threaded.wasm, added with canvas files add
ort.env.wasm.numThreads = 1;                  // threads need cross-origin isolation, which the app does not have
const session = await ort.InferenceSession.create(document.querySelector("[data-model]").dataset.model);
```

## Worked example: faces in the camera, with face-api.js

The team's Files hold `face-api.js` (the `@vladmandic/face-api` build, `dist/face-api.js`) and the tiny face
detector's `tiny_face_detector_model.json` and `tiny_face_detector_model.bin`. Add all three:

```bash
canvas files add face-api.js
canvas files add tiny_face_detector_model.json
canvas files add tiny_face_detector_model.bin
```

The template above, then `src/static/faces.js`, the app's own:

```js
// Draws a box on each face the camera sees. face-api.js (vendored) sets window.faceapi.
document.addEventListener("DOMContentLoaded", async () => {
  const video = document.querySelector("[data-faces]");
  if (!video) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(video.dataset.model);   // the .json, then the .bin beside it
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  const canvas = faceapi.createCanvasFromMedia(video);
  video.after(canvas);
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const draw = async () => {
    const size = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, size);
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(await faceapi.detectAllFaces(video, options), size));
    requestAnimationFrame(draw);
  };
  video.addEventListener("playing", draw, { once: true });
});
```

The camera needs the page on https — deployed, or `localhost` on your computer. Nothing leaves the browser: the
model runs there, and no picture reaches the app unless its code sends one.

## When it does not load

| The console says | Cause |
|---|---|
| `Refused to load the script 'https://…'` | loaded from another site: `canvas files add` it, then `asset()` |
| `Refused to evaluate a string as JavaScript` (`unsafe-eval`) | the library calls `eval` or `new Function`: its other build |
| `Incorrect response MIME type. Expected 'application/wasm'` | the file is not in `src/static/vendor/`, or under another name than the runtime asks for |
| 404 on `/static/vendor/…` | not added, or the name differs from the one in the code: `canvas files list` |
