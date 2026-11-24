// Editing weights in place. A weight is a whole number from 0 to 100 on each goal. Two small editors open next to what you clicked:
// one goal's weight (on the goal page, or on a goal card), or all weights at once (the "Total weight" tile). Nothing is calculated from
// the weights yet; they are only stored. The screen is told once, with "ajmng:weights", when you press Save.
sap.ui.define([], function () {
	"use strict";
	var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
	var PEN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
	function install(root, api) {
		var pop = null, anchor = null, mode = null, ids = [];
		var scrim = null;
		var close = function (refocus) { if (scrim) { scrim.remove(); scrim = null; } if (pop) { pop.remove(); pop = null; } if (refocus && anchor && document.contains(anchor)) { anchor.focus(); } anchor = null; };
		function place() {
			// v102: Set weights (all goals) is a centred popup over a dimmed page; one goal's weight stays next to what was clicked
			if (mode === "all") { pop.style.left = Math.max(8, (document.documentElement.clientWidth - pop.offsetWidth) / 2) + "px"; pop.style.top = Math.max(8, (window.innerHeight - pop.offsetHeight) / 2) + "px"; return; }
			var r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
			var left = root.dir === "rtl" ? r.right - w : r.left, top = r.bottom + 6;
			left = Math.max(8, Math.min(left, vw - w - 8));
			if (top + h > vh - 8 && r.top - h - 6 > 8) { top = r.top - h - 6; }
			pop.style.left = left + "px"; pop.style.top = top + "px";
		}
		var num = function (v) { return /^\d{1,3}$/.test(String(v).trim()) && +v <= 100 ? +v : null; };
		function field(id, val, label) {
			return '<div class="wtf"><button type="button" class="wtstep" data-step="-5" data-for="' + id + '" aria-label="' + (root.dir === "rtl" ? "إنقاص" : "Less") + '">&minus;</button>' +
				'<input type="text" inputmode="numeric" class="wtin" id="' + id + '" value="' + (val == null ? "" : val) + '" aria-label="' + esc(label) + '" placeholder="0">' +
				'<span class="wtpct">%</span><button type="button" class="wtstep" data-step="5" data-for="' + id + '" aria-label="' + (root.dir === "rtl" ? "زيادة" : "More") + '">+</button></div>';
		}
		function totals() {
			var sum = 0, bad = false;
			pop.querySelectorAll(".wtin").forEach(function (i) { var v = i.value.trim() === "" ? 0 : num(i.value); if (v === null) { bad = true; i.classList.add("bad"); } else { i.classList.remove("bad"); sum += v; } });
			var note = pop.querySelector(".wtnote"), save = pop.querySelector("[data-save]");
			var t = pop.querySelector(".wttotal");
			if (mode === "all") {
				t.textContent = "Total: " + sum + "%";
				note.textContent = bad ? "Each weight must be a whole number from 0 to 100." : sum === 100 ? "Complete" : sum < 100 ? (100 - sum) + "% still to give out" : (sum - 100) + "% over 100%";
				note.className = "wtnote " + (bad || sum > 100 ? "over" : sum === 100 ? "ok" : "low");
				save.disabled = bad || sum > 100;
			} else {
				var others = +pop.dataset.others, v = pop.querySelector(".wtin").value.trim() === "" ? 0 : num(pop.querySelector(".wtin").value);
				note.textContent = v === null ? "Enter a whole number from 0 to 100." : (others + v) > 100 ? "Your other goals already use " + others + "%. Up to " + Math.max(0, 100 - others) + "% is left." : "Your other goals use " + others + "%. Up to " + (100 - others) + "% is left.";
				note.className = "wtnote " + (v === null || others + v > 100 ? "over" : "low");
				save.disabled = v === null || others + v > 100;
			}
		}
		// when one weight changes, the last goal takes the remainder, so the total stays at 100
		function rebalance(changed) {
			if (mode !== "all") { return; }
			var ins = pop.querySelectorAll(".wtin"); if (ins.length < 2) { return; }
			var last = ins[ins.length - 1]; if (changed === last) { return; }
			var rest = 0, bad = false; ins.forEach(function (i) { if (i === last) { return; } var v = i.value.trim() === "" ? 0 : num(i.value); if (v === null) { bad = true; } else { rest += v; } });
			if (!bad) { last.value = Math.max(0, 100 - rest); }
		}
		function open(a, spec) {
			close(false); anchor = a; var list = api.list();
			pop = document.createElement("div"); pop.className = "wt-pop"; pop.setAttribute("role", "dialog");
			var html;
			if (spec === "all") {
				mode = "all"; ids = list.map(function (g) { return g.id; });
				var none = list.every(function (g) { return g.weight == null || g.weight === ""; }), cnt = list.length, base = Math.floor(100 / (cnt || 1)), extra = 100 - base * cnt;
				html = '<div class="wth">Set weights</div><div class="wtb">' + (list.length ? list.map(function (g, k) { return '<div class="wtrow"><span class="wtname" title="' + esc(g.title) + '">' + esc(g.title) + "</span>" + field("w_" + g.id, none ? base + (k < extra ? 1 : 0) : g.weight, g.title) + "</div>"; }).join("") : "<p>No goals yet.</p>") +
					'<div class="wtsum"><b class="wttotal"></b><span class="wtnote"></span></div></div><div class="wtf2"><button type="button" class="wtlink" data-even="1">Split evenly</button><span><button type="button" class="wtcancel" data-cancel="1">Cancel</button><button type="button" class="wtsave" data-save="1">Save</button></span></div>';
				pop.setAttribute("aria-label", "Set weights");
			} else {
				mode = "one"; var id = +spec.split(":")[1], g = list.filter(function (x) { return x.id === id; })[0]; if (!g) { pop = null; return; }
				ids = [id]; pop.dataset.others = list.filter(function (x) { return x.id !== id; }).reduce(function (t, x) { return t + (+x.weight || 0); }, 0);
				html = '<div class="wth">Set weight</div><div class="wtb"><div class="wtname one" title="' + esc(g.title) + '">' + esc(g.title) + "</div>" + field("w_" + id, g.weight, "Weight") +
					'<div class="wtpre">' + [10, 20, 25, 30, 40, 50].map(function (p) { return '<button type="button" class="wtp" data-preset="' + p + '">' + p + "%</button>"; }).join("") + '</div><div class="wtsum"><span class="wtnote"></span><b class="wttotal" hidden></b></div></div><div class="wtf2"><span></span><span><button type="button" class="wtcancel" data-cancel="1">Cancel</button><button type="button" class="wtsave" data-save="1">Save</button></span></div>';
				pop.setAttribute("aria-label", "Set weight");
			}
			pop.innerHTML = html; if (mode === "all") { scrim = document.createElement("div"); scrim.className = "wt-scrim"; root.appendChild(scrim); pop.classList.add("wt-center"); } root.appendChild(pop); totals(); place();
			var f = pop.querySelector(".wtin"); if (f) { f.focus(); f.select(); }
		}
		function save() {
			var changes = {}; pop.querySelectorAll(".wtin").forEach(function (i) { changes[i.id.slice(2)] = i.value.trim() === "" ? null : +i.value; });
			close(false); root.dispatchEvent(new CustomEvent("ajmng:weights", { detail: { changes: changes } }));
		}
		root.addEventListener("click", function (e) {
			var a = e.target.closest("[data-w]");
			if (a && !pop) { e.preventDefault(); open(a, a.dataset.w); return; }
			if (a && pop && a === anchor) { close(true); return; }
			if (!pop) { return; }
			var t = e.target, st = t.closest("[data-step]");
			if (st) { var i = pop.querySelector("#" + st.dataset.for), v = i.value.trim() === "" ? 0 : num(i.value); i.value = Math.max(0, Math.min(100, (v === null ? 0 : v) + (+st.dataset.step))); rebalance(i); totals(); i.focus(); return; }
			if (t.closest("[data-preset]")) { pop.querySelector(".wtin").value = t.closest("[data-preset]").dataset.preset; totals(); return; }
			if (t.closest("[data-even]")) { var n = ids.length, base = Math.floor(100 / n), extra = 100 - base * n; pop.querySelectorAll(".wtin").forEach(function (i, k) { i.value = base + (k < extra ? 1 : 0); }); totals(); return; }
			if (t.closest("[data-cancel]")) { close(true); return; }
			if (t.closest("[data-save]")) { if (!t.closest("[data-save]").disabled) { save(); } return; }
			if (!pop.contains(t)) { close(false); }
		});
		root.addEventListener("input", function (e) { if (pop && e.target.classList && e.target.classList.contains("wtin")) { rebalance(e.target); totals(); } });
		document.addEventListener("keydown", function (e) {
			if (!pop) { return; }
			if (e.key === "Escape") { e.preventDefault(); close(true); }
			else if (e.key === "Enter" && e.target.classList && e.target.classList.contains("wtin")) { e.preventDefault(); var s = pop.querySelector("[data-save]"); if (!s.disabled) { save(); } }
		});
		window.addEventListener("resize", function () { if (pop) { place(); } });
		window.addEventListener("scroll", function () { if (pop) { place(); } }, true);
	}
	return { install: install, PEN: PEN };
});
