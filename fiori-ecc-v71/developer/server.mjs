// Serves the one static page (index.html) on Canvas, with the platform's checks: who may open it
// (score.yaml's access, as PLATFORM_ACCESS), /healthz, and the security headers. No dependencies.
// It serves index.html, strategy.html, successfactors.html and goals-hub.html, and the Fiori (UI5) version of the
// Talent Suite under /fiori/ — the files found in fiori/ at start, and nothing else: no other file in this folder is reachable.
// The front page "/" is the Fiori AJMN People home (zajmn.hr.sucfac1.hk-v5) opening the Fiori Goals module (zajmn.hr.goals.hk-v17: goals at every level, no translation; v16 and v15 with it stays at /goals-module-v15, people table in model/Scenario.js); the plain HTML versions are /home.html and /goals.html (the 15 Nov prototype); goals-hub-v2.html stays at its own address; the original
// goals-hub.html stays at /goals-hub.html and the original Talent Suite page at /index.html, both unchanged.
// The two component projects (the AJMN People home and the Goals module, Web IDE layout) are served under /<id>/webapp/.
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { api, checkDisk } from "./api.mjs";
import { join } from "node:path";

const PAGES = { "/": "home.html", "/home.html": "home.html", "/goals.html": "goals.html", "/goals-hub-v2.html": "goals-hub-v2.html", "/index.html": "index.html", "/strategy.html": "strategy.html",
  "/successfactors.html": "successfactors.html", "/goals-hub.html": "goals-hub.html" };
// The Fiori app's own files, listed once at start: a request can only name one of these.
const TYPES = { html: "text/html", js: "text/javascript", json: "application/json", xml: "application/xml", css: "text/css" };
const FIORI = new Set(["fiori", "fiori-people"].flatMap((dir) => readdirSync(join(import.meta.dirname, dir), { recursive: true, withFileTypes: true })
  .filter((f) => f.isFile() && f.name.split(".").pop() in TYPES)
  .map((f) => "/" + join(f.parentPath, f.name).slice(import.meta.dirname.length + 1).split("\\").join("/"))));
// The two component projects: /<id>/webapp/... comes from <folder>/webapp/. Their start page is built below (the project's
// own index.html is the Web IDE one, which needs a Web IDE runtime), loading SAPUI5 from ui5.sap.com like the Fiori pages do.
const PROJECTS = [
  { url: "zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v2" },
  { url: "zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk" },
  // the same two projects in the Al Jazeera theme, beside the plain ones; their links to each other stay inside /aj/
  { url: "aj/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v3" },
  { url: "aj/zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v2" },
  // the latest goals prototype (version 4, its own navy and gold look), with the Al Jazeera themed home page
  { url: "latest-v9/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v9" },
  { url: "latest-v8/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v8" },
  { url: "latest-v7/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v7" },
  { url: "latest-v6/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v6" },
  { url: "latest-v5/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v5" },
  { url: "latest/zajmn.hr.sucfac1.hk", id: "zajmn.hr.sucfac1.hk", folder: "zajmn.hr.sucfac1.hk-v10" },
  { url: "goals-module-v5", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v5", home: "/" },
  { url: "goals-module-v6", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v6", home: "/" },
  { url: "goals-module-v7", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v7", home: "/" },
  { url: "goals-module-v8", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v8", home: "/" },
  { url: "goals-module-v9", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v9", home: "/" },
  { url: "goals-module-v13", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v13", home: "/" },
  { url: "goals-module-v14", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v14", home: "/" },
  { url: "goals-module-v15", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v15", home: "/" },
  { url: "goals-module-v16", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v16", home: "/" },
  { url: "goals-module-v17", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v17", home: "/" },
  { url: "goals-module-v18", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v18", home: "/" },
  { url: "goals-module-v19", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v19", home: "/" },
  { url: "goals-module-v20", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v20", home: "/" },
  { url: "goals-module-v21", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v21", home: "/" },
  { url: "goals-module-v22", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v22", home: "/" },
  { url: "goals-module-v23", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v23", home: "/" },
  { url: "goals-module-v24", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v24", home: "/" },
  { url: "goals-module-v25", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v25", home: "/" },
  { url: "goals-module-v26", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v26", home: "/" },
  { url: "goals-module-v27", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v27", home: "/" },
  { url: "goals-module-v28", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v28", home: "/" },
  { url: "goals-module-v29", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v29", home: "/" },
  { url: "goals-module-v30", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v30", home: "/" },
  { url: "goals-module-v31", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v31", home: "/" },
  { url: "goals-module-v32", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v32", home: "/" },
  { url: "goals-module-v33", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v33", home: "/" },
  { url: "goals-module-v34", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v34", home: "/" },
  { url: "goals-module-v35", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v35", home: "/" },
  { url: "goals-module-v36", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v36", home: "/" },
  { url: "goals-module-v37", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v37", home: "/" },
  { url: "goals-module-v38", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v38", home: "/" },
  { url: "goals-module-v39", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v39", home: "/" },
  { url: "goals-module-v40", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v40", home: "/" },
  { url: "goals-module-v41", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v41", home: "/" },
  { url: "goals-module-v42", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v42", home: "/" },
  { url: "goals-module-v43", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v43", home: "/" },
  { url: "goals-module-v44", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v44", home: "/" },
  { url: "goals-module-v45", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v45", home: "/" },
  { url: "goals-module-v46", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v46", home: "/" },
  { url: "goals-module-v47", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v47", home: "/" },
  { url: "goals-module-v48", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v48", home: "/" },
  { url: "goals-module-v49", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v49", home: "/" },
  { url: "goals-module-v50", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v50", home: "/" },
  { url: "goals-module-v51", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v51", home: "/" },
  { url: "goals-module-v52", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v52", home: "/" },
  { url: "goals-module-v53", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v53", home: "/" },
  { url: "goals-module-v54", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v54", home: "/" },
  { url: "goals-module-v55", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v55", home: "/" },
  { url: "goals-module-v56", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v56", home: "/" },
  { url: "goals-module-v57", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v57", home: "/" },
  { url: "goals-module-v58", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v58", home: "/" },
  { url: "goals-module-v59", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v59", home: "/" },
  { url: "goals-module-v60", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v60", home: "/" },
  { url: "goals-module-v61", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v61", home: "/" },
  { url: "goals-module-v62", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v62", home: "/" },
  // v63 (the process upgrade) was taken off the live link on 19 Nov 2026 at the owner's request; it stays here to look at
  { url: "goals-module-v63", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v63", home: "/" },
  // v64 = v62 with at most 5 suggestions per wizard step (AI first)
  { url: "goals-module-v64", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v64", home: "/" },
  // v65 = v64 with an easier My goals: suggestions in the empty box, attention box only when needed, Approvals count, slimmer banner
  // v66 = v65 with the review answers: Role, Parent and Due date steps filled in, one-screen push down, grouped approvals, DG dashboard by Executive Director, Owner badge
  { url: "goals-module-v66", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v66", home: "/" },
  // v67 = v66 with round 2 answers: calmer Team progress, Contributor tag, Director/ED wizard with Role step, lighter push down, Approve all asks, dashboard drill-down
  { url: "goals-module-v67", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v67", home: "/" },
  // v68 = v67 with round 3 answers: no tags on review rows, hover tips, lighter glow, drill-down Show more, searchable contributor picker, new push down
  { url: "goals-module-v68", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v68", home: "/" },
  // v69 = v68 with workflow round answers (in-app part): draft first, send checks, review rules, reminders
  { url: "goals-module-v69", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v69", home: "/" },
  // v70 = v69 with the new Alignment cascade (cards, tags, dashed contributors, details popup, team performance)
  { url: "goals-module-v70", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v70", home: "/" },
  // v71 = v70 with the ownership rule: the Director General's goals are the strategy (no separate column); Owner only on goals an owner holds; team goals carry no tag
  { url: "goals-module-v71", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v71", home: "/" },
  { url: "goals-module-v65", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v65", home: "/" },
  { url: "latest/zajmn.hr.goals.hk", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v70" },
  // the latest goals prototype as opened from the home page "/": its link back goes to "/", not to the UI5 home project
  { url: "goals-module", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v70", home: "/" },
  // the previous goals prototype (version 3), still reachable
  { url: "goals-module-v3", id: "zajmn.hr.goals.hk", folder: "zajmn.hr.goals.hk-v3", home: "/" }];
const TITLES = { "zajmn.hr.sucfac1.hk": ["AJMN People", "#F4F7FB"], "zajmn.hr.goals.hk": ["Goals 2027", "#FFFFFF"] };
const PTYPES = { ...TYPES, properties: "text/plain", ttf: "font/ttf", woff2: "font/woff2" };
const PROJECT_FILES = new Set(PROJECTS.flatMap(({ url, folder }) => {
  const base = join(import.meta.dirname, folder, "webapp");
  return readdirSync(base, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split(".").pop() in PTYPES)
    .map((f) => "/" + url + "/webapp/" + join(f.parentPath, f.name).slice(base.length + 1).split("\\").join("/"));
}));
// The start page of each app. Besides loading SAPUI5 it paints a loading screen at once (top bar, menu and a skeleton of the page, in the
// same colours as the app), so there is no blank page while the app is fetched; the app removes it when it is drawn (id="boot").
const SKELETON_CSS = `html,body{margin:0;height:100%;background:#CBD9E8}
#boot{position:fixed;inset:0;z-index:1000;background:#CBD9E8;display:flex;flex-direction:column;font-family:system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;transition:opacity .35s ease}
#boot.done{opacity:0;pointer-events:none}
#boot .bt{height:44px;background:#14264B;display:flex;align-items:center;padding:0 18px;color:#fff;font-weight:800;font-size:15px;gap:14px;flex-shrink:0}
#boot .bt i{display:block;width:20px;height:2px;background:#fff;box-shadow:0 6px #fff,0 -6px #fff}
#boot .gn{height:46px;background:#1B3366;flex-shrink:0;display:flex;align-items:center;padding:0 18px;color:#fff;font-weight:900;font-size:17px}
#boot .bd{flex:1;display:flex;min-height:0}
#boot .sd{width:210px;background:#14264B;padding:18px 14px;flex-shrink:0;box-sizing:border-box;color:#F3DC9A;font-weight:900;font-size:20px}
#boot .sd u{display:block;height:11px;border-radius:6px;background:#2B3F78;margin:20px 8px 0;text-decoration:none}
#boot .pn{flex:1;display:flex;justify-content:center}
#boot .pp{width:min(900px,100%);background:#F6F7FB;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}
#boot .sk{border-radius:4px;background:linear-gradient(90deg,#E8ECF4 25%,#F6F7FB 50%,#E8ECF4 75%);background-size:200% 100%;animation:bsh 1.2s ease-in-out infinite}
@keyframes bsh{from{background-position:200% 0}to{background-position:-200% 0}}
#boot .bar{position:absolute;left:0;top:0;height:3px;width:0;background:linear-gradient(90deg,#F3DC9A,#C99A2E);animation:bld 2.4s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes bld{from{width:0}to{width:90%}}
@media(max-width:900px){#boot .sd{display:none}}
@media(prefers-reduced-motion:reduce){#boot .sk,#boot .bar{animation:none}}`;
const bootPage = ({ id }) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLES[id][0]}</title><style>${SKELETON_CSS}</style>
<link rel="preconnect" href="https://ui5.sap.com" crossorigin>
<link rel="preload" href="./fonts/AlJazeeraBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="./fonts/AlJazeeraHeavy.woff2" as="font" type="font/woff2" crossorigin>
<script id="sap-ui-bootstrap" src="https://ui5.sap.com/1.144.1/resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"
  data-sap-ui-async="true" data-sap-ui-resource-roots='{"${id}": "./"}' data-sap-ui-on-init="module:sap/ui/core/ComponentSupport"></script>
</head><body><div id="boot" aria-hidden="true"><div class="bar"></div><div class="bt"><i></i>AJMN Home</div>${id === "zajmn.hr.goals.hk" ? '<div class="gn">Goals <span style="color:#F3DC9A;margin-left:6px">2027</span></div>' : ""}
<div class="bd"><div class="sd">AJMN<u></u><u></u><u></u><u></u><u></u><u></u><u></u></div><div class="pn"><div class="pp"><div class="sk" style="height:34px"></div><div class="sk" style="height:120px"></div><div class="sk" style="height:34px;width:60%"></div><div class="sk" style="height:90px"></div><div class="sk" style="height:90px"></div></div></div></div></div>
<div data-sap-ui-component data-name="${id}" data-id="container" data-settings='{"id": "app"}'></div></body></html>`;
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

const PROJECT_HEADERS = { ...FIORI_HEADERS, "Content-Security-Policy": `default-src 'self'; script-src 'self' ${UI5}; ` +
  `style-src 'self' 'unsafe-inline' ${UI5} https://fonts.googleapis.com; font-src 'self' data: ${UI5} https://fonts.gstatic.com; ` +
  `img-src 'self' data: ${UI5}; connect-src 'self' ${UI5}; frame-ancestors 'none'` };

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
  const who = caller(req.headers);
  if (!mayRead(who)) {
    return res.writeHead(403, { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" })
      .end("You do not have access to this app. Ask its owners to add you.\n");
  }
  if (await api(req, res, path, who, HEADERS)) return;
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405, { ...HEADERS, Allow: "GET, HEAD" }).end();
  // the front page is the Fiori (UI5) AJMN People home; the plain HTML home stays at /home.html
  if (path === "/") return res.writeHead(308, { ...HEADERS, Location: "/latest/zajmn.hr.sucfac1.hk/webapp/index.html" }).end();
  const proj = PROJECTS.find((p) => path === "/" + p.url || path === "/" + p.url + "/");
  if (proj) return res.writeHead(308, { ...HEADERS, Location: `/${proj.url}/webapp/index.html` }).end();
  const boot = PROJECTS.find((p) => path === `/${p.url}/webapp/index.html`);
  if (boot) {
    res.writeHead(200, { ...PROJECT_HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : bootPage(boot));
  }
  // UI5 asks for an optional preload bundle and for translation files of the visitor's language (i18n_en_US, i18n_en, i18n_ar...).
  // This demo has neither, so answer with an empty bundle and the base texts instead of a 404 that fills the console with errors.
  const opt = !PROJECT_FILES.has(path) && path.match(/^(\/.+?\/webapp)\/(Component-preload\.js|i18n\/i18n_[A-Za-z_]+\.properties)$/);
  const optProj = opt && PROJECTS.filter((x) => path.startsWith(`/${x.url}/webapp/`)).sort((x, y) => y.url.length - x.url.length)[0];
  if (optProj) {
    const isJs = opt[2].endsWith(".js");
    const body = isJs ? "sap.ui.require.preload({});" : await readFile(join(import.meta.dirname, optProj.folder, "webapp/i18n/i18n.properties")).catch(() => "");
    res.writeHead(200, { ...PROJECT_HEADERS, "Content-Type": isJs ? "text/javascript; charset=utf-8" : "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  if (PROJECT_FILES.has(path)) {
    const p = PROJECTS.find((x) => path.startsWith(`/${x.url}/webapp/`));
    const body = await readFile(join(import.meta.dirname, p.folder, path.slice(p.url.length + 2))).catch(() => null);
    if (!body) return res.writeHead(500, HEADERS).end();
    let out = body;
    if (p.home && path.endsWith("/webapp/manifest.json")) {
      const m = JSON.parse(body);
      m["sap.ui5"].config.nav.home.url = p.home;
      out = JSON.stringify(m);
    }
    const isFont = /\.(ttf|woff2)$/.test(path), etag = `W/"${createHash("sha1").update(out).digest("base64url").slice(0, 20)}"`;
    const head = { ...PROJECT_HEADERS, "Content-Type": isFont ? PTYPES[path.split(".").pop()] : `${PTYPES[path.split(".").pop()]}; charset=utf-8`, "Cache-Control": isFont ? "public, max-age=86400" : "no-cache", ETag: etag };
    if (req.headers["if-none-match"] === etag) { return res.writeHead(304, head).end(); }
    res.writeHead(200, head);
    return res.end(req.method === "HEAD" ? undefined : out);
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
checkDisk();
