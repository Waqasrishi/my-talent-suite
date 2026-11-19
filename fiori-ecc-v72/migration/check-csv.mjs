#!/usr/bin/env node
// node check-csv.mjs [out]: checks the export the way ZAJMN_IMPORT reads it (field count per row, JSON fields). Run it before copying the files to ECC.
// the same splitting and unescaping as lcl_csv in ZAJMN_IMPORT.abap, to check the files before they go to ECC
import { readFileSync } from "node:fs";
const split = (line) => { const out = []; let cell = "", inq = false;
  for (let i = 0; i < line.length; i++) { const ch = line[i];
    if (inq) { if (ch === '"') { if (line[i + 1] === '"') { cell += '"'; i++; } else inq = false; } else cell += ch; }
    else if (ch === '"') inq = true; else if (ch === ";") { out.push(un(cell)); cell = ""; } }
  out.push(un(cell)); return out; };
const un = (s) => s.replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c));
const dir = process.argv[2] || "out";
const want = { "goals.csv": 15, "activities.csv": 10, "pushes.csv": 7, "contributors.csv": 6, "log.csv": 8 };
const json = { "goals.csv": [14], "activities.csv": [8], "contributors.csv": [5], "log.csv": [5] };
let bad = 0;
for (const [f, n] of Object.entries(want)) {
  const rows = readFileSync(dir + "/" + f, "utf8").replace(/^﻿/, "").split("\r\n").filter(Boolean).slice(1);
  rows.forEach((r, i) => { const c = split(r); if (c.length !== n) { bad++; console.log(f, i + 2, c.length, "fields"); }
    for (const j of json[f] || []) { try { JSON.parse(c[j]); } catch { bad++; console.log(f, i + 2, "field", j + 1, "is not JSON"); } } });
  console.log(f, rows.length, "rows ok");
}
process.exit(bad ? 1 : 0);
