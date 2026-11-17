// The goals API: /api/state, /api/ids, /api/employees, /api/goals/:id, /api/reset. Every goal and activity has its
// own id (one Postgres sequence) and the employee it belongs to. The page keeps working in memory if this is down.
import { db } from "./db.mjs";

const MAX_BODY = 1_000_000;
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
    q("SELECT * FROM goals ORDER BY id"),
    q("SELECT * FROM activities ORDER BY goal_id, position"),
    q("SELECT * FROM pushes ORDER BY goal_id, position"),
    q("SELECT * FROM contributors ORDER BY goal_id, position"),
    q("SELECT * FROM audit_log ORDER BY goal_id, position"),
    q("SELECT nextval('ts_id')::bigint AS id FROM generate_series(1, 100)"),
  ]);
  const by = (rows) => rows.reduce((m, r) => ((m[r.goal_id] ??= []).push(r), m), {});
  const A = by(acts), P = by(pushes), C = by(contribs), L = by(audit);
  json(res, H, 200, {
    ids: ids.map((r) => Number(r.id)),
    goals: goals.map((g) => ({
      id: Number(g.id), code: g.code, employeeId: g.employee_id, title: g.title, desc: g.description, measure: g.measure, due: g.due,
      weight: g.weight, own: g.progress, status: g.status, statusText: g.status_text, parent: g.parent_title,
      from: g.pushed_from_goal_id ? { gid: Number(g.pushed_from_goal_id), employeeId: g.pushed_from_employee_id } : null,
      extra: g.extra, updatedAt: g.updated_at,
      updates: (A[g.id] ?? []).map((a) => ({ id: Number(a.id), code: a.code, d: a.done_on, n: a.note, p: a.progress, a: a.has_note ? 1 : 0, files: a.files })),
      pushed: (P[g.id] ?? []).map((p) => ({ employeeId: p.to_employee_id, p: p.progress, d: p.updated_on, n: p.note, due: p.due })),
      contribs: (C[g.id] ?? []).map((c) => c.data),
      audit: (L[g.id] ?? []).map((a) => ({ d: a.on_date, t: a.entry })),
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
         JSON.stringify(list(u.files, 5, "files").map((f) => ({ name: text(f.name, 255, "file name"), size: int(f.size ?? 0, 0, 2 ** 40, "file size") }))), i]);
    }
    for (const [i, p] of pushed.entries()) {
      await q("INSERT INTO pushes (goal_id, to_employee_id, progress, note, due, updated_on, position) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [goalId, text(p.employeeId, 80, "employeeId"), int(p.p ?? 0, 0, 100, "push progress"), text(p.n, 500, "note"), text(p.due, 60, "due"), text(p.d, 60, "date"), i]);
    }
    for (const [i, c] of contribs.entries()) {
      await q("INSERT INTO contributors (goal_id, employee_id, position, data) VALUES ($1,$2,$3,$4::jsonb)", [goalId, c.employeeId ? text(c.employeeId, 80, "employeeId") : null, i, JSON.stringify(c)]);
    }
    for (const [i, a] of audit.entries()) {
      await q("INSERT INTO audit_log (goal_id, position, on_date, entry) VALUES ($1,$2,$3,$4)", [goalId, i, text(a.d, 60, "date"), text(a.t, 1000, "entry")]);
    }
  });
  json(res, H, 200, { ok: true, id: goalId });
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

// Returns true when it answered.
export async function api(req, res, path, who, H) {
  if (!path.startsWith("/api/")) return false;
  try {
    const url = new URL(req.url, "http://app");
    if (path === "/api/state" && req.method === "GET") { await state(res, H); return true; }
    if (path === "/api/ids" && req.method === "GET") {
      const n = Math.min(200, Math.max(1, Number(url.searchParams.get("n")) || 50));
      const rows = await (await db()).query("SELECT nextval('ts_id')::bigint AS id FROM generate_series(1, $1)", [n]);
      json(res, H, 200, { ids: rows.map((r) => Number(r.id)) }); return true;
    }
    if (path === "/api/employees" && req.method === "PUT") { await employees(res, H, await readJson(req)); return true; }
    const m = path.match(/^\/api\/goals\/(\d+)$/);
    if (m && req.method === "PUT") { await saveGoal(res, H, who, m[1], await readJson(req)); return true; }
    if (path === "/api/reset" && req.method === "POST") {
      await (await db()).query("DELETE FROM goals");
      json(res, H, 200, { ok: true }); return true;
    }
    json(res, H, 404, { error: "Not found" }); return true;
  } catch (e) {
    const code = e.code === 400 || e.code === 413 ? e.code : e.code === "23503" || e.code === "23514" || e.code === "22P02" ? 400 : 500;
    if (code === 500) console.error("api error:", e);
    json(res, H, code, { error: code === 500 ? "Something went wrong saving that." : e.message });
    return true;
  }
}
