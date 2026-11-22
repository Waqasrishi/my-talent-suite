// A small drawn person (face, hair, shirt) for a name: the same name always gets the same person. Used for every avatar in Goals (v91).
sap.ui.define([], function () {
	"use strict";
	var FACE={sk:['#F6D3B3','#E8B48E','#C98E64','#8D5A3B'],hr:['#2B2118','#4A3121','#161616','#7A4B2A','#8E8E8E'],sh:['#1D174E','#006EA6','#D69D10','#2E6B3F','#8A3B5C'],bg:['#FBF3DE','#D9EEF8','#EEEBFA','#E3F1E7','#FCE8E1']};
	function svg(nm){let h=7;for(const ch of String(nm))h=(h*31+ch.charCodeAt(0))>>>0;const pick=(a,sh)=>a[(h>>>sh)%a.length];
		 const sk=pick(FACE.sk,0),hr=pick(FACE.hr,3),sh=pick(FACE.sh,6),bg=pick(FACE.bg,9),st=(h>>>12)%5;
		 const back=st===2?`<path d="M11.5 18c-1-8 3-12.5 8.5-12.5s9.5 4.5 8.5 12.5v9.5c-1.2 1-2.6 1-3.6 0V18H15.1v9.5c-1 1-2.4 1-3.6 0z" fill="${hr}"/>`:'';
		 const top=[`<path d="M12.6 16.5c-.4-6.6 3-10 7.4-10s7.8 3.4 7.4 10c-1-3.2-3.6-4.6-7.4-4.6s-6.4 1.4-7.4 4.6z" fill="${hr}"/>`,
		  `<path d="M12.4 17c-.7-7.2 3.4-11 8-11 4.3 0 7.9 2.8 7.3 9.6-2.2-3.4-6.4-4.8-10.4-3.6-2.2.7-4 2.6-4.9 5z" fill="${hr}"/>`,
		  `<path d="M12.8 15.6c.2-5.6 3.3-9 7.2-9s7 3.4 7.2 9c-2.6-2.4-4.4-3.4-7.2-3.4s-4.6 1-7.2 3.4z" fill="${hr}"/>`,
		  `<g fill="${hr}"><circle cx="14.2" cy="12.6" r="3.2"/><circle cx="18" cy="9.4" r="3.4"/><circle cx="22.4" cy="9.4" r="3.4"/><circle cx="26" cy="12.8" r="3.2"/><circle cx="13.2" cy="16" r="2.2"/><circle cx="26.8" cy="16" r="2.2"/></g>`,
		  `<path d="M12.8 15.8c-.2-6 3.1-9.4 7.2-9.4s7.4 3.4 7.2 9.4c-1-2.8-3.4-4-7.2-4s-6.2 1.2-7.2 4z" fill="${hr}"/><path d="M13.2 18.4c.2 5.8 3 8.8 6.8 8.8s6.6-3 6.8-8.8c-1.2 2.6-3 3.6-6.8 3.6s-5.6-1-6.8-3.6z" fill="${hr}"/>`][st];
		 return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" fill="${bg}"/>${back}<path d="M5 41c1-8.4 7-12.6 15-12.6S34 32.6 35 41z" fill="${sh}"/><path d="M16.6 22h6.8v7.6c-1 1.4-5.8 1.4-6.8 0z" fill="${sk}" style="filter:brightness(.9)"/><ellipse cx="20" cy="18" rx="7.2" ry="8.2" fill="${sk}"/>${top}<circle cx="17.3" cy="18.4" r=".95" fill="#231C3A"/><circle cx="22.7" cy="18.4" r=".95" fill="#231C3A"/>${st===4?'':'<path d="M17.8 22.2c1.3 1 3.1 1 4.4 0" stroke="#7A3E2E" stroke-width=".9" fill="none" stroke-linecap="round"/>'}</svg>`}
	return { svg: svg };
});
