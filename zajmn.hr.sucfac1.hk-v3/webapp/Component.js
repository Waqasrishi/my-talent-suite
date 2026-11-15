sap.ui.define([
	"sap/ui/core/UIComponent",
	"./util/Nav"
], function (UIComponent, Nav) {
	"use strict";

	return UIComponent.extend("zajmn.hr.sucfac1.hk.Component", {
		metadata: { manifest: "json" },

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			var config = this.getManifestEntry ? this.getManifestEntry("/sap.ui5/config") : this.getMetadata().getConfig();
			this.nav = Nav.create((config || {}).nav); // opens the goals module
			// The router owns the address: in the launchpad that is the part after "&/" in the shell's hash.
			this.getRouter().initialize();
		}
	});
});
