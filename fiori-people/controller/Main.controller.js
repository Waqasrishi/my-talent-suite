// One controller for the shell and every screen: each handler reads what was pressed, runs the Store
// action (which holds the page's own rules), then navigates and refreshes what the views show.
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Theming",
	"../model/Store"
], function (Controller, Fragment, MessageToast, MessageBox, Theming, Store) {
	"use strict";

	const DIALOGS = {
		gd: "GoalDialog", form: "GoalForm", pil: "PillarDialog",
		bell: "BellPopover", apps: "AppsPopover", me: "MePopover"
	};

	return Controller.extend("ajmn.people.controller.Main", {

		/* ---------- plumbing ---------- */
		_c: function () { return this._comp || this.getOwnerComponent(); },
		_vm: function (p) { return this._c().getModel("vm").getProperty(p); },
		_form: function (p) { return this._c().getModel("form").getProperty(p); },
		_setForm: function (p, v) { this._c().getModel("form").setProperty(p, v); },
		_ctx: function (e, m) { return e.getSource().getBindingContext(m || "vm"); },
		_p: function (e, prop, m) { const c = this._ctx(e, m); return c && c.getProperty(prop); },
		_done: function (res) {
			res = res || {};
			const c = this._c();
			if (res.stop) { return false; }
			if (res.forms) { c.resetForms(); }
			if (res.reset) { c.resetForms(res.reset); }
			if (res.close) { c.goalQ(null); }
			if (res.nav) { c.go(res.nav); } else if (res.goal) { c.goalQ(res.goal); }
			c.refresh();
			return true;
		},
		_open: function (key, opener) { const d = this._c().dlg; if (d && d[key]) { if (d[key].isOpen()) { d[key].close(); } else { d[key].openBy ? d[key].openBy(opener) : d[key].open(); } } },
		_closePop: function () { const d = this._c().dlg; ["bell", "apps", "me"].forEach(function (k) { if (d && d[k].isOpen()) { d[k].close(); } }); },
		_dirtyOk: function (then) {
			const f = this._form("/ap");
			if (f && f.dirty) { MessageBox.confirm("You have unsaved changes. Leave without saving them?", { onClose: function (a) { if (a === MessageBox.Action.OK) { then(); } } }); } else { then(); }
		},

		/* ---------- shell ---------- */
		onInit: function () {
			if (!this.byId("toolPage")) { return; } // only the shell loads the panels, once
			const view = this.getView(), comp = this.getOwnerComponent(), self = this, dlg = {};
			if (window.innerWidth < 1024) { this.byId("toolPage").setSideExpanded(false); }
			Promise.all(Object.keys(DIALOGS).map(function (k) {
				return Fragment.load({ id: view.getId() + "--" + k, name: "ajmn.people.view." + DIALOGS[k], controller: self }).then(function (f) { view.addDependent(f); dlg[k] = f; });
			})).then(function () { comp.dialogsReady(dlg); });
		},
		onToggleSide: function () { const tp = this.byId("toolPage"); tp.setSideExpanded(!tp.getSideExpanded()); },
		onNav: function (e) {
			const key = e.getParameter("item").getKey(), it = (this._vm("/sh/nav") || []).find(function (n) { return n.key === key; }), self = this;
			if (it) { this._dirtyOk(function () { self._setForm("/ap/dirty", false); self._c().go(it.href); if (window.innerWidth < 1024) { self.byId("toolPage").setSideExpanded(false); } }); }
		},
		onHome: function () { this._c().go("#/home"); },
		onHref: function (e) { const s = e.getSource(), h = s.data("href") || this._p(e, "href"); if (h) { this._closePop(); this._c().go(h); } },
		onCrumb: function (e) { const h = this._p(e, "href"); if (h) { this._c().go(h); } },
		onTheme: function () { Theming.setTheme(Theming.getTheme() === "sap_horizon_dark" ? "sap_horizon" : "sap_horizon_dark"); },
		onBell: function (e) { this._open("bell", e.getSource()); },
		onApps: function (e) { this._open("apps", e.getSource()); },
		onMe: function (e) { this._open("me", e.getSource()); },
		onSuggest: function (e) {
			const v = e.getParameter("suggestValue");
			this._setForm("/search", Store.search(v).map(function (r) { return { t: r.t, k: r.k, h: r.h }; }));
			e.getSource().suggest();
		},
		onSearch: function (e) {
			const it = e.getParameter("suggestionItem"), q = e.getParameter("query") || "";
			const h = it ? it.getKey() : (Store.search(q)[0] || {}).h;
			if (h) { this._c().go(h); e.getSource().setValue(""); }
		},
		onPersona: function (e) { this._closePop(); this._done(Store.act.persona(e.getParameter("selectedItem").getKey())); },
		onCycle: function (e) { this._done(Store.act.cycle(e.getParameter("selectedItem").getKey())); },
		onReset: function () {
			const self = this;
			MessageBox.confirm("Reset all demo data in this browser? Everything entered here is cleared.", { onClose: function (a) { if (a === MessageBox.Action.OK) { self._closePop(); self._done(Store.act.reset()); } } });
		},
		onTile: function (e) {
			const o = this._ctx(e).getObject(), h = o.href;
			if (!o.enabled) { return; }
			if (o.ext) { window.open(o.ext, "_blank", "noopener"); } else { this._c().go(h); }
		},

		/* ---------- goal panel ---------- */
		onGoalOpen: function (e) { this._c().goalQ(this._p(e, "id")); },
		onGoalLink: function (e) { const id = e.getSource().data("id") || this._p(e, "toId") || this._p(e, "fromId"); if (id) { this._c().goalQ(id); } },
		onGdClose: function () { const r = Store.route(); if (r.q.goal) { this._c().goalQ(null); } },
		onGdDismiss: function () { this._c().dlg.gd.close(); },
		onApprove: function () { this._done(Store.act.approve(this._vm("/gd/id"))); },
		onSendBack: function () { this._done(Store.act.sendback(this._vm("/gd/id"), this._vm("/gd/backMsg"))); },
		onReviewed: function () { this._done(Store.act.reviewed(this._vm("/gd/id"))); },
		onEditGoal: function () { const f = Store.editForm(this._vm("/gd/id")); if (f) { this._c().openForm(f); } },
		onDeleteDraft: function () {
			const self = this, id = this._vm("/gd/id");
			MessageBox.confirm("Delete this draft?", { onClose: function (a) { if (a === MessageBox.Action.OK) { self._done(Store.act.remove(id)); } } });
		},
		onArchive: function () {
			const self = this, id = this._vm("/gd/id"), q = Store.act.archiveAsk(id);
			if (q) { MessageBox.confirm(q, { onClose: function (a) { if (a === MessageBox.Action.OK) { self._done(Store.act.archive(id)); } } }); }
		},
		onUnarchive: function () { this._done(Store.act.unarchive(this._vm("/gd/id"))); },
		onCkOpen: function () { this._done(Store.act.ckOpen(this._vm("/gd/id"))); },
		onCkCancel: function () { this._done(Store.act.ckCancel()); },
		onCkSave: function () { this._done(Store.act.ckSave(this._vm("/gd/id"), this._vm("/gd/ck"))); },
		onAddOpen: function () { this._done(Store.act.addOpen(this._vm("/gd/id"))); },
		onAddCancel: function () { this._done(Store.act.addCancel()); },
		onPropose: function () { this._done(Store.act.propose(this._vm("/gd/id"), this._vm("/gd/addTo"))); },
		onAccept: function (e) { this._done(Store.act.accept(this._p(e, "id"))); },
		onReject: function (e) { const c = this._ctx(e).getObject(); this._done(Store.act.reject(c.id, c.why)); },
		onWithdraw: function (e) { this._done(Store.act.withdraw(this._p(e, "id"))); },
		onMakeMain: function (e) { this._done(Store.act.primary(this._p(e, "id"))); },

		/* ---------- goal form ---------- */
		onNewGoal: function () { this._c().go("#/goals?new=1"); },
		onFormSave: function (e) {
			const draft = e.getSource().data("draft") === "true", f = this._form("/gform"), r = Store.act.form(f, draft), c = this._c();
			if (r.errors) { // show each problem beside its field
				const er = r.errors.err, kr = r.errors.kr;
				this._setForm("/gform/err", { title: er.title || "", due: er.due || "", weight: er.weight || "", krs: er.krs || "", to: er.to || "" });
				f.krs.forEach(function (k, i) { c.getModel("form").setProperty("/gform/krs/" + i + "/err", kr[i] || ""); });
				return;
			}
			if (r.stop) { return; }
			c.dlg.form.close();
			if (r.goal) { c.goalQ(r.goal); }
			c.refresh();
		},
		onFormCancel: function () { this._c().dlg.form.close(); },
		onKrAdd: function () { const k = this._form("/gform/krs").slice(); if (k.length < 5) { k.push({ t: "", type: "number", start: "", target: "", current: "", unit: "", weight: "", steps: "", err: "" }); this._setForm("/gform/krs", k); this._setForm("/gform/canAddKr", k.length < 5); } },
		onKrDel: function (e) {
			const i = +this._ctx(e, "form").getPath().split("/").pop(), k = this._form("/gform/krs").slice();
			if (k.length > 1) { k.splice(i, 1); this._setForm("/gform/krs", k); this._setForm("/gform/canAddKr", true); }
		},
		onAiSuggest: function () { const f = this._form("/gform"); this._setForm("/gform/ai", { kind: "suggest", items: Store.aiSuggest(f), checks: [] }); },
		onAiReview: function () { const f = this._form("/gform"); this._setForm("/gform/ai", { kind: "review", items: [], checks: Store.aiReview(f) }); },
		onAiUse: function (e) {
			const s = this._ctx(e, "form").getObject();
			this._setForm("/gform/title", s.title);
			this._setForm("/gform/krs", s.krs.map(function (k) { return { t: k[0], type: "number", start: String(k[1]), target: String(k[2]), current: "", unit: k[3], weight: "", steps: "", err: "" }; }));
			this._setForm("/gform/ai", null);
			MessageToast.show("Filled in. Change anything before you submit.");
		},
		onAiClose: function () { this._setForm("/gform/ai", null); },

		/* ---------- pillars ---------- */
		onPillarOpen: function (id) { const f = Store.pillarForm(id); if (f) { this._setForm("/pil", f); this._c().dlg.pil.open(); } },
		onPillarGoalOpen: function (e) { const id = this._p(e, "id", "form"); if (id) { this._c().dlg.pil.close(); this._c().goalQ(id); } },
		onPillarClose: function () { this._c().dlg.pil.close(); },
		onPillarRename: function () { const f = this._form("/pil"); if (this._done(Store.act.pillarRename(f.id, f.name))) { this._setForm("/pil", Store.pillarForm(f.id)); } },
		onPillarAdd: function () { const f = this._form("/pil"); if (this._done(Store.act.pillarAdd(f.newName))) { this._setForm("/pil", Store.pillarForm(f.id)); } },
		onPillarGoal: function () { const f = Store.act.pillarGoal(this._form("/pil/id")); if (f) { this._c().dlg.pil.close(); this._c().openForm(f); } },
		onMapRendered: function (e) {
			const dom = e.getSource().getDomRef(), self = this;
			if (!dom) { return; }
			dom.onclick = function (ev) {
				const b = ev.target.closest(".tsBox");
				if (!b) { return; }
				if (b.dataset.pillar) { self.onPillarOpen(b.dataset.pillar); } else if (b.dataset.goal) { self._c().goalQ(b.dataset.goal); }
			};
			const f = this._vm("/strategy/focus");
			if (f && this._focused !== f) { this._focused = f; const b = dom.querySelector('.tsBox[data-id="' + f + '"]'); if (b) { b.scrollIntoView({ block: "center", inline: "center" }); } }
		},
		onShowAll: function () { this._c().go("#/strategy"); },

		/* ---------- lists, filters, reports ---------- */
		onFilter: function () { Store.setFilters(this._form("/gf")); this._c().refresh(); },
		onExport: function () {
			const x = Store.csv(), a = document.createElement("a");
			a.href = URL.createObjectURL(new Blob([x.text], { type: "text/csv;charset=utf-8" }));
			a.download = x.name; document.body.appendChild(a); a.click(); a.remove();
			MessageToast.show("Exported " + x.count + " goal" + (x.count === 1 ? "" : "s"));
		},
		onScope: function (e) { Store.setScope(e.getParameter("item").getKey()); this._c().refresh(); },

		/* ---------- appraisal ---------- */
		onApDirty: function () { this._setForm("/ap/dirty", true); },
		onApRate: function () { this._setForm("/ap/dirty", true); this._setForm("/ap/calc", Store.apCalc(this._form("/ap"))); },
		onApTheme: function (e) { this._done(Store.act.setTheme(e.getParameter("item").getKey())); },
		onApSave: function () { const r = Store.act.apSave(this._form("/ap")); if (r.saved) { this._setForm("/ap/dirty", false); } this._done(r); },
		onApSubmit: function () {
			const r = Store.act.apSubmit(this._form("/ap"));
			if (r.ok) { this._setForm("/ap/dirty", false); window.scrollTo(0, 0); }
			this._done(Object.assign({}, r, { stop: false }));
		},
		onApReturnOpen: function () { this._setForm("/ap/ret", ""); this.byId("retDlg").open(); },
		onApReturn: function () {
			const r = Store.act.apReturn(this._form("/ap"), this._form("/ap/ret"));
			if (r.stop) { return; }
			this.byId("retDlg").close();
			if (r.ok) { this._setForm("/ap/dirty", false); }
			this._done(r);
		},
		onApReturnCancel: function () { this.byId("retDlg").close(); },
		onApAck: function (e) {
			const r = Store.act.apAck(this._form("/ap"), e.getSource().data("d"), this._form("/ap/ackText"));
			if (r.ok) { this._setForm("/ap/dirty", false); }
			this._done(Object.assign({}, r, { stop: false }));
		},
		onTnaAdd: function () { const f = this._form("/ap"), t = f.tna.slice(); if (t.length < f.tnaMax) { t.push(Store.newTna(f)); this._setForm("/ap/tna", t); this._setForm("/ap/noTnaOn", false); this._setForm("/ap/tnaCanAdd", t.length < f.tnaMax); this._setForm("/ap/dirty", true); } },
		onTnaDel: function (e) { const f = this._form("/ap"), i = +this._ctx(e, "form").getPath().split("/").pop(), t = f.tna.slice(); t.splice(i, 1); this._setForm("/ap/tna", t); this._setForm("/ap/tnaCanAdd", true); this._setForm("/ap/dirty", true); },
		onApComment: function () { const f = this._form("/ap"); if (this._done(Store.act.apComment(f.id, f.newComment))) { this._setForm("/ap/newComment", ""); } },
		onApFile: function (e) {
			const fl = (e.getParameter("files") || [])[0];
			if (fl) { this._done(Store.act.apFile(this._form("/ap/id"), { name: fl.name, size: fl.size })); e.getSource().clear(); }
		},
		onPrint: function () { window.print(); },
		onSecJump: function (e) {
			const s = this._p(e, "s"), page = this.byId("apPage"), sec = this.byId("sec-" + (s === "tna" ? "tna" : s));
			if (page && sec) { page.scrollToSection(sec.getId(), 300); }
		},
		onStepInfo: function (e) { const s = this._ctx(e).getObject(); MessageToast.show(s.text + ". Steps change only through Submit, Return or Acknowledge, never by selecting the timeline."); },

		/* ---------- development, continuous performance, admin ---------- */
		onDevStatus: function (e) { this._done(Store.act.devStatus(this._vm("/devRecord/id"), e.getParameter("selectedItem").getKey())); },
		onActTab: function (e) { const k = e.getParameter("key"); this._c().go(k === "feedback" ? "#/activities?tab=feedback" : "#/activities"); },
		onActNew: function () { const t = this._vm("/activities/tab"); this._c().go(t === "feedback" ? "#/activities?tab=feedback&new=1" : "#/activities?new=1"); },
		onActCancel: function () { const t = this._vm("/activities/tab"); this._c().go(t === "feedback" ? "#/activities?tab=feedback" : "#/activities"); },
		onActSave: function () { this._done(Store.act.actSave(this._form("/act"))); },
		onFbSend: function () { this._done(Store.act.fbSend(this._form("/fbn"))); },
		onFbGive: function (e) { const c = this._ctx(e).getObject(); this._done(Store.act.fbGive(c.id, c.ans)); },
		onFbDecline: function (e) { this._done(Store.act.fbDecline(this._p(e, "id"))); },
		onCfg: function (e) {
			const s = e.getSource(), k = s.data("k");
			const v = e.getParameter("selected") !== undefined ? e.getParameter("selected") : e.getParameter("selectedItem").getKey();
			this._done(Store.act.cfg(k, v));
		},
		onSetUrl: function (e) { const c = this._ctx(e).getObject(); this._done(Store.act.setUrl(c.id, c.url)); }
	});
});
