// A date field with a calendar. The page holds the value in a hidden input (for example "31 December 2027"); a button shows it and opens
// a calendar under the button. Days before the date named in data-min (another date field) cannot be picked. Month and weekday names
// follow the page language; the stored value is always English, as the rest of the app keeps its dates.
sap.ui.define([], function () {
	"use strict";
	var EN_M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var AR_M = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
	var EN_D = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], AR_D = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
	var ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';

	function parse(t) {
		if (!t) { return null; }
		var m = /^\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*$/.exec(t);
		if (m) {
			var i = EN_M.findIndex(function (n) { return n.toLowerCase().slice(0, 3) === m[2].toLowerCase().slice(0, 3); });
			if (i >= 0) { return new Date(+m[3], i, +m[1]); }
		}
		var d = new Date(t); return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
	}
	function fmt(d) { return d.getDate() + " " + EN_M[d.getMonth()] + " " + d.getFullYear(); }
	var same = function (a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
	function day0(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

	function install(root) {
		var pop = null, cur = null, view = "days", shown = null, focusDay = null, min = null, sel = null, hidden = null, btn = null;
		var ar = function () { return root.dir === "rtl"; };
		var MN = function () { return ar() ? AR_M : EN_M; };

		function close(refocus) {
			if (!pop) { return; }
			pop.remove(); pop = null;
			if (refocus && btn) { btn.focus(); }
			btn = null;
		}
		function place() {
			var r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
			var left = ar() ? r.right - w : r.left, top = r.bottom + 6;
			left = Math.max(8, Math.min(left, vw - w - 8));
			if (top + h > vh - 8 && r.top - h - 6 > 8) { top = r.top - h - 6; }
			pop.style.left = left + "px"; pop.style.top = top + "px";
		}
		function pick(d) {
			if (min && d < min) { return; }
			hidden.value = fmt(d);
			hidden.setAttribute("value", fmt(d));
			btn.querySelector(".dptext").textContent = fmt(d);
			hidden.dispatchEvent(new Event("input", { bubbles: true }));
			hidden.dispatchEvent(new Event("change", { bubbles: true }));
			close(true);
		}
		function draw() {
			var y = shown.getFullYear(), m = shown.getMonth(), html = "";
			var head = '<div class="dph"><button type="button" class="dpnav" data-nav="-1" aria-label="' + (ar() ? "السابق" : "Previous") + '">&lsaquo;</button><button type="button" class="dptitle" data-title="1" aria-live="polite">' + (view === "days" ? MN()[m] + " " + y : y) + '</button><button type="button" class="dpnav" data-nav="1" aria-label="' + (ar() ? "التالي" : "Next") + '">&rsaquo;</button></div>';
			if (view === "months") {
				html = '<div class="dpmonths">' + MN().map(function (n, i) { return '<button type="button" class="dpm' + (i === m ? " on" : "") + '" data-month="' + i + '">' + n.slice(0, ar() ? 6 : 3) + '</button>'; }).join("") + '</div>';
			} else {
				var first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), today = day0(new Date()), cells = "";
				var names = ar() ? AR_D : EN_D;
				html = '<div class="dpw">' + names.map(function (n) { return "<span>" + n + "</span>"; }).join("") + "</div><div class=\"dpg\" role=\"grid\">";
				for (var i = 0; i < first; i++) { cells += "<span></span>"; }
				for (var d = 1; d <= days; d++) {
					var dt = new Date(y, m, d), off = min && dt < min;
					cells += '<button type="button" class="dpd' + (same(dt, sel) ? " sel" : "") + (same(dt, today) ? " today" : "") + '" data-day="' + d + '"' + (off ? " disabled" : "") + ' tabindex="' + (d === (focusDay || 1) ? 0 : -1) + '" aria-label="' + d + " " + MN()[m] + " " + y + '">' + d + "</button>";
				}
				html += cells + "</div>";
			}
			var foot = '<div class="dpf"><button type="button" class="dptoday" data-today="1">' + (ar() ? "اليوم" : "Today") + '</button><button type="button" class="dpclose" data-close="1">' + (ar() ? "إغلاق" : "Close") + "</button></div>";
			pop.innerHTML = head + html + foot;
			var f = pop.querySelector('.dpd[tabindex="0"]:not([disabled])') || pop.querySelector(".dpd:not([disabled])");
			if (f && document.activeElement && pop.contains(document.activeElement) === false && view === "days") { /* focus stays on the button until the person uses the keyboard */ }
		}
		function open(b) {
			close(false);
			btn = b; hidden = root.querySelector("#" + b.dataset.dp);
			sel = parse(hidden.value);
			var minEl = b.dataset.min && root.querySelector("#" + b.dataset.min);
			min = minEl ? parse(minEl.value) : null;
			shown = sel || day0(new Date()); if (min && shown < min) { shown = min; }
			focusDay = sel ? sel.getDate() : null; view = "days";
			pop = document.createElement("div");
			pop.className = "dp-pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", ar() ? "اختيار تاريخ" : "Choose a date");
			root.appendChild(pop);
			draw(); place();
		}
		function shift(delta) {
			if (view === "months") { shown = new Date(shown.getFullYear() + delta, shown.getMonth(), 1); }
			else { shown = new Date(shown.getFullYear(), shown.getMonth() + delta, 1); }
			focusDay = null; draw(); place();
		}
		root.addEventListener("click", function (e) {
			var b = e.target.closest("[data-dp]");
			if (b && !pop) { e.preventDefault(); open(b); return; }
			if (b && pop && btn === b) { close(true); return; }
			if (!pop) { return; }
			var t = e.target;
			if (t.closest("[data-nav]")) { shift(+t.closest("[data-nav]").dataset.nav); return; }
			if (t.closest("[data-title]")) { view = view === "days" ? "months" : "days"; draw(); place(); return; }
			if (t.closest("[data-month]")) { shown = new Date(shown.getFullYear(), +t.closest("[data-month]").dataset.month, 1); view = "days"; draw(); place(); return; }
			if (t.closest("[data-day]")) { pick(new Date(shown.getFullYear(), shown.getMonth(), +t.closest("[data-day]").dataset.day)); return; }
			if (t.closest("[data-today]")) { pick(day0(new Date())); return; }
			if (t.closest("[data-close]")) { close(true); return; }
			if (!pop.contains(t)) { close(false); }
		});
		document.addEventListener("keydown", function (e) {
			if (!pop) { return; }
			if (e.key === "Escape") { e.preventDefault(); close(true); return; }
			var a = document.activeElement;
			if (a && a.classList && a.classList.contains("dpd")) {
				var d = +a.dataset.day, step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
				if (step) {
					e.preventDefault();
					var nd = new Date(shown.getFullYear(), shown.getMonth(), d + step);
					shown = new Date(nd.getFullYear(), nd.getMonth(), 1); focusDay = nd.getDate(); draw(); place();
					var n = pop.querySelector('.dpd[data-day="' + focusDay + '"]'); if (n) { n.focus(); }
				}
			}
		});
		window.addEventListener("resize", function () { if (pop) { place(); } });
		window.addEventListener("scroll", function () { if (pop) { place(); } }, true);
		// removed from the page together with the screen
		return { close: close };
	}
	function field(id, label, value, minId) {
		var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
		return '<label class="fl" for="' + id + '_b">' + label + '</label><div class="dpwrap"><input type="hidden" id="' + id + '" value="' + esc(value) + '"><button type="button" class="dpbtn" id="' + id + '_b" data-dp="' + id + '" data-min="' + (minId || "") + '" aria-haspopup="dialog"><span class="dptext">' + esc(value || "Select a date") + "</span>" + ICON + "</button></div>";
	}
	return { install: install, field: field };
});
