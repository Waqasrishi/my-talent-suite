#!/usr/bin/env node
// A stand-in for SAP Gateway: the OData V2 service ZAJMN_GOALS_SRV exactly as ecc/02 defines it, in memory.
// It lets you run the Fiori app (../app/webapp) without ECC, and it is strict on purpose: a property name or type
// that is not in the contract is refused with 400, so the page and the ABAP service can be checked against one definition.
//
//   node developer/mock-gateway.mjs            then open http://localhost:8094/
//   MOCK_AI=1 node developer/mock-gateway.mjs  canned AI answers through AiRequests (option B), to try the AI screens
//   PORT=9000 ...                              another port
//
// Data lives in memory: a restart empties it. No sign-in: everyone is allowed everything (the ABAP checks who may do what).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT || 8094);
const WEBAPP = join(import.meta.dirname, "..", "app", "webapp");
const BASE = "/sap/opu/odata/sap/ZAJMN_GOALS_SRV";
const CSRF = "mock-" + Math.random().toString(36).slice(2);

// ---- the contract (ecc/02): property -> Edm type --------------------------------------------------------------
const T = { s: "string", i: "int", b: "bool" };
const GOAL = { GoalId: T.s, Pernr: T.s, Title: T.s, Description: T.s, Measure: T.s, DueText: T.s, Weight: T.i, Progress: T.i, Status: T.s,
  StatusText: T.s, ParentTitle: T.s, PushedFromGoal: T.s, PushedFromPernr: T.s, Extra: T.s };
const ACT = { GoalId: T.s, ActId: T.s, Progress: T.i, Note: T.s, HasNote: T.b, DoneText: T.s, Position: T.i, Files: T.s };
const PUSH = { GoalId: T.s, ToPernr: T.s, Progress: T.i, Note: T.s, DueText: T.s, UpdatedText: T.s, Position: T.i };
const CONTR = { GoalId: T.s, Position: T.i, Pernr: T.s, Data: T.s };
const LOG = { GoalId: T.s, Position: T.i, ActorPernr: T.s, Action: T.s, Text: T.s, DateText: T.s, Detail: T.s, OccurredAt: T.s };
const AIREQ = { LogId: T.s, Task: T.s, Pernr: T.s, Context: T.s, Answer: T.s };
const MAX = { Pernr: 8, ToPernr: 8, ActorPernr: 8, PushedFromPernr: 8, GoalId: 10, ActId: 10, PushedFromGoal: 10, Title: 255, ParentTitle: 255,
  DueText: 40, DoneText: 40, UpdatedText: 40, DateText: 40, Status: 3, StatusText: 40, Note: Infinity, Action: 40, Task: 20 };

class Bad extends Error { constructor(m) { super(m); this.status = 400; } }
function check(entity, row, where, extraOk = []) {
  if (!row || typeof row !== "object") throw new Bad(`${where}: not an object`);
  for (const [k, v] of Object.entries(row)) {
    if (extraOk.includes(k) || k === "__metadata") continue;
    const t = entity[k];
    if (!t) throw new Bad(`${where}: property ${k} is not in the service`);
    if (v === null || v === undefined) throw new Bad(`${where}: ${k} is null (send "" or a number)`);
    if (t === T.s && typeof v !== "string") throw new Bad(`${where}: ${k} must be Edm.String, got ${typeof v}`);
    if (t === T.i && (typeof v !== "number" || !Number.isInteger(v) || v < -32768 || v > 32767)) throw new Bad(`${where}: ${k} must be Edm.Int16, got ${JSON.stringify(v)}`);
    if (t === T.b && typeof v !== "boolean") throw new Bad(`${where}: ${k} must be Edm.Boolean, got ${typeof v}`);
    if (t === T.s && k in MAX && k !== "Note" && v.length > MAX[k]) throw new Bad(`${where}: ${k} is longer than ${MAX[k]}`);
  }
  if (where.startsWith("Goal") && Number.isNaN(Number(row.GoalId))) throw new Bad(`${where}: GoalId must be a number`);
}

// ---- the tables (ecc/01), in memory -------------------------------------------------------------------------------
const db = { goals: new Map(), acts: new Map(), pushes: new Map(), contr: new Map(), log: [], att: new Map(), ailog: [] };
let nextId = 1001, nextLog = 1, nextAtt = 1, nextAi = 1;
const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

function goalOut(g, expand) {
  const out = { __metadata: { type: "ZAJMN_GOALS_SRV.Goal" }, ...g.row };
  if (expand.includes("Activities")) out.Activities = { results: (db.acts.get(g.id) || []).slice().sort((a, b) => a.Position - b.Position) };
  if (expand.includes("Pushes")) out.Pushes = { results: (db.pushes.get(g.id) || []).slice().sort((a, b) => a.Position - b.Position) };
  if (expand.includes("Contributors")) out.Contributors = { results: (db.contr.get(g.id) || []).slice().sort((a, b) => a.Position - b.Position) };
  if (expand.includes("Log")) out.Log = { results: db.log.filter((l) => l.GoalId === g.row.GoalId).sort((a, b) => b._at - a._at || b._id - a._id)
    .map((l, i) => ({ GoalId: l.GoalId, Position: i, ActorPernr: l.ActorPernr, Action: l.Action, Text: l.Text, DateText: l.DateText, Detail: l.Detail, OccurredAt: l.OccurredAt })) };
  return out;
}

function saveGoal(b) {
  check(GOAL, b, "Goal", ["Activities", "Pushes", "Contributors", "Log"]);
  for (const k of ["GoalId", "Pernr"]) if (!b[k]) throw new Bad(`Goal: ${k} is empty`);
  const id = String(Number(b.GoalId));
  const old = db.goals.get(id);
  if (old?.deleted) return;   // a deleted goal stays deleted (ABAP: same)
  const row = {};
  for (const k of Object.keys(GOAL)) row[k] = b[k] ?? (GOAL[k] === T.i ? 0 : "");
  row.GoalId = id;
  if (row.Weight < 0 || row.Weight > 100) row.Weight = -1;
  db.goals.set(id, { id, row, deleted: false });
  const kids = (name, entity) => (b[name] === undefined ? [] : Array.isArray(b[name]) ? b[name] : b[name].results || []).map((r, i) => { check(entity, r, `${name}[${i}]`); return r; });
  db.acts.set(id, kids("Activities", ACT).map((r) => ({ ...r, GoalId: id })));
  const seen = new Set();
  db.pushes.set(id, kids("Pushes", PUSH).filter((r) => r.ToPernr && !seen.has(r.ToPernr) && seen.add(r.ToPernr)).map((r) => ({ ...r, GoalId: id })));
  db.contr.set(id, kids("Contributors", CONTR).map((r) => { JSON.parse(r.Data); return { ...r, GoalId: id }; }));
  const have = new Set(db.log.filter((l) => l.GoalId === id).map((l) => l.OccurredAt + "\n" + l.Text));
  for (const l of kids("Log", LOG)) {
    if (have.has(l.OccurredAt + "\n" + l.Text)) continue;
    have.add(l.OccurredAt + "\n" + l.Text);
    db.log.push({ ...l, GoalId: id, _id: nextLog++, _at: Date.parse(l.OccurredAt) || Date.now() });
  }
  for (const a of db.acts.get(id)) for (const f of JSON.parse(a.Files || "[]")) if (db.att.has(String(f.id))) db.att.get(String(f.id)).goal = id;
}

// OData URL literal: 'text' with '' for a quote
const lit = (q, name) => { const v = q.get(name); if (v == null) return ""; const m = v.match(/^'(.*)'$/s); return (m ? m[1] : v).replace(/''/g, "'"); };

// ---- canned AI answers (MOCK_AI=1), the same shapes as the company model gives through ZCL_ZAJMN_AI -----------------
function mockAi(task, c) {
  if (task === "translate") return { text: c.to === "en" ? "[EN] " + c.text : "[AR] " + c.text };
  if (task === "review") return { ready: false, checks: [{ ok: true, text: "Measurable: it has a number." }, { ok: false, text: "The due date is missing.", fix: { field: "due", value: "31 December 2027" } }], better: "" };
  if (task === "comment") return { options: [{ text: "Please add a number to the measure." }, { text: "Please link it to a goal above." }, { text: "Please add a due date." }] };
  if (task === "measures") return { options: [{ text: "Share of stories with video: from 30% to 50% by 31 December 2027", why: "Shows the change directly" }] };
  return { options: [{ text: "Raise the share of stories with video from 30% to 50%", why: "Supports the goal above" }, { text: "Cut the time to publish breaking news to 5 minutes", why: "Speed" }] };
}

// ---- HTTP --------------------------------------------------------------------------------------------------------
const send = (res, code, body, headers = {}) => {
  const json = body === undefined ? undefined : JSON.stringify(body);
  res.writeHead(code, { ...(json ? { "Content-Type": "application/json; charset=utf-8" } : {}), ...headers });
  res.end(json);
};
const readBody = (req) => new Promise((ok, no) => { const c = []; req.on("data", (d) => c.push(d)); req.on("end", () => ok(Buffer.concat(c))); req.on("error", no); });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".ttf": "font/ttf", ".properties": "text/plain", ".xml": "application/xml" };

const INDEX = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Goals 2027 (mock Gateway)</title><style>html,body{margin:0;height:100%;background:#fff}</style>
<script>window.AJMN_CONFIG = { serviceUrl: "${BASE}", aiOnEcc: ${process.env.MOCK_AI ? "true" : "false"} };</script>
<script id="sap-ui-bootstrap" src="https://ui5.sap.com/1.144.1/resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"
 data-sap-ui-resourceroots='{"zajmn.hr.goals.hk": "./webapp/"}' data-sap-ui-async="true" data-sap-ui-compat-version="edge" data-sap-ui-xx-component-preload="off"></script>
<script>sap.ui.getCore().attachInit(function(){sap.ui.require(["sap/ui/core/ComponentContainer"],function(C){new C({name:"zajmn.hr.goals.hk",async:true,height:"100%"}).placeAt("content")})})</script>
</head><body class="sapUiBody"><div id="content" style="height:100%"></div></body></html>`;

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x"), p = decodeURIComponent(url.pathname), q = url.searchParams;
  try {
    if (p === "/" || p === "/index.html") { res.writeHead(200, { "Content-Type": "text/html" }); res.end(INDEX); return; }
    if (p.startsWith("/webapp/")) {
      const f = normalize(join(WEBAPP, p.slice("/webapp/".length)));
      if (!f.startsWith(WEBAPP)) { send(res, 403); return; }
      const body = await readFile(f).catch(() => null);
      if (!body) { send(res, 404); return; }
      res.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream", "Cache-Control": "no-cache" }); res.end(body); return;
    }
    if (!p.startsWith(BASE)) { send(res, 404); return; }
    const path = p.slice(BASE.length) || "/";
    if (req.method !== "GET" && req.headers["x-csrf-token"] !== CSRF) { send(res, 403, { error: { message: { value: "CSRF token validation failed" } } }, { "x-csrf-token": "Required" }); return; }
    const done = (code, body) => { console.log(`${req.method} ${path}${url.search} ${code}`); send(res, code, body, req.headers["x-csrf-token"] === "Fetch" ? { "x-csrf-token": CSRF } : {}); };

    if (req.method === "GET" && path === "/") { done(200, { d: { EntitySets: ["Goals", "Activities", "Pushes", "Contributors", "LogEntries", "WorkflowLog", "Attachments", "AiRequests"] } }); return; }
    if (req.method === "GET" && path === "/Goals") {
      const expand = (q.get("$expand") || "").split(",").map((s) => s.trim());
      done(200, { d: { results: [...db.goals.values()].filter((g) => !g.deleted).sort((a, b) => b.id - a.id).map((g) => goalOut(g, expand)) } }); return;
    }
    const one = path.match(/^\/Goals\('(\d+)'\)$/);
    if (req.method === "GET" && one) { const g = db.goals.get(String(Number(one[1]))); if (!g || g.deleted) { done(404, { error: { message: { value: "Resource not found" } } }); return; } done(200, { d: goalOut(g, []) }); return; }
    if (req.method === "POST" && path === "/Goals") { const b = JSON.parse((await readBody(req)).toString("utf8")); saveGoal(b); done(201, { d: b }); return; }
    if (req.method === "GET" && path === "/GetIds") {
      const n = Math.max(1, Math.min(200, Number(q.get("count")) || 100));
      done(200, { d: { results: Array.from({ length: n }, () => ({ __metadata: { type: "ZAJMN_GOALS_SRV.IdItem" }, Id: String(nextId++) })) } }); return;
    }
    if (req.method === "POST" && path === "/DeleteGoal") {
      const id = String(Number(lit(q, "GoalId"))), why = lit(q, "Reason"), g = db.goals.get(id);
      if (why.length > 255) throw new Bad("DeleteGoal: Reason is longer than 255");
      if (g && !g.deleted) { g.deleted = true; db.log.push({ GoalId: id, ActorPernr: "", Action: "goal_deleted", Text: why || "Goal deleted", DateText: "", Detail: "{}", OccurredAt: nowIso(), _id: nextLog++, _at: Date.now() }); }
      done(204); return;
    }
    if (req.method === "GET" && path === "/WorkflowLog") {
      const top = Number(q.get("$top")) || 400;
      done(200, { d: { results: db.log.slice().sort((a, b) => b._at - a._at || b._id - a._id).slice(0, top).map((l) => ({ LogId: String(l._id), GoalId: l.GoalId,
        GoalTitle: db.goals.get(l.GoalId)?.row.Title || "", ActorPernr: l.ActorPernr, ActorName: "", Action: l.Action, Text: l.Text, OccurredAt: l.OccurredAt })) } }); return;
    }
    if (req.method === "POST" && path === "/Attachments") {
      const bytes = await readBody(req), id = String(nextAtt++), name = decodeURIComponent(req.headers.slug || "file");
      if (bytes.length > 10485760) throw new Bad("That file is over 10 MB");
      db.att.set(id, { bytes, name, type: req.headers["content-type"] || "application/octet-stream", goal: "" });
      done(201, { d: { AttId: id, FileName: name, FileSize: bytes.length, MimeType: db.att.get(id).type } }); return;
    }
    const av = path.match(/^\/Attachments\('(\d+)'\)\/\$value$/);
    if (req.method === "GET" && av) {
      const a = db.att.get(String(Number(av[1]))); if (!a) { done(404); return; }
      res.writeHead(200, { "Content-Type": a.type, "Content-Disposition": `attachment; filename="${encodeURIComponent(a.name)}"` }); res.end(a.bytes); return;
    }
    if (req.method === "POST" && path === "/AiRequests") {
      const b = JSON.parse((await readBody(req)).toString("utf8")); check(AIREQ, b, "AiRequest");
      const ctx = JSON.parse(b.Context || "{}"), id = String(nextAi++);
      const answer = process.env.MOCK_AI ? mockAi(b.Task, ctx) : { error: "AI is not connected" };
      db.ailog.push({ id, task: b.Task, request: b.Context, response: answer, accepted: "" });
      done(201, { d: { LogId: id, Task: b.Task, Pernr: b.Pernr, Context: "", Answer: JSON.stringify(answer) } }); return;
    }
    if (req.method === "POST" && path === "/AcceptAI") { const row = db.ailog.find((r) => r.id === lit(q, "LogId")); if (row) row.accepted = lit(q, "Text"); done(204); return; }
    done(404, { error: { message: { value: `No such resource: ${req.method} ${path}` } } });
  } catch (e) {
    console.log(`${req.method} ${p} ${e.status || 500} ${e.message}`);
    send(res, e.status || 500, { error: { message: { value: e.message } } });
  }
}).listen(PORT, () => console.log(`mock ZAJMN_GOALS_SRV on http://localhost:${PORT}/  (AI ${process.env.MOCK_AI ? "canned" : "off"})`));
