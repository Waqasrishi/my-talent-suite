sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/Goals"
], function (Controller, Goals) {
	"use strict";

	var MARKUP = "<div class=\"ajmng\"><div class=\"demo\">Demo prototype. Sample data. The AI suggestions are simulated, not a live AI. Nothing is saved.</div>\n<div class=\"hero\">\n <div class=\"wrap\"><div class=\"bar\">\n  <div class=\"brandblock\"><div class=\"brand\">Goals <span>2027</span></div><div id=\"crumb\"></div></div>\n  <div class=\"barright\"><button class=\"homebtn\" id=\"homeLink\" type=\"button\">&larr; AJMN People home</button><label class=\"who\">Viewing as <select id=\"role\" aria-label=\"Viewing as\"></select></label></div>\n </div></div>\n <div class=\"wrap\"><nav aria-label=\"Sections\" style=\"display:flex;gap:4px\"><button class=\"tab\" id=\"tabList\">My goals</button><button class=\"tab\" id=\"tabAlign\">Alignment</button><button class=\"tab\" id=\"tabDash\">Dashboard</button><button class=\"tab\" id=\"tabAppr\" hidden>Approvals</button></nav></div>\n <div class=\"wrap\" id=\"hero\"></div>\n</div>\n<main class=\"wrap\" id=\"app\"></main>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div></div>";

	return Controller.extend("zajmn.hr.goals.hk.controller.App", {
		onInit: function () {
			var comp = this.getOwnerComponent(), host = this.byId("host");
			host.setContent(MARKUP);
			host.attachEvent("afterRendering", function () { Goals.start({ nav: comp.nav, start: comp.getStart(), translateUrl: comp.getTranslateUrl() }); });
		}
	});
});
