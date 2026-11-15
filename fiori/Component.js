sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/Localization",
	"./model/Store"
], function (UIComponent, JSONModel, Localization, Store) {
	"use strict";

	return UIComponent.extend("ajmn.talent.Component", {
		metadata: { manifest: "json", interfaces: ["sap.ui.core.IAsyncContentCreation"] },

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			Store.load();
			Localization.setLanguage(Store.state().lang); // Arabic also turns the page right-to-left
			const vm = new JSONModel(Store.derive());
			vm.setSizeLimit(10000); // the audit log grows past the default 100 rows
			this.setModel(vm, "vm");
			this.setModel(new JSONModel(Store.formDefaults()), "form");
			this.getRouter().attachRouteMatched(this._onRoute, this);
			this.getRouter().initialize();
		},

		// A hash the person typed or went back to is a fresh visit; one an action set is not.
		_onRoute: function (e) {
			const name = e.getParameter("name"), S = Store.state();
			if (name === "root") { this.getRouter().navTo(S.route, {}, true); return; }
			if (name !== S.route) { S.route = name; S.ans = null; S.openReview = null; }
			this.refresh();
		},

		refresh: function () {
			Store.save();
			this.getModel("vm").setData(Store.derive());
		},

		resetForms: function (part) {
			const d = Store.formDefaults(), form = this.getModel("form");
			if (part) { form.setProperty("/" + part, d[part]); } else { form.setData(d); }
		}
	});
});
