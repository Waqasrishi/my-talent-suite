sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/Goals"
], function (Controller, Goals) {
	"use strict";

	var MARKUP = "<div class=\"ajmng\">\n<div class=\"topbar\">\n <div class=\"tb-left\"><button class=\"tbmenu\" id=\"menuBtn\" type=\"button\" aria-label=\"Menu\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></svg></button><span class=\"tbtitle\">Goals 2027</span></div>\n <span class=\"tbdot\" aria-hidden=\"true\"></span>\n <div class=\"tb-right\"><button class=\"langbtn\" id=\"langBtn\" type=\"button\" aria-label=\"English / العربية\" title=\"English / العربية\" data-i18n-skip=\"1\"><span class=\"l-en\">EN</span><span class=\"l-ar\">عربي</span></button><button class=\"tbhome\" id=\"homeLink\" type=\"button\" aria-label=\"AJMN People home\" title=\"AJMN People home\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 11.5 12 4l9 7.5\"/><path d=\"M5.5 10v10h13V10\"/><path d=\"M10 20v-6h4v6\"/></svg></button><span class=\"tbavatar\" aria-hidden=\"true\"></span></div>\n</div>\n<div class=\"wsbody\">\n <aside class=\"side\" aria-label=\"Sections\">\n  <div class=\"sidelogo\">AJMN</div><div class=\"sidesub\">ERP Workspace</div>\n  <button class=\"tab\" id=\"homeSide\" type=\"button\">Home</button>\n  <button class=\"tab\" id=\"tabList\">My goals</button><button class=\"tab\" id=\"tabAlign\">Alignment</button><button class=\"tab\" id=\"tabDash\">Dashboard</button><button class=\"tab\" id=\"tabAppr\" hidden>Approvals</button>\n  <div class=\"sidefoot\">Sandbox workspace</div>\n </aside>\n <div class=\"wsmain\"><div class=\"panel\">\n  <div class=\"demo\">Demo prototype. Sample data. The AI suggestions are simulated, not a live AI. Nothing is saved.</div>\n  <div class=\"banner\"><div class=\"brandblock\"><div class=\"brand\">Goals <span>2027</span></div><div id=\"crumb\"></div></div><div class=\"skyline\" aria-hidden=\"true\"></div></div>\n  <div class=\"whorow\"><label class=\"who\">Viewing as <select id=\"role\" aria-label=\"Viewing as\"></select></label></div>\n  <div class=\"wrap\" id=\"hero\"></div>\n  <main class=\"wrap\" id=\"app\"></main>\n </div></div>\n</div>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div></div>";

	return Controller.extend("zajmn.hr.goals.hk.controller.App", {
		onInit: function () {
			var comp = this.getOwnerComponent(), host = this.byId("host");
			host.setContent(MARKUP);
			host.attachEvent("afterRendering", function () {
				Goals.start({ nav: comp.nav, start: comp.getStart() });
				var root = document.querySelector(".ajmng"), q = function (id) { return document.getElementById(id); };
				// the menu button opens the side menu on narrow screens; the side menu's Home is the top bar's home icon
				q("menuBtn").addEventListener("click", function () { root.classList.toggle("menu-open"); });
				q("homeSide").addEventListener("click", function () { q("homeLink").click(); });
				root.querySelector(".side").addEventListener("click", function (e) { if (e.target.closest(".tab")) { root.classList.remove("menu-open"); } });
			});
		}
	});
});
