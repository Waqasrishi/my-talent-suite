// The AI behind the goal screens: the platform's own model (llm resource, qwen-flash: goal text stays inside the company).
// Five jobs: goals (ideas for a new goal), measures (how to know it is done), review (is this goal ready), comment (drafts for returning a goal),
// translate (one goal field into Arabic or English, shown beside the original; the goal itself is never changed).
// Every call is logged in ai_log. With no key (a laptop) enabled() is false and the screens fall back to the goal library.
import { db } from "./db.mjs";

const MODEL = process.env.AJMN_AI_MODEL || "qwen-flash";
export const enabled = () => !!(process.env.OPENAI_BASE_URL && process.env.OPENAI_API_KEY);

const RULES = `You help managers at Al Jazeera Media Network write goals for the year 2027, using the cascade Director General > Executive Director > Director > Manager > Employee.
A good goal: one sentence, starts with a verb, says what changes, is measurable with a number and a date, and supports the goal of the person above. A person has 3 to 5 goals.
Write in plain English. Never invent names of people. Answer with JSON only, no other text.`;

const clip = (v, n) => String(v ?? "").slice(0, n);
const arr = (v, n, m) => (Array.isArray(v) ? v.slice(0, n).map((x) => clip(x, m)).filter(Boolean) : []);

const TASKS = {
  goals: (c) => `The person is: ${clip(c.role, 60)}.
Goals of the person above them: ${JSON.stringify(arr(c.above, 6, 200))}.
Goals this person already has: ${JSON.stringify(arr(c.mine, 6, 200))}.
${c.hint ? `They started typing: "${clip(c.hint, 200)}".` : ""}
Suggest 5 different goals for this person. Each one must support one of the goals above when there is one.
JSON: {"options":[{"text":"<the goal, one sentence>","why":"<which goal above it supports, or why it matters, under 14 words>"}]}`,
  measures: (c) => `The person is: ${clip(c.role, 60)}. Their goal: "${clip(c.goal, 300)}".
Suggest 4 ways to measure when this goal is done. Each has a number, a starting value if you can say it, a target and the date 31 December 2027, for example "Median time to publish: from 11 minutes to 6 minutes by 31 December 2027".
JSON: {"options":[{"text":"<the measure>","why":"<what it tells you, under 12 words>"}]}`,
  review: (c) => `Review this goal written by ${clip(c.role, 60)}.
Goal: "${clip(c.title, 300)}"
Measure: "${clip(c.measure, 400)}"
Due: "${clip(c.due, 40)}"
${c.top
    ? "This person is the Director General, the highest role. There is NO goal above it. Do not check, mention or ask for alignment to a higher goal. Instead check that it sets a clear direction for the whole organisation."
    : `Supports: "${clip(c.parent, 300) || "nothing yet"}". Goals above: ${JSON.stringify(arr(c.above, 8, 200))}. Check that it supports one of them.`}
Check: is it measurable with a number, is it one clear outcome (not an activity), does it have a date.
JSON: {"ready":true|false,"checks":[{"ok":true|false,"text":"<one short sentence>","fix":{"field":"title|measure|due|parent","value":"<the corrected value>"}}],"better":"<a better wording of the goal in one sentence, or an empty string if it is already good>"}
Give 3 or 4 checks. Add "fix" only to a check that fails and only when you can write the exact corrected value: for title the improved goal sentence, for measure the improved measure with a number, a start value, a target and a date, for due a date written like "31 December 2027", for parent one of the goals above copied exactly. Leave "fix" out otherwise.`,
  translate: (c) => `Translate this text from a goal into ${c.to === "en" ? "English" : "Modern Standard Arabic"}. Keep numbers, dates and names as they are. Translate only; do not improve or explain it.
Text: "${clip(c.text, 800)}"
JSON: {"text":"<the translation>"}`,
  comment: (c) => `A manager is returning this goal for changes. Goal: "${clip(c.title, 300)}". Measure: "${clip(c.measure, 400)}". Problems found: ${JSON.stringify(arr(c.issues, 6, 200))}.
Write 3 short, polite comments (one or two sentences each) that tell the owner what to change.
JSON: {"options":[{"text":"<the comment>"}]}`,
};

function shape(task, j, ctx = {}) {
  if (task === "review") {
    const FIELDS = { title: 300, measure: 400, due: 40, parent: 300 };
    const above = arr(ctx.above, 8, 200);
    const fixOf = (f, ok) => {
      if (ok || !f || !FIELDS[f.field]) return undefined;
      const value = clip(f.value, FIELDS[f.field]).trim();
      if (!value) return undefined;
      if (f.field === "due" && !/^\d{1,2} [A-Za-z]+ \d{4}$/.test(value)) return undefined;
      if (f.field === "parent" && (ctx.top || !above.includes(value))) return undefined;
      return { field: f.field, value };
    };
    const checks = (Array.isArray(j.checks) ? j.checks : []).slice(0, 5).map((x) => ({ ok: !!x.ok, text: clip(x.text, 200), fix: fixOf(x.fix, !!x.ok) })).filter((x) => x.text);
    if (!checks.length) throw new Error("empty review");
    return { ready: !!j.ready, checks, better: clip(j.better, 300) };
  }
  if (task === "translate") {
    const text = clip(j.text, 1200).trim();
    if (!text) throw new Error("empty translation");
    return { text };
  }
  const options = (Array.isArray(j.options) ? j.options : []).slice(0, 6).map((x) => ({ text: clip(x.text, 400), why: clip(x.why, 160) })).filter((x) => x.text);
  if (!options.length) throw new Error("no options");
  return { options };
}

function parse(s) {
  const m = String(s).match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no json in the answer");
  return JSON.parse(m[0]);
}

// per person: 40 calls a minute is far more than anyone clicks
const hits = new Map();
function allowed(who) {
  const now = Date.now(), k = who || "anon", a = (hits.get(k) ?? []).filter((t) => now - t < 60_000);
  if (a.length >= 40) return false;
  a.push(now); hits.set(k, a); return true;
}

export async function ask(task, context, employeeId, email) {
  if (!TASKS[task]) throw Object.assign(new Error("unknown task"), { code: 400 });
  if (!enabled()) throw Object.assign(new Error("AI is not connected"), { code: 503 });
  if (!allowed(email || employeeId)) throw Object.assign(new Error("Too many AI requests. Wait a minute."), { code: 429 });
  const ctx = context && typeof context === "object" ? context : {};
  const t0 = Date.now(), q = (await db()).query;
  let status = "ok", out = null, tokens = null, error = null;
  try {
    const r = await fetch(`${process.env.OPENAI_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST", signal: AbortSignal.timeout(25_000),
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, temperature: 0.4, max_tokens: 900, messages: [{ role: "system", content: RULES }, { role: "user", content: TASKS[task](ctx) }] }),
    });
    if (!r.ok) throw new Error(`model answered ${r.status}`);
    const j = await r.json();
    tokens = j.usage?.total_tokens ?? null;
    out = shape(task, parse(j.choices?.[0]?.message?.content), ctx);
  } catch (e) { status = "error"; error = e.message; }
  const rows = await q("INSERT INTO ai_log (employee_id, task, model, request, response, status, latency_ms, tokens, asked_by) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9) RETURNING id",
    [employeeId || null, task, MODEL, JSON.stringify(ctx).slice(0, 8000), JSON.stringify(out ?? { error }), status, Date.now() - t0, tokens, email || null]).catch(() => [{ id: null }]);
  if (status !== "ok") throw Object.assign(new Error("The AI could not answer. Using the goal library."), { code: 502 });
  return { id: rows[0].id == null ? null : Number(rows[0].id), model: MODEL, ...out };
}

export async function accept(id, text) {
  await (await db()).query("UPDATE ai_log SET accepted = $2 WHERE id = $1", [id, clip(text, 800)]);
}
