// Smooth movement when the person moves to another screen or wizard step: the page keeps its height while the new content is put in,
// the new content fades in, and the page glides back to the top. Typing or choosing an option inside the same step does none of this.
// Respects "reduce motion".
sap.ui.define([], function () {
	function install(root) {
		const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const app = root.querySelector("#app"), hero = root.querySelector("#hero");
		if (!app) { return; }
		function scroller() {
			let n = root.parentElement;
			while (n && n !== document.body && n !== document.documentElement) {
				if (/(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight) { return n; }
				n = n.parentElement;
			}
			return null;
		}
		const y = () => { const s = scroller(); return s ? s.scrollTop : window.scrollY; };
		function toTop() {
			if (y() <= 0) { return; }
			const s = scroller(), opts = { top: 0, behavior: reduce ? "auto" : "smooth" };
			if (s) { s.scrollTo(opts); } else { window.scrollTo(opts); }
		}
		// which screen and step is showing: the headline, the wizard's question and its current step
		const text = (c, sel) => { const e = c.querySelector(sel); return e ? e.textContent.trim() : ""; };
		const signature = (c) => [text(c, "h1"), text(c, "#q"), text(c, ".stepper .cur"), text(c, "#gBack")].join("|");
		let last = signature(root), freezeTimer, held = false;
		function enter(el) {
			if (!el || reduce) { return; }
			el.classList.remove("enter");
			void el.offsetWidth; // restart the animation
			el.classList.add("enter");
		}
		function release() { app.style.minHeight = ""; if (hero) { hero.style.minHeight = ""; } }
		// just before the screen is drawn again: if it is another screen, hold the page's height so the browser does not shorten the
		// page and move the scroll position while the old content is swapped for the new
		root.addEventListener("ajmng:render", (e) => {
			const tmp = document.createElement("div");
			tmp.innerHTML = e.detail.html;
			const next = signature(tmp);
			if (next === last) { return; }
			last = next;
			// v104: no hold inside a popup (or when one opens or closes): the popup takes its own height at once
			const inSheet = !!app.closest(".gsheet"), was = held; held = inSheet;
			clearTimeout(freezeTimer);
			if (inSheet || was) { release(); } else {
				app.style.minHeight = app.offsetHeight + "px";
				if (hero) { hero.style.minHeight = hero.offsetHeight + "px"; }
				freezeTimer = setTimeout(release, reduce ? 0 : 650);
			}
			// v104: a popup opening or closing does not fade the page again or move it: the popup has its own entrance and exit, and
			// the page stays where it was. A new step inside a popup fades in and takes the popup (not the page) back to its top.
			if (inSheet !== was) { return; }
			// after the swap: fade in and glide up (a short timer, not requestAnimationFrame, which stops in a background tab)
			setTimeout(() => {
				enter(hero); enter(app);
				const sh = app.closest(".gsheet");
				if (sh) { if (sh.scrollTop > 0) { sh.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); } } else { toTop(); }
			}, 0);
		});
	}
	return { install };
});
