// Full text on hover: any text the page cuts short with "..." (ellipsis or a line clamp) shows its whole text in a small tooltip,
// also on keyboard focus. One listener for the whole page, so every list, popup and card gets it without a line of code each.
sap.ui.define([], function () {
	"use strict";
	var tip = null, cur = null, timer = null, saved = null;

	function cut(el) {
		var cs = getComputedStyle(el);
		if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) { return true; }
		if (cs.webkitLineClamp && cs.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 1) { return true; }
		return false;
	}
	function find(node) {
		for (var i = 0, el = node; el && el.nodeType === 1 && i < 5; i++, el = el.parentElement) { if (cut(el)) { return el; } }
		return null;
	}
	function hide() {
		clearTimeout(timer);
		if (cur && saved !== null) { cur.setAttribute("title", saved); }
		cur = null; saved = null;
		if (tip) { tip.classList.remove("show"); }
	}
	function show(el) {
		var text = (el.getAttribute("data-full") || el.getAttribute("title") || el.textContent || "").replace(/\s+/g, " ").trim();
		if (!text) { return; }
		cur = el; saved = el.hasAttribute("title") ? el.getAttribute("title") : null;
		if (saved !== null) { el.removeAttribute("title"); }
		tip.textContent = text; tip.classList.add("show");
		var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
		var x = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), y = r.bottom + 8;
		if (y + h > window.innerHeight - 8) { y = Math.max(8, r.top - h - 8); }
		tip.style.left = x + "px"; tip.style.top = y + "px";
	}
	function install(root) {
		tip = document.createElement("div"); tip.className = "fulltip"; tip.setAttribute("role", "tooltip"); root.appendChild(tip);
		root.addEventListener("mouseover", function (e) {
			var el = find(e.target);
			if (el === cur) { return; }
			hide();
			if (el) { timer = setTimeout(function () { show(el); }, 180); }
		});
		root.addEventListener("mouseout", function (e) { if (!e.relatedTarget || !cur || !cur.contains(e.relatedTarget)) { hide(); } });
		root.addEventListener("focusin", function (e) { var el = find(e.target); if (el) { hide(); show(el); } });
		root.addEventListener("focusout", hide);
		window.addEventListener("scroll", hide, true);
		root.addEventListener("click", hide);
		document.addEventListener("keydown", function (e) { if (e.key === "Escape") { hide(); } });
	}
	return { install: install };
});
