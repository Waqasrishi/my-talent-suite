// Keeps the goals in the database (/api). Every goal and activity gets its own id from the database and belongs to an employee id.
// load() fetches everything; queue() saves whatever changed, a moment after each change. If the API is down the app keeps
// working in memory and says so.
sap.ui.define([], function () {
	var BASE = "/api", pool = [], fallback = 900000000, saved = new Map(), timer = null, busy = false, offline = false, pill = null, hideT = null;
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
		upload: function (file) {
			return fetch(BASE + "/files?name=" + encodeURIComponent(file.name), { method: "POST", credentials: "same-origin", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file })
				.then(function (r) { if (!r.ok) { return r.json().catch(function () { return {}; }).then(function (e) { throw new Error(e.error || "HTTP " + r.status); }); } return r.json(); });
		},
		log: function () { return api("GET", "/log?limit=400"); },
		reset: function () { return api("POST", "/reset", {}).then(function () { saved.clear(); }); },
		OWN: OWN
	};
});
