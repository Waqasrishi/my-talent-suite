sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"./model/Store"
], function (UIComponent, JSONModel, MessageToast, Store) {
	"use strict";

	return UIComponent.extend("ajmn.people.Component", {
		metadata: { manifest: "json", interfaces: ["sap.ui.core.IAsyncContentCreation"] },

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			Store.load();
			Store.setNotifier(function (m) { MessageToast.show(m, { duration: 3400 }); });
			const vm = new JSONModel({});
			vm.setSizeLimit(10000);
			this.setModel(vm, "vm"); // what the screens show, rebuilt from the data after every action
			this.setModel(new JSONModel(Store.formDefaults()), "form"); // what people are typing, kept apart so a refresh never wipes it
			const router = this.getRouter();
			router.attachRouteMatched(this._onRoute, this);
			router.attachBypassed(function () { Store.setRoute("notFound", {}, {}); this.refresh(); }, this);
			router.initialize();
		},

		_nav: function (name, args, q, replace) {
			const a = Object.assign({}, args);
			if (q && Object.keys(q).length) { a["?query"] = q; }
			this.getRouter().navTo(name, a, replace === true);
		},
		go: function (hash) { const r = Store.toRoute(hash); this._nav(r.name, r.args, r.q); },
		goalQ: function (id) { const r = Store.route(), q = Object.assign({}, r.q); if (id) { q.goal = id; } else { delete q.goal; } this._nav(r.name, r.args, q); },

		_onRoute: function (e) {
			const name = e.getParameter("name"), a = e.getParameter("arguments") || {}, q = a["?query"] || {}, args = Object.assign({}, a);
			delete args["?query"];
			if (name === "root") { this._nav("home", {}, {}, true); return; }
			Store.setRoute(name, args, q);
			const t = Store.takeQuery(); // a one-off parameter (open a form, start a check-in) acts once and leaves the address
			if (t.strip) { this._nav(name, args, t.rest, true); if (t.form) { this.openForm(t.form); } this.refresh(); return; }
			this.refresh();
		},

		refresh: function () {
			const d = Store.derive(), vm = this.getModel("vm"), form = this.getModel("form"), r = Store.route();
			vm.setData(d);
			if (r.name === "appraisal") { // keep what is being typed; start fresh only for another form or after a save
				const f = form.getProperty("/ap");
				if (!f || f.id !== r.args.id || !f.dirty) { form.setProperty("/ap", Store.apForm(r.args.id)); }
			}
			if (d.activities && !d.activities.denied) {
				if (!form.getProperty("/act/goalId") && d.activities.goals[0]) { form.setProperty("/act/goalId", d.activities.goals[0].key); }
				if (!form.getProperty("/fbn/to") && d.activities.others[0]) { form.setProperty("/fbn/to", d.activities.others[0].key); }
			}
			this._syncDialogs(d);
		},

		resetForms: function (part) {
			const d = Store.formDefaults(), form = this.getModel("form");
			if (part) { form.setProperty("/" + part, d[part]); } else { form.setData(d); }
		},

		// the goal panel is open exactly when the address names a goal
		_syncDialogs: function (d) {
			const gd = this.dlg && this.dlg.gd;
			if (!gd) { return; }
			if (d.gd && !gd.isOpen()) { gd.open(); } else if (!d.gd && gd.isOpen()) { gd.close(); }
		},
		openForm: function (f) { this.getModel("form").setProperty("/gform", f); if (this.dlg) { this.dlg.form.open(); } else { this._pendingForm = true; } },
		dialogsReady: function (dlg) { this.dlg = dlg; if (this._pendingForm) { this._pendingForm = false; dlg.form.open(); } this.refresh(); }
	});
});
