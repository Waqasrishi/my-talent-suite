// The goals API: /api/state, /api/ids, /api/employees, /api/goals/:id, /api/reset. Every goal and activity has its
// own id (one Postgres sequence) and the employee it belongs to. The page keeps working in memory if this is down.
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { db } from "./db.mjs";
import * as ai from "./ai.mjs";

const MAX_BODY = 1_000_000;
const MAX_FILE = 10 * 1024 * 1024;
const DIR = join(process.env.DATA_DIR || join(import.meta.dirname, ".data"), "files");
const SAFE_TYPES = /^(image\/(png|jpeg|gif|webp)|application\/pdf|text\/plain|text\/csv|application\/(vnd\.openxmlformats-officedocument\.[a-z.]+|msword|vnd\.ms-excel|vnd\.ms-powerpoint|zip))$/;
const json = (res, headers, code, body) =>
  res.writeHead(code, { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }).end(JSON.stringify(body));

async function readJson(req) {
  let size = 0; const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw Object.assign(new Error("too large"), { code: 413 });
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw Object.assign(new Error("bad json"), { code: 400 }); }
}
const bad = (m) => Object.assign(new Error(m), { code: 400 });
const text = (v, max, name) => { const s = v == null ? "" : String(v); if (s.length > max) throw bad(`${name} is too long`); return s; };
const int = (v, lo, hi, name, nullable = false) => {
  if (v == null || v === "") { if (nullable) return null; throw bad(`${name} is required`); }
  const n = Number(v); if (!Number.isInteger(n) || n < lo || n > hi) throw bad(`${name} must be a whole number from ${lo} to ${hi}`); return n;
};
const list = (v, max, name) => { if (v == null) return []; if (!Array.isArray(v) || v.length > max) throw bad(`${name} must be a list of at most ${max}`); return v; };

async function state(res, H) {
  const q = (await db()).query;
  const [goals, acts, pushes, contribs, audit, ids] = await Promise.all([
    q("SELECT * FROM goals WHERE deleted_at IS NULL ORDER BY id"),
    q("SELECT * FROM activities ORDER BY goal_id, position"),
    q("SELECT * FROM pushes ORDER BY goal_id, position"),
    q("SELECT * FROM contributors ORDER BY goal_id, position"),
    q("SELECT * FROM audit_log ORDER BY goal_id, position"),
    q("SELECT nextval('ts_id')::bigint AS id FROM generate_series(1, 100)"),
  ]);
  const by = (rows) => rows.reduce((m, r) => ((m[r.goal_id] ??= []).push(r), m), {});
  const A = by(acts), P = by(pushes), C = by(contribs), L = by(audit);
  json(res, H, 200, {
    ids: ids.map((r) => Number(r.id)), ai: ai.enabled(),
    goals: goals.map((g) => ({
      id: Number(g.id), code: g.code, employeeId: g.employee_id, title: g.title, desc: g.description, measure: g.measure, due: g.due,
      weight: g.weight, own: g.progress, status: g.status, statusText: g.status_text, parent: g.parent_title,
      from: g.pushed_from_goal_id ? { gid: Number(g.pushed_from_goal_id), employeeId: g.pushed_from_employee_id } : null,
      extra: g.extra, updatedAt: g.updated_at,
      updates: (A[g.id] ?? []).map((a) => ({ id: Number(a.id), code: a.code, d: a.done_on, n: a.note, p: a.progress, a: a.has_note ? 1 : 0, files: a.files })),
      pushed: (P[g.id] ?? []).map((p) => ({ employeeId: p.to_employee_id, p: p.progress, d: p.updated_on, n: p.note, due: p.due })),
      contribs: (C[g.id] ?? []).map((c) => c.data),
      audit: (L[g.id] ?? []).map((a) => ({ d: a.on_date, t: a.entry, ts: a.occurred_at, actor: a.actor_employee_id, action: a.action, detail: a.detail })),
    })),
  });
}

async function saveGoal(res, H, who, id, b) {
  const goalId = int(id, 1, 2 ** 53, "id");
  const emp = text(b.employeeId, 80, "employeeId"); if (!emp) throw bad("employeeId is required");
  const title = text(b.title, 500, "title"); if (!title.trim()) throw bad("title is required");
  const row = [goalId, emp, title, text(b.desc, 4000, "desc"), text(b.measure, 1000, "measure"), text(b.due, 60, "due"),
    int(b.weight, 0, 100, "weight", true), int(b.own ?? 0, 0, 100, "progress"), text(b.status, 20, "status") || "att", text(b.statusText, 80, "statusText"),
    text(b.parent, 500, "parent"), b.from ? int(b.from.gid, 1, 2 ** 53, "from.gid") : null, b.from ? text(b.from.employeeId, 80, "from.employeeId") : null,
    JSON.stringify(b.extra && typeof b.extra === "object" ? b.extra : {}), who.email];
  const updates = list(b.updates, 500, "updates"), pushed = list(b.pushed, 200, "pushed"), contribs = list(b.contribs, 200, "contribs"), audit = list(b.audit, 1000, "audit");
  await (await db()).tx(async (q) => {
    const gone = await q("SELECT 1 FROM goals WHERE id = $1 AND deleted_at IS NOT NULL", [goalId]);
    if (gone.length) return;
    await q(`INSERT INTO goals (id, employee_id, title, description, measure, due, weight, progress, status, status_text, parent_title,
               pushed_from_goal_id, pushed_from_employee_id, extra, updated_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15)
             ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, measure=EXCLUDED.measure, due=EXCLUDED.due,
               weight=EXCLUDED.weight, progress=EXCLUDED.progress, status=EXCLUDED.status, status_text=EXCLUDED.status_text,
               parent_title=EXCLUDED.parent_title, pushed_from_goal_id=EXCLUDED.pushed_from_goal_id,
               pushed_from_employee_id=EXCLUDED.pushed_from_employee_id, extra=EXCLUDED.extra, updated_at=now(), updated_by=EXCLUDED.updated_by`, row);
    await q("DELETE FROM activities WHERE goal_id=$1", [goalId]);
    await q("DELETE FROM pushes WHERE goal_id=$1", [goalId]);
    await q("DELETE FROM contributors WHERE goal_id=$1", [goalId]);
    await q("DELETE FROM audit_log WHERE goal_id=$1", [goalId]);
    for (const [i, u] of updates.entries()) {
      await q("INSERT INTO activities (id, goal_id, employee_id, progress, note, has_note, done_on, files, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)",
        [int(u.id, 1, 2 ** 53, "activity id"), goalId, emp, int(u.p, 0, 100, "activity progress"), text(u.n, 2000, "note"), !!u.a, text(u.d, 60, "date"),
         JSON.stringify(list(u.files, 5, "files").map((f) => ({ id: f.id ? int(f.id, 1, 2 ** 53, "file id") : null, name: text(f.name, 255, "file name"), size: int(f.size ?? 0, 0, 2 ** 40, "file size") }))), i]);
    }
    for (const [i, p] of pushed.entries()) {
      await q("INSERT INTO pushes (goal_id, to_employee_id, progress, note, due, updated_on, position) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [goalId, text(p.employeeId, 80, "employeeId"), int(p.p ?? 0, 0, 100, "push progress"), text(p.n, 500, "note"), text(p.due, 60, "due"), text(p.d, 60, "date"), i]);
    }
    for (const [i, c] of contribs.entries()) {
      await q("INSERT INTO contributors (goal_id, employee_id, position, data) VALUES ($1,$2,$3,$4::jsonb)", [goalId, c.employeeId ? text(c.employeeId, 80, "employeeId") : null, i, JSON.stringify(c)]);
    }
    for (const [i, a] of audit.entries()) {
      const when = a.ts ? new Date(a.ts) : new Date();
      await q("INSERT INTO audit_log (goal_id, position, on_date, entry, actor_employee_id, action, detail, occurred_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)",
        [goalId, i, text(a.d, 60, "date"), text(a.t, 1000, "entry"), a.actor ? text(a.actor, 80, "actor") : null, text(a.action, 60, "action") || "event",
         JSON.stringify(a.detail && typeof a.detail === "object" ? a.detail : {}), Number.isNaN(+when) ? new Date() : when]);
    }
  });
  json(res, H, 200, { ok: true, id: goalId });
}

// DELETE /api/goals/:id: hide the goal and write who did it into its history. Nothing is erased.
async function deleteGoal(res, H, who, id, b) {
  const actor = b.actor ? text(b.actor, 80, "actor") : null;
  const entry = text(b.text, 1000, "text") || "Goal deleted";
  const did = await (await db()).tx(async (q) => {
    const g = (await q("SELECT id FROM goals WHERE id = $1 AND deleted_at IS NULL FOR UPDATE", [id]))[0];
    if (!g) return false;
    await q("UPDATE goals SET deleted_at = now(), deleted_by = $2, updated_at = now(), updated_by = $2 WHERE id = $1", [id, who.email]);
    const pos = Number((await q("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM audit_log WHERE goal_id = $1", [id]))[0].p);
    await q("INSERT INTO audit_log (goal_id, position, on_date, entry, actor_employee_id, action, detail) VALUES ($1,$2,$3,$4,$5,'goal_deleted',$6::jsonb)",
      [id, pos, text(b.d, 60, "date"), entry, actor, JSON.stringify(b.detail && typeof b.detail === "object" ? b.detail : {})]);
    return true;
  });
  json(res, H, 200, { ok: true, deleted: did });
}

async function employees(res, H, b) {
  const rows = list(b, 500, "employees");
  await (await db()).tx(async (q) => {
    for (const p of rows) {
      await q(`INSERT INTO employees (employee_id, label, level, manager_id, note) VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (employee_id) DO UPDATE SET label=EXCLUDED.label, level=EXCLUDED.level, manager_id=EXCLUDED.manager_id, note=EXCLUDED.note`,
        [text(p.id, 80, "id"), text(p.label, 200, "label"), text(p.lv, 20, "lv"), p.boss ? text(p.boss, 80, "boss") : null, text(p.note, 300, "note")]);
    }
  });
  json(res, H, 200, { ok: true, count: rows.length });
}

async function uploadFile(req, res, H, who, url) {
  const name = text(url.searchParams.get("name") || "file", 255, "name").replace(/[\\/\u0000-\u001f]/g, "_");
  const declared = Number(req.headers["content-length"]);
  if (declared > MAX_FILE) throw Object.assign(new Error("That file is over 10 MB."), { code: 413 });
  const id = Number((await (await db()).query("SELECT nextval('ts_id')::bigint AS id"))[0].id);
  await mkdir(DIR, { recursive: true });
  const dest = join(DIR, String(id));
  let size = 0;
  try {
    await pipeline(req, async function* (src) { for await (const c of src) { size += c.length; if (size > MAX_FILE) throw Object.assign(new Error("That file is over 10 MB."), { code: 413 }); yield c; } }, createWriteStream(dest));
  } catch (e) { await rm(dest, { force: true }); throw e; }
  const ct = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  await (await db()).query("INSERT INTO files (id, name, size, type, uploaded_by) VALUES ($1,$2,$3,$4,$5)", [id, name, size, SAFE_TYPES.test(ct) ? ct : "application/octet-stream", who.email]);
  json(res, H, 200, { id, name, size });
}

// Chunked upload: start (declare name and size), PUT each 512 KB chunk, finish. Small requests pass every proxy, a slow connection
// only slows one chunk, and a failed chunk is sent again alone.
const CHUNK = 512 * 1024;
async function uploadStart(res, H, who, url) {
  const name = text(url.searchParams.get("name") || "file", 255, "name").replace(/[\\/\u0000-\u001f]/g, "_");
  const size = int(url.searchParams.get("size"), 0, MAX_FILE, "size");
  const ct = String(url.searchParams.get("type") || "").toLowerCase();
  const id = Number((await (await db()).query("SELECT nextval('ts_id')::bigint AS id"))[0].id);
  await mkdir(DIR, { recursive: true });
  await writeFile(join(DIR, id + ".part"), "");
  await (await db()).query("INSERT INTO files (id, name, size, type, uploaded_by, complete) VALUES ($1,$2,$3,$4,$5,false)", [id, name, size, SAFE_TYPES.test(ct) ? ct : "application/octet-stream", who.email]);
  json(res, H, 200, { id, chunk: CHUNK });
}
async function uploadChunk(req, res, H, who, id, n) {
  const f = (await (await db()).query("SELECT size, uploaded_by, complete FROM files WHERE id = $1", [id]))[0];
  if (!f || f.complete || f.uploaded_by !== (who.email ?? null)) throw Object.assign(new Error("No such upload"), { code: 404 });
  const offset = int(n, 0, 100000, "chunk") * CHUNK;
  const parts = []; let len = 0;
  for await (const c of req) { len += c.length; if (len > CHUNK) throw bad("chunk too large"); parts.push(c); }
  if (offset + len > f.size) throw bad("chunk is past the end of the file");
  const fh = await open(join(DIR, id + ".part"), "r+");
  try { await fh.write(Buffer.concat(parts), 0, len, offset); } finally { await fh.close(); }
  json(res, H, 200, { ok: true, received: len });
}
async function uploadFinish(res, H, who, id) {
  const q = (await db()).query;
  const f = (await q("SELECT name, size, uploaded_by, complete FROM files WHERE id = $1", [id]))[0];
  if (!f || f.complete || f.uploaded_by !== (who.email ?? null)) throw Object.assign(new Error("No such upload"), { code: 404 });
  const got = (await stat(join(DIR, id + ".part"))).size;
  if (got !== f.size) throw bad(`The file is incomplete (${got} of ${f.size} bytes). Try again.`);
  await rename(join(DIR, id + ".part"), join(DIR, String(id)));
  await q("UPDATE files SET complete = true WHERE id = $1", [id]);
  json(res, H, 200, { id, name: f.name, size: f.size });
}

async function sendFile(req, res, H, id) {
  const rows = await (await db()).query("SELECT name, size, type FROM files WHERE id = $1 AND complete", [id]);
  const f = rows[0];
  const path = join(DIR, String(id));
  if (!f || !(await stat(path).catch(() => null))) return json(res, H, 404, { error: "File not found" });
  const inline = /^(image\/|application\/pdf$|text\/plain$)/.test(f.type);
  res.writeHead(200, { ...H, "Content-Type": f.type, "Content-Length": f.size, "Cache-Control": "private, max-age=3600",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(f.name)}`, "Content-Security-Policy": "sandbox; default-src 'none'" });
  if (req.method === "HEAD") return res.end();
  createReadStream(path).pipe(res);
}

async function workflowLog(res, H, url) {
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit")) || 200));
  const rows = await (await db()).query(
    `SELECT a.id, a.occurred_at, a.action, a.entry, a.detail, g.code AS goal_code, g.title AS goal_title, g.deleted_at IS NOT NULL AS goal_deleted, g.employee_id AS goal_owner,
            a.actor_employee_id, e.label AS actor_label
       FROM audit_log a JOIN goals g ON g.id = a.goal_id LEFT JOIN employees e ON e.employee_id = a.actor_employee_id
      ORDER BY a.occurred_at DESC, a.id DESC LIMIT $1`, [limit]);
  if (url.searchParams.get("format") === "csv") {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["when,actor,action,goal,goal_title,entry", ...rows.map((r) => [r.occurred_at.toISOString?.() ?? r.occurred_at, r.actor_employee_id, r.action, r.goal_code, r.goal_title, r.entry].map(q).join(","))].join("\n");
    return void res.writeHead(200, { ...H, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="workflow-log.csv"', "Cache-Control": "no-store" }).end(csv);
  }
  json(res, H, 200, { log: rows.map((r) => ({ id: Number(r.id), at: r.occurred_at, action: r.action, entry: r.entry, detail: r.detail, goalCode: r.goal_code, goalTitle: r.goal_title + (r.goal_deleted ? " (deleted)" : ""),
    actorId: r.actor_employee_id, actor: r.actor_label })) });
}

// Returns true when it answered.
export async function api(req, res, path, who, H) {
  if (!path.startsWith("/api/")) return false;
  if (req.method !== "GET" && req.method !== "HEAD") {
    // one line per write, so a failure on the live site can be found in `canvas logs`
    const t0 = Date.now();
    res.on("finish", () => console.log(`api ${req.method} ${path} ${res.statusCode} len=${req.headers["content-length"] ?? "?"} ${Date.now() - t0}ms by=${who.email ?? "-"}`));
  }
  try {
    const url = new URL(req.url, "http://app");
    if (path === "/api/state" && req.method === "GET") { await state(res, H); return true; }
    if (path === "/api/ids" && req.method === "GET") {
      const n = Math.min(200, Math.max(1, Number(url.searchParams.get("n")) || 50));
      const rows = await (await db()).query("SELECT nextval('ts_id')::bigint AS id FROM generate_series(1, $1)", [n]);
      json(res, H, 200, { ids: rows.map((r) => Number(r.id)) }); return true;
    }
    if (path === "/api/employees" && req.method === "PUT") { await employees(res, H, await readJson(req)); return true; }
    if (path === "/api/ai" && req.method === "POST") {
      const b = await readJson(req);
      json(res, H, 200, await ai.ask(text(b.task, 20, "task"), b.context, b.employeeId ? text(b.employeeId, 80, "employeeId") : null, who.email)); return true;
    }
    if (path === "/api/ai/log" && req.method === "GET") {
      const rows = await (await db()).query("SELECT id, created_at, employee_id, task, model, status, latency_ms, tokens, accepted FROM ai_log ORDER BY id DESC LIMIT 200");
      json(res, H, 200, { log: rows }); return true;
    }
    const am = path.match(/^\/api\/ai\/(\d+)\/accept$/);
    if (am && req.method === "POST") { const b = await readJson(req); await ai.accept(Number(am[1]), text(b.text, 800, "text")); json(res, H, 200, { ok: true }); return true; }
    if (path === "/api/log" && req.method === "GET") { await workflowLog(res, H, url); return true; }
    if (path === "/api/files/start" && req.method === "POST") { await uploadStart(res, H, who, url); return true; }
    const um = path.match(/^\/api\/files\/(\d+)\/(chunk|finish)$/);
    if (um && req.method === "PUT" && um[2] === "chunk") { await uploadChunk(req, res, H, who, Number(um[1]), url.searchParams.get("n")); return true; }
    if (um && req.method === "POST" && um[2] === "finish") { await uploadFinish(res, H, who, Number(um[1])); return true; }
    if (path === "/api/files" && req.method === "POST") { await uploadFile(req, res, H, who, url); return true; }
    const fm = path.match(/^\/api\/files\/(\d+)$/);
    if (fm && (req.method === "GET" || req.method === "HEAD")) { await sendFile(req, res, H, Number(fm[1])); return true; }
    const m = path.match(/^\/api\/goals\/(\d+)$/);
    if (m && req.method === "PUT") { await saveGoal(res, H, who, m[1], await readJson(req)); return true; }
    if (m && req.method === "DELETE") { await deleteGoal(res, H, who, Number(m[1]), await readJson(req).catch(() => ({}))); return true; }
    if (path === "/api/reset" && req.method === "POST") {
      // everything the scenario created: goals (and, by cascade, activities, pushes, contributors, log) and the attached files
      const gone = await (await db()).tx(async (q) => {
        const n = async (t) => Number((await q(`SELECT count(*)::int AS c FROM ${t}`))[0].c);
        const counts = { goals: await n("goals"), activities: await n("activities"), log: await n("audit_log"), files: await n("files") };
        await q("DELETE FROM goals");
        await q("DELETE FROM files");
        return counts;
      });
      await rm(DIR, { recursive: true, force: true });
      json(res, H, 200, { ok: true, deleted: gone }); return true;
    }
    json(res, H, 404, { error: "Not found" }); return true;
  } catch (e) {
    const code = [400, 404, 413, 429, 502, 503].includes(e.code) ? e.code : e.code === "23503" || e.code === "23514" || e.code === "22P02" ? 400 : 500;
    if (code === 500) console.error("api error:", e);
    json(res, H, code, { error: code === 500 ? "Something went wrong saving that." : e.message });
    return true;
  }
}

// At start-up: say in the logs whether the attachment disk can be written, so a problem shows in `canvas logs` before anyone uploads.
export async function checkDisk() {
  try {
    await mkdir(DIR, { recursive: true });
    const probe = join(DIR, ".probe");
    await writeFile(probe, "ok"); await rm(probe, { force: true });
    console.log(`attachments: ${DIR} is writable`);
  } catch (e) { console.error(`attachments: ${DIR} is NOT writable: ${e.code || e.message}`); }
}
