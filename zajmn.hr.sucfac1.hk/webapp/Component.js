sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("zajmn.hr.sucfac1.hk.Component", {
		metadata: { manifest: "json" },

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			// The router owns the address: in the launchpad that is the part after "&/" in the shell's hash.
			this.getRouter().initialize();
		}
	});
});
