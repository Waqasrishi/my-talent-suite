// The progress bar you can move: drag the round handle (or click the bar, or use the arrow keys) to set a progress from 0 to 100.
// While moving, only the bar changes; when you let go, the screen is told once ("ajmng:progress" with the key and the value).
sap.ui.define([], function () {
	"use strict";
	function markup(key, value, label) {
		var v = Math.max(0, Math.min(100, Math.round(+value || 0)));
		return '<div class="pctl"><div class="pbar" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-valuetext="' + v + ' percent" aria-label="' + String(label).replace(/"/g, "&quot;") + '" data-ps="' + key + '">' +
			'<div class="pfill" style="width:' + v + '%"></div><div class="pthumb" style="inset-inline-start:' + v + '%"><span class="pbub">' + v + '%</span></div></div><span class="pval">' + v + "%</span></div>";
	}
	function install(root) {
		var drag = null, idle;
		function set(bar, v) {
			v = Math.max(0, Math.min(100, Math.round(v)));
			bar.setAttribute("aria-valuenow", v); bar.setAttribute("aria-valuetext", v + " percent");
			bar.querySelector(".pfill").style.width = v + "%";
			var th = bar.querySelector(".pthumb"); th.style.insetInlineStart = v + "%"; th.querySelector(".pbub").textContent = v + "%";
			var val = bar.parentElement.querySelector(".pval"); if (val) { val.textContent = v + "%"; }
			var card = bar.closest("[data-ring-scope]");
			if (card) {
				var f = card.querySelector(".rfill"), t = card.querySelector(".rtxt"), r = card.querySelector(".pring");
				if (f) { f.setAttribute("stroke-dasharray", (v / 100 * 226.2).toFixed(1) + " 226.2"); }
				if (t) { t.textContent = v + "%"; }
				if (r) { r.setAttribute("aria-label", "Progress " + v + " percent"); }
			}
			return v;
		}
		function fromPointer(bar, e) {
			var r = bar.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
			if (getComputedStyle(bar).direction === "rtl") { x = 1 - x; }
			return x * 100;
		}
		function commit(bar) { root.dispatchEvent(new CustomEvent("ajmng:progress", { detail: { key: bar.dataset.ps, value: +bar.getAttribute("aria-valuenow") } })); }
		root.addEventListener("pointerdown", function (e) {
			var bar = e.target.closest(".pbar"); if (!bar) { return; }
			e.preventDefault(); bar.focus({ preventScroll: true });
			drag = { bar: bar, start: +bar.getAttribute("aria-valuenow") };
			bar.classList.add("drag"); bar.setPointerCapture(e.pointerId); set(bar, fromPointer(bar, e));
		});
		root.addEventListener("pointermove", function (e) { if (drag) { set(drag.bar, fromPointer(drag.bar, e)); } });
		function end() {
			if (!drag) { return; }
			var bar = drag.bar, changed = +bar.getAttribute("aria-valuenow") !== drag.start; bar.classList.remove("drag"); drag = null;
			if (changed) { commit(bar); }
		}
		root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
		root.addEventListener("keydown", function (e) {
			var bar = e.target.closest && e.target.closest(".pbar"); if (!bar) { return; }
			var rtl = getComputedStyle(bar).direction === "rtl", cur = +bar.getAttribute("aria-valuenow"), big = e.shiftKey ? 10 : 1;
			var d = { ArrowRight: rtl ? -big : big, ArrowLeft: rtl ? big : -big, ArrowUp: big, ArrowDown: -big, PageUp: 10, PageDown: -10 }[e.key];
			if (d === undefined && e.key !== "Home" && e.key !== "End") { return; }
			e.preventDefault();
			set(bar, e.key === "Home" ? 0 : e.key === "End" ? 100 : cur + d);
			clearTimeout(idle); idle = setTimeout(function () { commit(bar); }, 450);
		});
	}
	return { install: install, markup: markup };
});
