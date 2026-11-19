// Opens another app. Inside the Fiori launchpad it uses cross-application navigation (semantic object and action);
// anywhere else (Web IDE preview, a plain web server) it opens the url configured in manifest.json, sap.ui5 > config > nav.
sap.ui.define([], function () {
	"use strict";
	function query(params) {
		var keys = Object.keys(params || {});
		return keys.length ? "?" + keys.map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&") : "";
	}
	return {
		create: function (config) {
			return {
				to: function (key, params) {
					var t = (config || {})[key], shell = window.sap && window.sap.ushell && window.sap.ushell.Container;
					if (!t) { return; }
					function go(service) { service.toExternal({ target: { semanticObject: t.semanticObject, action: t.action }, params: params || {} }); }
					if (shell && shell.getServiceAsync) { shell.getServiceAsync("CrossApplicationNavigation").then(go); }
					else if (shell && shell.getService) { go(shell.getService("CrossApplicationNavigation")); }
					else { window.location.href = t.url + query(params); }
				}
			};
		}
	};
});
