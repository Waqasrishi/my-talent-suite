sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/Goals",
	"../model/Face"
], function (Controller, Goals, Face) {
	"use strict";

	var MARKUP = "<div class=\"ajmng\">\n<div class=\"topbar\">\n <div class=\"tb-left\"><button class=\"tbmenu\" id=\"menuBtn\" type=\"button\" aria-label=\"Menu\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></svg></button><span class=\"tblogo\">AJMN<span>.</span></span><span class=\"tbsep\" aria-hidden=\"true\"></span><span class=\"tbapp\">Goals 2027</span></div>\n \n <div class=\"tb-right\"><button class=\"tbhome tbinfo\" id=\"infoBtn\" type=\"button\" aria-label=\"About this prototype\" title=\"About this prototype\" aria-expanded=\"false\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.500v.5\"/></svg></button><button class=\"tbhome\" id=\"homeLink\" type=\"button\" aria-label=\"AJMN People home\" title=\"AJMN People home\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 11.5 12 4l9 7.5\"/><path d=\"M5.5 10v10h13V10\"/><path d=\"M10 20v-6h4v6\"/></svg></button><button class=\"tbhome tbbell\" type=\"button\" data-soon=\"1\" aria-label=\"Notifications\" title=\"Notifications\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 16V11a6 6 0 0 1 12 0v5l2 2H4z\"/><path d=\"M10 20a2 2 0 0 0 4 0\"/></svg></button><button class=\"tbavatar\" id=\"avatarBtn\" type=\"button\" aria-haspopup=\"menu\" aria-expanded=\"false\" aria-label=\"Account navigation\" title=\"Account navigation\"><span id=\"avInit\">AD</span></button></div>\n</div>\n<div class=\"wsbody\">\n <aside class=\"side\" aria-label=\"Menu\"><div class=\"sidelogo\">AJMN</div><div class=\"sidesub\">ERP Workspace · Talent Suite</div><div class=\"wscard\"><span class=\"wst\">G</span><span class=\"wsx\"><b>Goals 2027</b><small>Strategy · 2027 cycle</small></span><svg class=\"wsch\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M8 10l4-4 4 4M8 14l4 4 4-4\"/></svg></div><button class=\"sideitem\" type=\"button\" id=\"homeSide\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 11.5 12 4l9 7.5\"/><path d=\"M5.5 10v10h13V10\"/></svg><span>Home</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 5h16v10H9l-5 4z\"/></svg><span>My AI Assistant</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 3h8l4 4v14H7z\"/><path d=\"M15 3v4h4\"/></svg><span>My Requests</span></button><button class=\"sideitem on\" type=\"button\" id=\"goalsSide\" aria-current=\"page\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/></svg><span>Goals 2027</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M3 10h18\"/></svg><span>Areeba</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 14v-3a7 7 0 0114 0v3\"/><rect x=\"3\" y=\"14\" width=\"4\" height=\"5\" rx=\"1\"/><rect x=\"17\" y=\"14\" width=\"4\" height=\"5\" rx=\"1\"/></svg><span>Open Ticket</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"6\"/><path d=\"M16 16l5 5\"/></svg><span>Search Employee</span></button><button class=\"sideitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"/></svg><span>Privacy Notice</span></button><div class=\"sidefoot\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/></svg><span><b>Doha, Qatar</b>Sandbox workspace</span></div></aside>\n <div class=\"wsmain\"><div class=\"panel\">\n  <div class=\"demo\">Demo prototype. Sample data. The AI suggestions are simulated, not a live AI. Nothing is saved.</div>\n  <div class=\"pstrip\"><div class=\"psin\"><div class=\"psrow\"><span class=\"psav\" id=\"psAv\">AD</span><span class=\"psx\"><b id=\"tbName\">Admin Demo</b><small id=\"tbTitle\">Senior ERP Specialist</small></span></div><nav class=\"goalsnav\" aria-label=\"Sections\"><button class=\"tab\" id=\"tabList\">My goals</button><button class=\"tab\" id=\"tabAlign\">Alignment</button><button class=\"tab\" id=\"tabDash\">Dashboard</button><button class=\"tab\" id=\"tabAppr\" hidden>Approvals</button><button class=\"tab\" id=\"tabLog\">Workflow log</button></nav></div></div><div class=\"banner\"><svg class=\"bart bnx\" viewBox=\"0 0 1440 270\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><defs><linearGradient id=\"skybnx\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"270\"><stop offset=\"0\" style=\"stop-color:var(--k0)\"/><stop offset=\"0.6\" style=\"stop-color:var(--k1)\"/><stop offset=\"0.88\" style=\"stop-color:var(--k2)\"/><stop offset=\"1\" style=\"stop-color:var(--k3)\"/></linearGradient><linearGradient id=\"farbnx\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"60\" x2=\"0\" y2=\"270\"><stop offset=\"0\" style=\"stop-color:color-mix(in srgb,var(--k2) 70%,var(--k3))\"/><stop offset=\"0.5\" style=\"stop-color:color-mix(in srgb,var(--k2) 60%,var(--k1))\"/><stop offset=\"1\" style=\"stop-color:var(--k1)\"/></linearGradient><linearGradient id=\"midbnx\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"60\" x2=\"0\" y2=\"270\"><stop offset=\"0\" style=\"stop-color:color-mix(in srgb,var(--k1) 85%,var(--k2))\"/><stop offset=\"0.45\" style=\"stop-color:color-mix(in srgb,var(--k1) 60%,#000)\"/><stop offset=\"1\" style=\"stop-color:color-mix(in srgb,var(--k0) 60%,#000)\"/></linearGradient><linearGradient id=\"nearbnx\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"60\" x2=\"0\" y2=\"270\"><stop offset=\"0\" style=\"stop-color:color-mix(in srgb,var(--k0) 55%,var(--k1))\"/><stop offset=\"0.5\" style=\"stop-color:color-mix(in srgb,var(--k0) 80%,#000)\"/><stop offset=\"1\" style=\"stop-color:color-mix(in srgb,var(--k0) 50%,#000)\"/></linearGradient><linearGradient id=\"frontbnx\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"60\" x2=\"0\" y2=\"270\"><stop offset=\"0\" style=\"stop-color:color-mix(in srgb,var(--k0) 75%,var(--k1))\"/><stop offset=\"0.35\" style=\"stop-color:color-mix(in srgb,var(--k0) 55%,#000)\"/><stop offset=\"1\" style=\"stop-color:color-mix(in srgb,var(--k0) 35%,#000)\"/></linearGradient><linearGradient id=\"hazebnx\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".5\" style=\"stop-color:color-mix(in srgb,var(--k3) 25%,#fff)\" stop-opacity=\".22\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient><radialGradient id=\"glowbnx\" cx=\"1060\" cy=\"180\" r=\"520\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#FFD98A\" stop-opacity=\".85\"/><stop offset=\".18\" stop-color=\"#F2B44A\" stop-opacity=\".45\"/><stop offset=\".5\" stop-color=\"#D69A1E\" stop-opacity=\".12\"/><stop offset=\"1\" stop-color=\"#D69A1E\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"lightbnx\" cx=\"1060\" cy=\"150\" r=\"700\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#FFD27A\" stop-opacity=\".55\"/><stop offset=\".45\" stop-color=\"#FFD27A\" stop-opacity=\".12\"/><stop offset=\"1\" stop-color=\"#FFD27A\" stop-opacity=\"0\"/></radialGradient><filter id=\"softbnx\" x=\"-20%\" y=\"-50%\" width=\"140%\" height=\"200%\"><feGaussianBlur stdDeviation=\"1.2\"/></filter><filter id=\"bloombnx\" x=\"-100%\" y=\"-100%\" width=\"300%\" height=\"300%\"><feGaussianBlur stdDeviation=\"22\"/></filter></defs><rect width=\"1440\" height=\"270\" fill=\"url(#skybnx)\"/><g><circle cx=\"1060\" cy=\"178\" r=\"120\" fill=\"#F7C65E\" opacity=\".35\" filter=\"url(#bloombnx)\"/><rect width=\"1440\" height=\"270\" fill=\"url(#glowbnx)\"/><circle cx=\"1060\" cy=\"178\" r=\"38\" fill=\"#FCE3A0\"/></g><g filter=\"url(#softbnx)\" opacity=\".6\"><polygon fill=\"url(#farbnx)\" points=\"0,150 150,112 300,138 470,86 620,128 790,78 950,118 1120,66 1290,112 1380,96 1440,118 1440,270 0,270\"/></g><rect class=\"bnx-haze\" y=\"96\" width=\"1440\" height=\"80\" fill=\"url(#hazebnx)\"/><g class=\"bnx-cl bnx-cl-valley\" data-seed=\"23\" data-cover=\"0.28\" data-size=\"0.95\" data-thick=\"40\" style=\"opacity:0.44\"><g class=\"bnx-cl-move bnx-cl-left\" style=\"animation-duration:70s\"><image class=\"bnx-cl-img\" x=\"0\" y=\"114\" width=\"1440\" height=\"40\" preserveAspectRatio=\"none\"/><image class=\"bnx-cl-img\" x=\"1440\" y=\"114\" width=\"1440\" height=\"40\" preserveAspectRatio=\"none\"/></g></g><polygon fill=\"url(#midbnx)\" points=\"0,190 140,140 280,175 430,110 580,165 720,105 880,150 1010,92 1170,150 1310,100 1440,135 1440,270 0,270\"/><g class=\"bnx-haze\"><rect y=\"140\" width=\"1440\" height=\"70\" fill=\"url(#hazebnx)\" opacity=\".8\"/></g><polygon fill=\"url(#nearbnx)\" points=\"0,232 170,182 340,214 510,160 680,206 840,158 990,196 1130,128 1260,170 1440,146 1440,270 0,270\"/><g class=\"bnx-cl bnx-cl-low\" data-seed=\"37\" data-cover=\"0.48\" data-size=\"0.9\" data-thick=\"50\" style=\"opacity:0.3\"><g class=\"bnx-cl-move bnx-cl-right\" style=\"animation-duration:55s\"><image class=\"bnx-cl-img\" x=\"0\" y=\"199\" width=\"1440\" height=\"50\" preserveAspectRatio=\"none\"/><image class=\"bnx-cl-img\" x=\"1440\" y=\"199\" width=\"1440\" height=\"50\" preserveAspectRatio=\"none\"/></g></g><rect class=\"bnx-light\" width=\"1440\" height=\"270\" fill=\"url(#lightbnx)\"/><polygon fill=\"url(#frontbnx)\" points=\"560,270 1130,128 1200,150 1440,112 1440,270\"/><line x1=\"1130\" y1=\"128\" x2=\"1130\" y2=\"92\" stroke=\"#F4F1E8\" stroke-width=\"2.2\"/><polygon class=\"bnx-flag\" points=\"1130,92 1158,100 1130,108\" fill=\"#D69A1E\"/><g fill=\"#0A0826\"><circle cx=\"1038\" cy=\"150\" r=\"4.5\"/><path d=\"M1034 155h8l3 14-3 1-2-8-1 10h-3l-1-10-2 8-3-1z\"/><path d=\"M1042 157l9-4 1 2-9 5z\"/><circle cx=\"992\" cy=\"166\" r=\"4.5\"/><path d=\"M988 171h8l3 14-3 1-2-8-1 10h-3l-1-10-2 8-3-1z\"/><path d=\"M996 173l9-4 1 2-9 5z\"/></g><g class=\"bnx-climber\" opacity=\"0\"></g></svg><div class=\"bnx-grain\" aria-hidden=\"true\"></div><div class=\"bnx-vig\" aria-hidden=\"true\"></div><div class=\"bin\"><div class=\"bcard\"><span class=\"beye\">2027 goal cycle · closes 31 Dec 2027</span><h2 class=\"bh\">Welcome to Goals 2027</h2><p class=\"bp\">Set your goals, link them to the Director General's strategy and keep your team moving toward them through the year.</p><div class=\"bbtns\"><button class=\"bbtn pri\" type=\"button\" data-hgo=\"newGoal\">New goal</button><button class=\"bbtn\" type=\"button\" data-hgo=\"pushAll\">Push down</button><button class=\"bbtn lnk\" type=\"button\" data-hgo=\"alignAll\">See alignment</button></div></div></div><div id=\"crumb\" hidden></div></div>\n  <div class=\"whorow\" hidden><label class=\"who\">Viewing as <select id=\"role\" aria-label=\"Viewing as\"></select></label></div>\n  <div class=\"wrap\" id=\"hero\"></div>\n  <main class=\"wrap\" id=\"app\"></main>\n </div></div>\n</div>\n<div class=\"usermenu\" id=\"userMenu\" role=\"menu\" aria-label=\"Account\" hidden>\n <div class=\"umtop\"></div>\n <div class=\"umid\"><span class=\"umav\" id=\"umAv\">AD</span><b id=\"umName\">Admin Demo</b><span id=\"umId\">AJMN_DEMO</span><span id=\"umTitle\">Senior ERP Specialist</span><span class=\"umacting\" id=\"umActing\" hidden></span></div>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2L14 3h-4l-.6 2.7a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2L10 21h4l.6-2.7a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z\"/></svg><span>Settings</span></button>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"9\" cy=\"11\" r=\"2\"/><path d=\"M14 10h4M14 14h4M6 16c1-2 5-2 6 0\"/></svg><span>Public Profile</span></button>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" id=\"proxyNow\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"9\" cy=\"8\" r=\"3\"/><circle cx=\"17\" cy=\"9\" r=\"2.4\"/><path d=\"M3 19c.6-3.5 3-5 6-5s5.4 1.5 6 5M15 15c3 0 5 1.2 6 4\"/></svg><span>Proxy Now</span></button>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" id=\"proxyStop\" hidden><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 14l-4-4 4-4\"/><path d=\"M5 10h9a5 5 0 010 10h-2\"/></svg><span>Stop proxy</span></button>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" id=\"resetData\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.5v.5\"/></svg><span>Reset test data</span></button>\n <button class=\"umitem\" role=\"menuitem\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.5v.5\"/></svg><span>About</span></button>\n <div class=\"umfoot\"><button class=\"umout\" type=\"button\" data-soon=\"1\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M12 3v8\"/><path d=\"M6.5 6.5a8 8 0 1011 0\"/></svg><span>Sign Out</span></button></div>\n</div>\n<div class=\"proxy-back\" id=\"proxyBack\" hidden><div class=\"proxy\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"proxyT\">\n <div class=\"proxyh\" id=\"proxyT\">Proxy Now</div>\n <div class=\"proxyb\"><label for=\"proxyIn\">Please enter target user name:<b class=\"req\">*</b></label>\n  <div class=\"proxyfield\"><input id=\"proxyIn\" type=\"text\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"false\" aria-controls=\"proxyList\" aria-autocomplete=\"list\"><button class=\"proxyclr\" id=\"proxyClr\" type=\"button\" aria-label=\"Clear\" hidden>&#10005;</button><svg class=\"proxysrch\" viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"6\"/><path d=\"M16 16l5 5\"/></svg></div>\n  <ul class=\"proxylist\" id=\"proxyList\" role=\"listbox\" hidden></ul></div>\n <div class=\"proxyf\"><button class=\"pbtn primary\" id=\"proxyOk\" type=\"button\" disabled>OK</button><button class=\"pbtn\" id=\"proxyCancel\" type=\"button\">Cancel</button></div>\n</div></div>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div></div>";

	return Controller.extend("zajmn.hr.goals.hk.controller.App", {
		onInit: function () {
			var comp = this.getOwnerComponent(), host = this.byId("host");
			host.setContent(MARKUP);
			host.attachEvent("afterRendering", function () {
				// the server's loading screen (see server.mjs, bootPage) fades out once the app is drawn
				var boot = document.getElementById("boot");
				// the loading screen stays until the fonts are ready, so the text does not change shape after it appears
				var ready = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]) : Promise.resolve();
				if (boot) { ready.then(function () { boot.classList.add("done"); setTimeout(function () { boot.remove(); }, 400); }); }
				Goals.start({ nav: comp.nav, start: comp.getStart() });
				var root = document.querySelector(".ajmng"), q = function (id) { return document.getElementById(id); };
				// the menu button opens the side menu on narrow screens; the side menu's Home is the top bar's home icon
				q("menuBtn").addEventListener("click", function () { root.classList.toggle("menu-open"); });
				q("homeSide").addEventListener("click", function () { q("homeLink").click(); });
				q("infoBtn").addEventListener("click", function () { var d = root.querySelector(".demo"), on = !d.classList.contains("show"); d.classList.toggle("show", on); q("infoBtn").setAttribute("aria-expanded", String(on)); });
				q("goalsSide").addEventListener("click", function () { q("tabList").click(); });
				// v90: a dark theme for the top banner, picked at random on each visit (the goal tiles pick theirs from the goal's id)
				(function () { var K = [["#0E0B2E","#2B2371","#6E5578","#C89130"],["#06222A","#145A63","#3E7A78","#B08A3E"],["#0A1630","#1F3E6E","#5B6E8E","#C2894A"],["#1C0F27","#4A2A5C","#7A5A78","#B27346"],["#0B211C","#245243","#4F7A63","#B8913F"],["#26090F","#5E2235","#8A4A55","#C08046"],["#141A22","#38465A","#66748A","#A88A5A"],["#05182B","#0F4C75","#4A7A98","#C59A3C"]][Math.floor(Math.random() * 8)], b = root.querySelector(".banner"); if (b) { K.forEach(function (v, i) { b.style.setProperty("--k" + i, v); }); } })();
				// v112: the banner's clouds. Each layer is a strip of soft cloud drawn once on a canvas (so its left and right edges meet) and slid slowly across by CSS.
				// The numbers (cover, size, thickness, colour) were chosen in the cloud studio.
				(function () {
					var imgs = root.querySelectorAll(".bnx-cl-img"), tint = 0.3;
					if (!imgs.length) { return; }
					var strip = function (cover, size, thick, seed) {
						var W = 720, Hh = Math.max(8, Math.round(thick / 2)), cv = document.createElement("canvas"), cx, img, d, s = seed * 9301 + 49297, rnd, octs = [], o, i, j, x, y, grid, row, px, py;
						cv.width = W; cv.height = Hh; cx = cv.getContext("2d");
						if (!cx || !cx.createImageData) { return null; }
						img = cx.createImageData(W, Hh); d = img.data;
						rnd = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
						for (o = 0; o < 4; o++) {
							px = Math.max(2, Math.round(6 * Math.pow(2, o) / size)); py = Math.max(2, Math.round(3 * Math.pow(2, o) / size) + 1); grid = [];
							for (j = 0; j <= py; j++) { row = []; for (i = 0; i < px; i++) { row.push(rnd()); } grid.push(row); }
							octs.push({ px: px, py: py, grid: grid, amp: Math.pow(0.5, o) });
						}
						var sm = function (t) { return t * t * (3 - 2 * t); }, tG = Math.round(255 - 20 * tint), tB = Math.round(255 - 60 * tint);
						for (y = 0; y < Hh; y++) {
							var v = y / (Hh - 1), band = Math.pow(Math.sin(Math.PI * v), 1.6);
							for (x = 0; x < W; x++) {
								var n = 0, tot = 0, k;
								for (k = 0; k < octs.length; k++) {
									var O = octs[k], fx = x / W * O.px, fy = v * O.py, i0 = Math.floor(fx), j0 = Math.min(Math.floor(fy), O.py - 1);
									var tx = sm(fx - i0), ty = sm(fy - j0), i1 = (i0 + 1) % O.px, a = i0 % O.px;
									var top = O.grid[j0][a] * (1 - tx) + O.grid[j0][i1] * tx, bot = O.grid[j0 + 1][a] * (1 - tx) + O.grid[j0 + 1][i1] * tx;
									n += (top * (1 - ty) + bot * ty) * O.amp; tot += O.amp;
								}
								n /= tot;
								var al = Math.max(0, Math.min(1, (n - (1 - cover)) / 0.2)) * band, p = (y * W + x) * 4;
								d[p] = 255; d[p + 1] = tG; d[p + 2] = tB; d[p + 3] = Math.round(al * 255);
							}
						}
						cx.putImageData(img, 0, 0);
						return cv.toDataURL("image/png");
					};
					[].forEach.call(root.querySelectorAll(".bnx-cl"), function (g) {
						var url = strip(+g.getAttribute("data-cover"), +g.getAttribute("data-size"), +g.getAttribute("data-thick"), +g.getAttribute("data-seed"));
						if (!url) { return; }
						[].forEach.call(g.querySelectorAll(".bnx-cl-img"), function (im) { im.setAttribute("href", url); im.setAttributeNS("http://www.w3.org/1999/xlink", "href", url); });
					});
				})();
				// v110: the climber on the banner's front ridge (helmet + headlamp, pack with a rope coil, boots, ice axe). He walks up to the flag,
				// raises the ice axe, catches his breath with his hands on his knees, then fades out and starts again. Settings from the design studio.
				(function () {
					var g = root.querySelector(".bnx-climber");
					if (!g || g.getAttribute("data-run")) { return; }
					g.setAttribute("data-run", "1");
					var C = { size: 0.5, startX: 865, topX: 1111, climb: 31, cheer: 3, rest: 7, pause: 4, legs: 11, torso: 8.4, head: 2.7, limb: 3.2, pack: 1, lean: 20, stride: 16, axe: true, lamp: true, rope: true, color: "#0A0826", lampColor: "#FFE7A3" };
					var LOOP = C.climb + 1 + C.cheer + 1.2 + C.rest + 1.5 + C.pause + 2;
					var ridge = function (x) { return 270 + (x - 560) * (128 - 270) / (1130 - 560); };
					var rad = function (d) { return d * Math.PI / 180; }, lerp = function (a, b, s) { return a + (b - a) * s; };
					var ease = function (s) { return s <= 0 ? 0 : s >= 1 ? 1 : s * s * (3 - 2 * s); };
					var blend = function (a, b, s) { var o = {}, k; for (k in a) { o[k] = lerp(a[k], b[k], ease(s)); } return o; };
					var copy = function (a) { var o = {}, k; for (k in a) { o[k] = a[k]; } return o; };
					var f = function (n) { return (+n).toFixed(2); };
					var STAND = { lean: 5, la: 4, lb: -3, ka: 6, kb: 5, aa: 18, ab: -6, ea: 14, eb: 12, hop: 0 };
					var CHEER = { lean: -2, la: 5, lb: -5, ka: 4, kb: 4, aa: 146, ab: 30, ea: -14, eb: 50, hop: 0 };
					var TIRED = { lean: 38, la: 24, lb: 4, ka: 44, kb: 32, aa: -8, ab: -2, ea: 0, eb: 0, hop: 0 };
					var walk = function (phi, tired) {
						var s = Math.sin(phi), c = Math.cos(phi);
						return { lean: C.lean + 7 * tired, la: 7 + C.stride * s, lb: 7 - C.stride * s, ka: 10 + 22 * Math.max(0, c), kb: 10 + 22 * Math.max(0, -c), aa: 22 - 16 * s, ab: 2 + 18 * s, ea: 18, eb: 22, hop: 0 };
					};
					var state = function (t) {
						if (t < C.climb) {
							var u = t / C.climb, x = lerp(C.startX, C.topX, 1 - Math.pow(1 - u, 1.5));
							var pose = walk((x - C.startX) * 0.25 / C.size, u * u);
							if (t > C.climb - 1) { pose = blend(pose, STAND, t - (C.climb - 1)); }
							return { x: x, pose: pose, op: Math.min(1, t / 1.5) };
						}
						var s = t - C.climb, c1 = 1.8, c2 = 1 + C.cheer, r0 = c2 + 1.2, r1 = r0 + C.rest, r2 = r1 + 1.5, p, b;
						if (s < 1) { p = STAND; }
						else if (s < c1) { p = blend(STAND, CHEER, (s - 1) / 0.8); }
						else if (s < c2) { p = copy(CHEER); p.aa += 5 * Math.sin((s - c1) * 4.5); p.hop = s < c1 + 0.7 ? 1.4 * Math.sin((s - c1) / 0.7 * Math.PI) : 0; }
						else if (s < r0) { p = blend(CHEER, TIRED, (s - c2) / 1.2); }
						else if (s < r1) { p = copy(TIRED); b = Math.sin((s - r0) * 2 * Math.PI / 1.6); p.lean += 3 * b; p.aa += 2 * b; p.ab += 2 * b; }
						else if (s < r2) { p = blend(TIRED, STAND, (s - r1) / 1.5); }
						else { p = STAND; }
						return { x: C.topX, pose: p, op: t > LOOP - 2 ? (LOOP - t) / 2 : 1 };
					};
					// the figure, feet on the ground at (0,0), facing uphill
					var figure = function (p) {
						var T = C.legs / 2, TO = C.torso, UA = TO * 0.58, FA = TO * 0.54, col = C.color, lw = C.limb, out = [];
						var leg = function (a, k) { var kx = T * Math.sin(rad(a)), ky = T * Math.cos(rad(a)); return [kx, ky, kx + T * Math.sin(rad(a - k)), ky + T * Math.cos(rad(a - k))]; };
						var A = leg(p.la, p.ka), B = leg(p.lb, p.kb), hy = -Math.max(A[3], B[3]) - 1.1 - p.hop;
						var ux = Math.sin(rad(p.lean)), uy = -Math.cos(rad(p.lean)), sx = TO * ux, sy = hy + TO * uy;
						var arm = function (a, e) { var ex = sx + UA * Math.sin(rad(a)), ey = sy + UA * Math.cos(rad(a)); return [ex, ey, ex + FA * Math.sin(rad(a + e)), ey + FA * Math.cos(rad(a + e)), a + e]; };
						var R = arm(p.aa, p.ea), L = arm(p.ab, p.eb), hl = rad(p.lean * 0.8), hx = sx + (C.head + 1.6) * Math.sin(hl), hh = sy - (C.head + 1.6) * Math.cos(hl);
						var line = function (pts, w) { out.push('<path d="M' + f(pts[0]) + " " + f(pts[1]) + (pts.length > 2 ? "L" + f(pts[2]) + " " + f(pts[3]) : "") + (pts.length > 4 ? "L" + f(pts[4]) + " " + f(pts[5]) : "") + '" fill="none" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"/>'); };
						var boot = function (x, y) { out.push('<rect x="' + f(x - 1.1) + '" y="' + f(y - 0.4) + '" width="3.4" height="1.7" rx=".7" fill="' + col + '"/>'); };
						line([0, hy, B[0], hy + B[1], B[2], hy + B[3]], lw); boot(B[2], hy + B[3]);
						line([sx, sy, L[0], L[1], L[2], L[3]], lw * 0.82);
						var ph = 7.2 * C.pack, pw = 4.4 * C.pack, cx = 0.55 * TO * ux - 2.6 * C.pack * Math.cos(rad(p.lean)), cy = hy + 0.55 * TO * uy - 2.6 * C.pack * Math.sin(rad(p.lean)), rot = ' transform="rotate(' + f(p.lean) + " " + f(cx) + " " + f(cy) + ')"';
						out.push('<rect x="' + f(cx - pw / 2) + '" y="' + f(cy - ph / 2) + '" width="' + f(pw) + '" height="' + f(ph) + '" rx="' + f(1.3 * C.pack) + '" fill="' + col + '"' + rot + "/>");
						if (C.rope) { out.push('<ellipse cx="' + f(cx - 0.4 * C.pack) + '" cy="' + f(cy + ph * 0.42) + '" rx="' + f(2.6 * C.pack) + '" ry="' + f(1.3 * C.pack) + '" fill="none" stroke="' + col + '" stroke-width=".9"' + rot + "/>"); }
						line([0, hy, sx, sy], lw * 1.45);
						line([0, hy, A[0], hy + A[1], A[2], hy + A[3]], lw); boot(A[2], hy + A[3]);
						out.push('<circle cx="' + f(hx) + '" cy="' + f(hh) + '" r="' + f(C.head) + '" fill="' + col + '"/>');
						out.push('<path d="M' + f(hx - C.head * 1.15) + " " + f(hh + 0.2) + "A" + f(C.head * 1.15) + " " + f(C.head * 1.2) + " 0 0 1 " + f(hx + C.head * 1.15) + " " + f(hh + 0.2) + 'Z" fill="' + col + '" transform="rotate(' + f(p.lean * 0.8) + " " + f(hx) + " " + f(hh) + ')"/>');
						if (C.lamp) {
							var lx = hx + C.head * 1.05 * Math.cos(hl) + 0.2, ly = hh + C.head * 1.05 * Math.sin(hl) - C.head * 0.35, dir = hl + rad(22), BL = 16, sp = rad(11);
							out.push('<path d="M' + f(lx) + " " + f(ly) + "L" + f(lx + BL * Math.cos(dir - sp)) + " " + f(ly + BL * Math.sin(dir - sp)) + "L" + f(lx + BL * Math.cos(dir + sp)) + " " + f(ly + BL * Math.sin(dir + sp)) + 'Z" fill="' + C.lampColor + '" opacity=".16"/>');
							out.push('<circle cx="' + f(lx) + '" cy="' + f(ly) + '" r=".75" fill="' + C.lampColor + '"/>');
						}
						line([sx, sy, R[0], R[1], R[2], R[3]], lw * 0.82);
						if (C.axe) {
							var d = rad(R[4]), dx = Math.sin(d), dy = Math.cos(d), len = C.legs * 0.62, up = dy < 0;
							var tx = up ? R[2] + dx * len : R[2] - dx * 1.2, ty = up ? R[3] + dy * len : R[3] - dy * 1.2, bx = up ? R[2] - dx * 1.2 : R[2] + dx * len, by = up ? R[3] - dy * 1.2 : R[3] + dy * len;
							out.push('<path d="M' + f(tx) + " " + f(ty) + "L" + f(bx) + " " + f(by) + '" stroke="' + col + '" stroke-width=".9" stroke-linecap="round"/>');
							out.push('<path d="M' + f(tx - dy * 2.4) + " " + f(ty + dx * 2.4) + "Q" + f(tx) + " " + f(ty - 0.6) + " " + f(tx + dy * 1.6) + " " + f(ty - dx * 1.6) + '" fill="none" stroke="' + col + '" stroke-width="1" stroke-linecap="round"/>');
						}
						return out.join("");
					};
					var draw = function (st) {
						g.setAttribute("transform", "translate(" + f(st.x) + " " + f(ridge(st.x) + 0.15) + ") scale(" + C.size + ")");
						g.setAttribute("opacity", f(st.op));
						g.innerHTML = figure(st.pose);
					};
					// people who ask for less motion see him standing at the flag
					if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { draw({ x: C.topX, pose: STAND, op: 1 }); return; }
					var t0 = null;
					var frame = function (now) {
						if (!document.body.contains(g)) { return; }
						if (t0 === null) { t0 = now; }
						draw(state(((now - t0) / 1000) % LOOP));
						window.requestAnimationFrame(frame);
					};
					window.requestAnimationFrame(frame);
				})();
				// v87: the welcome banner's buttons press the page's own New goal, Push down and Alignment; Team view opens the Dashboard; a goal's menu closes on a click elsewhere
				root.addEventListener("click", function (e) { var h = e.target.closest("[data-hgo]"); if (h) { var go = q(h.getAttribute("data-hgo")); if (go) { go.click(); } return; } });
				document.addEventListener("click", function (e) { root.querySelectorAll("details.gmenu[open]").forEach(function (d) { if (!d.contains(e.target)) { d.open = false; } }); });
				// the menu on the left is the home page's menu; its other items are not set up in this demo
				var toastEl = q("toast"), toastTimer;
				var say = function (msg) { toastEl.textContent = msg; toastEl.style.display = "block"; clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.style.display = "none"; }, 3500); };
				// ---- Proxy Now (as in SuccessFactors): the account menu, then a dialog to pick the person to act as ----
				var role = q("role"), menu = q("userMenu"), back = q("proxyBack"), input = q("proxyIn"), list = q("proxyList"), ok = q("proxyOk"), clr = q("proxyClr"), avBtn = q("avatarBtn");
				var DEF = role.options.length ? role.value : "", chosen = null, ar = function () { return root.dir === "rtl"; };
				var who = function (o) { var t = o.textContent.replace(/\s*\((you|أنت)\)\s*$/, ""), i = t.indexOf(","); if (i < 0 && t.indexOf("،") > 0) { i = t.indexOf("،"); } return i > 0 ? { name: t.slice(0, i).trim(), sub: t.slice(i + 1).trim() } : { name: t.trim(), sub: "" }; };
				function paint() {
					var o = role.options[role.selectedIndex], p = o ? who(o) : { name: "", sub: "" }, acting = role.value !== DEF;
					q("avInit").innerHTML = Face.svg(acting ? p.name : "Admin Demo");
					q("umAv").innerHTML = Face.svg(acting ? p.name : "Admin Demo");
					q("tbName").textContent = acting ? p.name : q("umName").textContent; q("psAv").innerHTML = Face.svg(acting ? p.name : "Admin Demo"); q("tbTitle").textContent = acting ? p.sub : q("umTitle").textContent;
					var a = q("umActing"); a.hidden = !acting; a.textContent = acting ? (ar() ? "تعمل بصفة: " : "Acting as: ") + p.name + (p.sub ? " (" + p.sub + ")" : "") : "";
					q("proxyStop").hidden = !acting;
					avBtn.title = avBtn.getAttribute("aria-label") + (acting ? " (" + p.name + ")" : "");
				}
				role.addEventListener("change", paint); paint();
				function closeMenu() { menu.hidden = true; avBtn.setAttribute("aria-expanded", "false"); }
				avBtn.addEventListener("click", function (e) { e.stopPropagation(); var open = menu.hidden; menu.hidden = !open; avBtn.setAttribute("aria-expanded", String(open)); if (open) { menu.querySelector(".umitem").focus(); } });
				document.addEventListener("click", function (e) { if (!menu.hidden && !menu.contains(e.target)) { closeMenu(); } });
				menu.addEventListener("click", function (e) {
					var soon = e.target.closest("[data-soon]");
					if (soon) { closeMenu(); say(soon.textContent.trim() + (ar() ? " غير مُعدّ بعد في هذا النموذج." : " is not set up yet in this demo.")); }
				});
				function suggestions() {
					var v = input.value.trim().toLowerCase(), html = "", n = 0;
					[].forEach.call(role.options, function (o) {
						var p = who(o); if (!v || (p.name + " " + p.sub).toLowerCase().indexOf(v) < 0 || n >= 8) { return; } n++;
						html += '<li role="option" data-v="' + o.value + '" tabindex="-1"><span class="pav">' + Face.svg(p.name) + '</span><span class="ptx"><b>' + p.name.replace(/</g, "&lt;") + '</b><small>' + p.sub.replace(/</g, "&lt;") + '</small></span></li>';
					});
					list.innerHTML = v && !html ? '<li class="none" role="option" aria-disabled="true">' + (ar() ? "لا يوجد مستخدمون مطابقون." : "No matching users.") + '</li>' : html;
					list.hidden = !list.innerHTML; input.setAttribute("aria-expanded", String(!list.hidden)); clr.hidden = !input.value;
				}
				function openProxy() { closeMenu(); chosen = null; input.value = ""; ok.disabled = true; list.hidden = true; clr.hidden = true; back.hidden = false; setTimeout(function () { input.focus(); }, 30); }
				function closeProxy() { back.hidden = true; avBtn.focus(); }
				q("proxyNow").addEventListener("click", openProxy);
				q("proxyStop").addEventListener("click", function () { closeMenu(); role.value = DEF; role.dispatchEvent(new Event("change", { bubbles: true })); say(ar() ? "تم إيقاف العمل بالإنابة." : "Proxy stopped. You are back as yourself."); });
				input.addEventListener("input", function () { chosen = null; ok.disabled = true; suggestions(); });
				list.addEventListener("click", function (e) { var li = e.target.closest("li[data-v]"); if (!li) { return; } chosen = li.dataset.v; input.value = li.querySelector("b").textContent; list.hidden = true; input.setAttribute("aria-expanded", "false"); ok.disabled = false; clr.hidden = false; input.focus(); });
				clr.addEventListener("click", function () { input.value = ""; chosen = null; ok.disabled = true; suggestions(); input.focus(); });
				q("proxyCancel").addEventListener("click", closeProxy);
				back.addEventListener("click", function (e) { if (e.target === back) { closeProxy(); } });
				ok.addEventListener("click", function () { if (!chosen) { return; } role.value = chosen; role.dispatchEvent(new Event("change", { bubbles: true })); closeProxy(); say((ar() ? "أنت الآن تعمل بصفة " : "You are now acting as ") + who(role.options[role.selectedIndex]).name + "."); });
				document.addEventListener("keydown", function (e) {
					if (e.key === "Escape") { if (!back.hidden) { closeProxy(); } else if (!menu.hidden) { closeMenu(); avBtn.focus(); } }
					if (e.key === "Enter" && !back.hidden && document.activeElement === input && !ok.disabled) { ok.click(); }
					if (e.key === "ArrowDown" && !back.hidden && !list.hidden) { var f = list.querySelector("li[data-v]"); if (f) { f.focus(); e.preventDefault(); } }
					if (e.key === "Enter" && document.activeElement && document.activeElement.matches && document.activeElement.matches("#proxyList li[data-v]")) { document.activeElement.click(); }
				});
				root.querySelector(".side").addEventListener("click", function (e) {
					var soon = e.target.closest("[data-soon]");
					if (!soon) { return; }
					toastEl.textContent = soon.textContent.trim() + (root.dir === "rtl" ? " غير مُعدّ بعد في هذا النموذج." : " is not set up yet in this demo.");
					toastEl.style.display = "block"; clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.style.display = "none"; }, 3500);
				});
				root.querySelector(".side").addEventListener("click", function () { root.classList.remove("menu-open"); });
			});
		}
	});
});
