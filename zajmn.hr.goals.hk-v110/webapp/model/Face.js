// A neutral person icon for a name (v93): a head and shoulders in one theme colour on a soft tint, no skin, hair or face.
// The same name always gets the same colour pair, so people stay easy to tell apart.
sap.ui.define([], function () {
	"use strict";
	// [tint, figure] pairs from the AJ palette: indigo, blue, gold, teal, plum, slate
	var PAIRS = [["#ECEAF7", "#1D174E"], ["#E1EFF8", "#0F5C8C"], ["#FBF1DA", "#8A5A00"], ["#E2F1EE", "#1D5E54"], ["#F3E8F1", "#6B2D5C"], ["#ECEFF3", "#3E4352"]];
	function svg(nm) {
		var h = 7, s = String(nm || "");
		for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
		var c = PAIRS[h % PAIRS.length];
		return '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" fill="' + c[0] + '"/>' +
			'<circle cx="20" cy="16" r="7" fill="' + c[1] + '"/>' +
			'<path d="M6.5 40c1.2-8.6 6.6-13.4 13.5-13.4S32.3 31.4 33.5 40z" fill="' + c[1] + '"/></svg>';
	}
	return { svg: svg };
});
