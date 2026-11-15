// The sandbox's state, rules and actions: a port of index.html's script, with no UI in it.
// derive() turns the state into what the views bind to; every action returns {msg, nav}.
sap.ui.define([], function () {
	"use strict";

	const KEY = "ajmn-ts-fiori";
	const T = {
		en: {
			home: "Home", goals: "Goals", performance: "Performance", growth: "Growth", opportunities: "Opportunities", talent: "Talent", insights: "Insights", admin: "Configuration", audit: "Audit log",
			r_employee: "Employee", r_manager: "Line manager", r_hrbp: "HR business partner", r_talent: "Talent and calibration", r_exec: "Executive", r_admin: "Talent admin",
			sandbox: "Sandbox", viewas: "Viewing as", demo: "Demo script · Gate A", reset: "Reset sandbox", sample: "Synthetic data",
			needs: "Needs you", risk: "At risk", ask: "Ask anything", askhint: "Ask about anything you are allowed to see", aigen: "AI-generated · you decide",
			items: "items", signals: "signals",
			c_employee: "Employee cockpit", c_manager: "Manager cockpit", c_hrbp: "HR business partner cockpit", c_talent: "Talent and calibration cockpit", c_exec: "Executive cockpit", c_admin: "Admin cockpit",
			h_employee: "Your work today", h_manager: "Your team today", h_hrbp: "Your organisation today", h_talent: "Calibration and bench", h_exec: "Your division at a glance", h_admin: "Configuration and audit",
			reviews: "Reviews", feedback: "Feedback", calibration: "Calibration", succession: "Succession and career", development: "Development", learning: "Learning",
			addgoal: "Add goal", approve: "Approve", submit: "Submit", signoff: "Sign off and release", savedraft: "Save draft", publish: "Publish", cancel: "Cancel", confirm: "Confirm", interest: "Express interest", nominate: "Nominate",
			denied: "You do not have access to this record", hub: "Talent intelligence hub", market: "Opportunity marketplace"
		},
		ar: {
			home: "الرئيسية", goals: "الأهداف", performance: "الأداء", growth: "النمو", opportunities: "الفرص", talent: "المواهب", insights: "الرؤى", admin: "الإعدادات", audit: "سجل التدقيق",
			r_employee: "موظف", r_manager: "مدير مباشر", r_hrbp: "شريك أعمال الموارد البشرية", r_talent: "المواهب والمعايرة", r_exec: "تنفيذي", r_admin: "مسؤول المواهب",
			sandbox: "بيئة تجريبية", viewas: "العرض بصفة", demo: "سيناريو العرض · البوابة A", reset: "إعادة الضبط", sample: "بيانات اصطناعية",
			needs: "يحتاج إليك", risk: "معرّض للخطر", ask: "اسأل أي شيء", askhint: "اسأل عن أي شيء يُسمح لك برؤيته", aigen: "مولّد بالذكاء الاصطناعي · القرار لك",
			items: "عناصر", signals: "مؤشرات",
			c_employee: "لوحة الموظف", c_manager: "لوحة المدير", c_hrbp: "لوحة شريك الموارد البشرية", c_talent: "لوحة المواهب والمعايرة", c_exec: "اللوحة التنفيذية", c_admin: "لوحة المسؤول",
			h_employee: "عملك اليوم", h_manager: "فريقك اليوم", h_hrbp: "مؤسستك اليوم", h_talent: "المعايرة وجاهزية الخلفاء", h_exec: "قسمك في لمحة", h_admin: "الإعدادات والتدقيق",
			reviews: "التقييمات", feedback: "الملاحظات", calibration: "المعايرة", succession: "التعاقب والمسار المهني", development: "التطوير", learning: "التعلّم",
			addgoal: "إضافة هدف", approve: "اعتماد", submit: "إرسال", signoff: "اعتماد نهائي ونشر", savedraft: "حفظ مسودة", publish: "نشر", cancel: "إلغاء", confirm: "تأكيد", interest: "إبداء الاهتمام", nominate: "ترشيح",
			denied: "ليست لديك صلاحية الوصول إلى هذا السجل", hub: "مركز معلومات المواهب", market: "سوق الفرص"
		}
	};

	/* ---------- seed (synthetic) ---------- */
	const TODAY = new Date("2026-11-11T09:00:00");
	const today = () => TODAY.toISOString().slice(0, 10);
	const daysAgo = d => { const x = new Date(TODAY); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
	const age = g => Math.round((TODAY - new Date(g.updated)) / 864e5);
	const ROLE_USER = { employee: "sara", manager: "omar", hrbp: "layla", talent: "yusuf", exec: "noura", admin: "dina" };
	const TEAM = ["sara", "karim", "aisha", "daniel", "mariam", "tariq", "hana", "fatima", "ravi"];
	const ROUTES = ["home", "goals", "performance", "growth", "opportunities", "talent", "insights", "admin", "audit"];
	const NAV = { employee: ["home", "goals", "performance", "growth", "opportunities"], manager: ["home", "goals", "performance", "growth", "opportunities", "talent", "insights"], hrbp: ["home", "goals", "performance", "talent", "insights", "audit"], talent: ["home", "performance", "talent", "insights", "audit"], exec: ["home", "goals", "talent", "insights"], admin: ["home", "admin", "audit", "insights"] };
	const ICON = { home: "home", goals: "target-group", performance: "performance", growth: "learning-assistant", opportunities: "opportunity", talent: "group", insights: "bar-chart", admin: "action-settings", audit: "history" };
	const ALIGN = ["Lead live coverage of the 2026 regional elections", "Grow digital audience by 20%", "Modernise production workflows", "Grow and keep talent"];
	const BAND = ["", "Low", "Mid", "High"];
	const BOXES = ["3-1", "3-2", "3-3", "2-1", "2-2", "2-3", "1-1", "1-2", "1-3"];

	function seed() {
		const P = (id, name, title, unit, mgr, lvl, skills, extra) => Object.assign({ id, name, title, div: "News", unit, mgr, lvl, skills, matrix: null, risk: "Low", impact: "Medium" }, extra || {});
		const people = [
			P("noura", "Noura Saleh", "Executive Director, News", "News division", null, 1, ["Leadership", "Editorial judgement"]),
			P("hassan", "Hassan Idris", "Director, Newsroom Operations", "Newsroom operations", "noura", 2, ["Leadership", "Live production"]),
			P("omar", "Omar Khalil", "Head of Newsroom Production", "Newsroom production", "hassan", 3, ["Leadership", "Live production", "Editorial judgement"]),
			P("sara", "Sara Haddad", "Senior Producer", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production", "Audience analytics"], { risk: "Medium", impact: "High" }),
			P("karim", "Karim Nasser", "Producer", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production", "Audience analytics"]),
			P("aisha", "Aisha Farouk", "Senior Editor", "Newsroom production", "omar", 4, ["Editorial judgement", "Data storytelling"], { risk: "High", impact: "High" }),
			P("daniel", "Daniel Okoye", "Broadcast Director", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production"]),
			P("mariam", "Mariam Qasim", "Producer", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production", "Audience analytics"]),
			P("tariq", "Tariq Bennani", "Video Journalist", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production"], { matrix: "reem" }),
			P("hana", "Hana Yilmaz", "Assistant Producer", "Newsroom production", "omar", 5, ["Live production"]),
			P("fatima", "Fatima Idrissi", "Head of Output", "Newsroom production", "omar", 4, ["Editorial judgement", "Live production"], { risk: "Medium", impact: "High" }),
			P("ravi", "Ravi Menon", "Graphics Producer", "Newsroom production", "omar", 4, ["Editorial judgement", "Audience analytics"]),
			P("reem", "Reem Odeh", "Head of Digital Products", "Digital", "noura", 3, ["Audience analytics", "Data storytelling", "Leadership"], { div: "Digital" }),
			P("layla", "Layla Mansour", "HR Business Partner, News", "Human Resources", null, 3, ["Leadership"], { div: "Corporate" }),
			P("yusuf", "Yusuf Rahman", "Talent and Calibration Lead", "Human Resources", null, 3, ["Leadership"], { div: "Corporate" }),
			P("dina", "Dina Aziz", "Talent Systems Administrator", "Human Resources", null, 4, [], { div: "Corporate" })
		];
		const G = (id, owner, title, cat, weight, progress, status, upd, align, contrib) => ({ id, owner, title, cat, weight, progress, status, updated: daysAgo(upd), align, contributors: contrib || [] });
		const goals = [
			G("g1", "sara", "Lead the live results desk for the regional elections", "Editorial impact", 40, 55, "Approved", 12, ALIGN[0], ["karim", "ravi"]),
			G("g2", "sara", "Cut bulletin turnaround from 40 to 30 minutes", "Operational excellence", 35, 70, "Approved", 38, ALIGN[2]),
			G("g3", "sara", "Coach two assistant producers on live gallery work", "People and development", 25, 40, "Approved", 20, ALIGN[3], ["hana"]),
			G("g4", "karim", "Launch a weekly explainer for the digital feed", "Audience and digital", 60, 10, "Submitted", 3, ALIGN[1]),
			G("g5", "karim", "Own the overnight running order", "Operational excellence", 40, 0, "Submitted", 3, ALIGN[2]),
			G("g6", "mariam", "Produce the election night special", "Editorial impact", 100, 5, "Submitted", 2, ALIGN[0]),
			G("g7", "tariq", "Deliver 12 field packages for the digital feed", "Audience and digital", 100, 0, "Submitted", 1, ALIGN[1]),
			G("g8", "daniel", "Move the second gallery to IP-based workflow", "Operational excellence", 100, 25, "Approved", 52, ALIGN[2]),
			G("g9", "fatima", "Publish an output style guide in Arabic and English", "Editorial impact", 100, 30, "Approved", 47, ALIGN[0]),
			G("g10", "aisha", "Build a data desk template for election graphics", "Audience and digital", 100, 60, "Approved", 9, ALIGN[1], ["ravi"])
		];
		const R = (step, self, mgr, comp) => ({ step, self, mgr, comp: comp || {}, selfComment: "", mgrComment: "", released: step === "done" });
		const reviews = {
			sara: Object.assign(R("manager", 3, null), { selfComment: "Election desk is on track; turnaround target is close. I want more data skills." }),
			karim: Object.assign(R("manager", 3, null), { selfComment: "Explainer pilot launched late but audience response is strong." }),
			hana: R("self", null, null),
			aisha: R("done", 4, 4), daniel: R("done", 3, 2), mariam: R("done", 3, 3), tariq: R("done", 3, 3), fatima: R("done", 3, 3), ravi: R("done", 2, 2)
		};
		const place = { aisha: { perf: 3, pot: 3 }, daniel: { perf: 2, pot: 1 }, mariam: { perf: 2, pot: 2 }, tariq: { perf: 2, pot: 3 }, fatima: { perf: 2, pot: 2 }, ravi: { perf: 1, pot: 2 }, karim: { perf: 2, pot: 3 } };
		return {
			v: 3, lang: "en", role: "employee", route: "home", sub: { performance: "reviews", talent: "calibration", growth: "development", admin: "scales" },
			people, goals, reviews,
			calib: { place, unrated: ["sara", "hana"], released: false, trail: [] },
			positions: [
				{ id: "p1", title: "Head of Newsroom Production", holder: "omar", succ: [{ pid: "sara", ready: "Ready in 1 to 2 years" }, { pid: "daniel", ready: "Ready now" }] },
				{ id: "p2", title: "Head of Output", holder: "fatima", succ: [{ pid: "karim", ready: "Ready in 1 to 2 years" }] },
				{ id: "p3", title: "Senior Editor, Elections Desk", holder: "aisha", succ: [] },
				{ id: "p4", title: "Director, Newsroom Operations", holder: "hassan", succ: [{ pid: "omar", ready: "Ready now" }, { pid: "reem", ready: "Ready in 3 to 5 years" }] }
			],
			feedback: [
				{ id: "f1", from: "karim", to: "sara", text: "Calm and clear in the gallery on the budget night. The handover notes saved us twenty minutes.", goal: "g1", date: daysAgo(6), kind: "given" },
				{ id: "f2", from: "reem", to: "sara", text: "Good instinct for what works on the digital feed. Bring the data team in earlier.", goal: "g1", date: daysAgo(15), kind: "given" },
				{ id: "f3", from: "hana", to: "sara", text: "Thank you for the gallery coaching sessions. I can now run the second camera script alone.", goal: "g3", date: daysAgo(21), kind: "given" },
				{ id: "f4", from: "sara", to: "karim", text: "", goal: null, date: daysAgo(2), kind: "request" }
			],
			dev: [{ id: "d1", pid: "sara", title: "Shadow the data desk for two election nights", cat: "Skills & Future Readiness", link: "Data storytelling", status: "In progress", source: "Self" }],
			catalogue: [
				{ id: "l1", title: "Live production safety", type: "Compliance", hours: 1, skill: "Live production" },
				{ id: "l2", title: "Data storytelling fundamentals", type: "E-learning", hours: 3, skill: "Data storytelling" },
				{ id: "l3", title: "Audience analytics with dashboards", type: "Workshop", hours: 6, skill: "Audience analytics" },
				{ id: "l4", title: "Arabic and English editorial style", type: "E-learning", hours: 2, skill: "Editorial judgement" },
				{ id: "l5", title: "Leading a production team", type: "Programme", hours: 16, skill: "Leadership" }
			],
			assign: [{ id: "a1", pid: "sara", lid: "l1", due: "2026-11-30", status: "Assigned" }, { id: "a2", pid: "sara", lid: "l2", due: "2026-12-15", status: "In progress" }, { id: "a3", pid: "hana", lid: "l1", due: "2026-11-30", status: "Completed" }],
			opps: [
				{ id: "o1", title: "Digital election coverage", type: "Project", dur: "8 weeks", owner: "reem", skills: ["Audience analytics", "Data storytelling", "Editorial judgement"], interest: [{ pid: "sara", status: "Awaiting manager" }] },
				{ id: "o2", title: "Mentor for new producers", type: "Mentoring", dur: "2 hours a week", owner: "omar", skills: ["Live production", "Editorial judgement"], interest: [] },
				{ id: "o3", title: "Arabic to English desk rotation", type: "Short assignment", dur: "3 months", owner: "hassan", skills: ["Editorial judgement", "Arabic-English translation"], interest: [] },
				{ id: "o4", title: "Data visualisation sprint", type: "Project", dur: "4 weeks", owner: "reem", skills: ["Data storytelling", "Audience analytics"], interest: [] },
				{ id: "o5", title: "Senior Digital Producer", type: "Internal role", dur: "Permanent", owner: "reem", skills: ["Audience analytics", "Editorial judgement", "Live production"], interest: [] }
			],
			cfg: {
				scales: {
					four: { name: "4-point performance scale", use: "Goals and overall rating", pub: { version: 1, values: [{ v: 1, label: "Below expectations", band: 1 }, { v: 2, label: "Meets expectations", band: 2 }, { v: 3, label: "Exceeds expectations", band: 3 }, { v: 4, label: "Outstanding", band: 3 }] }, draft: null },
					six: { name: "0 to 6 competency scale", use: "Competencies", pub: { version: 1, values: [0, 1, 2, 3, 4, 5, 6].map(v => ({ v, label: ["Not shown", "Emerging", "Developing", "Solid", "Strong", "Excellent", "Role model"][v], band: v <= 2 ? 1 : v <= 4 ? 2 : 3 })) }, draft: null }
				},
				route: { pub: { version: 1, steps: [{ key: "self", label: "Self-assessment", on: true, who: "employee" }, { key: "manager", label: "Manager assessment", on: true, who: "manager" }, { key: "hr", label: "HR review", on: false, who: "hrbp" }, { key: "signoff", label: "Sign-off", on: true, who: "manager" }] }, draft: null },
				grid: { pub: { version: 1, labels: { "3-1": "Potential gem", "3-2": "High potential", "3-3": "Star", "2-1": "Inconsistent", "2-2": "Core contributor", "2-3": "High performer", "1-1": "Under review", "1-2": "Effective", "1-3": "Trusted professional" } }, draft: null },
				readiness: ["Ready now", "Ready in 1 to 2 years", "Ready in 3 to 5 years"],
				devcats: ["Performance & Role Excellence", "Career & Leadership Growth", "Skills & Future Readiness"],
				goalcats: ["Editorial impact", "Audience and digital", "Operational excellence", "People and development"],
				goalrules: { min: 3, max: 7, total: 100 },
				ai: { ask: { employee: true, manager: true, hrbp: true, talent: true, exec: true, admin: true }, assist: { employee: true, manager: true, hrbp: true, talent: true, exec: false, admin: false }, insight: { employee: false, manager: true, hrbp: true, talent: true, exec: true, admin: false }, act: { employee: false, manager: false, hrbp: false, talent: false, exec: false, admin: false } }
			},
			comps: ["Editorial judgement", "Collaboration", "Delivery under pressure"],
			audit: [{ ts: "2026-11-10 17:02", actor: "dina", role: "admin", behalf: null, action: "cycle.launch", obj: "Review cycle 2026 annual", before: "Draft", after: "Running" }, { ts: "2026-11-10 17:05", actor: "sara", role: "employee", behalf: null, action: "review.submit", obj: "Review · Sara Haddad", before: "Self-assessment", after: "Manager assessment" }],
			done: {}, pending: null, card: null, openReview: null, ans: null, drawer: false
		};
	}

	let S;
	function load() {
		try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : null; if (!S || S.v !== 3) { S = seed(); } } catch (e) { S = seed(); }
	}
	function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage may be blocked */ } }

	/* ---------- helpers ---------- */
	const t = k => (T[S.lang] && T[S.lang][k]) || T.en[k] || k;
	const per = id => S.people.find(p => p.id === id) || { name: id, title: "", skills: [] };
	const me = () => per(ROLE_USER[S.role]);
	const first = id => per(id).name.split(" ")[0];
	const initials = p => p.name.split(" ").map(w => w[0]).join("");
	const nowStr = () => { const d = new Date(); return d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 5); };
	function log(action, obj, before, after) { S.audit.push({ ts: nowStr(), actor: ROLE_USER[S.role], role: S.role, behalf: null, action, obj, before: before ?? "", after: after ?? "" }); }
	const scaleVals = k => S.cfg.scales[k].pub.values;
	const labelOf = (k, v) => { const x = scaleVals(k).find(s => s.v === +v); return x ? x.label : "—"; };
	const bandOf = (k, v) => { const x = scaleVals(k).find(s => s.v === +v); return x ? x.band : null; };
	const steps = () => S.cfg.route.pub.steps.filter(s => s.on);
	function nextStep(key) { const st = steps(); const i = st.findIndex(s => s.key === key); return i < 0 || i === st.length - 1 ? "done" : st[i + 1].key; }
	function stepLabel(key) { if (key === "done") { return "Released"; } const s = S.cfg.route.pub.steps.find(x => x.key === key); return s ? s.label : key; }
	const isTeam = id => TEAM.includes(id);
	function inScope(id) { // target population derived from org spine
		const r = S.role, u = ROLE_USER[r];
		if (r === "employee") { return id === u; }
		if (r === "manager") { return isTeam(id) || id === u; }
		if (r === "hrbp" || r === "talent" || r === "admin") { return true; }
		if (r === "exec") { return per(id).div === "News"; }
		return false;
	}
	const canTier3 = () => ["manager", "hrbp", "talent", "exec", "admin"].includes(S.role);
	const matchPct = (p, o) => Math.round(o.skills.filter(s => (p.skills || []).includes(s)).length / o.skills.length * 100);
	const STATUS = { Approved: "Success", Submitted: "Warning", Released: "Success", "In progress": "Warning", Completed: "Success", Assigned: "Information", "Awaiting manager": "Warning", "Approved by manager": "Success", Shortlisted: "Information", Declined: "Error" };
	const st8 = s => STATUS[s] || "None";
	const TONE = { teal: "Success", red: "Error", navy: "Information", muted: "None" };
	const li = (title, sub, tag, tone, go) => ({ title, sub, tag: String(tag ?? ""), state: TONE[tone || "navy"], go: go === undefined ? "home" : go });
	const bar = (label, pct, n, state) => ({ label, pct: Math.max(2, Math.min(100, pct)), n, state });
	const DENY = " The request was refused by the authorization service and written to the audit log.";

	/* ---------- ask anything (scripted placeholder for Prompt 3) ---------- */
	const SUGG = { employee: ["How are my goals tracking?", "What feedback have I received?", "Which opportunities match my skills?", "Show me Karim’s rating"], manager: ["Which goals are off track?", "Who on my team is ready for a bigger role?", "Summarise feedback for my reviews", "Who matches the open digital project?"], hrbp: ["Which key positions have no successor?", "Where is the review cycle behind?", "Show the rating spread by manager"], talent: ["Which key positions have no successor?", "Who is not yet placed on the grid?", "Show the rating spread by manager"], exec: ["Where are we thinnest on data skills?", "Which key positions have no successor?"], admin: ["What changed in configuration today?", "Which AI features are switched on?"] };
	function answer(q) {
		const r = S.role, u = ROLE_USER[r], ql = q.toLowerCase();
		const others = S.people.filter(p => p.id !== u && ql.includes(p.name.split(" ")[0].toLowerCase()));
		if (r === "employee" && (others.length || /team|who |everyone|rating spread/.test(ql))) { return { text: "I can only use records you are allowed to see. That question needs another person’s records, so I have not looked them up. Ask about your own goals, reviews, feedback or development.", src: "Permission check: employee · self only. Logged.", denied: true }; }
		if (r === "admin" && /rating|ready|feedback/.test(ql) && !/config|ai/.test(ql)) { return { text: "Talent admins run cycles and settings. Individual ratings and feedback are outside this question’s scope.", src: "Permission check. Logged.", denied: true }; }
		if (/off track|goals/.test(ql)) {
			const gs = S.goals.filter(g => inScope(g.owner) && (r === "employee" ? g.owner === u : true));
			const stalled = gs.filter(g => (TODAY - new Date(g.updated)) / 864e5 >= 30);
			if (r === "employee") { return { text: `You have ${gs.length} goals. ${stalled.length ? `${stalled.length} has had no update for over 30 days: “${stalled[0].title}”.` : "All have recent updates."} Weighted progress is ${Math.round(gs.reduce((a, g) => a + g.progress * g.weight, 0) / Math.max(1, gs.reduce((a, g) => a + g.weight, 0)))}%.`, src: `From ${gs.length} goal records. Open each to verify.` }; }
			return { text: `${stalled.length} goals have had no update for 30 days or more: ${stalled.map(g => `${first(g.owner)} (“${g.title}”)`).join("; ")}. A check-in this week covers them.`, src: `From ${gs.length} goal records in scope. Open each to verify.` };
		}
		if (/ready|bigger role/.test(ql)) { const c = Object.entries(S.calib.place).filter(([id, p]) => inScope(id) && p.pot === 3 && p.perf >= 2).map(([id]) => per(id).name); return { text: `${c.join(" and ") || "Nobody yet"} sit in the high-potential row with solid or better performance. Readiness is a decision for you and HR; the AI does not set it.`, src: "From calibration placements and successor records." }; }
		if (/feedback/.test(ql)) { const fb = S.feedback.filter(f => f.kind === "given" && inScope(f.to) && (r !== "employee" || f.to === u)); return { text: `${fb.length} feedback notes this cycle. Common themes: composure in live coverage, clear handovers, and a wish to bring data work in earlier. Two notes link to the elections goal.`, src: `From ${fb.length} feedback records. Feedback text is treated as data, never as instructions.` }; }
		if (/match|opportunit|digital project/.test(ql)) { const o = S.opps[0]; const ms = S.people.filter(p => inScope(p.id) && p.id !== o.owner).map(p => ({ p, m: matchPct(p, o) })).filter(x => x.m >= 66).sort((a, b) => b.m - a.m); return { text: `For “${o.title}”: ${ms.map(x => `${x.p.name} (${x.m}%)`).join(", ") || "no strong matches"}. Matches are driven by audience analytics and editorial judgement; data storytelling is the gap for most.`, src: "From the skill library and the opportunity record." }; }
		if (/successor/.test(ql)) { const z = S.positions.filter(p => !p.succ.length), o = S.positions.filter(p => p.succ.length === 1); return { text: `${z.length} key position has no successor (${z.map(p => p.title).join(", ")}). ${o.length} has a single successor (${o.map(p => p.title).join(", ")}).`, src: "From successor nominations. Tier 3 data, shown because your role allows it." }; }
		if (/data skills|thinnest/.test(ql)) { return { text: "Data and AI is the widest gap: 48 roles need it and 14 people hold it. Technology and Digital account for most of the shortfall.", src: "From the skill library and position records. Groups under 5 are hidden." }; }
		if (/unplaced|not yet placed|grid/.test(ql)) { return { text: `${S.calib.unrated.length} people are not yet placed: ${S.calib.unrated.map(first).join(", ")}. They join the grid when their review is signed off.`, src: "From review status and calibration records." }; }
		if (/spread|behind|cycle/.test(ql)) { return { text: "Mid-year reviews are 67% complete. Newsroom production has 2 reviews waiting on the manager. Ratings in this team sit mostly in the middle band; no manager is more than one band off the division average.", src: "From review status and normalised bands. Deterministic counts; wording by AI." }; }
		if (/config|ai feature|switched/.test(ql)) { const on = Object.entries(S.cfg.ai).map(([f, m]) => `${f}: ${Object.values(m).filter(Boolean).length} roles`).join(", "); return { text: `AI switches by feature: ${on}. Act features stay off until Gate C.`, src: "From the configuration service." }; }
		return { text: "In the sandbox, Ask anything answers a set of scripted questions. Try one of the suggestions. In the build (Prompt 3) it calls the suite API with your permissions.", src: "Scripted placeholder." };
	}

	/* ---------- cards shared by the cockpits and the hub ---------- */
	const askCard = () => ({ kind: "ask", title: t("ask"), meta: "Prototype · scripted", icon: "sap-icon://ai" });
	const zone = (title, unit, rows, icon) => ({ kind: "list", title, meta: rows.length + " " + unit, icon, rows });
	const listCard = (title, meta, rows, icon) => ({ kind: "list", title, meta, icon: icon || "sap-icon://list", rows });
	const barsCard = (title, meta, bars) => ({ kind: "bars", title, meta, icon: "sap-icon://horizontal-bar-chart", bars });
	const stalled = scope => S.goals.filter(g => scope(g.owner) && g.status === "Approved" && age(g) >= 45);
	function teamSkills() { const sk = ["Editorial judgement", "Live production", "Audience analytics", "Data storytelling"]; return barsCard("Team skills", "From the skill library", sk.map(s => { const n = TEAM.filter(id => per(id).skills.includes(s)).length; const p = Math.round(n / 9 * 100); return bar(s, p, n + " of 9", p < 20 ? "Error" : p < 60 ? "Information" : "Success"); })); }
	function cycleHealth() { const open = TEAM.filter(id => S.reviews[id].step === "done").length; return barsCard("Cycle health", "All modules", [bar("Goals approved", 91, "91%", "Success"), bar("Reviews released", Math.round(open / 9 * 100), open + " of 9", "Success"), bar("Calibration sessions", 38, "3 of 8", "Information"), bar("Development plans", 54, "54%", "Information")]); }
	function bench() { return { kind: "bench", title: "Bench strength", meta: "Key positions by division", icon: "sap-icon://org-chart", bench: [["News", 2, 5, 6], ["Programmes", 1, 4, 5], ["Technology", 3, 4, 3], ["Digital", 2, 3, 2], ["Corporate", 1, 3, 6]].map(([d, a, b, c]) => ({ d, a, b, c })) }; }
	function gridSummary() { const L = S.cfg.grid.pub.labels; const cnt = {}; Object.values(S.calib.place).forEach(p => { const k = p.pot + "-" + p.perf; cnt[k] = (cnt[k] || 0) + 1; }); return listCard("Newsroom production grid", `${Object.keys(S.calib.place).length} placed · ${S.calib.unrated.length} waiting`, Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, n]) => li(L[k], "Potential " + BAND[k[0]] + " · performance " + BAND[k[2]], n + " people", "teal", "talent")), "sap-icon://grid"); }

	/* ---------- home cockpits ---------- */
	function home() {
		const r = S.role, u = ROLE_USER[r]; const needs = [], risks = []; let row2 = [];
		if (r === "employee") {
			const rv = S.reviews[u];
			if (rv.step === "done" && !S.done.ackd) { needs.push(li("Read your released review", "Overall rating and comments are now visible", "New", "teal", "performance")); }
			S.assign.filter(a => a.pid === u && a.status !== "Completed").forEach(a => { const l = S.catalogue.find(c => c.id === a.lid); needs.push(li(l.title, l.type + " · " + l.hours + " h", l.type === "Compliance" ? "Due 30 Nov" : "In progress", l.type === "Compliance" ? "red" : "navy", "growth")); });
			S.feedback.filter(f => f.kind === "request" && f.from === u).forEach(f => needs.push(li("Feedback requested from " + first(f.to), "Sent " + f.date, "Waiting", "muted", "performance")));
			needs.push(li("Update goal progress", "Mid-year check-in is open", "Due 20 Nov", "navy", "goals"));
			S.goals.filter(g => g.owner === u && age(g) >= 30).forEach(g => risks.push(li("No update for " + age(g) + " days", g.title, "Stalled", "red", "goals")));
			const dc = S.dev.filter(d => d.pid === u).length; if (dc < 2) { risks.push(li("Development plan has " + dc + " item" + (dc === 1 ? "" : "s"), "Your plan template asks for at least 2", "Plan", "red", "growth")); }
			const mine = S.goals.filter(g => g.owner === u);
			row2 = [
				barsCard("My goals", mine.reduce((a, g) => a + g.weight, 0) + "% weight assigned", mine.map(g => bar(g.title, g.progress, g.progress + "%", g.progress < 45 ? "Information" : "Success"))),
				listCard("Opportunities for you", "From the marketplace", S.opps.map(o => ({ o, m: matchPct(per(u), o) })).sort((a, b) => b.m - a.m).slice(0, 3).map(({ o, m }) => li(o.title, o.type + " · " + o.dur, m + "% match", "teal", "opportunities")), "sap-icon://opportunity")
			];
		}
		if (r === "manager") {
			const pend = S.goals.filter(g => isTeam(g.owner) && g.status === "Submitted");
			const owners = [...new Set(pend.map(g => g.owner))];
			if (owners.length) { needs.push(li(`Approve ${owners.length} goal plan${owners.length > 1 ? "s" : ""}`, owners.map(first).join(", "), "Due Thu", "navy", "goals")); }
			const rv = TEAM.filter(id => S.reviews[id].step === "manager" || S.reviews[id].step === "signoff");
			if (rv.length) { needs.push(li(`Complete ${rv.length} review${rv.length > 1 ? "s" : ""}`, rv.map(id => first(id) + " · " + stepLabel(S.reviews[id].step)).join(", "), "Due 20 Nov", "navy", "performance")); }
			needs.push(li("Confirm calibration attendance", "Performance by potential session, Newsroom production", "26 Nov", "muted", "talent"));
			S.opps.forEach(o => o.interest.filter(i => isTeam(i.pid) && i.status === "Awaiting manager").forEach(i => needs.push(li("Respond to an opportunity request", per(i.pid).name + ", " + o.title, "New", "teal", "opportunities"))));
			if (stalled(isTeam).length) { risks.push(li(`${stalled(isTeam).length} goals have had no update for 45 days`, stalled(isTeam).map(g => first(g.owner)).join(", ") + " · linked to division objectives", "Stalled", "red", "goals")); }
			S.positions.filter(p => p.succ.length === 1).forEach(p => risks.push(li("1 key position has a single successor", p.title, "Bench", "red", "talent")));
			S.positions.filter(p => p.succ.length === 0).forEach(p => risks.push(li("A key position has no successor", p.title, "Bench", "red", "talent")));
			risks.push(li("Skill gap: data storytelling", "4 of 9 roles need it; " + TEAM.filter(id => per(id).skills.includes("Data storytelling")).length + " person has it", "Gap", "red", "insights"));
			row2 = [teamSkills(), listCard("Opportunities for your team", "From the marketplace", S.opps.slice(0, 3).map(o => { const n = TEAM.filter(id => matchPct(per(id), o) >= 66).length; return li(o.title, o.type + " · " + o.dur, n + " match" + (n === 1 ? "" : "es"), "teal", "opportunities"); }), "sap-icon://opportunity")];
		}
		if (r === "hrbp") {
			needs.push(li("Reopen request: Ravi Menon review", "Manager asked to correct a goal weight; reason required", "Today", "navy", "performance"));
			needs.push(li("Prepare calibration pack", "Newsroom production · 9 people · 26 Nov", "26 Nov", "muted", "talent"));
			needs.push(li("Validate 3 successor nominations", "Elections desk and output roles", "This week", "navy", "talent"));
			risks.push(li("Review cycle behind in Newsroom production", TEAM.filter(id => S.reviews[id].step !== "done").length + " of 9 reviews still open", "Cycle", "red", "performance"));
			S.positions.filter(p => !p.succ.length).forEach(p => risks.push(li("No successor", p.title, "Bench", "red", "talent")));
			risks.push(li("High risk of loss with high impact", "1 person in News · tier 3", "Retention", "red", "talent"));
			row2 = [cycleHealth(), bench()];
		}
		if (r === "talent") {
			needs.push(li("Run calibration: Newsroom production", "9 people · " + S.calib.unrated.length + " not yet placed", "26 Nov", "navy", "talent"));
			needs.push(li(S.calib.released ? "Results released" : "Release calibration results", "Writes the agreed box to each talent record", S.calib.released ? "Done" : "After session", S.calib.released ? "teal" : "muted", "talent"));
			needs.push(li("Confirm 5 calibration sessions across divisions", "3 of 8 sessions held", "Plan", "muted", "insights"));
			S.positions.filter(p => p.succ.length <= 1).forEach(p => risks.push(li(p.succ.length ? "Single successor" : "No successor", p.title, "Bench", "red", "talent")));
			risks.push(li("Rating spread", "Newsroom production sits 0.2 bands above division", "Watch", "muted", "insights"));
			row2 = [gridSummary(), bench()];
		}
		if (r === "exec") {
			needs.push(li("Approve division talent review", "News · results from 3 calibration sessions", "5 Dec", "navy", "talent"));
			needs.push(li("Sponsor digital election coverage", "Project needs 2 people from News", "New", "teal", "insights"));
			risks.push(li("Data and AI skills gap", "14 of 48 roles covered across the network", "Gap", "red", "insights"));
			S.positions.filter(p => !p.succ.length).forEach(p => risks.push(li("No successor", p.title, "Bench", "red", "talent")));
			row2 = [bench(), cycleHealth()];
		}
		if (r === "admin") {
			const c = S.cfg;
			[["Rating scales", Object.values(c.scales).some(s => s.draft)], ["Review route", !!c.route.draft], ["Calibration grid", !!c.grid.draft]].filter(d => d[1]).forEach(d => needs.push(li("Unpublished draft: " + d[0], "Nothing goes live until you publish", "Draft", "navy", "admin")));
			needs.push(li("Prepare 2027 cycle calendar", "Annual review with a mid-year check-in", "Jan", "muted", "admin"));
			needs.push(li("Export configuration for test system", "Transport file for promotion", "Ready", "teal", "admin"));
			risks.push(li("Act features off until Gate C", "Switches stay off until security and legal approve", "Gate C", "muted", "admin"));
			const pubRow = (name, sub, item) => li(name, sub, item.draft ? "Draft open" : "Published", item.draft ? "navy" : "teal", "admin");
			row2 = [
				listCard("Configuration", "Published versions", [
					pubRow("4-point performance scale", "Version " + c.scales.four.pub.version, c.scales.four),
					pubRow("0 to 6 competency scale", "Version " + c.scales.six.pub.version, c.scales.six),
					pubRow("Review route", "Version " + c.route.pub.version + " · " + steps().map(s => s.label).join(" → "), c.route),
					pubRow("Calibration grid labels", "Version " + c.grid.pub.version, c.grid)], "sap-icon://action-settings"),
				listCard("Recent audit events", S.audit.length + " events", S.audit.slice(-4).reverse().map(a => li(a.action + " · " + a.obj, a.ts + " · " + per(a.actor).name, a.after ? String(a.after).slice(0, 18) : "", "muted", "audit")), "sap-icon://history")
			];
		}
		return { eyebrow: t("c_" + r), title: t("h_" + r), cards: [zone(t("needs"), t("items"), needs, "sap-icon://task"), zone(t("risk"), t("signals"), risks, "sap-icon://alert"), askCard()].concat(row2) };
	}

	/* ---------- goals ---------- */
	function goals() {
		const r = S.role, u = ROLE_USER[r];
		const vis = S.goals.filter(g => inScope(g.owner));
		const owners = r === "employee" ? [u] : [...new Set(vis.map(g => g.owner))];
		const rules = S.cfg.goalrules;
		const mine = S.goals.filter(g => g.owner === u), wsum = mine.reduce((a, g) => a + g.weight, 0);
		return {
			eyebrow: t("goals"), title: r === "employee" ? "Your goal plan" : "Goals in your scope", isEmp: r === "employee", isMgr: r === "manager",
			approveAll: t("approve") + " all submitted",
			formMeta: `Plan rules from configuration: ${rules.min} to ${rules.max} goals, weights total ${rules.total}% · now ${mine.length} goals, ${wsum}%`,
			warn: wsum > rules.total ? `Weights total ${wsum}%. Rebalance to ${rules.total}% before submitting the plan.` : "",
			cats: S.cfg.goalcats.map(c => ({ key: c })), aligns: ALIGN.map(a => ({ key: a })),
			blocks: owners.map(o => {
				const gs = vis.filter(g => g.owner === o);
				return {
					name: per(o).name, initials: initials(per(o)), meta: `${per(o).title} · ${gs.length} goals · ${gs.reduce((a, g) => a + g.weight, 0)}%`,
					goals: gs.map(g => ({
						id: g.id, title: g.title, cat: g.cat, weight: g.weight + "%", progress: g.progress, pct: g.progress + "%",
						detail: "Aligned: " + g.align + (g.contributors.length ? " · Contributors: " + g.contributors.map(first).join(", ") : ""),
						updated: "Updated " + age(g) + " days ago", stale: age(g) >= 45 ? "Error" : "None", barState: age(g) >= 45 ? "Error" : "Success",
						status: g.status, state: st8(g.status), canProg: r === "employee" && g.owner === u, canApprove: r === "manager" && isTeam(o) && g.status === "Submitted"
					}))
				};
			})
		};
	}

	/* ---------- performance ---------- */
	const opts = k => [{ key: "", text: "Select" }].concat(scaleVals(k).map(s => ({ key: String(s.v), text: s.v + " · " + s.label })));
	const val = v => (v === null || v === undefined ? "" : String(v));
	function distribution() { const c = [0, 0, 0, 0]; TEAM.forEach(id => { const rv = S.reviews[id]; if (rv.step === "done") { c[bandOf("four", rv.mgr)]++; } }); const tot = c[1] + c[2] + c[3] || 1; return [3, 2, 1].map(b => bar(BAND[b] + " band", Math.round(c[b] / tot * 100), c[b] + " people", "Success")); }
	function reviewForm(id) {
		const r = S.role, u = ROLE_USER[r], rv = S.reviews[id], p = per(id), own = id === u;
		const st = steps(); const cur = rv.step === "done" ? st.length : st.findIndex(s => s.key === rv.step);
		const showMgr = !own || rv.released; // tier 2: employee sees manager rating only after release
		const editSelf = own && rv.step === "self";
		const editMgr = r === "manager" && isTeam(id) && rv.step === "manager";
		const canSign = r === "manager" && isTeam(id) && rv.step === "signoff";
		const canHr = r === "hrbp" && rv.step === "hr";
		const band = rv.mgr ? bandOf("four", rv.mgr) : null;
		const head = label => ({ kind: "head", label, meta: "", opts: [], self: "", mgr: "" });
		const row = (kind, key, label, meta, k, self, mgr) => ({ kind, key, label, meta, opts: opts(k), self: val(self), mgr: val(mgr) });
		const rows = [head("Goals · " + S.cfg.scales.four.name)]
			.concat(S.goals.filter(g => g.owner === id && g.status === "Approved").map(g => row("goal", g.id, g.title, g.weight + "%", "four", rv.self, rv.comp["g_" + g.id] ?? rv.mgr)))
			.concat([head("Competencies · " + S.cfg.scales.six.name)])
			.concat(S.comps.map((c, i) => row("comp", i, c, "", "six", rv.comp["cs" + i] ?? (rv.self ? rv.self + 1 : null), rv.comp["cm" + i] ?? (rv.mgr ? rv.mgr + 1 : null))))
			.concat([row("overall", "overall", "Overall rating", "", "four", rv.self, rv.mgr)]);
		const mark = (i, label) => ({ text: (i < cur ? "" : (i + 1) + " · ") + label, state: i < cur ? "Success" : i === cur ? "Information" : "None", icon: i < cur ? "sap-icon://accept" : "" });
		return {
			id, name: p.name, initials: initials(p), meta: `${p.title} · ${p.unit} · manager ${per(p.mgr).name}`, canClose: !!S.openReview,
			steps: st.map((s, i) => mark(i, s.label)).concat([rv.step === "done" ? { text: "Released", state: "Success", icon: "sap-icon://accept" } : { text: (st.length + 1) + " · Released", state: "None", icon: "" }]),
			rows, selfComment: rv.selfComment, mgrComment: rv.mgrComment, editSelf, editMgr, showMgr,
			bandNote: band && showMgr ? `Normalised band: ${BAND[band]} (from “${labelOf("four", rv.mgr)}” on the 4-point scale). This feeds the calibration grid.` : "",
			btnSelf: t("submit") + " self-assessment", btnMgr: t("submit") + " " + stepLabel("manager").toLowerCase(), btnHr: t("approve") + " HR review",
			canHr, canSign, canDev: rv.step === "done" && (r === "manager" || own), canReopen: r === "hrbp" && rv.step === "done",
			waiting: !editSelf && !editMgr && !canSign && !canHr && rv.step !== "done" ? "Waiting for: " + stepLabel(rv.step) : "",
			aiDraft: S.cfg.ai.assist[r] && editMgr ? `${first(id)} led the election results desk with calm, clear handovers (2 feedback notes) and is 70% through the turnaround goal. Next step: bring data work in earlier.` : ""
		};
	}
	function performance() {
		const r = S.role, u = ROLE_USER[r];
		const out = { eyebrow: t("performance"), title: "2026 annual review", tab: S.sub.performance, mode: "list", denyText: "", form: { steps: [], rows: [] }, dist: [], showOpen: r !== "admin",
			routeText: "Route: " + steps().map(s => s.label).join(" → "),
			table: TEAM.filter(id => r === "admin" || inScope(id)).map(id => { const rv = S.reviews[id]; return { id, name: per(id).name, title: per(id).title, step: stepLabel(rv.step), state: st8(stepLabel(rv.step)), overall: rv.step === "done" ? labelOf("four", rv.mgr) : "—" }; }) };
		const id = S.openReview || (r === "employee" ? u : null);
		if (r === "admin") { out.mode = "admin"; }
		else if (S.openReview && S.openReview !== u && !inScope(S.openReview)) { out.mode = "deny"; out.denyText = `${per(S.openReview).name}’s review is outside your target population.` + DENY; }
		else if (id) { out.mode = "form"; out.form = reviewForm(id); }
		else if (r === "exec") { out.mode = "exec"; out.dist = distribution(); }
		const fb = S.feedback.filter(f => (r === "employee" ? (f.to === u || f.from === u) : inScope(f.to) || inScope(f.from)));
		out.fb = {
			people: S.people.filter(p => p.id !== u && ["News", "Digital"].includes(p.div)).map(p => ({ key: p.id, text: p.name })), count: fb.length + " notes",
			list: fb.slice().reverse().map(f => ({ title: f.kind === "request" ? `${first(f.from)} asked ${first(f.to)} for feedback` : `${first(f.from)} → ${first(f.to)}`, sub: (f.text || "Waiting for a response") + (f.goal ? " · Goal: " + (S.goals.find(g => g.id === f.goal) || {}).title : ""), date: f.date, icon: f.kind === "request" ? "sap-icon://question-mark" : "sap-icon://feedback" }))
		};
		return out;
	}

	/* ---------- talent: calibration + succession ---------- */
	function talentCard() {
		const id = S.card; if (!id) { return { mode: "empty", rows: [] }; }
		if (!inScope(id)) { return { mode: "deny", rows: [], denyText: "This talent card is outside your scope." + DENY }; }
		const p = per(id), pl = S.calib.place[id], L = S.cfg.grid.pub.labels, rv = S.reviews[id], t3 = canTier3();
		const nom = S.positions.flatMap(x => x.succ.filter(s => s.pid === id).map(s => x.title + " · " + s.ready));
		const conf = (k, v, state) => (t3 ? { k, v, state: state || "None", icon: "" } : { k, v: "Confidential", state: "Indication05", icon: "sap-icon://locked" });
		return {
			mode: "card", name: p.name, initials: initials(p), meta: p.title + " · " + p.unit,
			rows: [
				{ k: "Manager", v: per(p.mgr).name + (p.matrix ? " · matrix: " + per(p.matrix).name : ""), state: "None", icon: "" },
				{ k: "Latest rating", v: rv && rv.step === "done" ? labelOf("four", rv.mgr) + " · " + BAND[bandOf("four", rv.mgr)] + " band" : "In progress", state: "None", icon: "" },
				conf("Calibrated box", pl ? L[pl.pot + "-" + pl.perf] + (S.calib.trail.some(x => x.pid === id) ? " · Calibrated" : "") : "Not placed", pl && S.calib.trail.some(x => x.pid === id) ? "Success" : "None"),
				conf("Potential", pl ? BAND[pl.pot] : "—"),
				conf("Risk / impact of loss", p.risk + " / " + p.impact, p.risk === "High" ? "Error" : p.risk === "Medium" ? "Warning" : "None"),
				conf("Successor for", nom.join("; ") || "—"),
				{ k: "Skills", v: p.skills.join(", ") || "—", state: "Information", icon: "" },
				{ k: "Development", v: S.dev.filter(d => d.pid === id).map(d => d.title).join("; ") || "—", state: "None", icon: "" }
			]
		};
	}
	function talent() {
		const r = S.role, L = S.cfg.grid.pub.labels, tab = S.sub.talent;
		if (r === "employee") { return { eyebrow: t("talent"), title: t("talent"), denied: true, denyText: "Calibration and succession records are tier 3 confidential." + DENY, tab, calib: { cells: [], unrated: [], trail: [] }, succ: { rows: [], team: [], readiness: [] }, card: { mode: "empty", rows: [] } }; }
		const canMove = ["talent", "manager", "hrbp"].includes(r);
		const cells = [];
		[3, 2, 1].forEach(pot => {
			cells.push({ kind: "ax", label: BAND[pot], people: [] });
			[1, 2, 3].forEach(perf => { const k = pot + "-" + perf; const ids = Object.entries(S.calib.place).filter(([, p]) => p.pot === pot && p.perf === perf).map(([id]) => id); cells.push({ kind: "cell", k, label: L[k], count: String(ids.length), tone: pot + perf >= 5 ? "hot" : pot + perf <= 3 ? "cool" : "mid", people: ids.map(id => ({ pid: id, name: per(id).name, moved: S.calib.trail.some(x => x.pid === id) })) }); });
		});
		cells.push({ kind: "ax", label: "", people: [] });
		[1, 2, 3].forEach(b => cells.push({ kind: "ax", label: BAND[b] + " performance", people: [] }));
		const canNom = ["manager", "hrbp", "talent", "admin"].includes(r);
		const cand = S.people.filter(p => inScope(p.id) && p.lvl >= 3 && p.div !== "Corporate");
		return {
			eyebrow: t("talent"), denied: false, denyText: "", tab, title: tab === "succession" ? "Bench, successors and talent cards" : "Performance by potential · Newsroom production",
			calib: {
				canMove, cells, head: "Session · 26 Nov · Facilitator " + per("yusuf").name,
				note: canMove ? "Drag a name to another box, or select a name and choose a box. A reason is required for every move. Nobody calibrates themselves." : "View only for this role.",
				unrated: S.calib.unrated.map(id => ({ text: per(id).name + " · " + stepLabel(S.reviews[id].step) })), allPlaced: !S.calib.unrated.length,
				isTalent: r === "talent", released: S.calib.released, releaseText: S.calib.released ? "Results released" : "Release results to talent records",
				trailCount: S.calib.trail.length + " moves", trail: S.calib.trail.slice().reverse().map(x => ({ name: per(x.pid).name, desc: `${L[x.from] || "Not placed"} → ${L[x.to]} · “${x.reason}”`, by: first(x.by) })),
				showAi: !!S.cfg.ai.insight[r]
			},
			succ: {
				canNom, readiness: S.cfg.readiness.map(x => ({ key: x })),
				rows: S.positions.map(p => { const h = per(p.holder); const cs = cand.filter(c => c.id !== p.holder && !p.succ.some(s => s.pid === c.id)).map(c => ({ key: c.id, text: c.name })); return {
					id: p.id, title: p.title, pid: p.holder, holderName: h.name,
					risk: canTier3() ? h.risk : "Confidential", riskState: canTier3() ? (h.risk === "High" ? "Error" : h.risk === "Medium" ? "Warning" : "Success") : "Indication05",
					succ: p.succ.map(s => ({ pid: s.pid, text: per(s.pid).name + " · " + s.ready, type: s.ready === "Ready now" ? "Accept" : "Default" })), none: !p.succ.length,
					bench: p.succ.length === 0 ? "No successor" : p.succ.length === 1 ? "Single" : "Covered", benchState: p.succ.length === 0 ? "Error" : p.succ.length === 1 ? "Warning" : "Success",
					cands: cs, pick: cs.length ? cs[0].key : "", ready: S.cfg.readiness[0]
				}; }),
				team: TEAM.filter(inScope).map(id => ({ pid: id, name: per(id).name }))
			},
			card: talentCard()
		};
	}

	/* ---------- growth ---------- */
	function growth() {
		const r = S.role, u = ROLE_USER[r], ppl = r === "employee" ? [u] : TEAM;
		return {
			eyebrow: t("growth"), title: r === "employee" ? "Your development" : "Your team’s development", tab: S.sub.growth,
			canAdd: r === "employee" || r === "manager", isMgr: r === "manager", team: TEAM.map(id => ({ key: id, text: per(id).name })),
			devcats: S.cfg.devcats.map(c => ({ key: c })), links: S.comps.concat(["Data storytelling", "Audience analytics", "Leadership"]).map(c => ({ key: c })),
			plans: S.dev.filter(d => ppl.includes(d.pid) || inScope(d.pid)).map(d => ({ title: d.title, sub: `${per(d.pid).name} · ${d.cat} · ${d.link} · source: ${d.source}`, status: d.status, state: st8(d.status) })),
			showAi: !!S.cfg.ai.assist[r],
			learn: S.assign.filter(a => ppl.includes(a.pid)).map(a => { const l = S.catalogue.find(c => c.id === a.lid); return { id: a.id, person: per(a.pid).name, item: l.title, type: l.type, due: a.due, status: a.status, state: st8(a.status), canComplete: a.pid === u && a.status !== "Completed" }; }),
			catCount: S.catalogue.length + " items",
			cat: S.catalogue.map(l => ({ id: l.id, title: l.title, sub: `${l.type} · ${l.hours} h · builds ${l.skill}`, canEnrol: r === "employee" && !S.assign.some(a => a.pid === u && a.lid === l.id) }))
		};
	}

	/* ---------- opportunities ---------- */
	function opportunities() {
		const r = S.role, u = ROLE_USER[r], p = me();
		return {
			eyebrow: t("market"), title: r === "employee" ? "Projects, assignments, mentoring and roles" : "Opportunities and your team", isEmp: r === "employee", isMgr: r === "manager",
			types: ["Project", "Short assignment", "Mentoring", "Internal role"].map(k => ({ key: k })), skills: ["Live production", "Editorial judgement", "Audience analytics", "Data storytelling"].map(k => ({ key: k })),
			cards: S.opps.map(o => {
				const m = matchPct(p, o), has = o.skills.filter(s => p.skills.includes(s)), miss = o.skills.filter(s => !p.skills.includes(s));
				const my = o.interest.find(i => i.pid === u);
				return {
					id: o.id, title: o.title, match: r === "employee" ? m + "% match" : "", meta: `${o.type} · ${o.dur} · owner ${per(o.owner).name}`,
					skills: o.skills.map(s => ({ text: s, state: r === "employee" && p.skills.includes(s) ? "Success" : "None" })),
					matchText: `Matched on ${has.join(", ") || "nothing yet"}${miss.length ? ". To build: " + miss.join(", ") : ""}.`,
					hasInt: !!my, myStatus: my ? my.status : "", myState: my ? st8(my.status) : "None",
					team: o.interest.filter(i => isTeam(i.pid)).map(i => ({ pid: i.pid, name: per(i.pid).name, sub: "Interest · " + matchPct(per(i.pid), o) + "% match", waiting: i.status === "Awaiting manager", status: i.status, state: st8(i.status) })),
					emptyText: TEAM.filter(id => matchPct(per(id), o) >= 66).length + " people in your team match. No requests yet."
				};
			})
		};
	}

	/* ---------- insights hub ---------- */
	function insights() {
		const sk = [["Editorial", 82, 90], ["Production", 64, 70], ["Broadcast engineering", 38, 52], ["Digital product", 31, 60], ["Data and AI", 14, 48], ["Leadership", 40, 44]];
		const mob = [["Opportunities posted this quarter", "Projects, assignments, mentoring, roles", 45 + S.opps.length - 4], ["Filled from inside", "Matched through the skill library", 29], ["Median time to fill", "From posting to accepted", "11 days"], ["Skills added through assignments", "Validated by the opportunity owner", 63]];
		return {
			eyebrow: t("hub"), title: "Skills, bench and mobility in one view",
			cards: [
				{ kind: "dual", title: "Skills: supply against demand", meta: "By skill family", icon: "sap-icon://multiple-bar-chart", dual: sk.map(([n, a, b]) => ({ n, a, b, text: a + " of " + b })) },
				bench(),
				listCard("Internal mobility", "Opportunity marketplace", mob.map(([a, b, c]) => li(a, b, c, "teal", "")), "sap-icon://journey-change"),
				cycleHealth(), askCard()
			]
		};
	}

	/* ---------- admin / configuration ---------- */
	const PERM = [["Employee", "Self", "Edit own", "Self-assess; view own after release", "None", "None", "None"], ["Line manager", "Direct reports", "View, comment, approve", "Rate until sign-off", "Propose", "Participate for own team", "None"], ["Matrix manager", "Matrix reports", "View, comment", "Contribute feedback", "None", "None", "None"], ["Second-level manager", "All levels below", "View", "View, approve", "View, nominate", "Participate", "None"], ["HR business partner", "Org unit subtree", "View", "View; reopen with reason", "View, edit", "Facilitate", "None"], ["Talent admin", "Everyone", "View", "Run cycles", "Administer", "Administer", "Business settings"], ["Executive", "Own division", "View", "View summaries", "View", "View results", "None"], ["System admin", "No talent data", "None", "None", "None", "None", "Technical settings"], ["Auditor", "Everyone, read-only", "View", "View", "View", "View", "View"]];
	const AI_FEATURES = [["ask", "Ask anything"], ["assist", "Assist: drafting"], ["insight", "Insight: gaps and risk"], ["act", "Act: launches and nudges"]];
	function admin() {
		const c = S.cfg, tab = S.sub.admin;
		if (S.role !== "admin") { return { eyebrow: t("admin"), title: t("admin"), denied: true, denyText: "Configuration is limited to talent admins (business settings) and system admins (technical settings)." + DENY, tab, scales: [], route: { steps: [] }, grid: { cells: [] }, perm: [], ai: [], json: "" }; }
		const ver = item => "Published v" + item.pub.version + (item.draft ? " · draft open" : "");
		const bands = [1, 2, 3].map(b => ({ key: String(b), text: BAND[b] }));
		const rd = c.route.draft || c.route.pub, gd = c.grid.draft || c.grid.pub;
		return {
			eyebrow: t("admin"), title: "Change the suite without code", denied: false, denyText: "", tab, bands,
			scales: Object.entries(c.scales).map(([k, s]) => ({ k, name: s.name, ver: ver(s), use: `Used for: ${s.use}. Mapped to three normalised bands.`, hasDraft: !!s.draft, values: (s.draft || s.pub).values.map((v, i) => ({ v: v.v, label: v.label, band: String(v.band), pub: s.pub.values[i].label })) })),
			route: { ver: ver(c.route), steps: rd.steps.map((st, i) => ({ n: i + 1, key: st.key, label: st.label, who: t("r_" + st.who), on: st.on, locked: st.key === "self" || st.key === "signoff", hint: st.key === "self" || st.key === "signoff" ? "Required" : "Optional" })) },
			grid: { ver: ver(c.grid), cells: BOXES.map(k => ({ k, label: `Potential ${BAND[k[0]]} · performance ${BAND[k[2]]}`, value: gd.labels[k] })) },
			perm: PERM.map(row => ({ c0: row[0], c1: row[1], c2: row[2], c3: row[3], c4: row[4], c5: row[5], c6: row[6] })),
			ai: AI_FEATURES.map(([f, label]) => Object.assign({ f, label, locked: f === "act" }, c.ai[f])),
			json: JSON.stringify({ exported: nowStr(), scales: Object.fromEntries(Object.entries(c.scales).map(([k, s]) => [k, s.pub])), route: c.route.pub, grid: c.grid.pub, readiness: c.readiness, devcats: c.devcats, goalrules: c.goalrules, ai: c.ai }, null, 2)
		};
	}

	/* ---------- audit ---------- */
	function audit() {
		if (!["admin", "hrbp", "talent"].includes(S.role)) { return { eyebrow: t("audit"), title: t("audit"), denied: true, denyText: "The audit log is available to admins, HR and auditors." + DENY, rows: [], count: "" }; }
		return { eyebrow: t("audit"), title: "Who, what, before, after, when", denied: false, denyText: "", count: S.audit.length + " events", rows: S.audit.slice().reverse().map(a => ({ ts: a.ts, who: per(a.actor).name, role: t("r_" + a.role), action: a.action, obj: a.obj, before: String(a.before), after: String(a.after) })) };
	}

	/* ---------- demo script ---------- */
	const DEMO = [
		{ k: "goal", t: "An employee creates a goal", s: "As Sara, add a goal on the Goals page.", role: "employee", r: "goals" },
		{ k: "rate", t: "The manager reviews and rates", s: "As Omar, open Sara’s review, rate, submit, then sign off.", role: "manager", r: "performance", open: "sara" },
		{ k: "calib", t: "A facilitator calibrates", s: "As Yusuf, move Sara on the grid with a reason.", role: "talent", r: "talent", sub: ["talent", "calibration"] },
		{ k: "card", t: "The result appears on the talent card", s: "Open Sara’s talent card under Succession.", role: "talent", r: "talent", sub: ["talent", "succession"], card: "sara" },
		{ k: "nom", t: "A successor is nominated", s: "Nominate someone for Senior Editor, Elections Desk.", role: "manager", r: "talent", sub: ["talent", "succession"] },
		{ k: "dev", t: "A development item is created from the review", s: "On Sara’s released review, create a development item.", role: "manager", r: "performance", open: "sara" },
		{ k: "scale", t: "Admin changes a rating scale label", s: "Edit a label on the 4-point scale and publish.", role: "admin", r: "admin", sub: ["admin", "scales"] },
		{ k: "route", t: "Admin changes a route step", s: "Rename a step or switch on HR review, then publish.", role: "admin", r: "admin", sub: ["admin", "route"] },
		{ k: "deny", t: "An employee cannot read another review", s: "As Sara, try to open Karim’s review. It is refused and logged.", role: "employee", r: "performance", open: "karim" },
		{ k: "audit", t: "Every action is in the audit log", s: "Open the audit log as admin.", role: "admin", r: "audit" }
	];

	function derive() {
		const u = me(), n = DEMO.filter(d => S.done[d.k]).length;
		return {
			t: Object.assign({}, T.en, T[S.lang]), lang: S.lang, role: S.role, route: S.route, drawer: !!S.drawer,
			user: { name: u.name, initials: initials(u), line: u.name + " · " + u.title },
			roles: Object.keys(ROLE_USER).map(r => ({ key: r, text: t("r_" + r) })),
			nav: NAV[S.role].map(r => ({ key: r, text: t(r), icon: "sap-icon://" + ICON[r] })),
			ask: { on: !!S.cfg.ai.ask[S.role], placeholder: SUGG[S.role][0], sugg: SUGG[S.role].map(q => ({ q })), has: !!S.ans, ans: S.ans || {} },
			home: home(), goals: goals(), perf: performance(), talent: talent(), growth: growth(), opps: opportunities(), insights: insights(), admin: admin(), audit: audit(),
			demo: { meta: `${n} of ${DEMO.length} done. Each step switches role and opens the right screen.`, pct: n / DEMO.length * 100, steps: DEMO.map((d, i) => ({ i, n: String(i + 1), t: d.t, s: d.s, done: !!S.done[d.k] })) }
		};
	}

	// What the entry forms start from; kept apart from derive() so typing survives a refresh.
	function formDefaults() {
		const u = ROLE_USER[S.role], rules = S.cfg.goalrules, wsum = S.goals.filter(g => g.owner === u).reduce((a, g) => a + g.weight, 0);
		const ppl = S.people.filter(p => p.id !== u && ["News", "Digital"].includes(p.div));
		return {
			q: "", division: "All divisions",
			goal: { title: "", cat: S.cfg.goalcats[0], weight: Math.max(5, Math.min(100, rules.total - wsum)) || 10, align: ALIGN[0] },
			fb: { kind: "given", to: ppl.length ? ppl[0].id : "", text: "" },
			dev: { pid: TEAM[0], title: "", cat: S.cfg.devcats[0], link: S.comps[0] },
			opp: { title: "", type: "Project", dur: "6 weeks", skill: "Live production" },
			move: { pid: "", name: "", from: "", fromLabel: "", to: "", reason: "", boxes: [] }
		};
	}

	/* ---------- actions ---------- */
	function setRole(r) { S.role = r; S.openReview = null; S.ans = null; S.pending = null; if (!NAV[r].includes(S.route)) { S.route = "home"; } log("session.view_as", "Sandbox role switch", "", t("r_" + r)); }
	function release(id, rv) { rv.released = true; const band = bandOf("four", rv.mgr); S.calib.place[id] = Object.assign({ pot: 2 }, S.calib.place[id] || {}, { perf: band }); S.calib.unrated = S.calib.unrated.filter(x => x !== id); if (id === "sara") { S.done.rate = true; } }
	function oppSet(oid, pid, status) { const o = S.opps.find(x => x.id === oid); const i = o.interest.find(x => x.pid === pid); const b = i.status; i.status = status; log("opportunity.decision", "Opportunity · " + o.title + " · " + per(i.pid).name, b, status); return {}; }

	const act = {
		role(r) { setRole(r); return { nav: S.route, forms: true }; },
		lang(l) { S.lang = l; return {}; },
		reset() { const keep = S.lang; S = seed(); S.lang = keep; return { msg: "Sandbox reset to seed data", nav: "home", forms: true }; },
		drawer() { S.drawer = !S.drawer; return {}; },
		go(r) { S.openReview = null; S.ans = null; S.route = r; return { nav: r }; },
		sub(area, k) { S.sub[area] = k; S.openReview = null; return {}; },
		demoGo(i, narrow) {
			const d = DEMO[i]; setRole(d.role); if (d.sub) { S.sub[d.sub[0]] = d.sub[1]; } if (d.r === "performance") { S.sub.performance = "reviews"; }
			S.openReview = d.open || null; if (d.card) { S.card = d.card; } S.route = d.r;
			if (d.k === "deny" && !inScope("karim")) { log("access.denied", "Review · Karim Nasser", "GET /api/v1/reviews/karim", "403 refused"); S.done.deny = true; }
			if (d.k === "card" && S.calib.trail.some(x => x.pid === "sara")) { S.done.card = true; }
			if (d.k === "audit") { S.done.audit = true; }
			if (narrow) { S.drawer = false; }
			return { nav: d.r, forms: true };
		},
		ask(q) { const a = answer(q); S.ans = Object.assign({ q: "“" + q + "”" }, a); log(a.denied ? "ai.ask.refused" : "ai.ask", "Ask anything", q.slice(0, 60), a.denied ? "Refused: outside permissions" : "Answered · categories: " + a.src.split(".")[0]); return {}; },
		aiDiscard() { S.ans = null; return {}; },
		addGoal(f) {
			const u = ROLE_USER[S.role], title = String(f.title || "").trim(); if (!title) { return { msg: "Enter the goal first", stop: true }; }
			if (S.goals.filter(g => g.owner === u).length >= S.cfg.goalrules.max) { return { msg: `Your plan already has ${S.cfg.goalrules.max} goals, the maximum set in configuration`, stop: true }; }
			S.goals.push({ id: "g" + Date.now(), owner: u, title, cat: f.cat, weight: +f.weight || 10, progress: 0, status: "Submitted", updated: today(), align: f.align, contributors: [] });
			log("goal.create", "Goal · " + title, "", "Submitted for approval"); S.done.goal = true; return { msg: "Goal added and sent to your manager" };
		},
		prog(id) { const g = S.goals.find(x => x.id === id); const b = g.progress; g.progress = Math.min(100, g.progress + 10); g.updated = today(); log("goal.progress", "Goal · " + g.title, b + "%", g.progress + "%"); return {}; },
		approve(id) { const g = S.goals.find(x => x.id === id); g.status = "Approved"; log("goal.approve", "Goal · " + g.title, "Submitted", "Approved"); return { msg: "Goal approved" }; },
		approveAll() { S.goals.filter(g => isTeam(g.owner) && g.status === "Submitted").forEach(g => { g.status = "Approved"; log("goal.approve", "Goal · " + g.title, "Submitted", "Approved"); }); return { msg: "All submitted goals approved" }; },
		openRev(id) { S.openReview = id; return {}; },
		closeRev() { S.openReview = null; return {}; },
		review(by, f) {
			const id = f.id, rv = S.reviews[id], before = stepLabel(rv.step);
			const pick = (kind, key, col) => { const x = f.rows.find(q => q.kind === kind && q.key === key); return x ? x[col] : ""; };
			if (by === "self") { if (!pick("overall", "overall", "self")) { return { msg: "Choose an overall self rating first", stop: true }; } rv.self = +pick("overall", "overall", "self"); rv.selfComment = f.selfComment; S.comps.forEach((c, i) => { rv.comp["cs" + i] = +pick("comp", i, "self") || null; }); rv.step = nextStep("self"); }
			if (by === "mgr") { if (!pick("overall", "overall", "mgr")) { return { msg: "Choose an overall rating first", stop: true }; } rv.mgr = +pick("overall", "overall", "mgr"); rv.mgrComment = f.mgrComment || ""; S.comps.forEach((c, i) => { rv.comp["cm" + i] = +pick("comp", i, "mgr") || null; }); rv.step = nextStep("manager"); }
			if (by === "hr") { rv.step = nextStep("hr"); }
			if (by === "sign") { rv.step = "done"; }
			if (rv.step === "done" && !rv.released) { release(id, rv); }
			log(by === "sign" ? "review.signoff" : "review.submit", "Review · " + per(id).name, before, stepLabel(rv.step) + (rv.mgr && by !== "self" ? " · " + labelOf("four", rv.mgr) : ""));
			return { msg: rv.step === "done" ? "Review signed off and released" : "Moved to " + stepLabel(rv.step) };
		},
		devFromRev(id) { const item = { id: "d" + Date.now(), pid: id, title: "Build data storytelling for the elections desk", cat: "Skills & Future Readiness", link: "Data storytelling", status: "Not started", source: "2026 review" }; S.dev.push(item); log("dev.create", "Development item · " + per(id).name, "", item.title + " (from review)"); S.done.dev = true; S.sub.growth = "development"; S.openReview = null; S.ans = null; S.route = "growth"; return { msg: "Development item created from the review", nav: "growth" }; },
		reopen(id) { const rv = S.reviews[id]; rv.step = "manager"; rv.released = false; log("review.reopen", "Review · " + per(id).name, "Released", "Manager assessment · reason: correction requested by manager"); return { msg: "Review reopened. Reason recorded." }; },
		feedback(f) { const u = ROLE_USER[S.role], txt = String(f.text || "").trim(); if (f.kind === "given" && !txt) { return { msg: "Write the feedback first", stop: true }; } S.feedback.push({ id: "f" + Date.now(), from: u, to: f.to, text: f.kind === "given" ? txt : "", goal: null, date: today(), kind: f.kind }); log(f.kind === "given" ? "feedback.give" : "feedback.request", "Feedback · " + per(f.to).name, "", f.kind === "given" ? "Given" : "Requested"); return { msg: f.kind === "given" ? "Feedback sent" : "Feedback requested" }; },
		// The move a drop or a selected name proposes; null with a message when it cannot start.
		startMove(pid, to) {
			if (!["talent", "manager", "hrbp"].includes(S.role)) { return { stop: true }; }
			const cur = S.calib.place[pid], from = cur ? cur.pot + "-" + cur.perf : "";
			if (to && from === to) { return { stop: true }; }
			if (pid === ROLE_USER[S.role]) { return { msg: "Nobody can calibrate their own record", stop: true }; }
			const L = S.cfg.grid.pub.labels;
			return { move: { pid, name: per(pid).name, from, fromLabel: L[from] || "Not placed", to: to || BOXES.find(k => k !== from), reason: "", boxes: BOXES.filter(k => k !== from).map(k => ({ key: k, text: L[k] })) } };
		},
		move(m) {
			const reason = String(m.reason || "").trim(); if (!reason) { return { msg: "A reason is required", stop: true }; }
			const [pot, perf] = m.to.split("-").map(Number), L = S.cfg.grid.pub.labels;
			S.calib.place[m.pid] = { pot, perf }; S.calib.unrated = S.calib.unrated.filter(x => x !== m.pid); S.calib.trail.push({ pid: m.pid, from: m.from || null, to: m.to, reason, by: ROLE_USER[S.role] });
			log("calibration.move", "Talent record · " + per(m.pid).name, L[m.from] || "Not placed", L[m.to] + " · reason: " + reason); if (m.pid === "sara") { S.done.calib = true; }
			return { msg: "Moved and written to the talent record" };
		},
		release() { S.calib.released = true; log("calibration.release", "Session · Newsroom production", "Draft", "Released to talent records"); return { msg: "Results released" }; },
		card(id) { S.card = id; log("talentcard.view", "Talent card · " + per(id).name, "", ""); if (id === "sara" && S.calib.trail.some(x => x.pid === "sara")) { S.done.card = true; } return {}; },
		nominate(posId, pid, ready) { const pos = S.positions.find(p => p.id === posId); if (!pid) { return { stop: true }; } pos.succ.push({ pid, ready }); log("succession.nominate", "Position · " + pos.title, "", per(pid).name + " · " + ready); S.done.nom = true; return { msg: "Successor nominated" }; },
		addDev(f) { const u = ROLE_USER[S.role], title = String(f.title || "").trim(); if (!title) { return { msg: "Enter the item first", stop: true }; } const pid = S.role === "manager" ? f.pid : u; S.dev.push({ id: "d" + Date.now(), pid, title, cat: f.cat, link: f.link, status: "Not started", source: S.role === "manager" ? "Manager" : "Self" }); log("dev.create", "Development item · " + per(pid).name, "", title); return { msg: "Development item added" }; },
		complete(id) { const a = S.assign.find(x => x.id === id); const b = a.status; a.status = "Completed"; log("learning.complete", "Learning · " + S.catalogue.find(c => c.id === a.lid).title, b, "Completed"); return {}; },
		enrol(id) { S.assign.push({ id: "a" + Date.now(), pid: ROLE_USER[S.role], lid: id, due: "2026-12-31", status: "Assigned" }); log("learning.assign", "Learning · " + S.catalogue.find(c => c.id === id).title, "", "Assigned"); return {}; },
		interest(id) { const o = S.opps.find(x => x.id === id); o.interest.push({ pid: ROLE_USER[S.role], status: "Awaiting manager" }); log("opportunity.interest", "Opportunity · " + o.title, "", "Awaiting manager"); return { msg: "Interest sent. Your manager approves before you start." }; },
		oppOk(oid, pid) { return oppSet(oid, pid, "Approved by manager"); },
		oppNo(oid, pid) { return oppSet(oid, pid, "Declined"); },
		postOpp(f) { const title = String(f.title || "").trim(); if (!title) { return { msg: "Enter a title first", stop: true }; } const o = { id: "o" + Date.now(), title, type: f.type, dur: f.dur, owner: ROLE_USER[S.role], skills: [f.skill, "Editorial judgement"].filter((v, i, a) => a.indexOf(v) === i), interest: [] }; S.opps.unshift(o); log("opportunity.post", "Opportunity · " + o.title, "", "Open"); return { msg: "Opportunity posted" }; },
		scale(by, row) {
			const s = S.cfg.scales[row.k]; const vals = (s.draft || s.pub).values.map((v, i) => ({ v: v.v, label: String(row.values[i].label).trim() || v.label, band: +row.values[i].band }));
			if (by === "publish") { const before = s.pub.values.map(v => v.label).join(" / "); s.pub = { version: s.pub.version + 1, values: vals }; s.draft = null; log("config.publish", "Config · " + s.name + " v" + s.pub.version, before, vals.map(v => v.label).join(" / ")); S.done.scale = true; return { msg: "Published. Review forms now use the new labels." }; }
			s.draft = { values: vals }; log("config.draft", "Config · " + s.name, "", "Draft saved"); return { msg: "Draft saved. Not live until you publish." };
		},
		discard(k) { const s = S.cfg.scales[k]; s.draft = null; log("config.discard", "Config · " + s.name, "Draft", "Discarded"); return {}; },
		route(by, rows) {
			const s = S.cfg.route; const st = (s.draft || s.pub).steps.map((x, i) => Object.assign({}, x, { label: String(rows[i].label).trim() || x.label, on: x.key === "self" || x.key === "signoff" ? true : !!rows[i].on }));
			if (by === "publish") { const before = steps().map(x => x.label).join(" → "); s.pub = { version: s.pub.version + 1, steps: st }; s.draft = null; Object.values(S.reviews).forEach(rv => { if (rv.step !== "done" && !steps().some(x => x.key === rv.step)) { rv.step = nextStep("manager"); } }); log("config.publish", "Config · Review route v" + s.pub.version, before, steps().map(x => x.label).join(" → ")); S.done.route = true; return { msg: "Route published" }; }
			s.draft = { steps: st }; log("config.draft", "Config · Review route", "", "Draft saved"); return { msg: "Draft saved. Not live until you publish." };
		},
		grid(by, cells) {
			const s = S.cfg.grid; const labels = {}; cells.forEach(c => { labels[c.k] = String(c.value).trim() || s.pub.labels[c.k]; });
			if (by === "publish") { s.pub = { version: s.pub.version + 1, labels }; s.draft = null; log("config.publish", "Config · Calibration grid v" + s.pub.version, "", Object.values(labels).slice(0, 3).join(" / ") + " …"); return { msg: "Grid labels published" }; }
			s.draft = { labels }; log("config.draft", "Config · Calibration grid", "", "Draft saved"); return { msg: "Draft saved" };
		},
		ai(f, r, on) { const b = S.cfg.ai[f][r]; S.cfg.ai[f][r] = on; log("config.publish", "AI switch · " + f + " · " + t("r_" + r), b ? "On" : "Off", on ? "On" : "Off"); return {}; },
		exported() { log("config.export", "Configuration transport file", "", "Exported"); return {}; }
	};

	return { load, save, state: () => S, derive, formDefaults, act, ROUTES };
});
