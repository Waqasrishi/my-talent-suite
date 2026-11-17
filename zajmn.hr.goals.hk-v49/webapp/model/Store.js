// Keeps the goals in the database (/api). Every goal and activity gets its own id from the database and belongs to an employee id.
// load() fetches everything; queue() saves whatever changed, a moment after each change. If the API is down the app keeps
// working in memory and says so.
sap.ui.define([], function () {
	var BASE = "/api", frozen = false, pool = [], fallback = 900000000, saved = new Map(), timer = null, busy = false, offline = false, pill = null, hideT = null;
	var OWN = ["id", "owner", "title", "desc", "measure", "due", "weight", "own", "status", "statusText", "parent", "from", "updates", "pushed", "contribs", "audit"];

	function api(method, path, body, ms) {
		var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, ms || 8000);
		return fetch(BASE + path, { method: method, credentials: "same-origin", signal: ctl.signal,
			headers: body === undefined ? {} : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) })
			.then(function (r) { clearTimeout(t); if (!r.ok) { throw new Error("HTTP " + r.status); } return r.json(); })
			.catch(function (e) { clearTimeout(t); throw e; });
	}
	function say(text, kind, sticky) {
		if (!pill) { return; }
		pill.textContent = text; pill.className = "syncpill show " + (kind || "");
		clearTimeout(hideT);
		if (!sticky) { hideT = setTimeout(function () { pill.className = "syncpill"; }, 1800); }
	}
	function nid() {
		if (pool.length < 25) { api("GET", "/ids?n=100").then(function (d) { pool = pool.concat(d.ids); }).catch(function () {}); }
		return pool.length ? pool.shift() : fallback++;
	}

	return {
		nid: nid,
		isOffline: function () { return offline; },
		install: function (root) { pill = document.createElement("div"); pill.className = "syncpill"; pill.setAttribute("role", "status"); pill.setAttribute("aria-live", "polite"); root.appendChild(pill); },
		// people: the scenario's PEOPLE. Returns {goals: [...]} or null when the database cannot be reached.
		load: function (people) {
			var rows = people.map(function (p) { return { id: p.id, label: p.label, lv: p.lv, boss: p.boss || null, note: p.note || "" }; });
			return api("PUT", "/employees", rows, 6000).then(function () { return api("GET", "/state", undefined, 8000); })
				.then(function (d) { pool = d.ids.slice(); offline = false; return d; })
				.catch(function () { offline = true; return null; });
		},
		remember: function (id, json) { saved.set(id, json); },
		// goals: [[goal, employeeId], ...] already turned into API bodies by the caller: [[id, body, json], ...]
		queue: function (collect) {
			if (frozen) { return; }
			clearTimeout(timer);
			timer = setTimeout(function run() {
				if (busy) { timer = setTimeout(run, 300); return; }
				var todo = collect().filter(function (x) { return saved.get(x[0]) !== x[2]; });
				if (!todo.length) { return; }
				busy = true; say("Saving…", "", true);
				var chain = Promise.resolve();
				todo.forEach(function (x) {
					chain = chain.then(function () { return api("PUT", "/goals/" + x[0], x[1]).then(function () { saved.set(x[0], x[2]); }); });
				});
				chain.then(function () { busy = false; offline = false; say("Saved to the database", "ok"); })
					.catch(function () { busy = false; offline = true; say("Not saved. Retrying…", "bad", true); clearTimeout(timer); timer = setTimeout(run, 5000); });
			}, 400);
		},
		// one file to the app's disk: resolves {id, name, size}
		// one file to the app's disk, in 512 KB pieces, each piece retried alone: resolves {id, name, size}
		upload: function (file) {
			function send(method, path, body, ctype) {
				function once() {
					return fetch(BASE + path, { method: method, credentials: "same-origin", headers: ctype ? { "Content-Type": ctype } : {}, body: body })
						.then(function (r) {
							if (!r.ok) { var e = new Error("HTTP " + r.status); e.status = r.status; return r.json().catch(function () { return {}; }).then(function (b) { if (b.error) { e.message = b.error; } throw e; }); }
							return r.json();
						});
				}
				function go(n) {
					return once().catch(function (e) {
						if (n < 4 && (e.status === 502 || e.status === 503 || e.status === 504 || !e.status)) { return new Promise(function (ok) { setTimeout(ok, 1200 * (n + 1)); }).then(function () { return go(n + 1); }); }
						throw e;
					});
				}
				return go(0);
			}
			return send("POST", "/files/start?name=" + encodeURIComponent(file.name) + "&size=" + file.size + "&type=" + encodeURIComponent(file.type || ""))
				.then(function (st) {
					var n = Math.max(1, Math.ceil(file.size / st.chunk)), chain = Promise.resolve();
					for (var k = 0; k < n; k++) { (function (k) { chain = chain.then(function () { return send("PUT", "/files/" + st.id + "/chunk?n=" + k, file.slice(k * st.chunk, (k + 1) * st.chunk), "application/octet-stream"); }); })(k); }
					return chain.then(function () { return send("POST", "/files/" + st.id + "/finish", ""); });
				});
		},
		ai: function (task, context, employeeId) { return api("POST", "/ai", { task: task, context: context, employeeId: employeeId }, 35000); },
		aiAccept: function (id, text) { return api("POST", "/ai/" + id + "/accept", { text: text }).catch(function () {}); },
		log: function () { return api("GET", "/log?limit=400"); },
		// wipe the scenario. Saving stops first, so a save that was already waiting cannot put the data back.
		reset: function () {
			frozen = true; clearTimeout(timer);
			return api("POST", "/reset", {}, 20000).then(function (r) { saved.clear(); return r; }).catch(function (e) { frozen = false; throw e; });
		},
		OWN: OWN
	};
});
