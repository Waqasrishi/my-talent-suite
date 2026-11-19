// Goals 2027 process, v63 (the "Goals 2027 Process Upgrade" recommendations, 19 Nov 2026):
//  - review the plan, not each goal: people build 3-5 goals (saved at once) and press "Send my goals" once; the manager agrees the plan
//  - a pushed-down copy the person does not change is agreed at once; only material changes (title, target, due date, weight +-10) are re-reviewed
//  - new goal in 3 steps with a real measure (From / To / Unit / By); parent and weight suggested
//  - one monthly check-in ("Update all") with actual values; a leader's goal rolls up from its pushed copies
//  - nothing waits forever: reminder on day 3, on day 6 it moves one level up; absence routes up at once; window close = agreed by default
//  - the year has windows (cascade waves, lock, mid-year reopen) and nine rules HR owns (Cycle screen), not developers
//  - roles: My team for leaders, Org view for the DG, HR cockpit for HR, Cycle for the HR admin
// Goals.js gives this module what it needs (G); this module owns the screens and rules above.
sap.ui.define([], function () {
	"use strict";
	const MS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	// the nine rules and the windows, for goal year 2027 (ZAJMN_CYCLE in ECC)
	const DEF = {
		year: 2027, minGoals: 3, maxGoals: 5, totalWeight: 100, minWeight: 10,
		open: "2026-12-01", waves: { dg: "2026-12-07", ed: "2026-12-21", dir: "2027-01-15", mgr: "2027-01-15", sh: "2027-01-31", emp: "2027-01-31" },
		lock: "2027-01-31", midFrom: "2027-07-01", midTo: "2027-07-14", yearEnd: "2027-12-31",
		reviewDays: 5, remindDay: 3, escalateDay: 6, materialWeight: 10, absenceDays: 5, inviteDays: 14, dueReminders: [30, 7],
		state: "auto", closedAt: "", dgEndorsed: "", demoDays: 0, absent: {}
	};
	const KEY = "ajmn.goals.cycle.2027";
	// the server keeps the rules for everyone once the goal_cycle table and /api/cycle are added (awaiting the owner's yes); until then this browser does
	const SERVER_CYCLE = false;
	const TXT = { draft: "Draft", sent: "Sent for review", returned: "Returned for changes", change: "Change to review" };
	const LVN = { dg: "Director General", ed: "Executive Director", dir: "Director", mgr: "Manager", sh: "Section Head", emp: "Employee", hr: "HR", hra: "HR Admin" };

	function make(G) {
		const esc = G.esc, $ = G.$, ROOT = G.ROOT;
		let C = JSON.parse(JSON.stringify(DEF)), HIST = [], SHARED = false, open = new Set(), retFor = null, retErr = "", hrSort = "area";

		// ---------- dates (the demo clock can be moved forward on the Cycle screen) ----------
		const pd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
		const fd = d => d ? d.getDate() + " " + MS[d.getMonth()] + " " + d.getFullYear() : "";
		const fds = s => fd(pd(s));
		const day0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
		const now = () => { const t = day0(new Date()); t.setDate(t.getDate() + (+C.demoDays || 0)); return t; };
		const nowTs = () => new Date(Date.now() + (+C.demoDays || 0) * 864e5).toISOString();
		const isoD = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
		// working days from a time stamp to today (Sunday to Thursday; the factory calendar in ECC)
		function wdays(ts) {
			if (!ts) { return 0; }
			const d = day0(new Date(ts)), e = now(); let n = 0;
			for (let i = 0; d < e && i < 800; i++) { const w = d.getDay(); if (w !== 5 && w !== 6) { n++; } d.setDate(d.getDate() + 1); }
			return n;
		}
		const cdays = ts => ts ? Math.floor((now() - day0(new Date(ts))) / 864e5) : 0;

		// ---------- the cycle: the server's goal_cycle table when there is one, else this browser ----------
		function loadCycle() {
			try { const s = localStorage.getItem(KEY); if (s) { const o = JSON.parse(s); C = Object.assign(JSON.parse(JSON.stringify(DEF)), o.data || {}); HIST = o.history || []; } } catch (e) { /* private window */ }
			if (!SERVER_CYCLE) { return Promise.resolve(); }
			return fetch("/api/cycle?year=" + DEF.year, { credentials: "same-origin" }).then(r => r.ok ? r.json() : null)
				.then(d => { if (d && d.data) { C = Object.assign(JSON.parse(JSON.stringify(DEF)), d.data); HIST = d.history || []; SHARED = true; } })
				.catch(() => {});
		}
		function saveCycle(what) {
			HIST.unshift({ at: new Date().toISOString(), by: G.me().id, what: what });
			HIST = HIST.slice(0, 50);
			try { localStorage.setItem(KEY, JSON.stringify({ data: C, history: HIST })); } catch (e) { /* private window */ }
			if (!SERVER_CYCLE) { return Promise.resolve(); }
			return fetch("/api/cycle?year=" + DEF.year, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: C, actor: G.me().id, what: what }) })
				.then(r => { SHARED = r.ok; }).catch(() => { SHARED = false; });
		}
		const ready = loadCycle();

		// ---------- the year ----------
		function phase() {
			const t = now(), mf = pd(C.midFrom), mt = pd(C.midTo), ye = pd(C.yearEnd);
			if (C.state === "open") { return "setting"; }
			if (mf && mt && t >= mf && t <= mt) { return "mid"; }
			if (C.state === "closed") { return ye && t > ye ? "close" : "run"; }
			if (t < pd(C.open)) { return "before"; }
			if (t <= pd(C.lock)) { return "setting"; }
			if (ye && t > ye) { return "close"; }
			return "run";
		}
		const locked = () => { const p = phase(); return p === "run" || p === "close"; };
		const waveOf = p => pd((C.waves || {})[p.lv]);
		const isHR = p => p && (p.lv === "hr" || p.lv === "hra");
		const STAFF = () => G.PEOPLE.filter(p => !isHR(p));
		const nm = p => p ? G.nameOf(p) : "";
		const first = p => p ? (/^(Director|Manager|Section head)\b/.test(p.label) ? p.label : p.label.split(",")[0]) : "";
		const you = () => "You, " + G.me().label;
		const ownerOf = g => G.pByLabel(g.owner);
		const isTop = g => { const o = ownerOf(g); return !!o && !o.boss; };

		// ---------- measures: From / To / Unit / By, or milestones, or done / not done ----------
		const num = v => { const n = +String(v).replace(/,/g, ""); return String(v).trim() !== "" && isFinite(n) ? n : null; };
		const fmtN = n => Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
		function mText(m, due) {
			if (!m) { return ""; }
			const by = due ? " by " + due : "";
			if (m.kind === "num") { return "From " + fmtN(m.from) + " to " + fmtN(m.to) + " " + m.unit + by; }
			if (m.kind === "ms") { return m.n + " milestone" + (m.n > 1 ? "s" : "") + by; }
			return "Done" + by;
		}
		function mParse(t) {
			const x = /from\s+(-?[\d.,]+)\s*([^\s\d][^]*?)?\s+to\s+(-?[\d.,]+)\s*(.*?)(?:\s+by\s+(.+?))?\.?$/i.exec(String(t || ""));
			if (!x) { return null; }
			const f = num(x[1]), to = num(x[3]), unit = (x[4] || x[2] || "").trim();
			return f === null || to === null || f === to || !unit ? null : { kind: "num", from: f, to: to, unit: unit };
		}
		const measured = g => { const m = g.m; return !!m && (m.kind === "num" ? m.from !== m.to && !!m.unit : m.kind === "ms" ? m.n >= 1 : m.kind === "done") && !!G.Datepicker.parse(g.due); };
		function pctOf(m, own) {
			if (!m) { return own || 0; }
			if (m.kind === "num") { if (m.actual === undefined || m.actual === null || m.actual === "") { return own || 0; } return Math.max(0, Math.min(100, Math.round((m.actual - m.from) / (m.to - m.from) * 100))); }
			if (m.kind === "ms") { return Math.round(100 * Math.min(m.n, m.done || 0) / m.n); }
			return m.done ? 100 : 0;
		}
		function actualText(g) {
			const m = g.m; if (!m) { return ""; }
			if (m.kind === "num") { return m.actual === undefined || m.actual === null || m.actual === "" ? "No actual value yet" : "Actual " + fmtN(m.actual) + " " + m.unit + " (target " + fmtN(m.to) + ")"; }
			if (m.kind === "ms") { return (m.done || 0) + " of " + m.n + " milestones done"; }
			return m.done ? "Done" : "Not done yet";
		}

		// ---------- the plan: the status of each goal, and of a person's whole plan ----------
		function setPlan(g, st) {
			g.plan = st;
			g.status = st === "agreed" ? "ok" : st === "draft" ? "neu" : "att";
			g.statusText = st === "agreed" ? (isTop(g) ? "Published" : "Agreed") : TXT[st];
		}
		function planOf(p) {
			const gs = G.STORE[p.id] || [], by = s => gs.filter(g => g.plan === s);
			const sent = by("sent"), ret = by("returned"), dr = by("draft"), ch = by("change"), nr = gs.filter(g => g.notRel), dl = gs.filter(g => g.delReq);
			const st = !gs.length ? "none" : sent.length ? "sent" : ret.length ? "returned" : dr.length ? "draft" : "agreed";
			const since = [].concat(sent.map(g => g.sentAt), ch.map(g => g.changeAt), nr.map(g => g.notRel.at), dl.map(g => g.delReq.at)).filter(Boolean).sort()[0] || null;
			return { p, gs, st, sent, ret, dr, ch, nr, dl, since, pending: sent.length + ch.length + nr.length + dl.length,
				weight: gs.reduce((t, g) => t + (+g.weight || 0), 0), avg: gs.length ? Math.round(gs.reduce((t, g) => t + (g.own || 0), 0) / gs.length) : 0 };
		}
		function checks(p) {
			const gs = G.STORE[p.id] || [], top = !p.boss, n = gs.length, sum = gs.reduce((t, g) => t + (+g.weight || 0), 0);
			const lowW = gs.filter(g => g.weight === null || g.weight === undefined || g.weight === "" || +g.weight < C.minWeight);
			const unm = gs.filter(g => !measured(g)), outY = gs.filter(g => { const d = G.Datepicker.parse(g.due); return !d || d.getFullYear() !== +C.year; });
			const unl = top ? [] : gs.filter(g => !g.parent && !g.from && !g.cto);
			const out = [
				{ k: "count", ok: n >= C.minGoals && n <= C.maxGoals, t: C.minGoals + " to " + C.maxGoals + " goals", s: n + " now" },
				{ k: "weight", ok: sum === +C.totalWeight && !lowW.length, t: "Weights total " + C.totalWeight + "%, at least " + C.minWeight + "% each", s: sum + "%" + (lowW.length ? ", " + lowW.length + " under " + C.minWeight + "%" : ""), gs: lowW },
				{ k: "measure", ok: !unm.length, t: "Every goal has From, To, Unit and By", s: unm.length ? unm.length + " to set" : "", gs: unm },
				{ k: "due", ok: !outY.length, t: "Every due date is in " + C.year, s: outY.length ? outY.length + " outside " + C.year : "", gs: outY }
			];
			if (!top) { out.push({ k: "link", ok: !unl.length, t: "Every goal supports a goal above", s: unl.length ? unl.length + " not linked" : "", gs: unl }); }
			return out;
		}
		const clean = p => checks(p).every(c => c.ok);
		// who decides now: the manager; someone away 5+ days or a vacant post passes it up at once; on day 6 it moves one level up
		function route(p, since) {
			let r = G.pById(p.boss); if (!r) { return null; }
			const days = wdays(since), away = x => x && (+((C.absent || {})[x.id]) || 0) >= C.absenceDays;
			let why = "";
			while (r && away(r)) { const nx = G.pById(r.boss); why = "away"; if (!nx) { break; } r = nx; }
			if (since && days >= C.escalateDay) { const nx = G.pById(r.boss); if (nx) { r = nx; why = why || "late"; } }
			return { r, days, why, reminded: !!since && days >= C.remindDay && days < C.escalateDay };
		}
		function suggestW(pid, skip) {
			const gs = (G.STORE[pid] || []).filter(g => g !== skip), left = C.totalWeight - gs.reduce((t, g) => t + (+g.weight || 0), 0);
			// shared by the goals still without a weight, counting at least the fewest goals a plan needs
			const set = gs.filter(g => !(g.weight === null || g.weight === undefined || g.weight === "")).length, unset = Math.max(gs.length + 1, C.minGoals) - set;
			if (left < C.minWeight) { return null; }
			const w = Math.floor(left / unset / 5) * 5;
			return w >= C.minWeight ? w : C.minWeight;
		}

		// ---------- kept in step on every screen: old data, expired invitations, rollups ----------
		function sync() {
			G.ALLG().forEach(g => {
				if (g.plan === undefined) {
					setPlan(g, g.from ? "agreed" : g.status === "ok" ? "agreed" : /return/i.test(g.statusText || "") ? "returned" : "draft");
					if (g.from) { g.asPushed = true; }
				}
				if (!g.m && g.measure) { const m = mParse(g.measure); if (m) { g.m = m; } }
				if (g.delReq && !g.delReq.at) { g.delReq.at = nowTs(); }
				(g.contribs || []).forEach(c => {
					if (c.status !== "Invited") { return; }
					if (!c.invitedAt) { c.invitedAt = nowTs(); }
					if (cdays(c.invitedAt) >= C.inviteDays) { c.status = "Expired"; G.ev(g, "invite_expired", "Invitation to " + c.who + " expired after " + C.inviteDays + " days with no answer", { contributor: (G.pByLabel(c.who) || {}).id }); }
				});
			});
			// a leader's goal is the average of the copies pushed down from it, bottom level first
			for (let pass = 0; pass < 6; pass++) {
				let moved = false;
				G.ALLG().forEach(g => {
					const cps = G.copiesOf(g); if (!cps.length) { if (g.rolled) { g.rolled = 0; } return; }
					const avg = Math.round(cps.reduce((t, x) => t + (x.own || 0), 0) / cps.length);
					if (g.rolled !== cps.length) { g.rolled = cps.length; }
					(g.pushed || []).forEach(x => { const cp = cps.find(y => y.owner === x.who); if (cp && x.p !== cp.own) { x.p = cp.own; } });
					if (g.own !== avg) { g.own = avg; G.syncContrib(g); moved = true; }
				});
				if (!moved) { break; }
			}
		}

		// ---------- what happens to a goal ----------
		const ev = G.ev;
		function newState(pid) {
			const p = G.pById(pid); if (!p || !p.boss) { return "draft"; }
			const pl = planOf(p);
			return locked() && pl.gs.length && pl.st === "agreed" ? "change" : "draft";
		}
		// a goal the person just added (new, or accepted from an invitation): it joins their plan
		function added(g, pid) {
			const st = newState(pid);
			if (!g.m) { const m = mParse(g.measure); if (m) { g.m = m; } }
			setPlan(g, st);
			if (st === "change") { g.changeAt = nowTs(); g.changeWhat = ["new goal"]; g.before = null; ev(g, "change_requested", "New goal added to an agreed plan: to review · " + you(), { fields: ["new goal"] }); }
		}
		// a copy pushed down: the manager wrote it, so it is agreed as written, with a suggested weight
		function pushedCopy(cp, src, pid) {
			cp.m = src.m ? JSON.parse(JSON.stringify(src.m)) : mParse(cp.measure);
			if (cp.m) { delete cp.m.actual; delete cp.m.done; }
			if (cp.m && cp.measure === src.measure) { cp.measure = mText(cp.m, cp.due); }
			cp.weight = suggestW(pid, cp);
			setPlan(cp, "agreed"); cp.asPushed = true; cp.agreedAt = nowTs(); cp.agreedBy = G.me().id;
			cp.audit.unshift({ d: G.today(), t: "Agreed as written by " + G.me().label + " (pushed down). Suggested weight " + (cp.weight === null ? "not set" : cp.weight + "%"), action: "plan_agreed", actor: G.me().id, ts: new Date().toISOString(), detail: { pushed: true } });
		}
		// title, target or due date changed (from the goal page or the measure popup): an agreed goal goes back to the manager
		function edited(g, fields, before, viaText) {
			if (viaText && fields.includes("measure")) { const m = mParse(g.measure); g.m = m ? Object.assign(m, g.m && g.m.kind === "num" && g.m.actual !== undefined ? { actual: g.m.actual } : {}) : null; }
			const mat = fields.filter(f => f === "title" || f === "measure" || f === "due");
			const o = ownerOf(g);
			if (!mat.length || !o || !o.boss || g.plan !== "agreed") { return; }
			const go = why => {
				g.before = before; g.changeAt = nowTs(); g.changeWhat = mat; g.changeWhy = why || "";
				setPlan(g, "change");
				ev(g, "change_requested", "Change to review (" + mat.map(f => f === "measure" ? "target" : f === "due" ? "due date" : f).join(", ") + ")" + (why ? ": " + why : "") + " · " + you(), { fields: mat, reason: why || "" });
				G.toast("Saved. " + first(G.pById(o.boss)) + " reviews the change; the goal keeps counting meanwhile.");
				G.render();
			};
			if (!locked()) {
				setPlan(g, "draft"); g.note = null;
				ev(g, "goal_edited", "Changed after it was agreed (" + mat.map(f => f === "measure" ? "target" : f === "due" ? "due date" : f).join(", ") + "): back in the plan to send · " + you(), { fields: mat });
				G.toast("Saved. Send your goals again so " + first(G.pById(o.boss)) + " sees the change.");
				G.render(); return;
			}
			{
				reasonDlg("Request a change", "The " + C.year + " plan is locked. A new title, target or due date goes to " + esc(first(G.pById(o.boss))) + " with your reason. The goal keeps counting meanwhile.", "Why does it need to change?", "Send request",
					why => go(why), () => { Object.assign(g, before); G.render(); G.toast("Change cancelled. The goal is as it was."); });
			}
		}
		function weighted(g, old, nw) {
			const o = ownerOf(g);
			if (!o || !o.boss || g.plan !== "agreed" || Math.abs((+nw || 0) - (+old || 0)) < C.materialWeight) { return; }
			if (!locked()) { setPlan(g, "draft"); ev(g, "goal_edited", "Weight moved " + (old === null ? "from not set" : "from " + old + "%") + " to " + (nw === null ? "not set" : nw + "%") + ": back in the plan to send · " + you(), {}); return; }
			g.before = { weight: old }; g.changeAt = nowTs(); g.changeWhat = ["weight"]; g.changeWhy = "Weight moved from " + (old === null ? "not set" : old + "%") + " to " + (nw === null ? "not set" : nw + "%");
			setPlan(g, "change");
			ev(g, "change_requested", "Change to review (weight " + (old === null ? "not set" : old + "%") + " to " + (nw === null ? "not set" : nw + "%") + ") · " + you(), { fields: ["weight"] });
		}
		function sendPlan() {
			const me = G.me(), pl = planOf(me), todo = pl.gs.filter(g => g.plan === "draft" || g.plan === "returned");
			if (!todo.length) { G.toast("Nothing to send."); return; }
			if (!me.boss) {
				todo.forEach(g => { setPlan(g, "agreed"); g.agreedAt = nowTs(); g.note = null; ev(g, "plan_published", "Published as a strategic goal · " + you(), {}); });
				G.toast("Strategic goals published. The Executive Directors can link to them now."); G.render(); return;
			}
			const ts = nowTs(), late = phase() === "setting" && waveOf(me) && now() > waveOf(me);
			todo.forEach(g => { setPlan(g, "sent"); g.sentAt = ts; g.note = null; ev(g, "plan_sent", "Plan sent to " + G.pById(me.boss).label + (late ? " (after the wave deadline)" : "") + " · " + you(), { goals: todo.length, late: !!late }); });
			const r = route(me, ts);
			G.toast("Sent to " + first(r && r.r) + ". They agree the plan as a whole; you can keep working on your goals.");
			G.render();
		}
		function agreePlan(p, how) {
			const pl = planOf(p), ts = nowTs(), me = G.me();
			pl.sent.forEach(g => { setPlan(g, "agreed"); g.agreedAt = ts; g.agreedBy = me.id; g.note = null; ev(g, "plan_agreed", "Plan agreed by " + me.label + (how ? " (" + how + ")" : "") + " · " + you(), { reviewDays: wdays(g.sentAt) }); });
			return pl.sent.length;
		}
		function returnGoal(g, why) {
			setPlan(g, "returned"); g.note = why; g.returnedAt = nowTs();
			ev(g, "goal_returned", "Returned for changes: " + why + " · " + you(), { reason: why });
		}
		function decideChange(g, ok, why) {
			const me = G.me(), o = ownerOf(g);
			if (ok) { g.before = null; setPlan(g, "agreed"); g.agreedAt = nowTs(); g.agreedBy = me.id; ev(g, "change_agreed", "Change agreed by " + me.label + " · " + you(), { fields: g.changeWhat || [] }); G.toast("Change agreed. " + first(o) + " is told in their digest."); }
			else if (g.before) { Object.assign(g, g.before); g.before = null; setPlan(g, "agreed"); g.note = "Change not agreed by " + first(me) + (why ? ": " + why : "") + ". The goal is back as it was."; ev(g, "change_declined", "Change not agreed; previous version kept · " + you(), { fields: g.changeWhat || [] }); G.toast("Kept the previous version."); }
			else { returnGoal(g, why || "Please talk to " + first(me) + " about this goal."); G.toast("Returned to " + first(o) + "."); }
			g.changeWhat = null; g.changeWhy = null; g.changeAt = null;
		}

		// ---------- small popups ----------
		function dlg(html, label, sticky) {
			const old = ROOT.querySelector(".actdlg"); if (old) { old.remove(); }
			const el = document.createElement("div"); el.className = "actdlg pl-dlg";
			el.innerHTML = '<div class="actbox pl-box" role="dialog" aria-modal="true" aria-label="' + esc(label) + '">' + html + "</div>";
			ROOT.appendChild(el);
			const close = () => el.remove();
			el.addEventListener("click", e => { if (e.target === el && !sticky) { close(); } });
			el.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); close(); } });
			return { el, close, q: s => el.querySelector(s) };
		}
		function reasonDlg(title, text, label, okText, ok, cancel, options) {
			const d = dlg('<h2>' + esc(title) + '</h2><p class="pl-p">' + text + '</p><label class="fl" for="plWhy">' + esc(label) + '</label>' +
				(options && options.length ? '<div class="pl-chips">' + options.map((o, i) => '<button type="button" class="pl-chip" data-o="' + i + '">' + esc(o) + "</button>").join("") + "</div>" : "") +
				'<textarea id="plWhy" class="pl-ta" rows="3"></textarea><div class="pl-err" id="plErr" role="alert"></div><div class="pl-acts"><button class="btn" id="plNo">Cancel</button><button class="btn primary" id="plOk">' + esc(okText) + "</button></div>", title);
			d.el.querySelectorAll("[data-o]").forEach(b => { b.onclick = () => { d.q("#plWhy").value = options[+b.dataset.o]; d.q("#plWhy").focus(); }; });
			d.q("#plNo").onclick = () => { d.close(); if (cancel) { cancel(); } };
			d.q("#plOk").onclick = () => { const w = d.q("#plWhy").value.trim(); if (!w) { d.q("#plErr").textContent = "Write a short reason first."; return; } d.close(); ok(w); };
			setTimeout(() => d.q("#plWhy").focus(), 30);
		}
		// the measure fields, shared by the new-goal popup and the measure popup
		function mFields(s) {
			const k = s.kind || "num";
			return '<div class="pl-seg" role="radiogroup" aria-label="How it is measured">' + [["num", "A number"], ["ms", "Milestones"], ["done", "Done or not"]].map(x => '<button type="button" role="radio" aria-checked="' + (k === x[0]) + '" class="' + (k === x[0] ? "on" : "") + '" data-kind="' + x[0] + '">' + x[1] + "</button>").join("") + "</div>" +
				(k === "num" ? '<div class="pl-ftu"><label><span>From</span><input id="mFrom" inputmode="decimal" value="' + esc(s.from ?? "") + '" placeholder="62"></label><label><span>To</span><input id="mTo" inputmode="decimal" value="' + esc(s.to ?? "") + '" placeholder="90"></label><label class="u"><span>Unit</span><input id="mUnit" list="plUnits" value="' + esc(s.unit || "") + '" placeholder="% of alerts"></label></div><datalist id="plUnits"><option>%</option><option>% of stories</option><option>minutes</option><option>hours</option><option>days</option><option>stories</option><option>people</option><option>points</option><option>QAR</option></datalist>'
					: k === "ms" ? '<div class="pl-ftu"><label><span>Milestones</span><input id="mN" inputmode="numeric" value="' + esc(s.n || 2) + '"></label></div><p class="pl-hint">Progress is the share of milestones done.</p>'
						: '<p class="pl-hint">Progress is 0% until it is done, then 100%.</p>') +
				'<div class="pl-by">' + G.Datepicker.field("mBy", "By", s.by || "31 December " + C.year, "") + "</div>";
		}
		function readM(d, s) {
			s.kind = s.kind || "num";
			if (s.kind === "num") { s.from = d.q("#mFrom").value.trim(); s.to = d.q("#mTo").value.trim(); s.unit = d.q("#mUnit").value.trim(); }
			if (s.kind === "ms") { s.n = d.q("#mN").value.trim(); }
			const b = d.q("#mBy"); if (b) { s.by = b.value; }
		}
		function mErr(s) {
			if (s.kind === "num") { const f = num(s.from), t = num(s.to); if (f === null || t === null) { return "From and To must be numbers."; } if (f === t) { return "From and To must differ."; } if (!s.unit) { return "Say the unit, for example % of alerts or minutes."; } }
			if (s.kind === "ms") { const n = +s.n; if (!Number.isInteger(n) || n < 1 || n > 12) { return "Milestones: a whole number from 1 to 12."; } }
			const d = G.Datepicker.parse(s.by); if (!d) { return "Pick the date it is done by."; }
			if (d.getFullYear() !== +C.year) { return "The date must be in " + C.year + ", the goal year."; }
			return "";
		}
		const mOf = s => s.kind === "num" ? { kind: "num", from: num(s.from), to: num(s.to), unit: s.unit } : s.kind === "ms" ? { kind: "ms", n: +s.n, done: 0 } : { kind: "done", done: false };
		function bindKind(d, s, paint) { d.el.querySelectorAll("[data-kind]").forEach(b => { b.onclick = () => { readM(d, s); s.kind = b.dataset.kind; paint(); }; }); }

		// the measure of a goal that has none yet, or a new target
		function measureDlg(g) {
			const m = g.m || {}, s = { kind: m.kind || "num", from: m.from, to: m.to, unit: m.unit, n: m.n, by: g.due };
			const d = dlg('<div id="mdBody"></div>', "Measure", true);
			const paint = () => {
				d.q("#mdBody").innerHTML = '<h2>How will you measure it?</h2><p class="pl-p"><b>' + esc(g.title) + "</b></p>" + mFields(s) + '<div class="pl-err" id="plErr" role="alert"></div><div class="pl-acts"><button class="btn" id="plNo">Cancel</button><button class="btn primary" id="plOk">Save</button></div>';
				bindKind(d, s, paint);
				d.q("#plNo").onclick = d.close;
				d.q("#plOk").onclick = () => {
					readM(d, s); const e = mErr(s); if (e) { d.q("#plErr").textContent = e; return; }
					const before = { title: g.title, measure: g.measure, due: g.due, weight: g.weight, m: g.m ? JSON.parse(JSON.stringify(g.m)) : null };
					const nm2 = mOf(s); if (g.m && g.m.kind === nm2.kind) { if (nm2.kind === "num" && g.m.actual !== undefined) { nm2.actual = g.m.actual; } if (nm2.kind !== "num") { nm2.done = g.m.done; } }
					g.m = nm2; g.due = s.by; g.measure = mText(g.m, g.due);
					const ch = []; if (g.measure !== before.measure) { ch.push("measure"); } if (g.due !== before.due) { ch.push("due"); }
					d.close();
					if (!ch.length) { G.toast("No change."); return; }
					ev(g, "goal_edited", "Measure set: " + g.measure + " · " + you(), {});
					G.toast("Measure saved.");
					edited(g, ch, before, false);
					G.render();
				};
			};
			paint();
		}

		// ---------- New goal in 3 steps: What and how measured, Link and date, Confirm ----------
		function newGoal(pre) {
			const me = G.me(), top = !me.boss, above = G.mgmt();
			const s = Object.assign({ step: 1, src: "", title: "", desc: "", kind: "num", by: "31 December " + C.year, parent: "", weight: null, pickedParent: false }, pre || {});
			const d = dlg('<div id="ngBody"></div>', "New goal", true);
			const libU = u => u === "pct" ? "%" : u === "min" ? "minutes" : u === "sec" ? "seconds" : u === "hrs" ? "hours" : u === "days" ? "days" : u === "num" ? "" : u;
			const rank = () => { const w = (s.title + " " + (s.unit || "")).toLowerCase().match(/[a-z0-9%]+/g) || []; return above.map(m => ({ m, k: [...new Set(w.filter(x => x.length > 2 && m.k.includes(x)))].length })).sort((a, b) => b.k - a.k); };
			const sources = () => {
				const out = [];
				if (above.length) { out.push(["boss", "Your manager's goals"]); }
				out.push(["lib", "Goal library"]);
				if (G.ai()) { out.push(["ai", "AI ideas"]); }
				out.push(["last", "Last year"]);
				return out;
			};
			function srcList() {
				if (s.src === "boss") { return above.map((m, i) => '<button type="button" class="pl-opt" data-pick="boss:' + i + '"><b>' + esc(m.t) + "</b><small>" + esc(first(G.pByLabel(m.o)) || m.o) + "'s goal. Starts as your own wording.</small></button>").join(""); }
				if (s.src === "lib") {
					const q = (s.title || "").toLowerCase().match(/[a-z]{4,}/g) || [];
					const hits = G.lib.map((x, i) => ({ x, i, k: q.filter(w => (x[0] + " " + x[3]).toLowerCase().includes(w)).length })).sort((a, b) => b.k - a.k).slice(0, 6);
					return hits.map(h => '<button type="button" class="pl-opt" data-pick="lib:' + h.i + '"><b>' + esc(h.x[0]) + "</b><small>" + esc(h.x[3]) + ": from " + esc(fmtN(h.x[5])) + " to " + esc(fmtN(h.x[6])) + " " + esc(libU(h.x[4])) + "</small></button>").join("");
				}
				if (s.src === "ai") {
					const r = G.aiGet("goals|" + me.id + "|v63|" + above.length, "goals", { role: me.label.split(",").slice(1).join(",").trim() || me.label, above: above.map(m => m.t), mine: (G.STORE[me.id] || []).map(g => g.title), hint: s.title || "" }, () => { if (s.src === "ai" && document.body.contains(d.el)) { paint(); } });
					if (r.state === "loading") { return '<p class="pl-hint">Asking the AI&hellip;</p>'; }
					const o = r.state === "ok" && r.data && r.data.options || [];
					return o.length ? o.slice(0, 5).map((x, i) => '<button type="button" class="pl-opt" data-pick="ai:' + i + '"><b>' + esc(x.text) + "</b>" + (x.why ? "<small>" + esc(x.why) + "</small>" : "") + "</button>").join("") : '<p class="pl-hint">The AI could not answer. Try the goal library.</p>';
				}
				if (s.src === "last") { return '<p class="pl-hint">There are no ' + (C.year - 1) + " goals on record for you in this prototype. In ECC this lists last year's goals to carry over.</p>"; }
				return "";
			}
			function paint() {
				const b = d.q("#ngBody"), steps = ["What and how measured", "Link and date", "Confirm"];
				const head = '<div class="pl-steps">' + steps.map((t, i) => '<span class="' + (i + 1 === s.step ? "cur" : i + 1 < s.step ? "done" : "") + '"><i>' + (i + 1 < s.step ? "&#10003;" : i + 1) + "</i>" + t + "</span>").join('<em aria-hidden="true"></em>') + "</div>";
				let h = "";
				if (s.step === 1) {
					const sg = rank()[0], sw = suggestW(me.id);
					h = '<div class="pl-src">' + sources().map(x => '<button type="button" class="pl-chip' + (s.src === x[0] ? " on" : "") + '" data-src="' + x[0] + '">' + x[1] + "</button>").join("") + "</div>" +
						(s.src ? '<div class="pl-opts">' + srcList() + "</div>" : "") +
						'<label class="fl" for="ngT">Goal</label><textarea id="ngT" class="pl-ta grow" rows="2" placeholder="Start with a verb: Publish breaking alerts on the app within 5 minutes">' + esc(s.title) + "</textarea>" +
						'<label class="fl">How it is measured</label>' + mFields(s) +
						(!top && (sg && sg.k || sw !== null) ? '<div class="pl-sugg">' + (sg && sg.k ? "Suggested link: <b>&ldquo;" + esc(sg.m.t) + "&rdquo;</b>, " + esc(first(G.pByLabel(sg.m.o))) + "'s goal. " : "") + (sw !== null ? "Suggested weight: <b>" + sw + "%</b>." : "") + "</div>" : "");
				} else if (s.step === 2) {
					const r = rank(), sw = s.weight !== null ? s.weight : suggestW(me.id);
					if (!s.pickedParent && !s.parent && r[0] && r[0].k) { s.parent = r[0].m.t; }
					h = (top ? '<p class="pl-p">Your goals are the strategic goals: nothing above to link to.</p>' :
						'<label class="fl" for="ngP">Supports this goal of ' + esc(first(G.pById(me.boss))) + "</label>" +
						(r.length ? '<div class="pl-radio">' + r.map(x => '<label class="' + (s.parent === x.m.t ? "on" : "") + '"><input type="radio" name="ngP" value="' + esc(x.m.t) + '"' + (s.parent === x.m.t ? " checked" : "") + "><span><b>" + esc(x.m.t) + "</b>" + (x.k ? '<small class="ok">Suggested: ' + x.k + " matching word" + (x.k > 1 ? "s" : "") + "</small>" : "") + "</span></label>").join("") + "</div>"
							: '<p class="pl-hint">' + esc(first(G.pById(me.boss))) + " has no goals yet. You can save this goal now and link it when theirs are published.</p>")) +
						'<div class="pl-row2"><div><label class="fl" for="ngW">Weight (%)</label><input id="ngW" class="pl-in" inputmode="numeric" value="' + esc(sw ?? "") + '"><p class="pl-hint">Suggested: an equal share of what is left.</p></div><div>' + G.Datepicker.field("ngBy", "Due date", s.by, "") + "</div></div>" +
						'<label class="fl" for="ngD">Description (optional)</label><textarea id="ngD" class="pl-ta grow" rows="2">' + esc(s.desc) + "</textarea>";
				} else {
					const m = mOf(s), w = s.weight, others = (G.STORE[me.id] || []), sum = others.reduce((t, g) => t + (+g.weight || 0), 0) + (+w || 0);
					const ok = (c, t) => '<li class="' + (c ? "ok" : "warn") + '"><i aria-hidden="true">' + (c ? "&#10003;" : "!") + "</i>" + t + "</li>";
					h = '<div class="pl-conf"><div class="geyebrow">Goal</div><h3>' + esc(s.title) + '</h3><div class="pl-cm"><span>Measure</span>' + esc(mText(m, s.by)) + "</div>" + (s.parent ? '<div class="pl-cm"><span>Supports</span>' + esc(s.parent) + "</div>" : "") + '<div class="pl-cm"><span>Weight</span>' + (w === null || w === "" ? "Not set" : w + "%") + "</div></div>" +
						'<ul class="pl-checks">' + ok(true, "Measurable: from, to, unit and by") + ok(G.Datepicker.parse(s.by).getFullYear() === +C.year, "Due in " + C.year) + (top ? "" : ok(!!s.parent, s.parent ? "Linked to a goal above" : "Not linked yet: you can link it before you send")) + ok(w !== null && w !== "" && +w >= C.minWeight, "Weight at least " + C.minWeight + "%") + "</ul>" +
						'<p class="pl-hint">You will have ' + (others.length + 1) + " goal" + (others.length ? "s" : "") + ", weights " + sum + "%. " + (top ? "Publish your strategic goals when they are ready." : "It is saved now. Send your goals to " + esc(first(G.pById(me.boss))) + " once, when the plan is ready.") + "</p>";
				}
				b.innerHTML = '<h2>New goal</h2>' + head + h + '<div class="pl-err" id="plErr" role="alert"></div><div class="pl-acts">' + (s.step > 1 ? '<button class="btn" id="ngBack">Back</button>' : '<button class="btn" id="ngNo">Cancel</button>') + '<button class="btn primary" id="ngGo">' + (s.step < 3 ? "Next" : "Create goal") + "</button></div>";
				const t = d.q("#ngT"); if (t) { t.oninput = () => { s.title = t.value; }; }
				d.el.querySelectorAll("[data-src]").forEach(x => { x.onclick = () => { readStep(); s.src = s.src === x.dataset.src ? "" : x.dataset.src; paint(); }; });
				d.el.querySelectorAll("[data-pick]").forEach(x => {
					x.onclick = () => {
						readStep(); const [k, i] = x.dataset.pick.split(":");
						if (k === "boss") { s.title = above[+i].t; s.parent = above[+i].t; s.pickedParent = true; const src = G.findG(above[+i].id); if (src && src.m && src.m.kind === "num") { Object.assign(s, { kind: "num", from: src.m.from, to: src.m.to, unit: src.m.unit }); } }
						if (k === "lib") { const L = G.lib[+i]; Object.assign(s, { title: L[0], kind: "num", from: L[5], to: L[6], unit: (libU(L[4]) ? libU(L[4]) + " " : "") + "(" + L[3].toLowerCase() + ")" }); }
						if (k === "ai") { const r = G.aiGet("goals|" + me.id + "|v63|" + above.length, "goals", {}); const o = r.data && r.data.options && r.data.options[+i]; if (o) { s.title = o.text; if (r.data.id) { G.Store.aiAccept(r.data.id, o.text); } const m = mParse(o.text); if (m) { Object.assign(s, m); } } }
						s.src = ""; paint();
					};
				});
				bindKind(d, s, () => { readStep(); paint(); });
				d.el.querySelectorAll("input[name=ngP]").forEach(x => { x.onchange = () => { s.parent = x.value; s.pickedParent = true; d.el.querySelectorAll(".pl-radio label").forEach(l => l.classList.toggle("on", l.contains(x))); }; });
				const no = d.q("#ngNo"); if (no) { no.onclick = d.close; }
				const bk = d.q("#ngBack"); if (bk) { bk.onclick = () => { readStep(); s.step--; paint(); }; }
				d.q("#ngGo").onclick = () => {
					readStep(); const err = d.q("#plErr");
					if (s.step === 1) { if (s.title.trim().length < 8) { err.textContent = "Write the goal in one sentence (at least a few words)."; return; } const e = mErr(s); if (e) { err.textContent = e; return; } s.step = 2; paint(); return; }
					if (s.step === 2) { const e = mErr(s); if (e) { err.textContent = e; return; } if (s.weight !== null && s.weight !== "" && (!Number.isInteger(+s.weight) || +s.weight < 0 || +s.weight > 100)) { err.textContent = "Weight: a whole number from 0 to 100."; return; } s.step = 3; paint(); return; }
					const m = mOf(s), g = { id: G.Store.nid(), owner: me.label, title: s.title.trim(), desc: s.desc.trim(), m, measure: mText(m, s.by), due: s.by, parent: top ? "" : s.parent, also: [], own: 0, weight: s.weight === null || s.weight === "" ? null : +s.weight, contribs: [], pushed: [], audit: [] };
					G.ensure(g); g.audit = [{ d: G.today(), t: "Created · " + you() }];
					G.STORE[me.id].unshift(g); added(g, me.id);
					d.close(); G.toast(top ? "Goal saved. Publish your strategic goals when they are ready." : "Goal saved. Send your goals to " + first(G.pById(me.boss)) + " when the plan is ready.");
					G.go("list");
				};
				const first1 = d.el.querySelector("#ngT,#ngW,input[name=ngP]"); if (first1 && s.step !== 1) { first1.focus(); }
			}
			function readStep() {
				const t = d.q("#ngT"); if (t) { s.title = t.value; }
				if (d.q("#mBy") || d.q("#mFrom") || d.q("#mN")) { readM(d, s); }
				const w = d.q("#ngW"); if (w) { s.weight = w.value.trim() === "" ? null : w.value.trim(); }
				const by = d.q("#ngBy"); if (by) { s.by = by.value; }
				const ds = d.q("#ngD"); if (ds) { s.desc = ds.value; }
			}
			paint();
			setTimeout(() => { const t = d.q("#ngT"); if (t) { t.focus(); } }, 40);
		}

		// ---------- My goals: the plan bar and the daily digest ----------
		function planBar() {
			const me = G.me(), pl = planOf(me), top = !me.boss, ph = phase(), cs = checks(me), okAll = cs.every(c => c.ok), wv = waveOf(me);
			const r = me.boss ? route(me, pl.since) : null;
			const pill = { none: ["neu", "No goals yet"], draft: ["neu", "Draft"], returned: ["att", "Returned for changes"], sent: ["att", "With " + first(r && r.r)], agreed: ["ok", top ? "Published" : "Agreed"] }[pl.st];
			let line = "";
			if (pl.st === "sent") { line = "Sent " + (r.days ? r.days + " working day" + (r.days > 1 ? "s" : "") + " ago" : "today") + ". " + (r.why === "late" ? "Not decided in " + C.escalateDay + " days, so it moved to " + esc(first(r.r)) + "." : r.why === "away" ? esc(first(G.pById(me.boss))) + " is away, so " + esc(first(r.r)) + " decides." : r.reminded ? esc(first(r.r)) + " was reminded." : esc(first(r.r)) + " has " + C.reviewDays + " working days to agree it.") + " You can keep working meanwhile."; }
			else if (pl.st === "agreed" && pl.gs.length) { const a = pl.gs.map(g => g.agreedAt).filter(Boolean).sort().pop(); line = top ? (C.dgEndorsed ? "Endorsed by the Board on " + esc(fds(C.dgEndorsed)) + "." : "The Board's endorsement is recorded by HR on the cycle.") : (a ? "Agreed " + esc(fd(day0(new Date(a)))) + ". " : "") + (locked() ? "Locked: a new title, target or due date needs a short reason." : "Changing a title, target, due date or a weight by " + C.materialWeight + "+ points puts that goal back in your plan to send."); }
			else if (pl.st === "returned") { line = pl.ret.length + " goal" + (pl.ret.length > 1 ? "s" : "") + " returned. Fix " + (pl.ret.length > 1 ? "them" : "it") + " and send again."; }
			else if (pl.st === "draft") { line = top ? "Publish your strategic goals first: everyone below links to them." : "Build " + C.minGoals + " to " + C.maxGoals + " goals, then send them once."; }
			else { line = "Start with New goal" + (top ? "." : ", or wait for a goal pushed down to you."); }
			const canSend = (pl.dr.length || pl.ret.length) && okAll;
			const due = ph === "setting" && wv ? '<span class="pl-wave">' + (now() > wv ? "Wave closed " : "Send by ") + esc(fd(wv)) + "</span>" : ph === "before" ? '<span class="pl-wave">Goal setting opens ' + esc(fds(C.open)) + "</span>" : ph === "mid" ? '<span class="pl-wave">Mid-year reopen until ' + esc(fds(C.midTo)) + "</span>" : "";
			const extra = pl.ch.length ? '<div class="pl-note">' + pl.ch.length + " change" + (pl.ch.length > 1 ? "s" : "") + " waiting for " + esc(first(route(me, pl.ch[0].changeAt).r)) + ". The goals keep counting meanwhile.</div>" : "";
			return '<section class="card pl-bar" aria-label="Your plan"><div class="pl-bh"><div><div class="geyebrow">Your ' + C.year + " plan</div><h2>" + (top ? "Strategic goals" : "Goal plan") + ' <span class="chip ' + pill[0] + '">' + esc(pill[1]) + "</span></h2><p>" + line + "</p></div>" + due + "</div>" +
				(pl.gs.length && pl.st !== "agreed" ? '<ul class="pl-checks row">' + cs.map(c => '<li class="' + (c.ok ? "ok" : "warn") + '"><i aria-hidden="true">' + (c.ok ? "&#10003;" : "!") + "</i>" + esc(c.t) + (c.s ? " <small>" + esc(c.s) + "</small>" : "") + "</li>").join("") + "</ul>" : "") + extra +
				'<div class="pl-bacts">' + (pl.gs.length ? '<button class="btn small" data-pl="checkin">Update all</button>' : "") + (pl.gs.length && pl.st !== "agreed" && pl.st !== "sent" && !cs.find(c => c.k === "weight").ok ? '<button class="btn small" data-pl="suggestW">Suggest weights</button>' : "") +
				((pl.dr.length || pl.ret.length) ? '<button class="btn small primary" data-pl="send"' + (canSend ? "" : ' disabled aria-disabled="true" title="Fix the checks first"') + ">" + (top ? "Publish strategic goals" : pl.ret.length && !pl.dr.length ? "Send again" : "Send my goals to " + esc(first(G.pById(me.boss)))) + "</button>" : "") + "</div></section>";
		}
		function digest() {
			const me = G.me(), it = [], pl = planOf(me), ph = phase(), t = now();
			if (me.boss && (pl.dr.length || pl.ret.length) && ph !== "run" && ph !== "close") { const wv = waveOf(me); it.push({ tone: "gold", ic: "✉", title: pl.ret.length ? pl.ret.length + " goal" + (pl.ret.length > 1 ? "s" : "") + " returned" : "Send your goals", sub: pl.ret.length ? "Fix and send again to " + first(G.pById(me.boss)) : "To " + first(G.pById(me.boss)) + (wv ? " by " + fd(wv) : ""), btn: "Review", act: "toPlan" }); }
			if (!me.boss && pl.dr.length) { it.push({ tone: "gold", ic: "★", title: "Publish your strategic goals", sub: "Wave 1 closes " + fds(C.waves.dg), btn: "Review", act: "toPlan" }); }
			if (G.TEAMS().length || STAFF().some(p => route(p, planOf(p).since) && route(p, planOf(p).since).r === me)) {
				const q = queue(); const n = q.length;
				if (n) { const esc2 = q.filter(x => x.r.why).length; it.push({ tone: "gold", ic: "✓", title: n + " plan" + (n > 1 ? "s" : "") + " or change" + (n > 1 ? "s" : "") + " to decide", sub: esc2 ? esc2 + " escalated to you" : "Clean plans agree in one click", btn: "My team", act: "team", primary: 1 }); }
			}
			if (pl.gs.length && (ph === "run" || ph === "mid") && !pl.gs.some(g => g.ciAt && new Date(g.ciAt).getMonth() === t.getMonth() && new Date(g.ciAt).getFullYear() === t.getFullYear())) { it.push({ tone: "blue", ic: "↻", title: MONTH[t.getMonth()] + " check-in", sub: "One screen for every goal. About 2 minutes.", btn: "Update all", act: "checkin", primary: 1 }); }
			pl.gs.forEach(g => { const d = G.Datepicker.parse(g.due); if (!d || (g.own || 0) >= 100) { return; } const n = Math.round((d - t) / 864e5); const lim = (C.dueReminders || [30, 7]).find(x => n >= 0 && n <= x); if (lim !== undefined && n <= Math.max.apply(null, C.dueReminders || [30])) { it.push({ tone: n <= 7 ? "red" : "gold", ic: "⏰", title: "Due in " + n + " day" + (n === 1 ? "" : "s"), sub: g.title, btn: "Open", act: "open:" + g.id }); } });
			const inv = G.ALLG().reduce((t2, o) => t2 + (o.contribs || []).filter(c => c.who === me.label && c.status === "Invited").length, 0);
			if (inv) { it.push({ tone: "blue", ic: "✉", title: inv + " invitation" + (inv > 1 ? "s" : "") + " to contribute", sub: "They close after " + C.inviteDays + " days", btn: "View", act: "toInv" }); }
			pl.nr.forEach(g => it.push({ tone: "gold", ic: "…", title: "Waiting: not relevant to you", sub: g.title, wait: 1 }));
			if (pl.st === "sent") { const r = route(me, pl.since); it.push({ tone: "gold", ic: "…", title: "Your plan is with " + first(r.r), sub: "Day " + r.days + " of " + C.reviewDays, wait: 1 }); }
			const act = it.filter(x => !x.wait);
			const row = (x, i) => '<div class="pit ' + x.tone + (x.wait ? " wait" : "") + '"><i class="pi" aria-hidden="true">' + x.ic + '</i><div class="pit-t"><b>' + esc(x.title) + "</b><small>" + esc(x.sub) + "</small></div>" + (x.wait ? '<span class="pwait">Waiting</span>' : '<button type="button" class="btn small' + (x.primary ? " primary" : "") + '" data-pl="' + x.act + '">' + esc(x.btn) + "</button>") + "</div>";
			return '<aside class="portlet" aria-label="Today"><header><span class="pbell" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg></span><b>Today</b><span class="pcount' + (act.length ? "" : " zero") + '">' + act.length + "</span></header>" +
				(it.length ? '<div class="plist">' + it.slice(0, 6).map(row).join("") + "</div>" : '<div class="pclear"><i aria-hidden="true">✓</i><div><b>Nothing to do today</b><small>The daily digest only comes on days with something to do.</small></div></div>') + "</aside>";
		}
		// one line under each goal on My goals: actual value and the check-in, not a slider
		function progLine(g) {
			const cps = g.rolled;
			return '<div class="pl-prog"><span>' + (cps ? "Rolls up from " + cps + " " + (cps > 1 ? "people" : "person") + " below" : esc(actualText(g) || "Progress " + (g.own || 0) + "%")) + "</span>" +
				(g.m ? "" : '<button type="button" class="pl-link" data-pl="measure:' + g.id + '">Set From, To, Unit and By</button>') +
				(g.m && !cps && g.owner === G.me().label ? '<button type="button" class="pl-link" data-pl="checkin">Update</button>' : "") +
				(g.m && g.owner === G.me().label ? '<button type="button" class="pl-link" data-pl="measure:' + g.id + '">Change target</button>' : "") + "</div>";
		}
		function cardNote(g) {
			const o = ownerOf(g), b = o && G.pById(o.boss);
			if (g.notRel) { return '<div class="pl-note">You said this goal is not relevant to you. Waiting for ' + esc(first(b)) + " to remove it or keep it.</div>"; }
			if (g.plan === "change") { return '<div class="pl-note">Change waiting for ' + esc(first(route(o, g.changeAt).r)) + ". If they keep the old version, the goal goes back to it.</div>"; }
			return "";
		}
		function cardBtns(g) {
			if (g.from && g.plan === "agreed" && !g.notRel) { return '<button class="btn small" data-pl="nrel:' + g.id + '">Not relevant to me</button>'; }
			return "";
		}
		function notRel(g) {
			const o = ownerOf(g), b = o && G.pById(o.boss);
			reasonDlg("Not relevant to you?", "<b>" + esc(g.title) + "</b><br>" + esc(first(b)) + " pushed this goal to you. They decide whether it comes off your plan; it stays until then.", "Why is it not relevant?", "Send to " + first(b),
				why => { g.notRel = { reason: why, at: nowTs() }; ev(g, "not_relevant", "Marked not relevant: " + why + " · " + you(), { reason: why }); G.toast("Sent to " + first(b) + "."); G.render(); }, null,
				["This is not part of my role.", "Another person on the team owns this work.", "I already have this in another goal."]);
		}

		// ---------- My team: plans to agree (bulk), changes, team progress ----------
		function queue() {
			const me = G.me();
			return STAFF().map(p => { const pl = planOf(p); if (!pl.pending) { return null; } const r = route(p, pl.since); return r && r.r === me ? { p, pl, r } : null; }).filter(Boolean);
		}
		function suggestReasons(g, p) {
			const cs = checks(p).filter(c => !c.ok && (c.gs || []).includes(g)).map(c => c.t);
			const base = cs.map(t => "Please fix: " + t.toLowerCase() + ".");
			const k = "cm|" + g.id + "|" + cs.join(",");
			if (G.ai()) {
				const r = G.aiGet(k, "comment", { title: g.title, measure: g.measure, issues: cs }, () => { if (retFor === g.id) { G.render(); } });
				if (r.state === "ok" && r.data && r.data.options) { return { ai: r.data, list: r.data.options.map(o => o.text).slice(0, 3) }; }
				if (r.state === "loading") { return { loading: true, list: base }; }
			}
			return { list: base.length ? base : ["Make the target a number we can check, with a date in " + C.year + ".", "Link this to one of my goals so the team's work adds up.", "This overlaps with another goal on your plan. Merge them."] };
		}
		function goalRows(p, pl, editable) {
			return pl.gs.map(g => {
				const cs = checks(p).filter(c => !c.ok && (c.gs || []).includes(g));
				const rs = retFor === g.id ? suggestReasons(g, p) : null;
				return '<div class="pl-g' + (g.plan === "returned" ? " ret" : "") + '"><div class="pl-gm"><b>' + esc(g.title) + "</b><small>" + esc(g.measure || "No measure") + " &middot; " + (g.weight === null || g.weight === undefined || g.weight === "" ? "no weight" : g.weight + "%") + (g.parent ? " &middot; supports &ldquo;" + esc(g.parent) + "&rdquo;" : "") + (g.asPushed ? " &middot; pushed down, agreed as written" : "") + "</small>" +
					(cs.length ? '<span class="pl-fail">' + cs.map(c => esc(c.t)).join(" &middot; ") + "</span>" : "") + (g.plan === "returned" ? '<span class="pl-fail">Returned: ' + esc(g.note || "") + "</span>" : "") + "</div>" +
					'<span class="chip ' + g.status + '">' + esc(g.statusText) + "</span>" +
					(editable && g.plan === "sent" ? (retFor === g.id ? "" : '<button class="btn small" data-pl="ret:' + g.id + '">Return</button>') : "") + "</div>" +
					(retFor === g.id ? '<div class="pl-retbox"><label class="fl" for="plRet">Why return it? ' + (rs.ai ? '<span class="pl-ai">AI drafted</span>' : rs.loading ? '<span class="pl-ai">AI is drafting&hellip;</span>' : "") + '</label><div class="pl-chips">' + rs.list.map((t, i) => '<button type="button" class="pl-chip" data-pl="retpick:' + i + '">' + esc(t) + "</button>").join("") + '</div><textarea id="plRet" class="pl-ta" rows="2"></textarea>' + (retErr ? '<div class="pl-err" role="alert">' + esc(retErr) + "</div>" : "") + '<div class="pl-acts"><button class="btn small" data-pl="retx">Cancel</button><button class="btn small primary" data-pl="retok:' + g.id + '">Return goal</button></div></div>' : "");
			}).join("");
		}
		function renderTeam() {
			G.crumb("My team"); G.tabs();
			const me = G.me(), q = queue(), direct = G.PEOPLE.filter(p => p.boss === me.id), ph = phase();
			const plans = q.filter(x => x.pl.sent.length), cleanQ = plans.filter(x => clean(x.p));
			const changes = q.flatMap(x => x.pl.ch.map(g => ({ g, x }))), nrs = q.flatMap(x => x.pl.nr.map(g => ({ g, x }))), dls = q.flatMap(x => x.pl.dl.map(g => ({ g, x })));
			const area = me.label.split(",").slice(1).join(",").trim() || "Your team";
			let h = '<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">My team</h1><span class="row" style="gap:8px">' + (cleanQ.length ? '<button class="btn primary" data-pl="agreeClean">Agree ' + cleanQ.length + " clean plan" + (cleanQ.length > 1 ? "s" : "") + "</button>" : "") + "</span></div>" +
				'<p class="sub">' + esc(area) + " &middot; " + plans.length + " plan" + (plans.length === 1 ? "" : "s") + " sent &middot; " + (ph === "setting" || ph === "before" ? "goal setting closes " + esc(fds(C.lock)) : ph === "mid" ? "mid-year reopen until " + esc(fds(C.midTo)) : "plans locked since " + esc(fds(C.state === "closed" && C.closedAt ? C.closedAt : C.lock))) + "</p>";
			const wait = r => r.why === "late" ? '<span class="pl-tag red">Escalated: ' + r.days + " days</span>" : r.why === "away" ? '<span class="pl-tag red">Routed to you: manager away</span>' : r.reminded ? '<span class="pl-tag gold">Day ' + r.days + ", reminded</span>" : '<span class="pl-tag">Day ' + r.days + " of " + C.reviewDays + "</span>";
			if (plans.length) {
				h += '<h2 class="sect">Plans to agree</h2><div class="card pl-tw"><table class="pl-t"><thead><tr><th>Person</th><th>Plan</th><th>Goals</th><th>Weight</th><th>Checks</th><th>Waiting</th><th><span class="pl-sr">Actions</span></th></tr></thead><tbody>' +
					plans.map(x => {
						const cs = checks(x.p), bad = cs.filter(c => !c.ok), op = open.has(x.p.id);
						return '<tr class="' + (op ? "op" : "") + '"><td><button class="pl-pname" data-pl="exp:' + x.p.id + '" aria-expanded="' + op + '"><b>' + esc(first(x.p)) + "</b><small>" + esc(LVN[x.p.lv] || "") + "</small></button></td><td>Sent</td><td>" + x.pl.gs.length + "</td><td>" + x.pl.weight + "%</td><td>" + (bad.length ? '<span class="pl-tag gold">' + esc(bad.map(c => c.k === "weight" ? "Weights " + x.pl.weight + "%" : c.t).slice(0, 2).join(", ")) + "</span>" : '<span class="pl-tag ok">All pass</span>') + "</td><td>" + wait(x.r) + '</td><td class="pl-ta-r"><button class="btn small" data-pl="exp:' + x.p.id + '">' + (op ? "Close" : "Open") + "</button>" + '<button class="btn small primary" data-pl="agree:' + x.p.id + '">Agree plan</button></td></tr>' +
							(op ? '<tr class="pl-sub"><td colspan="7">' + goalRows(x.p, x.pl, true) + "</td></tr>" : "");
					}).join("") + "</tbody></table></div>";
			}
			if (changes.length || nrs.length || dls.length) {
				h += '<h2 class="sect">Changes to decide</h2>' + changes.map(({ g, x }) => {
					const b = g.before || {}, fld = g.changeWhat || [], row = (l, a, n) => '<div class="pl-diff"><span>' + l + "</span><s>" + esc(a ?? "Not set") + "</s><b>" + esc(n ?? "Not set") + "</b></div>";
					return '<div class="card pl-ch"><div class="pl-chh"><div><div class="geyebrow">' + esc(first(x.p)) + " &middot; " + (fld.includes("new goal") ? "new goal on an agreed plan" : "change to an agreed goal") + "</div><h3>" + esc(g.title) + "</h3></div>" + wait(route(x.p, g.changeAt)) + "</div>" +
						(fld.includes("title") ? row("Title", b.title, g.title) : "") + (fld.includes("measure") ? row("Target", b.measure, g.measure) : "") + (fld.includes("due") ? row("Due date", b.due, g.due) : "") + (fld.includes("weight") ? row("Weight", b.weight === null || b.weight === undefined ? "Not set" : b.weight + "%", g.weight === null ? "Not set" : g.weight + "%") : "") +
						(fld.includes("new goal") ? '<div class="pl-diff"><span>Measure</span><b>' + esc(g.measure) + "</b></div>" : "") + (g.changeWhy ? '<p class="pl-p"><b>Reason:</b> ' + esc(g.changeWhy) + "</p>" : "") +
						'<div class="pl-acts"><button class="btn small" data-pl="chno:' + g.id + '">' + (g.before ? "Keep the old version" : "Return") + '</button><button class="btn small primary" data-pl="chok:' + g.id + '">Agree change</button></div></div>';
				}).join("") +
					nrs.map(({ g, x }) => '<div class="card pl-ch"><div class="pl-chh"><div><div class="geyebrow">' + esc(first(x.p)) + " says this pushed goal is not relevant to them</div><h3>" + esc(g.title) + '</h3></div>' + wait(route(x.p, g.notRel.at)) + '</div><p class="pl-p"><b>Reason:</b> ' + esc(g.notRel.reason) + '</p><div class="pl-acts"><button class="btn small" data-pl="nrkeep:' + g.id + '">Keep it on their plan</button><button class="btn small danger" data-pl="nrrm:' + g.id + '">Remove it</button></div></div>').join("") +
					dls.map(({ g, x }) => '<div class="card pl-ch"><div class="pl-chh"><div><div class="geyebrow">' + esc(first(x.p)) + " asks to remove an agreed goal</div><h3>" + esc(g.title) + '</h3></div>' + wait(route(x.p, g.delReq.at)) + '</div><p class="pl-p"><b>Reason:</b> ' + esc(g.delReq.reason || "") + '</p><div class="pl-acts"><button class="btn small" data-pl="dlkeep:' + g.id + '">Keep it</button><button class="btn small danger" data-pl="dlok:' + g.id + '">Remove it</button></div></div>').join("");
			}
			if (!q.length) { h += '<div class="card pl-clear"><i aria-hidden="true">&#10003;</i><div><b>Nothing waiting for you</b><small>Plans and changes appear here when someone sends them. Each has ' + C.reviewDays + " working days; on day " + C.escalateDay + " it moves to the next level up.</small></div></div>"; }
			// the whole team, all year: plan, checks, progress, stale goals
			h += '<h2 class="sect">Your team</h2>' + (direct.length ? '<div class="card pl-tw"><table class="pl-t"><thead><tr><th>Person</th><th>Plan</th><th>Goals</th><th>Weight</th><th>Checks</th><th>Progress</th><th>Last update</th></tr></thead><tbody>' +
				direct.map(p => {
					const pl = planOf(p), cs = checks(p), bad = cs.filter(c => !c.ok), last = pl.gs.flatMap(g => (g.updates || []).map(u => G.Datepicker.parse(u.d)).concat(g.ciAt ? [day0(new Date(g.ciAt))] : [])).filter(Boolean).sort((a, b) => b - a)[0], stale = pl.gs.length && (ph === "run" || ph === "mid") && (!last || (now() - last) / 864e5 > 45);
					const st = { none: "No goals yet", draft: "Draft", returned: "Returned", sent: "Sent", agreed: "Agreed" }[pl.st];
					return '<tr><td><b>' + esc(first(p)) + "</b><small>" + esc(LVN[p.lv] || "") + "</small></td><td>" + st + (pl.ch.length ? ' <span class="pl-tag gold">' + pl.ch.length + " change</span>" : "") + "</td><td>" + pl.gs.length + "</td><td>" + (pl.gs.length ? pl.weight + "%" : "&ndash;") + "</td><td>" + (!pl.gs.length ? "&ndash;" : bad.length ? '<span class="pl-tag gold">' + bad.length + " to fix</span>" : '<span class="pl-tag ok">All pass</span>') + "</td><td>" + (pl.gs.length ? '<span class="pl-mini"><i style="width:' + pl.avg + '%"></i></span>' + pl.avg + "%" : "&ndash;") + "</td><td>" + (last ? esc(fd(last)) : "&ndash;") + (stale ? ' <span class="pl-tag red">Stale</span>' : "") + "</td></tr>";
				}).join("") + "</tbody></table></div>" : '<p class="sub">Nobody reports to you directly.</p>');
			G.html(h);
		}

		// ---------- Org view (DG): progress under each strategic goal ----------
		function below(g, seen) {
			seen = seen || new Set(); if (seen.has(g.id)) { return []; } seen.add(g.id);
			const o = ownerOf(g); if (!o) { return []; }
			const kids = G.PEOPLE.filter(p => p.boss === o.id).flatMap(p => (G.STORE[p.id] || []).filter(x => x.parent === g.title || (x.from && x.from.gid === g.id)));
			return kids.concat(kids.flatMap(k => below(k, seen)));
		}
		function renderOrg() {
			G.crumb("Org view"); G.tabs();
			const me = G.me(), mine = G.STORE[me.id] || [], eds = G.PEOPLE.filter(p => p.boss === me.id);
			let h = '<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">Org view</h1></div><p class="sub">Progress under each strategic goal, from every goal linked to it at every level. ' + (C.dgEndorsed ? "Strategy endorsed by the Board on " + esc(fds(C.dgEndorsed)) + "." : "The Board's endorsement is not recorded yet (HR records it on the cycle).") + "</p>";
			if (!mine.length) { h += '<div class="empty">No strategic goals yet. Create them on Strategic goals and publish them.</div>'; G.html(h); return; }
			h += mine.map(g => {
				const all = below(g), ppl = new Set(all.map(x => x.owner)), avg = all.length ? Math.round(all.reduce((t, x) => t + (x.own || 0), 0) / all.length) : 0;
				const byEd = eds.map(e => { const xs = all.filter(x => { let p = ownerOf(x); while (p && p.boss !== me.id) { p = G.pById(p.boss); } return p && p.id === e.id; }); return { e, xs, a: xs.length ? Math.round(xs.reduce((t, x) => t + (x.own || 0), 0) / xs.length) : null }; });
				return '<div class="card pl-org"><div class="pl-orgh"><div><div class="geyebrow">Strategic goal &middot; ' + esc(g.statusText || "") + "</div><h3>" + esc(g.title) + '</h3><small>' + esc(g.measure || "") + '</small></div><div class="pl-big"><b>' + avg + "%</b><small>" + all.length + " linked goal" + (all.length === 1 ? "" : "s") + " &middot; " + ppl.size + " " + (ppl.size === 1 ? "person" : "people") + "</small></div></div>" +
					'<div class="pl-orgs">' + byEd.map(x => '<div><span>' + esc(first(x.e)) + "</span>" + (x.a === null ? '<em>Not linked yet</em>' : '<span class="pl-mini w"><i style="width:' + x.a + '%"></i></span><b>' + x.a + "%</b><small>" + x.xs.length + " goal" + (x.xs.length === 1 ? "" : "s") + "</small>") + "</div>").join("") + "</div></div>";
			}).join("");
			G.html(h);
		}

		// ---------- HR cockpit: completion by area, who waits and how long, people with no goals ----------
		function areaOf(p) { if (!p.boss) { return "Director General"; } let x = p; while (x && x.lv !== "ed") { x = G.pById(x.boss); } return x ? x.label.split(",").pop().replace(/^\s*ED\s*/, "").trim() : "Other"; }
		function hrRows() {
			return STAFF().map(p => { const pl = planOf(p), r = pl.since ? route(p, pl.since) : null; return { p, pl, r, area: areaOf(p), ok: clean(p) }; });
		}
		function renderHR() {
			G.crumb("HR cockpit"); G.tabs();
			const me = G.me(), admin = me.lv === "hra", R = hrRows(), ph = phase();
			const withG = R.filter(x => x.pl.gs.length), agreed = R.filter(x => x.pl.st === "agreed");
			const durations = G.ALLG().filter(g => g.sentAt && g.agreedAt && !g.asPushed).map(g => wdays(g.sentAt) - wdays(g.agreedAt)).sort((a, b) => a - b);
			const med = durations.length ? durations[Math.floor(durations.length / 2)] : null;
			const escN = R.filter(x => x.r && x.r.why).length, none = R.filter(x => !x.pl.gs.length), flagged = G.ALLG().filter(g => g.byDefault);
			const pct = R.length ? Math.round(100 * agreed.length / R.length) : 0;
			const areas = [...new Set(R.map(x => x.area))];
			let h = '<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">HR cockpit</h1><span class="row" style="gap:8px"><button class="btn" data-pl="export">Export</button>' +
				(admin ? (ph === "setting" || ph === "before" || ph === "mid" ? '<button class="btn primary" data-pl="hrClose">Close goal setting</button>' : '<button class="btn primary" data-pl="hrOpen">Reopen goal setting</button>') : "") + "</span></div>" +
				'<p class="sub">Goal year ' + C.year + " &middot; " + esc({ before: "goal setting opens " + fds(C.open), setting: "goal setting until " + fds(C.lock), mid: "mid-year reopen until " + fds(C.midTo), run: "plans locked, monthly check-ins", close: "year closed" }[ph]) + (C.demoDays ? " &middot; demo clock +" + C.demoDays + " days (" + esc(fd(now())) + ")" : "") + ". HR sees every plan but cannot change anyone's goals.</p>";
			h += '<div class="kpis"><div class="kpi"><span>Plans agreed</span><b>' + pct + '%</b><div class="kbar"><i style="width:' + pct + '%"></i></div><small>' + agreed.length + " of " + R.length + " people</small></div>" +
				'<div class="kpi"><span>Median review</span><b>' + (med === null ? "&ndash;" : med + " d") + "</b><small>Working days, sent to agreed</small></div>" +
				'<div class="kpi' + (escN ? " w-over" : "") + '"><span>Escalated</span><b>' + escN + "</b><small>Moved up after " + C.escalateDay + " days or away</small></div>" +
				'<div class="kpi' + (none.length ? " w-low" : "") + '"><span>No goals yet</span><b>' + none.length + "</b><small>" + withG.length + " people have goals</small></div></div>";
			h += '<h2 class="sect">By area</h2><div class="card pl-tw"><table class="pl-t"><thead><tr><th>Area</th><th>People</th><th>Agreed</th><th>Oldest wait</th><th>Status</th></tr></thead><tbody>' + areas.map(a => {
				const xs = R.filter(x => x.area === a), ag = xs.filter(x => x.pl.st === "agreed").length, w = xs.filter(x => x.r).map(x => x.r.days), old = w.length ? Math.max.apply(null, w) : null;
				const behind = ph === "setting" && xs.some(x => { const wv = waveOf(x.p); return wv && now() > wv && (x.pl.st === "none" || x.pl.st === "draft"); });
				const st = xs.some(x => x.r && x.r.why) ? ["red", "Escalated"] : xs.some(x => x.r && x.r.reminded) ? ["gold", "Reminded"] : behind ? ["gold", "Behind wave"] : ["ok", "On track"];
				return "<tr><td><b>" + esc(a) + "</b></td><td>" + xs.length + "</td><td>" + Math.round(100 * ag / xs.length) + "%</td><td>" + (old === null ? "&ndash;" : old + " d") + '</td><td><span class="pl-tag ' + st[0] + '">' + st[1] + "</span></td></tr>";
			}).join("") + "</tbody></table></div>";
			const waiting = R.filter(x => x.r).sort((a, b) => b.r.days - a.r.days);
			if (waiting.length) { h += '<h2 class="sect">Waiting for a decision</h2><div class="card pl-tw"><table class="pl-t"><thead><tr><th>Person</th><th>What</th><th>With</th><th>Days</th></tr></thead><tbody>' + waiting.map(x => "<tr><td>" + esc(first(x.p)) + "</td><td>" + (x.pl.sent.length ? "Plan (" + x.pl.sent.length + " goals)" : x.pl.ch.length ? "Change" : x.pl.nr.length ? "Not relevant" : "Removal") + "</td><td>" + esc(first(x.r.r)) + (x.r.why ? ' <span class="pl-tag red">' + (x.r.why === "late" ? "escalated" : "manager away") + "</span>" : "") + "</td><td>" + x.r.days + "</td></tr>").join("") + "</tbody></table></div>"; }
			if (none.length) { h += '<h2 class="sect">No goals yet</h2><div class="pl-people">' + none.map(x => '<span class="pl-pp"><b>' + esc(first(x.p)) + "</b><small>" + esc(LVN[x.p.lv]) + (waveOf(x.p) ? " &middot; wave closes " + esc(fd(waveOf(x.p))) : "") + "</small></span>").join("") + "</div>"; }
			if (flagged.length) { h += '<h2 class="sect">Agreed by default</h2><p class="sub">Plans nobody decided before goal setting closed. They count as agreed; HR follows up.</p><div class="pl-people">' + flagged.map(g => '<span class="pl-pp"><b>' + esc(first(ownerOf(g))) + "</b><small>" + esc(g.title) + "</small></span>").join("") + "</div>"; }
			G.html(h);
		}
		function exportCsv() {
			const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
			const rows = [["person", "level", "area", "plan", "goals", "weight", "checks_pass", "waiting_with", "waiting_days", "escalated", "avg_progress"]].concat(hrRows().map(x => [x.p.label, LVN[x.p.lv], x.area, x.pl.st, x.pl.gs.length, x.pl.weight, x.ok ? "yes" : "no", x.r ? x.r.r.label : "", x.r ? x.r.days : "", x.r && x.r.why ? x.r.why : "", x.pl.avg]));
			const blob = new Blob(["﻿" + rows.map(r => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
			const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "goals-" + C.year + "-plans.csv"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
		}
		function closeSetting() {
			const n = G.ALLG().filter(g => g.plan === "sent");
			if (!window.confirm("Close goal setting for " + C.year + "? Plans are locked. " + n.length + " goal" + (n.length === 1 ? "" : "s") + " still waiting will count as agreed by default and be flagged to HR.")) { return; }
			n.forEach(g => { setPlan(g, "agreed"); g.agreedAt = nowTs(); g.byDefault = true; ev(g, "agreed_by_default", "Agreed by default: goal setting closed before a decision. Flagged to HR · " + you(), {}); });
			C.state = "closed"; C.closedAt = isoD(now()); saveCycle("Closed goal setting (" + n.length + " agreed by default)");
			G.toast("Goal setting closed. " + n.length + " agreed by default."); G.render();
		}

		// ---------- Cycle (HR admin): the windows and the nine rules ----------
		function renderCycle() {
			G.crumb("Cycle"); G.tabs();
			const f = (id, label, v, hint, type) => '<label class="pl-f"><span>' + label + "</span><input id=\"" + id + '" type="' + (type || "text") + '" value="' + esc(v) + '">' + (hint ? "<small>" + hint + "</small>" : "") + "</label>";
			const absent = C.absent || {};
			let h = '<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">Cycle ' + C.year + '</h1><span class="row" style="gap:8px"><button class="btn primary" data-pl="cycSave">Save rules</button></span></div><p class="sub">The windows and the nine rules for goal year ' + C.year + ". Changing a rule needs no developer and no transport. " + (SHARED ? "Saved for everyone." : "Saved in this browser until the cycle table is added on the server.") + "</p>" +
				'<h2 class="sect">Windows</h2><div class="card pl-form">' + f("cOpen", "Goal setting opens", C.open, "", "date") + f("cW_dg", "Wave 1: Director General", C.waves.dg, "Publishes the strategic goals", "date") + f("cW_ed", "Wave 2: Executive Directors", C.waves.ed, "Link to strategy, push down", "date") + f("cW_dir", "Wave 3: Directors and Managers", C.waves.dir, "Link, push down, agree plans", "date") + f("cW_emp", "Wave 4: Section heads and Employees", C.waves.emp, "Last wave", "date") + f("cLock", "Lock date", C.lock, "After it, material edits need a reason", "date") + f("cMidF", "Mid-year reopen from", C.midFrom, "Add, drop, re-weight", "date") + f("cMidT", "Mid-year reopen until", C.midTo, "", "date") +
				'<label class="pl-f"><span>Goal setting is</span><select id="cState"><option value="auto"' + (C.state === "auto" ? " selected" : "") + '>Open and closed by the dates</option><option value="open"' + (C.state === "open" ? " selected" : "") + '>Open now</option><option value="closed"' + (C.state === "closed" ? " selected" : "") + ">Closed</option></select><small>Now: " + esc(phase()) + "</small></label>" +
				f("cDG", "Board endorsed the strategy on", C.dgEndorsed, "The Director General's goals need no in-app approval", "date") + "</div>" +
				'<h2 class="sect">The nine rules</h2><div class="card pl-form">' + f("cMin", "Fewest goals", C.minGoals, "Checked on Send my goals", "number") + f("cMax", "Most goals", C.maxGoals, "", "number") + f("cTot", "Total weight (%)", C.totalWeight, "", "number") + f("cMinW", "Least weight per goal (%)", C.minWeight, "", "number") + f("cRev", "Review time (working days)", C.reviewDays, "From the factory calendar", "number") + f("cRem", "Reminder on day", C.remindDay, "", "number") + f("cEsc", "Escalate on day", C.escalateDay, "To the next level up", "number") + f("cMat", "Material weight change (points)", C.materialWeight, "Smaller moves need no review", "number") + f("cAbs", "Absence before routing (days)", C.absenceDays, "Read from PA2001 in ECC", "number") + f("cInv", "Invitation expiry (days)", C.inviteDays, "Unanswered invitations close", "number") + "</div>" +
				'<h2 class="sect">Demo controls</h2><div class="card pl-form"><p class="pl-hint" style="grid-column:1/-1">For trying the process here only. In ECC the date is the real date and absence comes from PA2001.</p>' + f("cDemo", "Move the clock forward (days)", C.demoDays || 0, "Today in the app: " + fd(now()), "number") +
				'<label class="pl-f"><span>Away for 5+ days</span><select id="cAway" multiple size="5">' + STAFF().filter(p => G.PEOPLE.some(x => x.boss === p.id)).map(p => '<option value="' + p.id + '"' + ((+absent[p.id] || 0) >= C.absenceDays ? " selected" : "") + ">" + esc(p.label) + "</option>").join("") + "</select><small>Their reviews go one level up at once</small></label></div>" +
				(HIST.length ? '<h2 class="sect">Changes</h2><div class="card"><ul class="pl-hist">' + HIST.slice(0, 10).map(x => "<li><b>" + esc(fd(day0(new Date(x.at)))) + "</b> " + esc(x.what) + " &middot; " + esc(first(G.pById(x.by)) || x.by || "") + "</li>").join("") + "</ul></div>" : "");
			G.html(h);
		}
		function saveRules() {
			const v = id => $("#" + id).value, n = (id, lo, hi) => { const x = +v(id); return Number.isInteger(x) && x >= lo && x <= hi ? x : null; };
			const nums = { minGoals: n("cMin", 1, 20), maxGoals: n("cMax", 1, 20), totalWeight: n("cTot", 1, 1000), minWeight: n("cMinW", 0, 100), reviewDays: n("cRev", 1, 60), remindDay: n("cRem", 1, 60), escalateDay: n("cEsc", 1, 90), materialWeight: n("cMat", 1, 100), absenceDays: n("cAbs", 1, 60), inviteDays: n("cInv", 1, 365), demoDays: n("cDemo", 0, 400) };
			const bad = Object.keys(nums).filter(k => nums[k] === null);
			if (bad.length) { G.toast("Check the numbers: each must be a whole number in range."); return; }
			if (nums.minGoals > nums.maxGoals || nums.remindDay >= nums.escalateDay) { G.toast("Fewest goals must not exceed most goals, and the reminder must come before escalation."); return; }
			const dates = { open: v("cOpen"), lock: v("cLock"), midFrom: v("cMidF"), midTo: v("cMidT"), dgEndorsed: v("cDG") }, waves = { dg: v("cW_dg"), ed: v("cW_ed"), dir: v("cW_dir"), mgr: v("cW_dir"), sh: v("cW_emp"), emp: v("cW_emp") };
			if ([dates.open, dates.lock, dates.midFrom, dates.midTo].concat(Object.values(waves)).some(x => !pd(x))) { G.toast("Every window needs a date."); return; }
			const away = {}; [...$("#cAway").selectedOptions].forEach(o => { away[o.value] = C.absenceDays; });
			const was = JSON.stringify(C);
			Object.assign(C, nums, dates, { waves, state: v("cState"), absent: away });
			if (C.state !== "closed") { C.closedAt = ""; }
			if (JSON.stringify(C) === was) { G.toast("No changes."); return; }
			saveCycle("Rules and windows saved").then(() => { G.toast(SHARED ? "Saved for everyone." : "Saved in this browser."); G.render(); });
			G.render();
		}

		// ---------- Monthly check-in: one screen, actual values, % calculated ----------
		function renderCheckin() {
			const me = G.me(), gs = G.STORE[me.id] || [], t = now();
			G.crumb("Check-in"); G.tabs();
			let h = '<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">' + MONTH[t.getMonth()] + ' check-in</h1><span class="row" style="gap:8px"><button class="btn" data-pl="back">Back to my goals</button></span></div><p class="sub">Takes about 2 minutes. Type where each goal stands; the percentage is calculated.</p>';
			if (!gs.length) { h += '<div class="empty">No goals to update yet.</div>'; G.html(h); return; }
			h += '<div class="card pl-ci">' + gs.map(g => {
				const m = g.m, p = g.own || 0;
				let inp;
				if (g.rolled) { inp = '<span class="pl-roll">Rolls up from ' + g.rolled + " " + (g.rolled > 1 ? "people" : "person") + "</span>"; }
				else if (!m) { inp = '<label class="pl-ciin"><span class="pl-sr">Progress</span><input data-ci="' + g.id + '" data-k="pct" inputmode="numeric" value="' + p + '"><em>%</em></label><button type="button" class="pl-link" data-pl="measure:' + g.id + '">Set a measure</button>'; }
				else if (m.kind === "num") { inp = '<span class="pl-ft">From ' + esc(fmtN(m.from)) + " to " + esc(fmtN(m.to)) + " " + esc(m.unit) + '</span><label class="pl-ciin"><span class="pl-sr">Actual value</span><input data-ci="' + g.id + '" data-k="num" inputmode="decimal" value="' + esc(m.actual ?? "") + '" placeholder="' + esc(fmtN(m.from)) + '"></label>'; }
				else if (m.kind === "ms") { inp = '<span class="pl-ft">Milestone goal</span><label class="pl-ciin"><span class="pl-sr">Milestones done</span><select data-ci="' + g.id + '" data-k="ms">' + Array.from({ length: m.n + 1 }, (_, i) => '<option value="' + i + '"' + (i === (m.done || 0) ? " selected" : "") + ">" + i + " of " + m.n + "</option>").join("") + "</select></label>"; }
				else { inp = '<span class="pl-ft">Due ' + esc(g.due) + '</span><label class="pl-cichk"><input type="checkbox" data-ci="' + g.id + '" data-k="done"' + (m.done ? " checked" : "") + "> Done</label>"; }
				return '<div class="pl-cir"><div class="pl-cit"><b>' + esc(g.title) + "</b></div>" + '<div class="pl-cif">' + inp + "</div>" + '<span class="pl-cip" id="cip_' + g.id + '">' + p + "%</span></div>";
			}).join("") + '<label class="fl" for="ciNote">One line for your manager (optional)</label><textarea id="ciNote" class="pl-ta" rows="2"></textarea><div class="pl-acts"><button class="btn primary" data-pl="ciSave">Save check-in</button></div></div>';
			G.html(h);
		}
		function ciValue(el, g) {
			const k = el.dataset.k, m = g.m;
			if (k === "pct") { const x = num(el.value); return x === null ? null : { p: Math.max(0, Math.min(100, Math.round(x))) }; }
			if (k === "num") { const x = num(el.value); if (x === null) { return null; } const mm = Object.assign({}, m, { actual: x }); return { p: pctOf(mm, g.own), m: mm, txt: "actual " + fmtN(x) + " " + m.unit }; }
			if (k === "ms") { const mm = Object.assign({}, m, { done: +el.value }); return { p: pctOf(mm), m: mm, txt: el.value + " of " + m.n + " milestones done" }; }
			const mm = Object.assign({}, m, { done: el.checked }); return { p: pctOf(mm), m: mm, txt: el.checked ? "done" : "not done" };
		}
		function saveCheckin() {
			const me = G.me(), note = ($("#ciNote").value || "").trim(), ts = nowTs(); let n = 0, bad = 0;
			ROOT.querySelectorAll("[data-ci]").forEach(el => {
				const g = G.findG(+el.dataset.ci); if (!g) { return; }
				const v = ciValue(el, g); if (!v) { if (String(el.value || "").trim() !== "") { bad++; } return; }
				g.ciAt = ts;
				const changed = v.p !== (g.own || 0) || (v.m && JSON.stringify(v.m) !== JSON.stringify(g.m));
				if (!changed) { return; }
				if (v.m) { g.m = v.m; }
				G.setOwn(g, v.p, "Check-in: " + v.p + "%");
				g.updates.unshift({ id: G.Store.nid(), d: G.today(), n: "Check-in" + (v.txt ? ": " + v.txt : "") + (note ? ". " + note : ""), p: v.p, a: note ? 1 : undefined });
				ev(g, "progress", "Progress update: " + v.p + "% (" + MONTH[now().getMonth()] + " check-in) · " + you(), { checkin: true });
				n++;
			});
			(G.STORE[me.id] || []).forEach(g => { g.ciAt = ts; });
			if (bad) { G.toast("Some values are not numbers; they were left out."); }
			G.toast(n ? "Check-in saved: " + n + " goal" + (n > 1 ? "s" : "") + " updated." : "Check-in saved. Nothing changed this month.");
			G.go("list");
		}

		// ---------- who may see what: the reporting line, contributors and HR see everything; others only titles ----------
		function canSee(g) {
			const me = G.me(), o = ownerOf(g); if (!o || isHR(me) || o.id === me.id) { return true; }
			const above = (a, b) => { let x = G.pById(b.boss); while (x) { if (x.id === a.id) { return true; } x = G.pById(x.boss); } return false; };
			if (above(me, o) || above(o, me)) { return true; }
			if ((g.contribs || []).some(c => c.who === me.label)) { return true; }
			return (G.STORE[me.id] || []).some(x => x.cto === g.title || (x.from && x.from.gid === g.id));
		}

		// ---------- tabs per role ----------
		function addTabs() {
			const nav = ROOT.querySelector(".goalsnav"), log = $("#tabLog");
			[["tabTeam", "My team", "team"], ["tabOrg", "Org view", "org"], ["tabHR", "HR cockpit", "hr"], ["tabCycle", "Cycle", "cycle"]].forEach(x => {
				if ($("#" + x[0])) { return; }
				const b = document.createElement("button"); b.className = "tab"; b.id = x[0]; b.textContent = x[1]; b.hidden = true; b.type = "button";
				b.onclick = () => G.go(x[2]);
				if (x[0] === "tabTeam" || x[0] === "tabOrg") { nav.insertBefore(b, $("#tabDash")); } else { nav.appendChild(b); }
			});
			void log;
		}
		addTabs();
		function roleTabs() {
			const me = G.me(), hr = isHR(me), top = !me.boss && !hr, lead = G.PEOPLE.some(x => x.boss === me.id);
			const show = { tabList: !hr, tabAlign: !hr, tabTeam: lead, tabOrg: top, tabDash: false, tabAppr: false, tabLog: hr, tabHR: hr, tabCycle: me.lv === "hra" };
			Object.keys(show).forEach(id => { const b = $("#" + id); if (b) { b.hidden = !show[id]; } });
		}
		function tabs(v) {
			[["tabTeam", "team"], ["tabOrg", "org"], ["tabHR", "hr"], ["tabCycle", "cycle"]].forEach(x => { const b = $("#" + x[0]); if (b) { b.classList.toggle("on", v === x[1]); b.setAttribute("aria-current", v === x[1] ? "page" : "false"); } });
			const l = $("#tabList"); if (l && v === "checkin") { l.classList.add("on"); }
		}
		const home = () => isHR(G.me()) ? "hr" : "list";
		function render(v) {
			if (v === "team") { renderTeam(); return true; }
			if (v === "org") { renderOrg(); return true; }
			if (v === "hr") { renderHR(); return true; }
			if (v === "cycle") { if (G.me().lv !== "hra") { G.go(home()); return true; } renderCycle(); return true; }
			if (v === "checkin") { renderCheckin(); return true; }
			return false;
		}
		function suggestWeights() {
			const me = G.me(), gs = G.STORE[me.id] || [], n = gs.length;
			if (!n) { return; }
			if (n * C.minWeight > C.totalWeight) { G.toast("With " + n + " goals, " + C.minWeight + "% each is more than " + C.totalWeight + "%. Keep " + C.minGoals + " to " + C.maxGoals + " goals."); return; }
			const base = Math.floor(C.totalWeight / n / 5) * 5; let left = C.totalWeight - base * n;
			gs.forEach(g => { let w = base; if (left >= 5) { w += 5; left -= 5; } else if (left > 0) { w += left; left = 0; } if (g.weight !== w) { const old = g.weight; g.weight = w; ev(g, "weight_set", "Weight set to " + w + "% (suggested) · " + you(), {}); weighted(g, old, w); } });
			G.toast("Weights suggested: an equal share each, " + C.totalWeight + "% in total. Change any on the goal.");
			G.render();
		}

		// ---------- one click handler for everything this module draws ----------
		ROOT.addEventListener("input", e => {
			const el = e.target.closest && e.target.closest("[data-ci]"); if (!el) { return; }
			const g = G.findG(+el.dataset.ci), out = $("#cip_" + el.dataset.ci); if (!g || !out) { return; }
			const v = ciValue(el, g); out.textContent = v ? v.p + "%" : "–";
		});
		ROOT.addEventListener("change", e => { const el = e.target.closest && e.target.closest("[data-ci]"); if (el && el.tagName !== "INPUT") { el.dispatchEvent(new Event("input", { bubbles: true })); } if (el && el.type === "checkbox") { el.dispatchEvent(new Event("input", { bubbles: true })); } });
		ROOT.addEventListener("click", e => {
			const b = e.target.closest && e.target.closest("[data-pl]"); if (!b || b.disabled) { return; }
			const [a, arg] = b.dataset.pl.split(/:(.*)/s), g = arg ? G.findG(+arg) : null, me = G.me();
			if (a === "send") { sendPlan(); }
			else if (a === "checkin") { G.go("checkin"); }
			else if (a === "back") { G.go("list"); }
			else if (a === "ciSave") { saveCheckin(); }
			else if (a === "team") { G.go("team"); }
			else if (a === "toPlan") { const el = ROOT.querySelector(".pl-bar"); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("pl-flash"); setTimeout(() => el.classList.remove("pl-flash"), 1400); } }
			else if (a === "toInv") { const el = ROOT.querySelector(".invcard"); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); } }
			else if (a === "open" && g) { G.openGoal(g.id); }
			else if (a === "suggestW") { suggestWeights(); }
			else if (a === "measure" && g) { measureDlg(g); }
			else if (a === "nrel" && g) { notRel(g); }
			else if (a === "exp") { open.has(arg) ? open.delete(arg) : open.add(arg); retFor = null; G.render(); }
			else if (a === "agree") { const p = G.pById(arg); if (!p) { return; } const n = agreePlan(p); G.toast("Agreed " + first(p) + "'s plan (" + n + " goal" + (n === 1 ? "" : "s") + ")."); open.delete(arg); G.render(); }
			else if (a === "agreeClean") { const xs = queue().filter(x => x.pl.sent.length && clean(x.p)); let n = 0; xs.forEach(x => { n += agreePlan(x.p, "all checks passed"); }); G.toast("Agreed " + xs.length + " clean plan" + (xs.length === 1 ? "" : "s") + " (" + n + " goals) in one click."); G.render(); }
			else if (a === "ret" && g) { retFor = g.id; retErr = ""; G.render(); setTimeout(() => { const t = $("#plRet"); if (t) { t.focus(); } }, 30); }
			else if (a === "retx") { retFor = null; retErr = ""; G.render(); }
			else if (a === "retpick") { const t = $("#plRet"); if (t) { t.value = b.textContent; t.focus(); } }
			else if (a === "retok" && g) { const why = ($("#plRet").value || "").trim(); if (!why) { retErr = "Say what they should change."; G.render(); return; } const r = G.ai() ? G.aiGet("cm|" + g.id + "|" + checks(ownerOf(g)).filter(c => !c.ok && (c.gs || []).includes(g)).map(c => c.t).join(","), "comment", {}) : null; if (r && r.data && r.data.id && (r.data.options || []).some(o => o.text === why)) { G.Store.aiAccept(r.data.id, why); } returnGoal(g, why); retFor = null; retErr = ""; G.toast("Returned to " + first(ownerOf(g)) + ". The rest of the plan can be agreed now."); G.render(); }
			else if (a === "chok" && g) { decideChange(g, true); G.render(); }
			else if (a === "chno" && g) { if (g.before) { decideChange(g, false); G.render(); } else { reasonDlg("Return this goal", "<b>" + esc(g.title) + "</b>", "What should change?", "Return goal", why => { decideChange(g, false, why); G.render(); }); } }
			else if (a === "nrkeep" && g) { const o = ownerOf(g); g.notRel = null; g.note = "Kept on your plan by " + first(me) + "."; ev(g, "not_relevant_kept", "Kept on the plan by " + me.label + " · " + you(), {}); G.toast("Kept on " + first(o) + "'s plan."); G.render(); }
			else if (a === "nrrm" && g) { G.doDelete(g, "removed by " + first(me) + ": not relevant to " + first(ownerOf(g))); }
			else if (a === "dlok" && g) { G.approveDel(g); }
			else if (a === "dlkeep" && g) { G.returnDel(g, "Kept by " + first(me), true); }
			else if (a === "export") { exportCsv(); }
			else if (a === "hrClose") { closeSetting(); }
			else if (a === "hrOpen") { if (!window.confirm("Reopen goal setting? People can add, drop and re-weight goals freely until you close it again.")) { return; } C.state = "open"; C.closedAt = ""; saveCycle("Reopened goal setting"); G.toast("Goal setting is open."); G.render(); }
			else if (a === "cycSave") { saveRules(); }
		});

		return {
			ready, sync, render, roleTabs, tabs, home, planBar, digest, progLine, cardNote, cardBtns, newGoal, added, pushedCopy, edited, weighted, canSee,
			locked, setPlan, mText, needsOk: g => locked() && (g.plan === "agreed" || g.plan === "change") && !!(ownerOf(g) || {}).boss
		};
	}
	return { make: make };
});
