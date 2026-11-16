// AJMN People home (Goals theme, 15 Nov 2026): the home page design as a module of this component.
// Links into the Goals module go through opts.nav (Fiori launchpad navigation, or a plain link); the other areas say "not set up yet".
sap.ui.define([], function () {
	var started = false;
	function start(opts) {
		if (started) { return; }
		started = true;
		var ROOT = document.querySelector(".ajmnh"), toast = ROOT.querySelector("#toast"), timer;
		ROOT.addEventListener("click", function (e) {
			var go = e.target.closest("[data-go]"), soon = e.target.closest("[data-soon]");
			if (go) { e.preventDefault(); opts.nav.to("goals", go.dataset.go === "goals" ? {} : { start: go.dataset.go }); }
			else if (soon) {
				e.preventDefault();
				var l = soon.querySelector("h3,.ql,span:last-child") || soon;
				toast.querySelector("b").textContent = l.textContent.replace(/\s+/g, " ").trim();
				toast.hidden = false; clearTimeout(timer); timer = setTimeout(function () { toast.hidden = true; }, 3500);
			}
		});
	}
	return { start: start };
});
