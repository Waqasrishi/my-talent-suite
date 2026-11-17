#!/usr/bin/env node
// Turns the prototype's data (Canvas Postgres, through /api/state and /api/log) into files for the ECC import.
//   node export-from-canvas.mjs https://talent-suite--erp.canvas.ajnai.net <cookie> [pernr-map.json]
// <cookie> is the sign-in cookie of a person who can open the app (copy it from the browser: the platform sign-in cannot be scripted).
// Output (in ./out): goals.csv, activities.csv, pushes.csv, contributors.csv, log.csv. UTF-8, semicolon separated, one header row.
// Dates: the prototype keeps them as display text ("31 December 2027"); this converts them to YYYYMMDD (SAP DATS).
import { mkdir, readFile, writeFile } from "node:fs/promises";

const [base, cookie, mapFile = new URL("./pernr-map.json", import.meta.url).pathname] = process.argv.slice(2);
if (!base || !cookie) { console.error("usage: export-from-canvas.mjs <app url> <cookie> [pernr-map.json]"); process.exit(1); }
const MAP = JSON.parse(await readFile(mapFile, "utf8")).map;
const placeholders = Object.entries(MAP).filter(([, v]) => v.startsWith("9"));
if (placeholders.length) console.warn(`WARNING: ${placeholders.length} personnel numbers are still placeholders (start with 9). Replace them in ${mapFile} first.`);
const pn = (id) => (id == null ? "" : MAP[id] ?? (console.warn("unknown employee id:", id), id));

const get = (p) => fetch(base + p, { headers: { cookie } }).then((r) => { if (!r.ok) throw new Error(p + " " + r.status); return r.json(); });
const { goals } = await get("/api/state");
const { log } = await get("/api/log?limit=1000");

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const dats = (s) => {
  const m = String(s || "").match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  return m && MONTHS[m[2].toLowerCase()] ? `${m[3]}${String(MONTHS[m[2].toLowerCase()]).padStart(2, "0")}${m[1].padStart(2, "0")}` : "";
};
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
const csv = (head, rows) => [head.join(";"), ...rows.map((r) => r.map(cell).join(";"))].join("\n") + "\n";
const ts = (v) => (v ? new Date(v).toISOString().replace(/[-:T]/g, "").slice(0, 14) : "");

const out = {
  "goals.csv": csv(["GOAL_ID", "PERNR", "TITLE", "DESCRIPTION", "MEASURE", "DUE_DATE", "WEIGHT", "PROGRESS", "STATUS", "STATUS_TEXT", "PARENT_TITLE", "PUSHED_FROM_GOAL", "PUSHED_FROM_PERNR", "EXTRA"],
    goals.map((g) => [g.id, pn(g.employeeId), g.title, g.desc, g.measure, dats(g.due), g.weight ?? -1, g.own, g.status, g.statusText, g.parent, g.from?.gid ?? "", pn(g.from?.employeeId), JSON.stringify(g.extra)])),
  "activities.csv": csv(["GOAL_ID", "ACT_ID", "PERNR", "PROGRESS", "NOTE", "HAS_NOTE", "DONE_ON", "FILES"],
    goals.flatMap((g) => g.updates.map((u) => [g.id, u.id, pn(g.employeeId), u.p, u.n, u.a ? "X" : "", dats(u.d), JSON.stringify(u.files || [])]))),
  "pushes.csv": csv(["GOAL_ID", "TO_PERNR", "PROGRESS", "NOTE", "DUE_DATE", "UPDATED_ON"],
    goals.flatMap((g) => g.pushed.map((p) => [g.id, pn(p.employeeId), p.p, p.n, dats(p.due), dats(p.d)]))),
  "contributors.csv": csv(["GOAL_ID", "PERNR", "STATUS", "LINKED_GOAL_ID", "REASON", "DATA"],
    goals.flatMap((g) => g.contribs.map((c) => [g.id, pn(c.employeeId), c.status, c.myId ?? "", c.reason ?? "", JSON.stringify(c)]))),
  "log.csv": csv(["LOG_ID", "GOAL_ID", "ACTOR_PERNR", "ACTION", "TEXT", "OCCURRED_AT"],
    log.map((l) => [l.id, l.goalCode.replace(/^G-0*/, ""), pn(l.actorId), l.action, l.entry, ts(l.at)])),
};
await mkdir("out", { recursive: true });
for (const [f, body] of Object.entries(out)) await writeFile("out/" + f, "﻿" + body);
console.log(`${goals.length} goals, ${goals.reduce((n, g) => n + g.updates.length, 0)} activities, ${log.length} log rows written to ./out`);
console.log("Attachments are not exported: the bytes are on the Canvas disk (/api/files/<id>). Download them and load them with the attachment upload of the service.");
