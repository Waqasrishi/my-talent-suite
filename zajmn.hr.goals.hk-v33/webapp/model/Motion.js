// Smooth movement: when the person moves to another screen or another wizard step, the new content fades in and the page glides
// back to the top instead of jumping. Typing or choosing an option inside the same step does not trigger it. Respects "reduce motion".
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
		const text = (sel) => { const e = root.querySelector(sel); return e ? e.textContent.trim() : ""; };
		// what screen and step is showing: the headline, the wizard's question and its current step
		const signature = () => [text("#hero h1") || text("#app h1"), text("#q"), text(".stepper .cur"), text("#gBack")].join("|");
		let last = signature(), queued = false;
		function enter(el) {
			if (!el || reduce) { return; }
			el.classList.remove("enter");
			void el.offsetWidth; // restart the animation
			el.classList.add("enter");
		}
		function check() {
			queued = false;
			const now = signature();
			if (now === last) { return; }
			last = now;
			enter(hero); enter(app);
			toTop();
		}
		// a short timer, not requestAnimationFrame: the screen has finished rebuilding by then, and timers still run in a background tab
		const mo = new MutationObserver(() => { if (!queued) { queued = true; setTimeout(check, 40); } });
		mo.observe(app, { childList: true, subtree: true });
		if (hero) { mo.observe(hero, { childList: true, subtree: true }); }
	}
	return { install };
});
