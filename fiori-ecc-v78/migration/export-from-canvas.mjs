#!/usr/bin/env node
// Turns the prototype's data (Canvas, through /api/state) into CSV files for ZAJMN_IMPORT, one per ECC table (ecc/01).
//   node export-from-canvas.mjs <app url> <cookie> [pernr-map.json]
//   e.g. node export-from-canvas.mjs https://talent-suite--erp.canvas.ajnai.net "<cookie copied from the browser>"
//        node export-from-canvas.mjs http://localhost:8092 none          (a local copy, no sign-in)
// <cookie> is the sign-in cookie of a person who can open the app (the platform sign-in cannot be scripted).
// Output in ./out: goals.csv, activities.csv, pushes.csv, contributors.csv, log.csv
//   UTF-8 with BOM, ; separated, every field in "quotes", a quote doubled, one header row.
//   A line break inside a text is written as \n and a backslash as \\ (ZAJMN_IMPORT turns them back).
// Dates: the display text is kept (DUE_TEXT, DONE_TEXT) and a SAP date is added (YYYYMMDD) when it can be read.
// Attachments: only the list of files is exported (FILES); copy the bytes with the attachment upload of the service.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const [base, cookie, mapFile = new URL("./pernr-map.json", import.meta.url).pathname] = process.argv.slice(2);
if (!base || !cookie) { console.error("usage: export-from-canvas.mjs <app url> <cookie|none> [pernr-map.json]"); process.exit(1); }
const MAP = JSON.parse(await readFile(mapFile, "utf8")).map;
const placeholders = Object.values(MAP).filter((v) => String(v).startsWith("9")).length;
if (placeholders) console.warn(`WARNING: ${placeholders} personnel numbers are still placeholders (start with 9). Replace them in ${mapFile} first.`);
const unknown = new Set();
const pn = (id) => { if (id == null || id === "") return ""; if (MAP[id]) return MAP[id]; unknown.add(id); return ""; };

const res = await fetch(base.replace(/\/$/, "") + "/api/state", { headers: cookie === "none" ? {} : { cookie } });
if (!res.ok) { console.error(`GET /api/state answered ${res.status}. Is the cookie still valid?`); process.exit(1); }
const { goals } = await res.json();

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const dats = (s) => {
  const m = String(s || "").match(/^\s*(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\s+(\d{4})\s*$/);
  if (!m || !MONTHS[m[2].toLowerCase()]) return "";
  const d = `${m[3]}${String(MONTHS[m[2].toLowerCase()]).padStart(2, "0")}${m[1].padStart(2, "0")}`;
  const t = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}T00:00:00Z`);
  return t.getUTCDate() === Number(m[1]) ? d : "";   // 31 February is not a date
};
const ts14 = (v) => { const t = Date.parse(v || ""); return Number.isNaN(t) ? "" : new Date(t).toISOString().replace(/[-:T]/g, "").slice(0, 14); };
const text = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n");
const cell = (v) => `"${text(v).replace(/"/g, '""')}"`;
const csv = (head, rows) => "﻿" + [head.join(";"), ...rows.map((r) => r.map(cell).join(";"))].join("\r\n") + "\r\n";
const num = (v) => (v === null || v === undefined || v === "" ? "" : String(Math.trunc(Number(v))));

const out = {
  "goals.csv": csv(["GOAL_ID", "PERNR", "TITLE", "DESCRIPTION", "MEASURE", "DUE_TEXT", "DUE_DATE", "WEIGHT", "PROGRESS", "STATUS", "STATUS_TEXT", "PARENT_TITLE", "PUSHED_FROM_GOAL", "PUSHED_FROM_PERNR", "EXTRA"],
    goals.map((g) => [g.id, pn(g.employeeId), g.title, g.desc, g.measure, g.due, dats(g.due), g.weight == null ? -1 : num(g.weight), num(g.own), g.status, g.statusText, g.parent,
      g.from?.gid ?? "", pn(g.from?.employeeId), JSON.stringify(g.extra || {})])),
  "activities.csv": csv(["GOAL_ID", "ACT_ID", "PERNR", "PROGRESS", "NOTE", "HAS_NOTE", "DONE_TEXT", "DONE_ON", "FILES", "POSITION"],
    goals.flatMap((g) => g.updates.map((u, i) => [g.id, u.id, pn(g.employeeId), num(u.p), u.n, u.a ? "X" : "", u.d, dats(u.d), JSON.stringify(u.files || []), i]))),
  "pushes.csv": csv(["GOAL_ID", "TO_PERNR", "PROGRESS", "NOTE", "DUE_TEXT", "UPDATED_TEXT", "POSITION"],
    goals.flatMap((g) => g.pushed.map((p, i) => [g.id, pn(p.employeeId), num(p.p), p.n, p.due, p.d, i]))),
  "contributors.csv": csv(["GOAL_ID", "POSITION", "PERNR", "STATUS", "LINKED_GOAL_ID", "DATA"],
    goals.flatMap((g) => g.contribs.map((c, i) => [g.id, i, pn(c.employeeId), c.status || "", c.myId ?? "", JSON.stringify(c)]))),
  "log.csv": csv(["GOAL_ID", "ACTOR_PERNR", "ACTION", "TEXT", "DATE_TEXT", "DETAIL", "CLIENT_TS", "OCCURRED_AT"],
    goals.flatMap((g) => g.audit.map((a) => [g.id, pn(a.actor), a.action || "event", a.t, a.d, JSON.stringify(a.detail || {}), a.ts || "", ts14(a.ts)]))),
};
await mkdir("out", { recursive: true });
for (const [f, body] of Object.entries(out)) await writeFile("out/" + f, body);
const n = (f) => out[f].split("\r\n").length - 2;
console.log(`./out: ${n("goals.csv")} goals, ${n("activities.csv")} activities, ${n("pushes.csv")} pushes, ${n("contributors.csv")} contributors, ${n("log.csv")} log rows`);
if (unknown.size) console.warn(`WARNING: no personnel number for ${[...unknown].join(", ")} — add them to ${mapFile}; their PERNR fields are empty.`);
console.log("Attachments: FILES lists them; copy the bytes from <app url>/api/files/<id> with the attachment upload of the service.");
