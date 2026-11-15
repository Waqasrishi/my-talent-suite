// Serves the one static page (index.html) on Canvas, with the platform's checks: who may open it
// (score.yaml's access, as PLATFORM_ACCESS), /healthz, and the security headers. No dependencies.
// It serves index.html, strategy.html, successfactors.html and goals-hub.html, and the Fiori (UI5) version of the
// Talent Suite under /fiori/ — the files found in fiori/ at start, and nothing else: no other file in this folder is reachable.
// The front page "/" is AJMN People (goals-hub.html); the original Talent Suite page stays at /index.html, unchanged.
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";

const PAGES = { "/": "goals-hub.html", "/index.html": "index.html", "/strategy.html": "strategy.html",
  "/successfactors.html": "successfactors.html", "/goals-hub.html": "goals-hub.html" };
// The Fiori app's own files, listed once at start: a request can only name one of these.
const TYPES = { html: "text/html", js: "text/javascript", json: "application/json", xml: "application/xml", css: "text/css" };
const FIORI = new Set(["fiori", "fiori-people"].flatMap((dir) => readdirSync(join(import.meta.dirname, dir), { recursive: true, withFileTypes: true })
  .filter((f) => f.isFile() && f.name.split(".").pop() in TYPES)
  .map((f) => "/" + join(f.parentPath, f.name).slice(import.meta.dirname.length + 1).split("\\").join("/"))));
const RULES = JSON.parse(process.env.PLATFORM_ACCESS || "{}");
const SSO = process.env.PLATFORM_AUTH === "sso";
// index.html is kept exactly as it is: one inline script, one inline style block, and its fonts
// from Google Fonts. The policy allows those and nothing more.
const HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin",
};

// The Fiori page has no inline script; UI5 itself, its themes, fonts and texts come from ui5.sap.com.
const UI5 = "https://ui5.sap.com";
const FIORI_HEADERS = { ...HEADERS, "Content-Security-Policy": `default-src 'self'; script-src 'self' ${UI5}; ` +
  `style-src 'self' 'unsafe-inline' ${UI5}; font-src 'self' data: ${UI5}; img-src 'self' data: ${UI5}; ` +
  `connect-src 'self' ${UI5}; frame-ancestors 'none'` };

// Who is calling, as the platform's sign-in says — trusted only behind it (PLATFORM_AUTH=sso).
const text = (v) => Buffer.from(v ?? "", "latin1").toString("utf8");
function caller(h) {
  return { email: text(h["x-authentik-email"]) || null, groups: text(h["x-authentik-groups"]).split("|").filter(Boolean) };
}
const matches = (who, entries = []) => entries.some((e) =>
  e.includes("@") ? e.toLowerCase() === (who.email ?? "").toLowerCase() : who.groups.includes(e));
// A static site only reads: `read` (or `write`, which may also read), never `deny`.
function mayRead(who) {
  if (!SSO || Object.keys(RULES).length === 0) return true;
  if (!who.email || matches(who, RULES.deny)) return false;
  return RULES.read === undefined || matches(who, RULES.read) || matches(who, RULES.write);
}

createServer(async (req, res) => {
  const path = new URL(req.url, "http://app").pathname;
  if (path === "/healthz") return res.writeHead(200, HEADERS).end("ok");
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405, { ...HEADERS, Allow: "GET, HEAD" }).end();
  if (!mayRead(caller(req.headers))) {
    return res.writeHead(403, { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" })
      .end("You do not have access to this app. Ask its owners to add you.\n");
  }
  const dir = ["/fiori", "/fiori-people"].find((d) => path === d);
  if (dir) return res.writeHead(308, { ...HEADERS, Location: dir + "/" }).end();
  const file = path === "/fiori/" || path === "/fiori-people/" ? path + "index.html" : path;
  if (FIORI.has(file)) {
    const body = await readFile(join(import.meta.dirname, file)).catch(() => null);
    if (!body) return res.writeHead(500, HEADERS).end();
    res.writeHead(200, { ...FIORI_HEADERS, "Content-Type": `${TYPES[file.split(".").pop()]}; charset=utf-8`, "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  if (!Object.hasOwn(PAGES, path)) return res.writeHead(404, HEADERS).end();
  const page = await readFile(join(import.meta.dirname, PAGES[path])).catch(() => null);
  if (!page) return res.writeHead(500, HEADERS).end();
  res.writeHead(200, { ...HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(req.method === "HEAD" ? undefined : page);
}).listen(Number(process.env.PORT ?? 8080), "0.0.0.0");
