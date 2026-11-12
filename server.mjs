// Serves the one static page (index.html) on Canvas, with the platform's checks: who may open it
// (score.yaml's access, as PLATFORM_ACCESS), /healthz, and the security headers. No dependencies.
// It serves index.html, strategy.html, successfactors.html and goals-hub.html and nothing else: no other file in this folder is reachable.
// The front page "/" is AJMN People (goals-hub.html); the original Talent Suite page stays at /index.html, unchanged.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";

const PAGES = { "/": "goals-hub.html", "/index.html": "index.html", "/strategy.html": "strategy.html",
  "/successfactors.html": "successfactors.html", "/goals-hub.html": "goals-hub.html" };
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
  if (!Object.hasOwn(PAGES, path)) return res.writeHead(404, HEADERS).end();
  const page = await readFile(join(import.meta.dirname, PAGES[path])).catch(() => null);
  if (!page) return res.writeHead(500, HEADERS).end();
  res.writeHead(200, { ...HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(req.method === "HEAD" ? undefined : page);
}).listen(Number(process.env.PORT ?? 8080), "0.0.0.0");
