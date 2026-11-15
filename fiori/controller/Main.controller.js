// One controller for the shell and every page: each handler reads what was pressed, runs the
// Store action, then shows its message, navigates and refreshes what the views bind to.
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/base/i18n/Localization",
	"sap/ui/core/Theming",
	"../model/Store"
], function (Controller, MessageToast, Localization, Theming, Store) {
	"use strict";

	return Controller.extend("ajmn.talent.controller.Main", {

		/* ---------- plumbing ---------- */
		_done: function (res) {
			res = res || {};
			const c = this.getOwnerComponent();
			if (res.msg) { MessageToast.show(res.msg); }
			if (res.stop) { return false; }
			if (res.forms) { c.resetForms(); }
			if (res.nav) { c.getRouter().navTo(res.nav); }
			c.refresh();
			return true;
		},
		_p: function (e, prop) { return e.getSource().getBindingContext("vm").getProperty(prop); },
		_obj: function (e) { return e.getSource().getBindingContext("vm").getObject(); },
		_vm: function (path) { return this.getOwnerComponent().getModel("vm").getProperty(path); },
		_form: function (path) { return this.getOwnerComponent().getModel("form").getProperty(path); },

		/* ---------- shell ---------- */
		// On a narrow screen the menu would cover the page: start closed, and close after a choice.
		_narrow: function () { return window.innerWidth < 1024; },
		onInit: function () { const tp = this.byId("toolPage"); if (tp && this._narrow()) { tp.setSideExpanded(false); } },
		onToggleSide: function () { const tp = this.byId("toolPage"); tp.setSideExpanded(!tp.getSideExpanded()); },
		onNav: function (e) { const key = e.getParameter("item").getKey(); if (Store.ROUTES.includes(key)) { this._done(Store.act.go(key)); if (this._narrow()) { this.byId("toolPage").setSideExpanded(false); } } },
		onGo: function (e) { const r = this._p(e, "go"); if (r) { this._done(Store.act.go(r)); } },
		onHome: function () { this._done(Store.act.go("home")); },
		onRole: function (e) { this._done(Store.act.role(e.getParameter("selectedItem").getKey())); },
		onLang: function (e) { const l = e.getParameter("item").getKey(); Localization.setLanguage(l); this._done(Store.act.lang(l)); },
		onTheme: function () { Theming.setTheme(Theming.getTheme() === "sap_horizon_dark" ? "sap_horizon" : "sap_horizon_dark"); },
		onReset: function () { this._done(Store.act.reset()); },
		onDrawer: function () { this._done(Store.act.drawer()); },
		onDemoGo: function (e) { this._done(Store.act.demoGo(this._p(e, "i"), window.innerWidth < 1100)); },
		onTab: function (e) { this._done(Store.act.sub(e.getSource().data("area"), e.getParameter("key"))); },

		/* ---------- ask anything ---------- */
		onAsk: function (e) { const q = String(e.getParameter("value") || "").trim(); if (q) { this._done(Store.act.ask(q)); this.getOwnerComponent().resetForms("q"); } },
		onAskQ: function (e) { this._done(Store.act.ask(this._p(e, "q"))); },
		onAiDiscard: function () { this._done(Store.act.aiDiscard()); },

		/* ---------- goals ---------- */
		onAddGoal: function () { if (this._done(Store.act.addGoal(this._form("/goal")))) { this.getOwnerComponent().resetForms("goal"); } },
		onProg: function (e) { this._done(Store.act.prog(this._p(e, "id"))); },
		onApprove: function (e) { this._done(Store.act.approve(this._p(e, "id"))); },
		onApproveAll: function () { this._done(Store.act.approveAll()); },

		/* ---------- performance ---------- */
		onOpenRev: function (e) { this._done(Store.act.openRev(this._p(e, "id"))); },
		onCloseRev: function () { this._done(Store.act.closeRev()); },
		onReview: function (e) { this._done(Store.act.review(e.getSource().data("by"), this._vm("/perf/form"))); },
		onDevFromRev: function () { this._done(Store.act.devFromRev(this._vm("/perf/form/id"))); },
		onReopen: function () { this._done(Store.act.reopen(this._vm("/perf/form/id"))); },
		onFeedback: function () { if (this._done(Store.act.feedback(this._form("/fb")))) { this.getOwnerComponent().getModel("form").setProperty("/fb/text", ""); } },

		/* ---------- talent ---------- */
		_openMove: function (res) {
			if (!res.move) { this._done(res); return; }
			this.getOwnerComponent().getModel("form").setProperty("/move", res.move);
			this.byId("moveDialog").open();
		},
		onChip: function (e) { this._openMove(Store.act.startMove(this._p(e, "pid"), "")); },
		onDrop: function (e) {
			const from = e.getParameter("draggedControl").getBindingContext("vm"), to = e.getParameter("droppedControl").getBindingContext("vm");
			if (from && to && to.getProperty("kind") === "cell") { this._openMove(Store.act.startMove(from.getProperty("pid"), to.getProperty("k"))); }
		},
		onMoveConfirm: function () { if (this._done(Store.act.move(this._form("/move")))) { this.byId("moveDialog").close(); } },
		onMoveCancel: function () { this.byId("moveDialog").close(); },
		onRelease: function () { this._done(Store.act.release()); },
		onCard: function (e) { this._done(Store.act.card(this._p(e, "pid"))); },
		onNominate: function (e) { const r = this._obj(e); this._done(Store.act.nominate(r.id, r.pick, r.ready)); },

		/* ---------- growth and opportunities ---------- */
		onAddDev: function () { if (this._done(Store.act.addDev(this._form("/dev")))) { this.getOwnerComponent().getModel("form").setProperty("/dev/title", ""); } },
		onComplete: function (e) { this._done(Store.act.complete(this._p(e, "id"))); },
		onEnrol: function (e) { this._done(Store.act.enrol(this._p(e, "id"))); },
		onInterest: function (e) { this._done(Store.act.interest(this._p(e, "id"))); },
		_opp: function (e, fn) { const ctx = e.getSource().getBindingContext("vm"); const oid = ctx.getModel().getProperty(ctx.getPath().replace(/\/team\/\d+$/, "") + "/id"); this._done(fn(oid, ctx.getProperty("pid"))); },
		onOppOk: function (e) { this._opp(e, Store.act.oppOk); },
		onOppNo: function (e) { this._opp(e, Store.act.oppNo); },
		onPostOpp: function () { if (this._done(Store.act.postOpp(this._form("/opp")))) { this.getOwnerComponent().resetForms("opp"); } },

		/* ---------- configuration ---------- */
		onScale: function (e) { this._done(Store.act.scale(e.getSource().data("by"), this._obj(e))); },
		onDiscard: function (e) { this._done(Store.act.discard(this._p(e, "k"))); },
		onRoute: function (e) { this._done(Store.act.route(e.getSource().data("by"), this._vm("/admin/route/steps"))); },
		onGrid: function (e) { this._done(Store.act.grid(e.getSource().data("by"), this._vm("/admin/grid/cells"))); },
		onAi: function (e) { this._done(Store.act.ai(this._p(e, "f"), e.getSource().data("r"), e.getParameter("selected"))); },
		onCopyCfg: function () {
			const txt = this._vm("/admin/json");
			(navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => MessageToast.show("Configuration copied"), () => MessageToast.show("Select all and copy"));
			this._done(Store.act.exported());
		}
	});
});
