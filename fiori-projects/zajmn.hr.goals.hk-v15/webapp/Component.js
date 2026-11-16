sap.ui.define([
	"sap/ui/core/UIComponent",
	"./util/Nav"
], function (UIComponent, Nav) {
	"use strict";

	return UIComponent.extend("zajmn.hr.goals.hk.Component", {
		metadata: { manifest: "json" },

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			var config = this.getManifestEntry ? this.getManifestEntry("/sap.ui5/config") : this.getMetadata().getConfig();
			this.nav = Nav.create((config || {}).nav);
		},

		// the address of the translation service (the Canvas app's /api/translate); empty: translation is typed by hand
		getTranslateUrl: function () {
			var c = (this.getManifestEntry && this.getManifestEntry("/sap.ui5/config")) || {};
			return c.translateUrl || "";
		},

		// "new" when the home page asked to start the new-goal wizard (launchpad parameter or ?start=new)
		getStart: function () {
			var data = this.getComponentData && this.getComponentData(), p = data && data.startupParameters && data.startupParameters.start;
			return (p && p[0]) || new URLSearchParams(window.location.search).get("start");
		}
	});
});
