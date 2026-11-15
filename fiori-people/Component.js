// The component only has to draw the two elements the page's script works in, then start it.
sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/HTML", "./model/People"], function (UIComponent, HTML, People) {
	"use strict";
	return UIComponent.extend("ajmn.people.Component", {
		metadata: { manifest: "json" },
		createContent: function () {
			const html = new HTML({ content: '<div id="app"></div><div class="toast" id="toast" role="status" hidden></div>', preferDOM: false });
			html.attachEvent("afterRendering", function () { People.start(); });
			return html;
		}
	});
});
