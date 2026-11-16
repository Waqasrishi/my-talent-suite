sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/Goals"
], function (Controller, Goals) {
	"use strict";

	var MARKUP = "<div class=\"ajmng\"><div class=\"demo\">Demo prototype. Sample data. The AI suggestions are simulated, not a live AI. Nothing is saved.</div>\n<div class=\"hero\">\n <div class=\"wrap\"><div class=\"bar\">\n  <div class=\"row\" style=\"gap:20px\"><button class=\"link homelink\" id=\"homeLink\" type=\"button\">&larr; AJMN People home</button><div class=\"brand\">Goals <span>2027</span></div><div id=\"crumb\" style=\"font-size:15px\"></div></div>\n  <label class=\"who\">Viewing as <select id=\"role\" aria-label=\"Viewing as\"></select></label>\n </div></div>\n <div class=\"wrap\"><nav aria-label=\"Sections\" style=\"display:flex;gap:4px\"><button class=\"tab\" id=\"tabList\">My goals</button><button class=\"tab\" id=\"tabAlign\">Alignment</button><button class=\"tab\" id=\"tabDash\">Dashboard</button><button class=\"tab\" id=\"tabAppr\" hidden>Approvals</button></nav></div>\n <div class=\"wrap\" id=\"hero\"></div>\n</div>\n<main class=\"wrap\" id=\"app\"></main>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div></div>";

	return Controller.extend("zajmn.hr.goals.hk.controller.App", {
		onInit: function () {
			var comp = this.getOwnerComponent(), host = this.byId("host");
			// the prototype's fonts (Inter and Manrope); without internet the page falls back to system fonts
			if (!document.getElementById("ajmng-fonts")) {
				var l = document.createElement("link");
				l.id = "ajmng-fonts"; l.rel = "stylesheet";
				l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=swap";
				document.head.appendChild(l);
			}
			host.setContent(MARKUP);
			host.attachEvent("afterRendering", function () { Goals.start({ nav: comp.nav, start: comp.getStart(), translateUrl: comp.getTranslateUrl() }); });
		}
	});
});
