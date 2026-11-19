// Updates part of the page in place instead of throwing it away and building it again. A screen that is drawn again keeps every element
// that did not change, so nothing flashes, the page does not lose its height for a moment, focus and scroll stay where they are, and CSS
// transitions (a selected option, a progress bar) run between the old and the new state.
sap.ui.define([], function () {
	"use strict";
	var HANDLERS = ["onclick", "oninput", "onchange", "onkeydown", "onkeyup", "onmousedown", "onblur", "onfocus", "onsubmit"];

	function attrs(x, y) {
		Array.prototype.slice.call(x.attributes).forEach(function (a) { if (!y.hasAttribute(a.name)) { x.removeAttribute(a.name); } });
		Array.prototype.forEach.call(y.attributes, function (a) { if (x.getAttribute(a.name) !== a.value) { x.setAttribute(a.name, a.value); } });
	}

	function node(x, y) {
		// a different kind of element, or one that got listeners of its own (the type-ahead fields): use the new one
		if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName || x.__fresh) { x.replaceWith(y); return; }
		if (x.nodeType !== 1) { if (x.data !== y.data) { x.data = y.data; } return; }
		attrs(x, y);
		HANDLERS.forEach(function (h) { if (x[h]) { x[h] = null; } }); // the screen binds its handlers again after drawing
		var tag = x.nodeName;
		if (tag === "INPUT") {
			if (x.type === "checkbox" || x.type === "radio") { x.checked = y.hasAttribute("checked"); }
			else { var v = y.getAttribute("value") || ""; if (x.value !== v) { x.value = v; } }
			return;
		}
		if (tag === "TEXTAREA") { var t = y.textContent; if (x.value !== t) { x.value = t; } return; }
		children(x, y);
		if (tag === "SELECT") {
			var sel = Array.prototype.findIndex.call(x.options, function (o, i) { return y.options[i] && y.options[i].hasAttribute("selected"); });
			if (sel >= 0) { x.selectedIndex = sel; }
		}
	}

	function children(a, b) {
		var from = Array.prototype.slice.call(b.childNodes), i;
		for (i = 0; i < from.length; i++) {
			var x = a.childNodes[i];
			if (!x) { a.appendChild(from[i]); } else { node(x, from[i]); }
		}
		while (a.childNodes.length > from.length) { a.removeChild(a.lastChild); }
	}

	return { children: children };
});
