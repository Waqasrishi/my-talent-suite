// v103: the Goals helper robot. v105: the win is a quiet halo of gold rings (no confetti, rays or stars). v104: it floats in its own lane at the right of the page on wide screens and in the top bar on smaller ones, never over the goal tiles. It blinks, follows the pointer with its eyes,
// jumps and speaks up when something new or urgent arrives, celebrates with confetti when a task is done, dances when everything
// is done, and falls asleep after a minute without input. It has no box and no arms: only the robot, softly lit.
// Goals.js tells it what is waiting (update) and when something was done (celebrate); a click opens the list (opts.open).
sap.ui.define([], function () {
	"use strict";
	var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var BOUNCE = "cubic-bezier(.34,1.56,.64,1)";
	var LIGHT = { clear: "#2FB673", steady: "#3BA7E0", busy: "#E8AE1F", urgent: "#E0493B", sleep: "#8A8FA0" };
	var MOUTH = { smile: "M41 54 Q50 61 59 54", grin: "M40 52 Q50 64 60 52 Z", o: "M50 51 a3.6 4.4 0 1 0 .01 0", wavy: "M42 55 Q46 51 50 55 T58 55", small: "M45 54 Q50 57 55 54" };
	var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
	var SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
		'<defs><radialGradient id="rbJet" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#FFE08A"/><stop offset=".5" stop-color="#D69D10" stop-opacity=".75"/><stop offset="1" stop-color="#D69D10" stop-opacity="0"/></radialGradient></defs>' +
		'<ellipse class="rb-jet" cx="50" cy="104" rx="9" ry="11" fill="url(#rbJet)"/>' +
		'<g class="rb-head">' +
		'<path d="M18 46 Q18 10 50 10 Q82 10 82 46" stroke="#1D174E" stroke-width="5" fill="none" stroke-linecap="round"/>' +
		'<rect x="20" y="20" width="60" height="54" rx="16" fill="#D69D10"/><rect x="27" y="27" width="46" height="38" rx="11" fill="#FFFFFF"/>' +
		'<g class="rb-eyes"><circle cx="40" cy="43" r="3.6" fill="#1D174E"/><circle cx="60" cy="43" r="3.6" fill="#1D174E"/></g>' +
		'<g class="rb-lids" style="display:none"><path d="M35 43 Q40 46 45 43 M55 43 Q60 46 65 43" stroke="#1D174E" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>' +
		'<g class="rb-happy" style="display:none"><path d="M35.5 44.5 Q40 38.5 44.5 44.5 M55.5 44.5 Q60 38.5 64.5 44.5" stroke="#1D174E" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>' +
		'<g class="rb-brows" style="display:none"><path d="M34 36 L43 34 M66 36 L57 34" stroke="#1D174E" stroke-width="2.2" stroke-linecap="round"/></g>' +
		'<path class="rb-m" d="' + MOUTH.smile + '" stroke="#1D174E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
		'<ellipse class="rb-cheek" cx="32" cy="52" rx="3" ry="1.8" fill="#E86A8A" opacity="0"/><ellipse class="rb-cheek" cx="68" cy="52" rx="3" ry="1.8" fill="#E86A8A" opacity="0"/>' +
		'<rect x="10" y="36" width="12" height="22" rx="6" fill="#1D174E"/><rect x="78" y="36" width="12" height="22" rx="6" fill="#1D174E"/>' +
		'<circle class="rb-lt" cx="84" cy="47" r="2.5"/><circle class="rb-lt" cx="16" cy="47" r="2.5"/></g>' +
		'<rect x="36" y="77" width="28" height="18" rx="8" fill="#1D174E"/><circle class="rb-lt" cx="50" cy="86" r="3"/></svg>';

	function create(root, opts) {
		var el = document.createElement("div");
		el.className = "gbot rb";
		el.innerHTML = '<span class="rb-ring" aria-hidden="true"></span><button type="button" class="rb-btn"><span class="rb-hov">' + SVG + '</span></button><span class="rb-shadow" aria-hidden="true"></span><b class="gbn rb-n" hidden></b>';
		root.appendChild(el);
		var btn = el.querySelector(".rb-btn"), hov = el.querySelector(".rb-hov"), s = el.querySelector("svg"), head = s.querySelector(".rb-head"), eyes = s.querySelector(".rb-eyes"),
			mouthEl = s.querySelector(".rb-m"), badge = el.querySelector(".rb-n"), shadow = el.querySelector(".rb-shadow"), ring = el.querySelector(".rb-ring");
		[head, eyes].forEach(function (g) { g.style.transformBox = "fill-box"; g.style.transformOrigin = "50% 50%"; });
		var st = { mood: "clear", n: 0, sleeping: false, face: null, busy: false, last: Date.now(), who: null, seen: null, timers: [] };
		var floatA = null;
		var anim = function (node, frames, o) { if (RM || !node.animate) { return { finished: Promise.resolve() }; } return node.animate(frames, o); };
		// an animation never holds the robot up: a paused or hidden page still gets the bubble on time
		function upTo(p, ms) { return Promise.race([p, new Promise(function (r) { setTimeout(r, ms); })]).catch(function () {}); }
		function later(fn, ms) { var t = setTimeout(fn, ms); st.timers.push(t); return t; }

		// ---- the body: float, blink, look around, follow the pointer ----
		if (!RM) {
			floatA = hov.animate([{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }, { transform: "translateY(0)" }], { duration: 2600, iterations: Infinity, easing: "ease-in-out" });
			shadow.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.75)", opacity: .55 }, { transform: "scale(1)", opacity: 1 }], { duration: 2600, iterations: Infinity, easing: "ease-in-out" });
			s.querySelector(".rb-jet").animate([{ opacity: .5, transform: "scaleY(.8)" }, { opacity: 1, transform: "scaleY(1.2)" }, { opacity: .5, transform: "scaleY(.8)" }], { duration: 480, iterations: Infinity });
		}
		(function blink() { if (!st.sleeping && !st.face) { anim(eyes, [{ transform: "scaleY(1)" }, { transform: "scaleY(.1)" }, { transform: "scaleY(1)" }], { duration: 170 }); } setTimeout(blink, 2400 + Math.random() * 3600); })();
		(function idle() {
			if (!st.busy && !st.sleeping && !RM && !document.hidden) {
				var r = Math.random();
				if (r < .35) { anim(eyes, [{ transform: "translate(0,0)" }, { transform: "translate(-3px,0)", offset: .25 }, { transform: "translate(-3px,0)", offset: .45 }, { transform: "translate(3px,-1px)", offset: .7 }, { transform: "translate(0,0)" }], { duration: 1800, easing: "ease-in-out" }); }
				else if (r < .55) { anim(hov, [{ transform: "scale(1,1)" }, { transform: "scale(.92,1.08)", offset: .4 }, { transform: "scale(1.05,.95)", offset: .7 }, { transform: "scale(1,1)" }], { duration: 900, easing: BOUNCE, composite: "add" }); }
				else if (r < .7) { anim(head, [{ transform: "rotate(0)" }, { transform: "rotate(-7deg)" }, { transform: "rotate(0)" }], { duration: 900, easing: "ease-in-out" }); }
			}
			setTimeout(idle, 4000 + Math.random() * 4000);
		})();
		function seen() { st.last = Date.now(); if (st.sleeping) { wake(); } }
		document.addEventListener("pointermove", function (e) {
			seen(); if (st.face || st.sleeping) { return; }
			var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .4;
			var dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 300)), dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 300));
			eyes.style.transform = "translate(" + (dx * 3).toFixed(2) + "px," + (dy * 2.5).toFixed(2) + "px)"; head.style.transform = "rotate(" + (dx * 4).toFixed(2) + "deg)";
		}, { passive: true });
		document.addEventListener("keydown", seen, true);
		// asleep after a minute without input; it wakes on the next move or key
		setInterval(function () { if (!st.sleeping && !st.busy && Date.now() - st.last > 60000) { sleep(); } }, 5000);

		// ---- faces ----
		function show(sel, on) { s.querySelector(sel).style.display = on ? "" : "none"; }
		function mouth(k) { mouthEl.setAttribute("d", MOUTH[k]); mouthEl.setAttribute("fill", k === "o" || k === "grin" ? "#1D174E" : "none"); }
		function lights(c) { s.querySelectorAll(".rb-lt").forEach(function (l) { l.setAttribute("fill", c); }); }
		function setFace(f) {
			st.face = f; var base = f || (st.mood === "urgent" ? "worry" : st.mood === "clear" ? "glad" : null);
			show(".rb-eyes", base !== "sleep" && base !== "happy" && base !== "glad"); show(".rb-lids", base === "sleep"); show(".rb-happy", base === "happy" || base === "glad"); show(".rb-brows", base === "worry");
			s.querySelectorAll(".rb-cheek").forEach(function (c) { c.setAttribute("opacity", base === "happy" ? .5 : 0); });
			mouth(base === "happy" ? "grin" : base === "wow" ? "o" : base === "worry" ? "wavy" : base === "sleep" ? "small" : "smile");
			eyes.style.transform = base === "wow" ? "scale(1.35)" : "";
			lights(base === "sleep" ? LIGHT.sleep : LIGHT[st.mood] || LIGHT.steady);
			el.classList.toggle("urgent", st.mood === "urgent" && !st.sleeping);
		}
		function hop(h) { return anim(hov, [{ transform: "translateY(0) scale(1,1)" }, { transform: "translateY(2px) scale(1.08,.9)", offset: .2 }, { transform: "translateY(-" + (h || 16) + "px) scale(.95,1.06)", offset: .55 }, { transform: "translateY(0) scale(1,1)" }], { duration: 650, easing: "ease-out", composite: "add" }).finished; }
		function pulse() { anim(ring, [{ transform: "scale(.6)", opacity: .9 }, { transform: "scale(1.7)", opacity: 0 }], { duration: 1100, easing: "ease-out" }); }
		function shake() { return anim(hov, [{ transform: "rotate(0)" }, { transform: "rotate(-7deg)" }, { transform: "rotate(7deg)" }, { transform: "rotate(-7deg)" }, { transform: "rotate(0)" }], { duration: 560, iterations: 2, composite: "add" }).finished; }
		// v105: the win is a halo. Soft gold rings spread out from the robot, it glows and hops, its face is happy and the count turns into a
		// green tick for a moment. Nothing leaves the robot's corner.
		function halo() {
			if (RM) { tick(); return; }
			var r = el.getBoundingClientRect();
			for (var i = 0; i < 3; i++) {
				var d = document.createElement("i"); d.className = "rb-halo"; d.style.left = (r.left + r.width / 2) + "px"; d.style.top = (r.top + r.height * .42) + "px"; root.appendChild(d);
				d.animate([{ transform: "translate(-50%,-50%) scale(.5)", opacity: .9 }, { transform: "translate(-50%,-50%) scale(2.5)", opacity: 0 }], { duration: 1100, delay: i * 200, easing: "cubic-bezier(.2,.7,.3,1)", fill: "backwards" })
					.finished.then(function (n) { return function () { n.remove(); }; }(d), function (n) { return function () { n.remove(); }; }(d));
			}
			anim(hov, [{ filter: "drop-shadow(0 0 7px rgba(214,157,16,.6)) drop-shadow(0 6px 12px rgba(29,23,78,.32))" }, { filter: "drop-shadow(0 0 20px rgba(255,214,102,1)) drop-shadow(0 0 10px rgba(214,157,16,.9)) drop-shadow(0 6px 12px rgba(29,23,78,.32))", offset: .4 }, { filter: "drop-shadow(0 0 7px rgba(214,157,16,.6)) drop-shadow(0 6px 12px rgba(29,23,78,.32))" }], { duration: 1300, easing: "ease-in-out" });
			hop(12); tick();
		}
		function tick() {
			st.tickUntil = Date.now() + 1500; badge.hidden = false; badge.textContent = "\u2713"; badge.classList.add("ok");
			anim(badge, [{ transform: "scale(0) rotate(-90deg)" }, { transform: "scale(1.4) rotate(0)" }, { transform: "scale(1)" }], { duration: 420, easing: BOUNCE });
			setTimeout(function () { badge.classList.remove("ok"); badge.textContent = st.n > 9 ? "9+" : st.n; badge.hidden = !st.n; }, 1500);
		}
		// knocks on the glass: leans towards you, taps three times, and the taps ripple out from where it knocked
		function knock() {
			if (RM) { pulse(); return Promise.resolve(); }
			var lean = hov.animate([{ transform: "scale(1) translateY(0)" }, { transform: "scale(1.28) translateY(-8px)", offset: .22 }, { transform: "scale(1.22) translateY(-8px)", offset: .34 }, { transform: "scale(1.28) translateY(-8px)", offset: .46 }, { transform: "scale(1.22) translateY(-8px)", offset: .58 }, { transform: "scale(1.28) translateY(-8px)", offset: .7 }, { transform: "scale(1) translateY(0)" }], { duration: 1300, easing: "ease-in-out", composite: "add" });
			[330, 600, 870].forEach(function (t) {
				setTimeout(function () {
					var r = el.getBoundingClientRect(), x = r.left + r.width * .5, y = r.top + r.height * .32;
					var w = document.createElement("span"); w.className = "rb-tap"; w.style.left = x + "px"; w.style.top = y + "px"; root.appendChild(w);
					w.animate([{ transform: "translate(-50%,-50%) scale(.2)", opacity: .9 }, { transform: "translate(-50%,-50%) scale(1.6)", opacity: 0 }], { duration: 600, easing: "ease-out" }).finished.then(function () { w.remove(); });
					var k = document.createElement("span"); k.className = "rb-knock"; k.textContent = "knock"; k.style.left = (x - 70 + Math.random() * 16) + "px"; k.style.top = (y - 26 - Math.random() * 18) + "px"; root.appendChild(k);
					k.animate([{ opacity: 0, transform: "scale(.6) rotate(-8deg)" }, { opacity: 1, transform: "scale(1.1) rotate(-8deg)", offset: .3 }, { opacity: 0, transform: "scale(1) translateY(-14px) rotate(-8deg)" }], { duration: 700 }).finished.then(function () { k.remove(); });
				}, t);
			});
			return lean.finished;
		}
		function sleep() {
			if (st.sleeping) { return; } st.sleeping = true; bubbleOff(); setFace("sleep"); if (floatA) { floatA.updatePlaybackRate(.45); }
			(function z() {
				if (!st.sleeping) { return; }
				if (!RM && !document.hidden) {
					var r = el.getBoundingClientRect(), e = document.createElement("span"); e.className = "rb-z"; e.textContent = "z"; e.style.left = (r.left + r.width * .72) + "px"; e.style.top = (r.top + 4) + "px"; root.appendChild(e);
					e.animate([{ opacity: 0, transform: "translate(0,0) scale(.6)" }, { opacity: 1, offset: .3 }, { opacity: 0, transform: "translate(18px,-48px) scale(1.4)" }], { duration: 2200 }).finished.then(function () { e.remove(); });
				}
				st.zt = setTimeout(z, 950);
			})();
		}
		function wake() { if (!st.sleeping) { return; } st.sleeping = false; clearTimeout(st.zt); if (floatA) { floatA.updatePlaybackRate(1); } setFace(null); hop(10); }

		// ---- the speech bubble: only for something new or urgent; its button does the job ----
		var bub = null;
		function bubbleOff() { if (bub) { bub.remove(); bub = null; } }
		function say(title, text, btn, go) {
			bubbleOff(); bub = document.createElement("div"); bub.className = "rb-bub"; bub.setAttribute("role", "status");
			bub.innerHTML = '<button type="button" class="rb-bx" aria-label="Close">&times;</button><b>' + esc(title) + "</b><span>" + esc(text) + "</span>" + (btn ? '<div class="rb-bb"><button type="button" class="rb-later">Later</button><button type="button" class="rb-go">' + esc(btn) + "</button></div>" : "");
			root.appendChild(bub);
			anim(bub, [{ transform: "scale(.3)", opacity: 0 }, { transform: "scale(1.05)", opacity: 1 }, { transform: "scale(1)" }], { duration: 320, easing: BOUNCE });
			var b = bub; b.querySelector(".rb-bx").onclick = bubbleOff; var l = b.querySelector(".rb-later"); if (l) { l.onclick = bubbleOff; }
			var g = b.querySelector(".rb-go"); if (g) { g.onclick = function () { bubbleOff(); if (go) { go(); } }; }
			later(function () { if (bub === b) { bubbleOff(); } }, btn ? 14000 : 4000);
		}

		// ---- reactions ----
		async function arrive(it, urgent) {
			if (st.sleeping) { wake(); } st.busy = true; setFace(urgent ? "worry" : "wow");
			anim(badge, [{ transform: "scale(0)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 450, easing: BOUNCE });
			pulse(); await upTo(hop(24), 700); await upTo(knock(), 1400); if (urgent) { await upTo(shake(), 1200); }
			if (it) { say(urgent ? "This needs you now" : "Something new for you", it.title + (it.sub && it.sub !== it.title ? ": " + it.sub : ""), it.btn, it.go); }
			later(function () { setFace(null); st.busy = false; }, 900);
		}
		async function celebrate(text) {
			st.busy = true; if (st.sleeping) { wake(); } setFace("happy"); lights(LIGHT.clear); halo();
			if (text) { say(text, "", null, null); }
			later(function () { setFace(null); st.busy = false; }, 1400);
		}
		async function allClear() {
			st.busy = true; setFace("happy"); lights(LIGHT.clear); halo();
			say("All caught up", "Nothing is waiting for you. Nice work.", null, null);
			later(function () { setFace(null); st.busy = false; }, 1200);
		}
		// it asks for attention while something waits: every 20 seconds (12 when urgent) a gold ring and a knock on the glass, or a hop
		(function nudge() {
			var wait = st.mood === "urgent" ? 12000 : 20000;
			if (st.n && !st.busy && !st.sleeping && !document.hidden && !bub) { pulse(); st.k = (st.k || 0) + 1; if (st.mood === "urgent" || st.k % 2) { knock(); } else { hop(12); } }
			setTimeout(nudge, wait);
		})();

		el.addEventListener("mouseenter", function () { if (!st.busy && !st.sleeping) { hop(12); } });
		btn.addEventListener("click", function () { seen(); bubbleOff(); if (opts && opts.open) { opts.open(); } });

		// Goals.js calls this after every render with what is waiting now
		function update(x) {
			if (!x) { el.hidden = true; return; } el.hidden = false;
			var ids = x.act.map(function (i) { return i.title + "|" + i.sub; });
			if (!(st.tickUntil > Date.now())) { badge.textContent = x.n > 9 ? "9+" : x.n; badge.hidden = !x.n; } badge.classList.toggle("red", x.mood === "urgent");
			btn.setAttribute("aria-label", "Needs your attention: " + (x.n ? x.n + " thing" + (x.n > 1 ? "s" : "") + " to do" : "nothing waiting") + ". Open the list");
			var prevMood = st.mood; st.mood = x.mood; if (!st.face && !st.sleeping) { setFace(null); }
			if (st.who !== x.who) { st.who = x.who; st.seen = ids; st.n = x.n; return; }  // another person: no reaction, just their state
			var fresh = x.act.filter(function (i, k) { return st.seen.indexOf(ids[k]) < 0; }), done = st.seen.filter(function (k) { return ids.indexOf(k) < 0; }).length;
			st.seen = ids; var was = st.n; st.n = x.n;
			if (fresh.length) { var red = fresh.filter(function (i) { return i.tone === "red"; })[0]; arrive(red || fresh[0], !!red); }
			else if (was && !x.n) { allClear(); }
			else if (done && x.n < was) { celebrate("Done. One less thing to do."); }
			else if (prevMood !== x.mood && x.mood === "urgent") { arrive(null, true); }
		}
		return { update: update, celebrate: celebrate };
	}
	return { create: create };
});
