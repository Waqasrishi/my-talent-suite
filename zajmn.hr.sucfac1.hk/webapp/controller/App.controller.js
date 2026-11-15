sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/People"
], function (Controller, People) {
	"use strict";

	return Controller.extend("zajmn.hr.sucfac1.hk.controller.App", {
		onInit: function () {
			var router = this.getOwnerComponent().getRouter();
			// the screens draw themselves into the element above once it is in the page
			this.byId("host").attachEvent("afterRendering", function () { People.start(router); });
		}
	});
});
