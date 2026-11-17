// The goals data layer for SAP: talks to the Gateway OData V2 service ZAJMN_GOALS_SRV on ECC.
// Same interface as the Canvas version (load, queue, nid, upload, log, reset), so Goals.js does not change.
// Employee ids are personnel numbers (PERNR): the scenario's short ids are translated on the way out and back.
// NOT yet run against a real Gateway: see ../../ecc/README.md, section "First test".
sap.ui.define([], function () {
	"use strict";
	var CFG = window.AJMN_CONFIG || {};
	var SERVICE = (CFG.serviceUrl || "/sap/opu/odata/sap/ZAJMN_GOALS_SRV").replace(/\/$/, "");
	var pool = [], fallback = 900000000, saved = new Map(), timer = null, busy = false, offline = false, pill = null, hideT = null, csrf = null;
	var toPernr = {}, toId = {};
	var OWN = ["id", "owner", "title", "desc", "measure", "due", "weight", "own", "status", "statusText", "parent", "from", "updates", "pushed", "contribs", "audit"];

	// ---- plumbing: JSON OData V2 with the CSRF token ----
	function token() {
		if (csrf) { return Promise.resolve(csrf); }
		return fetch(SERVICE + "/", { headers: { "X-CSRF-Token": "Fetch", "Accept": "application/json" }, credentials: "same-origin" })
			.then(function (r) { csrf = r.headers.get("x-csrf-token"); return csrf; });
	}
	function call(method, path, body, ms) {
		var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, ms || 15000);
		function go(tok) {
			var h = { "Accept": "application/json" };
			if (body !== undefined) { h["Content-Type"] = "application/json"; }
			if (method !== "GET") { h["X-CSRF-Token"] = tok; }
			return fetch(SERVICE + path, { method: method, headers: h, credentials: "same-origin", signal: ctl.signal, body: body === undefined ? undefined : JSON.stringify(body) });
		}
		return (method === "GET" ? Promise.resolve(null) : token()).then(go).then(function (r) {
			if (r.status === 403 && method !== "GET") { csrf = null; return token().then(go); }   // the token expired: fetch a new one once
			return r;
		}).then(function (r) {
			clearTimeout(t);
			if (!r.ok) { throw new Error("HTTP " + r.status); }
			return r.status === 204 ? {} : r.json().then(function (j) { return j.d || j; });
		}).catch(function (e) { clearTimeout(t); throw e; });
	}
	var results = function (x) { return x && x.results ? x.results : (x || []); };
	var pn = function (id) { return id == null ? null : (toPernr[id] || id); };
	var pi = function (pernr) { return pernr == null ? null : (toId[pernr] || pernr); };

	// ---- API body (what Goals.js builds) <-> Gateway entity ----
	function toGateway(b) {
		return {
			GoalId: String(b.id), Pernr: pn(b.employeeId), Title: b.title, Description: b.desc, Measure: b.measure, DueText: b.due,
			Weight: b.weight, Progress: b.own, Status: b.status, StatusText: b.statusText, ParentTitle: b.parent,
			PushedFromGoal: b.from ? String(b.from.gid) : "", PushedFromPernr: b.from ? pn(b.from.employeeId) : "", Extra: JSON.stringify(b.extra || {}),
			Activities: b.updates.map(function (u, i) { return { GoalId: String(b.id), ActId: String(u.id), Progress: u.p, Note: u.n, HasNote: !!u.a, DoneText: u.d, Position: i, Files: JSON.stringify(u.files || []) }; }),
			Pushes: b.pushed.map(function (p, i) { return { GoalId: String(b.id), ToPernr: pn(p.employeeId), Progress: p.p, Note: p.n, DueText: p.due, UpdatedText: p.d, Position: i }; }),
			Contributors: b.contribs.map(function (c, i) { return { GoalId: String(b.id), Position: i, Pernr: pn(c.employeeId), Data: JSON.stringify(c) }; }),
			Log: b.audit.map(function (a, i) { return { GoalId: String(b.id), Position: i, ActorPernr: pn(a.actor), Action: a.action, Text: a.t, DateText: a.d, Detail: JSON.stringify(a.detail || {}), OccurredAt: a.ts }; })
		};
	}
	function fromGateway(g) {
		var parse = function (s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };
		return {
			id: +g.GoalId, code: "G-" + String(g.GoalId).padStart(6, "0"), employeeId: pi(g.Pernr), title: g.Title, desc: g.Description, measure: g.Measure, due: g.DueText,
			weight: g.Weight === null || g.Weight === undefined || g.Weight < 0 ? null : +g.Weight, own: +g.Progress, status: g.Status, statusText: g.StatusText, parent: g.ParentTitle,
			from: g.PushedFromGoal && +g.PushedFromGoal ? { gid: +g.PushedFromGoal, employeeId: pi(g.PushedFromPernr) } : null, extra: parse(g.Extra, {}),
			updates: results(g.Activities).sort(function (a, b) { return a.Position - b.Position; }).map(function (u) { return { id: +u.ActId, d: u.DoneText, n: u.Note, p: +u.Progress, a: u.HasNote ? 1 : 0, files: parse(u.Files, []) }; }),
			pushed: results(g.Pushes).sort(function (a, b) { return a.Position - b.Position; }).map(function (p) { return { employeeId: pi(p.ToPernr), p: +p.Progress, d: p.UpdatedText, n: p.Note, due: p.DueText }; }),
			contribs: results(g.Contributors).sort(function (a, b) { return a.Position - b.Position; }).map(function (c) { return parse(c.Data, {}); }),
			audit: results(g.Log).sort(function (a, b) { return a.Position - b.Position; }).map(function (a) { return { d: a.DateText, t: a.Text, ts: a.OccurredAt, actor: pi(a.ActorPernr), action: a.Action, detail: parse(a.Detail, {}) }; })
		};
	}

	function say(text, kind, sticky) {
		if (!pill) { return; }
		pill.textContent = text; pill.className = "syncpill show " + (kind || "");
		clearTimeout(hideT);
		if (!sticky) { hideT = setTimeout(function () { pill.className = "syncpill"; }, 1800); }
	}
	// Ids come from the ECC number range (function import GetIds), never from the browser.
	function nid() {
		if (pool.length < 25) { call("GET", "/GetIds?count=100").then(function (d) { var v = d.GetIds || d; pool = pool.concat(results(v).map(function (x) { return +(x.Id || x); })); }).catch(function () {}); }
		return pool.length ? pool.shift() : fallback++;
	}

	return {
		nid: nid, OWN: OWN,
		isOffline: function () { return offline; },
		install: function (root) { pill = document.createElement("div"); pill.className = "syncpill"; pill.setAttribute("role", "status"); pill.setAttribute("aria-live", "polite"); root.appendChild(pill); },
		// people: the scenario's PEOPLE, each with a pernr. Employees are NOT copied into ECC: they already exist (PA0001, HRP1001).
		load: function (people) {
			people.forEach(function (p) { if (p.pernr) { toPernr[p.id] = p.pernr; toId[p.pernr] = p.id; } });
			return Promise.all([call("GET", "/Goals?$expand=Activities,Pushes,Contributors,Log&$format=json"), call("GET", "/GetIds?count=100")])
				.then(function (x) {
					var ids = results(x[1].GetIds || x[1]).map(function (v) { return +(v.Id || v); });
					pool = ids.slice(); offline = false;
					return { goals: results(x[0]).map(fromGateway), ids: ids, ai: !!CFG.aiUrl };
				}).catch(function () { offline = true; return null; });
		},
		remember: function (id, json) { saved.set(id, json); },
		queue: function (collect) {
			clearTimeout(timer);
			timer = setTimeout(function run() {
				if (busy) { timer = setTimeout(run, 300); return; }
				var todo = collect().filter(function (x) { return saved.get(x[0]) !== x[2]; });
				if (!todo.length) { return; }
				busy = true; say("Saving…", "", true);
				var chain = Promise.resolve();
				todo.forEach(function (x) { chain = chain.then(function () { return call("POST", "/Goals", toGateway(x[1])).then(function () { saved.set(x[0], x[2]); }); }); });
				chain.then(function () { busy = false; offline = false; say("Saved", "ok"); })
					.catch(function () { busy = false; offline = true; say("Not saved. Retrying…", "bad", true); clearTimeout(timer); timer = setTimeout(run, 5000); });
			}, 400);
		},
		// attachments go to the content store through the media stream of entity set Attachments
		upload: function (file) {
			return token().then(function (tok) {
				return fetch(SERVICE + "/Attachments", { method: "POST", credentials: "same-origin", headers: { "X-CSRF-Token": tok, "Slug": encodeURIComponent(file.name), "Content-Type": file.type || "application/octet-stream", "Accept": "application/json" }, body: file });
			}).then(function (r) { if (!r.ok) { throw new Error("HTTP " + r.status); } return r.json(); })
				.then(function (j) { var d = j.d || j; return { id: +d.AttId, name: d.FileName, size: +d.FileSize }; });
		},
		// the AI is not on ECC. It stays the company model behind the Canvas app (ai.mjs); point aiUrl at it, for example through a BTP destination.
		ai: function (task, context, employeeId) {
			if (!CFG.aiUrl) { return Promise.reject(new Error("AI is not connected")); }
			return fetch(CFG.aiUrl.replace(/\/$/, "") + "/ai", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: task, context: context, employeeId: employeeId }) })
				.then(function (r) { if (!r.ok) { throw new Error("HTTP " + r.status); } return r.json(); });
		},
		aiAccept: function () { return Promise.resolve(); },
		fileUrl: function (id) { return SERVICE + "/Attachments('" + id + "')/$value"; },
		log: function () {
			return call("GET", "/WorkflowLog?$orderby=OccurredAt desc&$top=400&$format=json").then(function (d) {
				return { log: results(d).map(function (r) { return { id: +r.LogId, at: r.OccurredAt, action: r.Action, entry: r.Text, goalCode: "G-" + String(r.GoalId).padStart(6, "0"), goalTitle: r.GoalTitle || "", actorId: pi(r.ActorPernr), actor: r.ActorName || pi(r.ActorPernr) }; }) };
			});
		},
		reset: function () { return Promise.reject(new Error("Reset is not available against ECC.")); }
	};
});
