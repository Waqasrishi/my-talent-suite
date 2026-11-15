// Goals module (latest prototype, 15 Nov 2026): its screens and sample data, unchanged, as a module of this component.
// opts.nav opens the home page; opts.start is "new" when the home page asked for the new-goal wizard.
sap.ui.define([], function () {
	var started = false;
	function start(opts) {
		if (started) { return; }
		started = true;
		const ROOT=document.querySelector('.ajmng'),NAV=opts.nav,START=opts.start;
		// the page scrolls in the window on its own, and in the launchpad's content area inside it
		function scroller(){let n=ROOT.parentElement;while(n&&n!==document.body&&n!==document.documentElement){if(/(auto|scroll)/.test(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight)return n;n=n.parentElement}return null}
		function scrollYNow(){const s=scroller();return s?s.scrollTop:window.scrollY}
		function scrollToY(y,behavior){const s=scroller();if(s)s.scrollTo({top:y,behavior});else window.scrollTo({top:y,behavior})}
		const $=s=>ROOT.querySelector(s);
		const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
		let goals=[
		 {id:1,title:'Cut publishing delay on breaking stories',parent:'Faster digital delivery',status:'ok',statusText:'Approved',own:40,contribs:[{who:'Director, Video',goal:'Faster video publishing tools',p:45,status:'Linked'}],measure:'Median time from filing to publish under 6 minutes by Q2',due:'30 June 2027',pushed:[{who:'Manager, Web desk',p:25,d:'8 Nov 2026',n:'Template draft is ready.',due:'30 June 2027'},{who:'Manager, Mobile',p:10,d:'9 Nov 2026',n:'Kick-off held with the app team.',due:'30 June 2027'}],also:[]},
		 {id:2,title:'Launch the new video player on all apps',parent:'Faster digital delivery',status:'att',statusText:'Awaiting approval',own:15,contribs:[],measure:'Player live on web, iOS and Android',due:'30 September 2027',pushed:[],also:[]},
		 {id:3,title:'Grow weekly digital audience by 12%',parent:'Reach more Arabic-speaking audiences',status:'ok',statusText:'Approved',own:55,contribs:[],measure:'Weekly unique users up 12% on 2026',due:'31 December 2027',pushed:[],also:[]}
		];
		let view='list',wiz=null,step=1,idc=10,gid=null,gEdit=false,cAddOpen=false;
		const MGRS={mgr:'Manager, Web desk',mgr2:'Manager, Mobile',mgr3:'Manager, Audience'};
		const CONTRIB_OPTS=['Director, Video','Director, Web','Director, Social','Rana Haddad, ED News','Khalid Nasser, ED Arabic'];
		const teamAvg=g=>g.pushed&&g.pushed.length?Math.round(g.pushed.reduce((t,x)=>t+x.p,0)/g.pushed.length):null;
		const bar1=(label,p,cls,sub)=>`<div style="margin-top:10px"><div class="row" style="justify-content:space-between;font-size:14px;${cls?'':''}"><span>${label}</span><span>${p}%</span></div><div class="bar-track" role="img" aria-label="${esc(label)} ${p} percent"><div class="bar-fill ${cls||''}" style="width:${p}%"></div></div>${sub?`<div style="font-size:12px;color:var(--muted);margin-top:2px">${sub}</div>`:''}</div>`;
		function rollup(g,detail){let h='';(g.contribs||[]).filter(c=>c.status==='Linked').forEach(c=>{h+=bar1('Contributor: '+esc(c.who),c.p,'c',detail?'Their goal: '+esc(c.goal):'')});
		 const n=g.pushed?g.pushed.length:0;if(n){if(detail){g.pushed.forEach(x=>{h+=bar1('Team: '+esc(x.who),x.p,'t',esc(x.n||'')+' &middot; '+esc(x.d))});h+=`<div style="font-size:12px;color:var(--muted);margin-top:8px">Team average ${teamAvg(g)}%. How the owner, contributor and team figures combine into one overall number is not decided yet (D-44).</div>`}else h+=bar1('Team ('+n+' manager'+(n>1?'s':'')+', average)',teamAvg(g),'t','')}
		 return h}
		function contribCard(g){const cs=g.contribs||[],avail=CONTRIB_OPTS.filter(o=>!cs.some(c=>c.who===o));
		 return `<div class="card" style="margin-top:16px"><div class="row" style="justify-content:space-between"><h3 style="font-size:17px">Contributors</h3>${avail.length?'<button class="btn small" id="cAdd">'+(cAddOpen?'Close':'Add contributor')+'</button>':''}</div>
		 ${cAddOpen?`<div style="margin-top:10px"><label class="fl" for="cSel" style="margin-top:0">Who should contribute?</label><select id="cSel" style="width:100%">${avail.map(o=>`<option>${esc(o)}</option>`).join('')}</select><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn small primary" id="cOk">Invite</button></div></div>`:''}
		 ${cs.length?cs.map((c,i)=>`<div style="padding:10px 0;border-top:1px solid var(--line);margin-top:10px;font-size:14px"><div class="row" style="justify-content:space-between"><b>${esc(c.who)}</b><button class="link" data-cdel="${i}" aria-label="Remove ${esc(c.who)}">Remove</button></div>${c.status==='Linked'?`<div style="color:var(--muted)">Linked their goal: ${esc(c.goal)}</div><div class="bar-track" style="margin-top:6px"><div class="bar-fill c" style="width:${c.p}%"></div></div><div style="font-size:12px;color:var(--muted)">${c.p}% done</div>`:`<div style="color:var(--muted)">Invited. Waiting for them to link one of their own goals.</div><button class="link" data-csim="${i}" style="margin-top:4px">Demo only: pretend they linked a goal</button>`}</div>`).join(''):'<div style="font-size:14px;color:var(--muted);margin-top:8px">No contributors yet.</div>'}
		 <p style="font-size:12px;color:var(--muted);margin:12px 0 0">Contributors are other EDs or Directors who link their own goals to this one. Whether a link needs approval is not decided yet (D-44).</p></div>`}
		const TODAY=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
		const SEED={1:{desc:'Breaking stories wait too long between filing and publishing. This goal cuts that wait so our audience sees our reporting first.',start:'1 Jan 2027',target:'Under 6 minutes (median)',updates:[{d:'12 Nov 2026',n:'Fast-track template is live on the web desk.',p:40},{d:'29 Oct 2026',n:'Baseline measured at 11 minutes.',p:15}],approvals:[{who:'Omar Saleh, ED Digital',d:'5 Nov 2026',dec:'Approved',why:''}],audit:[{d:'12 Nov 2026',t:'Progress update: 40% · You, Director, Digital'},{d:'5 Nov 2026',t:'Approved · Omar Saleh, ED Digital'},{d:'3 Nov 2026',t:'Submitted for approval · You, Director, Digital'},{d:'1 Nov 2026',t:'Created · You, Director, Digital'}]},
		2:{desc:'One video player across web, iOS and Android, so viewers get the same experience everywhere.',start:'1 Feb 2027',target:'Live on all 3 platforms',updates:[{d:'10 Nov 2026',n:'Web version is in testing.',p:15}],approvals:[],audit:[{d:'8 Nov 2026',t:'Submitted for approval · You, Director, Digital'},{d:'6 Nov 2026',t:'Created · You, Director, Digital'}]},
		3:{desc:'Grow the number of people who use our digital products every week.',start:'1 Jan 2027',target:'+12% on the 2026 weekly average',updates:[{d:'9 Nov 2026',n:'Arabic app push notifications lifted weekly users.',p:55}],approvals:[{who:'Omar Saleh, ED Digital',d:'5 Nov 2026',dec:'Approved',why:''}],audit:[{d:'9 Nov 2026',t:'Progress update: 55% · You, Director, Digital'},{d:'5 Nov 2026',t:'Approved · Omar Saleh, ED Digital'},{d:'2 Nov 2026',t:'Created · You, Director, Digital'}]}};
		function ensure(g){const d=SEED[g.id]||{};if(g.desc===undefined)g.desc=d.desc||'';if(!g.start)g.start=d.start||TODAY;if(g.target===undefined)g.target=d.target||'';if(!g.updates)g.updates=d.updates||[];if(!g.approvals)g.approvals=d.approvals||[];if(!g.audit)g.audit=d.audit||[{d:TODAY,t:'Submitted for approval · You, Director, Digital'},{d:TODAY,t:'Created · You, Director, Digital'}];return g}
		const GOAL_IDEAS=[
		 ['Cut the time it takes to publish breaking stories','Links to the speed goal your ED set.'],
		 ['Raise the share of stories with video from 30% to 50%','Links to the video growth goal.'],
		 ['Reduce corrections on published stories','Links to the quality goal.']];
		const MEASURES=(t)=>{t=(t||'').toLowerCase();
		 if(t.includes('video'))return [['Videos on 50% of published stories by Q3','Measurable, dated, and matches the 30% to 50% change.'],['Video on 50% of stories in each month from June','Checks the level is kept, not reached once.'],['Raise video share by 20 points against the 2026 average','Shows progress against your own starting point.']];
		 if(t.includes('correction'))return [['Corrections cut by 30% against 2026 by Q3','Measurable and dated.'],['No more than 2 corrections per 1,000 stories each month','Sets a clear ceiling.'],['100% of corrections published within 24 hours','Focuses on the response, not the count.']];
		 return [['Median time from filing to publish under 6 minutes by Q2','Measurable, dated, and fits a goal about speed.'],['90% of stories live within 10 minutes of sign-off','Covers most stories, not only the typical one.'],['Cut the 2026 average by 40%','Shows progress against your own starting point.']]};
		const STRAT=['Lead in digital-first journalism','Earn audience trust','Grow audiences in every language'];
		const MGMT=[
		 {t:'Faster digital delivery',o:'Omar Saleh, ED Digital',s:STRAT[0],k:['publish','publishing','speed','delivery','faster','time','minutes','delay','breaking','player','apps','launch','live']},
		 {t:'Grow video and live storytelling',o:'Omar Saleh, ED Digital',s:STRAT[0],k:['video','live','stories','watch','story']},
		 {t:'One newsroom, every region',o:'Omar Saleh, ED Digital',s:STRAT[0],k:['region','regional','bureau','bureaus','newsroom','local','share']},
		 {t:'Accurate reporting, every time',o:'Rana Haddad, ED News',s:STRAT[1],k:['correction','corrections','accuracy','accurate','quality','trust','verify','errors']},
		 {t:'Reach more Arabic-speaking audiences',o:'Khalid Nasser, ED Arabic',s:STRAT[2],k:['arabic','audience','weekly','users','grow','reach','12%','unique']}];
		function rankMgmt(a){const words=((a.goal||'')+' '+(a.measure||'')).toLowerCase().match(/[a-z0-9%]+/g)||[];
		 return MGMT.map(m=>{const hit=[...new Set(words.filter(w=>m.k.includes(w)))];return {m,hit,score:hit.length}}).sort((x,y)=>y.score-x.score)}
		const strength=n=>n>=3?'Strong match':n>=1?'Possible match':'Weak match';
		const DATES=[['30 June 2027','End of Q2. Matches a 6-month measure.'],['30 September 2027','End of Q3.'],['31 December 2027','End of the goal year.']];
		const TEAMS=[['Manager, Web desk','2 staff. Runs the publishing desk this goal depends on.'],['Manager, Mobile','3 staff. Owns the apps.'],['Manager, Audience','2 staff. Little overlap with this goal so far.']];

		function crumb(t){$('#crumb').textContent=t}
		function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',3500)}
		const SP='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B3B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>';
		const aihead=t=>`<div class="aihead"><span class="aitag">${SP}Suggested for you</span><span>${t}</span></div>`;

		/* ---------- list ---------- */
		function bars(g){
		 let h=`<div style="margin-top:12px"><div class="row" style="justify-content:space-between;font-size:14px"><span>Owner: you</span><span>${g.own}%</span></div><div class="bar-track" role="img" aria-label="Owner progress ${g.own} percent"><div class="bar-fill" style="width:${g.own}%"></div></div></div>`;
		 h+=rollup(g,false);
		 return h}
		function chip(g){if(g.pending)return '<span class="chip att"><span aria-hidden="true">&#9201;</span>Change awaiting approval</span>';const i={ok:'&#10003;',att:'&#9201;',neu:'&#8226;'}[g.status];return `<span class="chip ${g.status}"><span aria-hidden="true">${i}</span>${esc(g.statusText)}</span>`}
		function tabs(){$('#tabDash').classList.toggle('on',view==='dash');$('#tabDash').setAttribute('aria-current',view==='dash'?'page':'false');$('#tabList').classList.toggle('on',view==='list'||view==='goal');$('#tabAlign').classList.toggle('on',view==='align');$('#tabList').setAttribute('aria-current',view==='list'?'page':'false');$('#tabAlign').setAttribute('aria-current',view==='align'?'page':'false')}
		function renderDash(){crumb('Dashboard');tabs();
		 const n=goals.length,ap=goals.filter(g=>g.statusText==='Approved').length,aw=goals.filter(g=>(/awaiting/i.test(g.statusText)||!!g.pending)).length,rt=goals.filter(g=>g.statusText==='Returned for changes').length,avg=Math.round(goals.reduce((t,g)=>t+g.own,0)/(n||1));
		 const T=[['Goals',n+' of 5',n>=3&&n<=5?'In range (3 to 5)':'Outside the 3 to 5 range'],['Approved',ap,'Live and tracked'],['Awaiting approval',aw,'With Omar Saleh'],['Returned',rt,'Needs your changes'],['Average progress',avg+'%','Across your goals']];
		 let h=`<h1 style="font-size:34px">Dashboard</h1><p class="sub">Where your goals stand today. Updates as you create, submit and approve goals in this demo.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px">${T.map(t=>`<div class="card" style="padding:14px 16px"><div style="font-size:13px;color:var(--muted)">${t[0]}</div><div style="font-family:Manrope,Inter,sans-serif;font-size:32px;font-weight:600;line-height:1.2">${t[1]}</div><div style="font-size:13px;color:var(--muted)">${t[2]}</div></div>`).join('')}</div>`;
		 h+=`<div class="card" style="margin-bottom:16px"><h2 style="font-size:22px;margin-bottom:4px">Progress by management goal</h2><p class="sub" style="margin:0 0 14px">Average owner progress of your goals under each management goal.</p>`;
		 const rows=MGMT.map(m=>{const gs=goals.filter(g=>g.parent===m.t);return {m,gs,p:gs.length?Math.round(gs.reduce((t,g)=>t+g.own,0)/gs.length):null}});
		 rows.forEach(r=>{h+=`<div style="margin:12px 0"><div class="row" style="justify-content:space-between;font-size:14px"><span><strong>${esc(r.m.t)}</strong> <span style="color:var(--muted)">&middot; ${esc(r.m.o)}</span></span><span>${r.p===null?'No goals yet':r.p+'% ('+r.gs.length+' goal'+(r.gs.length>1?'s':'')+')'}</span></div><div class="bar-track" role="img" aria-label="${esc(r.m.t)}: ${r.p===null?'no goals':r.p+' percent'}"><div class="bar-fill" style="width:${r.p||0}%"></div></div></div>`});
		 h+=`</div>`;
		 const att=goals.filter(g=>g.statusText!=='Approved'||g.pending);
		 h+=`<div class="card"><h2 style="font-size:22px;margin-bottom:10px">Needs attention</h2>${att.length?att.map(g=>`<div class="sumrow"><span class="v">${esc(g.title)}</span>${chip(g)}</div>`).join(''):'<div style="color:var(--muted)">Nothing needs attention.</div>'}</div>`;
		 $('#app').innerHTML=h}
		let alUp=0,alDown=0,alGoal=null,alFrom='list';
		const LV=['DG strategy','Executive Director','Director','Manager','Employee'],LVS=['DG','ED','Director','Manager','Employee'];
		function alNodes(){const N=[];
		 STRAT.forEach((t,i)=>N.push({id:'s'+i,lvl:0,t,who:'DG office',p:null}));
		 MGMT.forEach((m,i)=>N.push({id:'e'+i,lvl:1,t:m.t,who:m.o,p:'s'+STRAT.indexOf(m.s)}));
		 const eid=t=>'e'+MGMT.findIndex(m=>m.t===t);
		 goals.forEach(g=>N.push({id:'g'+g.id,lvl:2,t:g.title,who:'Director, Digital',p:eid(g.parent),also:(g.also||[]).map(eid),st:g.statusText}));
		 N.push({id:'dv',lvl:2,t:'Ship video player v2',who:'Director, Video',p:'e1',also:[]},{id:'dw',lvl:2,t:'Cut CMS publish time',who:'Director, Web',p:'e0',also:[]});
		 N.push({id:'m4',lvl:3,t:'Player live on iOS and Android',who:'Manager, Mobile',p:'g2',also:[]});N.push({id:'m1',lvl:3,t:'Fast-track publishing for breaking stories',who:'Manager, Web desk',p:'g1',also:[]},{id:'m2',lvl:3,t:'Embed video in all article templates',who:'Manager, Web desk',p:'g2',also:[]},{id:'m3',lvl:3,t:'Weekly audience report for every desk',who:'Manager, Audience',p:'g3',also:[]});
		 N.push({id:'p1',lvl:4,t:'Build the fast-track publishing template',who:'Sara Khan',p:'m1',also:[]},{id:'p2',lvl:4,t:'Cut editor approval steps from 4 to 2',who:'Ali Reza',p:'m1',also:[]},{id:'p3',lvl:4,t:'Add video embed to the article page',who:'Noor Hassan',p:'m2',also:[]},{id:'p4',lvl:4,t:'Build the weekly audience dashboard',who:'Lina Abbas',p:'m3',also:[]});
		 return N}
		function renderAlign(){crumb('Alignment');tabs();
		 const role=$('#role').value,F=alGoal?goals.find(x=>x.id===alGoal):null,ownLvl=F?2:(MGRS[role]?3:{ed:1,dir:2}[role]),N=alNodes(),by={};N.forEach(n=>by[n.id]=n);
		 const own=F?['g'+F.id]:N.filter(n=>role==='ed'?(n.lvl===1&&n.who.includes('Omar')):role==='dir'?(n.lvl===2&&n.id[0]==='g'):({mgr:['m1','m2'],mgr2:['m4'],mgr3:['m3']}[role]||[]).includes(n.id)).map(n=>n.id);
		 const inc=new Set(own);
		 const up=id=>{const n=by[id];[n.p,...(n.also||[])].filter(Boolean).forEach(p=>{if(!inc.has(p)){inc.add(p)}up(p)})};
		 own.forEach(up);
		 const down=id=>{N.filter(c=>c.p===id).forEach(c=>{inc.add(c.id);down(c.id)})};own.forEach(down);
		 const defLo=Math.max(0,ownLvl-1),defHi=Math.min(4,ownLvl+1);let lo=Math.max(0,defLo-alUp),hi=Math.min(4,defHi+alDown);
		 if(F){lo=0;hi=Math.max(...N.filter(n=>inc.has(n.id)).map(n=>n.lvl))}
		 const vis=N.filter(n=>inc.has(n.id)&&n.lvl>=lo&&n.lvl<=hi),vs=new Set(vis.map(n=>n.id));
		 const PITCH=204,NW=188,NH=82,GG=20,RG=62,ry=l=>(l-lo)*(NH+RG),pos={};let cur=0;
		 const kids=id=>vis.filter(c=>c.p===id);
		 const place=n=>{const k=kids(n.id);if(!k.length){pos[n.id]=cur+NW/2;cur+=PITCH}else{k.forEach(place);pos[n.id]=(pos[k[0].id]+pos[k[k.length-1].id])/2}};
		 vis.filter(n=>!n.p||!vs.has(n.p)).forEach(r=>{place(r);cur+=GG});
		 const W=Math.max(cur,NW+10),H=(hi-lo+1)*NH+(hi-lo)*RG+2;
		 const curve=(x1,y1,x2,y2,dash,col)=>{const my=(y1+y2)/2;return `<path d="M${x1} ${y1} C${x1} ${my},${x2} ${my},${x2} ${y2}" fill="none" stroke="${col}" stroke-width="2.5" ${dash?'stroke-dasharray="6 6"':''} />`};
		 let svg='',nodes='';
		 vis.forEach(n=>{if(n.p&&vs.has(n.p))svg+=curve(pos[n.p],ry(by[n.p].lvl)+NH,pos[n.id],ry(n.lvl),false,n.lvl===2?'#D89E11':'#B9BDD6');
		  (n.also||[]).forEach(p=>{if(vs.has(p))svg+=curve(pos[p],ry(by[p].lvl)+NH,pos[n.id],ry(n.lvl),true,'#212D66')})});
		 vis.forEach(n=>{const mine=own.includes(n.id),cls=n.lvl===0?'s':mine?'g':'m';
		  nodes+=`<div class="an ${cls}" style="left:${pos[n.id]-NW/2}px;top:${ry(n.lvl)}px;width:${NW}px;height:${NH}px"><b>${esc(n.t)}</b><small>${esc(n.who)}${n.st?' &middot; '+esc(n.st):''}</small></div>`});
		 const cap=[];for(let l=lo;l<=hi;l++)cap.push(`<div style="position:absolute;left:0;top:${ry(l)}px;width:38px;height:${NH}px;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden;background:${l===ownLvl?'var(--tint)':'var(--warm)'}"><span style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px;line-height:1.3;text-align:center;font-weight:800;color:${l===ownLvl?'#5F4300':'var(--muted)'};text-transform:uppercase;letter-spacing:.05em;white-space:nowrap">${LVS[l]}${l===ownLvl?'<br>'+(F?'this goal':'you'):''}</span></div>`);
		 const tb=(id,t,pri)=>`<button class="btn small" id="${id}" style="min-height:40px">${t}</button>`;
		 const topBtns=F?'':(lo>0?tb('alUp','+ Show '+LV[lo-1]+' goals above'):'')+(alUp>0?tb('alUpHide','&minus; Hide '+LV[lo]+' level'):'');
		 const botBtns=F?'':(hi<4?tb('alDown','+ Show '+LV[hi+1]+' goals below'):'')+(alDown>0?tb('alDownHide','&minus; Hide '+LV[hi]+' level'):'');
		 $('#app').innerHTML=F?`<h1>${esc(F.title)}</h1><p class="sub"><button class="link" id="alBack">&lsaquo; ${alFrom==='goal'?'Back to the goal':'My goals'}</button> &nbsp; Alignment of this goal only: what it supports above it and what is built on it below, from the DG strategy down to the employee.</p>`:`<h1>Alignment</h1><p class="sub">Your place in the cascade, one level up and one level down. Use the + buttons to open more levels, from the DG strategy down to the employee.</p>`;
		 $('#app').insertAdjacentHTML('beforeend',`
		 <div class="row" style="justify-content:center;margin-bottom:12px;min-height:0">${topBtns}</div>
		 <div style="overflow-x:auto;padding-bottom:6px"><div style="position:relative;width:${W+50}px;height:${H}px;margin:0 auto">${cap.join('')}<div style="position:absolute;left:50px;top:0;width:${W}px;height:${H}px"><svg width="${W}" height="${H}" style="position:absolute;left:0;top:0" aria-hidden="true">${svg}</svg>${nodes}</div></div></div>
		 <div class="row" style="justify-content:center;margin-top:12px">${botBtns}</div>
		 <div class="row" style="gap:22px;justify-content:center;font-size:13px;color:var(--muted);margin-top:14px"><span><svg width="34" height="8" aria-hidden="true"><line x1="0" y1="4" x2="34" y2="4" stroke="#D89E11" stroke-width="3"/></svg> Main link</span><span><svg width="34" height="8" aria-hidden="true"><line x1="0" y1="4" x2="34" y2="4" stroke="#212D66" stroke-width="3" stroke-dasharray="6 5"/></svg> Also supports</span><span><span style="display:inline-block;width:14px;height:14px;background:#FBF0D2;border:2px solid #212D66;border-radius:4px;vertical-align:-2px"></span> ${F?'This goal':'Your goals'}</span></div>${F?'<div class="row" style="justify-content:center;margin-top:16px"><button class="btn small" id="alAll">Show the full alignment chart</button></div>':''}`);
		 const bind=(id,f)=>{const e=$('#'+id);if(e)e.onclick=()=>{f();renderAlign()}};
		 const ab=$('#alBack');if(ab)ab.onclick=()=>{alGoal=null;view=alFrom==='goal'?'goal':'list';renderList()};const aa=$('#alAll');if(aa)aa.onclick=()=>{alGoal=null;renderAlign()};
		 bind('alUp',()=>alUp++);bind('alUpHide',()=>alUp--);bind('alDown',()=>alDown++);bind('alDownHide',()=>alDown--)}
		function renderApprovals(){crumb('Approvals');tabs();
		 const P=goals.filter(g=>(/awaiting/i.test(g.statusText)||!!g.pending));
		 let h=`<h1 style="font-size:34px">Approvals</h1><p class="sub">${P.length?P.length+' goal'+(P.length>1?'s':'')+' waiting for your decision.':'Nothing is waiting for you.'}</p>`;
		 if(!P.length)h+='<div class="empty">All caught up. Submit a goal as the Director to see it arrive here.</div>';
		 P.forEach(g=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><h3 style="font-size:20px;flex:1;min-width:240px">${esc(g.title)}</h3>${chip(g)}</div><div style="color:var(--muted);font-size:14px;margin-top:4px">${g.pending?'<strong>Change request</strong> from ':'From '}Director, Digital &middot; Supports: ${esc(g.parent)} &middot; Due ${esc(g.due)}</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary small" data-appr="${g.id}">Review</button></div></div>`});
		 $('#app').innerHTML=h;ROOT.querySelectorAll('[data-appr]').forEach(b=>b.onclick=()=>{wiz={kind:'approve',gid:+b.dataset.appr,a:{}};step=1;view='wiz';renderApprove()})}
		function aiChecks(g){return [[/\d/.test(g.measure),'Measurable: the measure has a number','Not measurable: the measure has no number'],[!!g.due,'Has a due date','No due date'],[!!g.parent,'Aligned to '+g.parent,'Not aligned to a management goal'],[g.own<=100,'Owner has room within 3 to 5 goals','Owner would have more than 5 goals']]}
		function renderApprove(){
		 const g=goals.find(x=>x.id===wiz.gid),a=wiz.a,N=['Goal','Decision','Review'];crumb('Approve or return');
		 $('#tabList').classList.remove('on');$('#tabAlign').classList.remove('on');
		 const pv=g.pending?Object.assign({},g,g.pending.nw):g;const C=aiChecks(pv),fails=C.filter(c=>!c[0]);let q,sub,body='',valid=true,primary='Continue';
		 const card=`<div class="card" style="margin-bottom:18px;padding:6px 20px"><div class="sumrow"><span class="k">Goal</span><span class="v">${esc(pv.title)}</span><span></span></div><div class="sumrow"><span class="k">Measure</span><span class="v">${esc(pv.measure)}</span><span></span></div><div class="sumrow"><span class="k">Supports</span><span class="v">${esc(pv.parent)}</span><span></span></div><div class="sumrow"><span class="k">Due date</span><span class="v">${esc(pv.due)}</span><span></span></div><div class="sumrow"><span class="k">From</span><span class="v">Director, Digital</span><span></span></div></div>`;
		 if(step===1){q=g.pending?'Is this change ready to approve?':'Is this goal ready to approve?';sub='Read the goal and the AI check, then decide on the next page.';
		  body=(g.pending?diffHtml(g):'')+card+`<div class="card" style="background:var(--warm)">${aihead('A quick check of the goal.')}<ul class="checks">${C.map(c=>`<li><span class="mark ${c[0]?'ok':'warn'}" aria-hidden="true">${c[0]?'&#10003;':'!'}</span><span>${c[0]?c[1]:c[2]}<span style="position:absolute;left:-9999px">${c[0]?' (passed)':' (needs attention)'}</span></span></li>`).join('')}</ul></div>`;}
		 if(step===2){q='What is your decision?';sub='You can change your mind on the review page.';
		  const D=[['Approve','The goal goes live and the Director can start tracking it.'],['Return for changes','The goal goes back to the Director with your comment.']];
		  body=optHtml('dec','radio',D,t=>a.dec===t,fails.length?[1]:[0]);
		  if(a.dec==='Return for changes'){const sug=fails.length?fails.map(f=>[f[2]+'. Please fix and resubmit.','Based on the check.']):[['Please make the measure more specific and resubmit.','General suggestion.'],['Please explain how this supports the management goal.','General suggestion.']];
		   const own=a.comment&&!sug.some(x=>x[0]===a.comment);
		   body+=`<h2 style="font-size:20px;margin:18px 0 10px">What should the Director change?</h2>`+aihead('Drafted from the check. You decide.')+optHtml('cmt','radio',sug,t=>a.comment===t,[0])+ownOpt('cmt','Write your comment',a.comment||'',own);}
		  valid=!!a.dec&&(a.dec==='Approve'||!!a.comment);}
		 if(step===3){q=a.dec==='Approve'?'Approve this goal?':'Return this goal?';sub='Check your decision before you confirm.';primary=a.dec==='Approve'?'Approve goal':'Return goal';
		  body=card+`<div class="card" style="padding:6px 20px"><div class="sumrow"><span class="k">Decision</span><span class="v">${esc(a.dec)}</span><button class="link" data-goto="2" aria-label="Change decision">Change</button></div>${a.dec!=='Approve'?`<div class="sumrow"><span class="k">Comment</span><span class="v">${esc(a.comment)}</span><button class="link" data-goto="2" aria-label="Change comment">Change</button></div>`:''}</div>`;}
		 $('#app').innerHTML=`<div style="max-width:720px;margin:0 auto"><div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn small" id="exit">Save and exit</button></div>${stepper(N)}<div style="font-size:13px;font-weight:600;color:var(--muted)">Step ${step} of 3</div><h1 style="font-size:34px;line-height:1.25;margin:4px 0 6px" id="q" tabindex="-1">${q}</h1><p class="sub">${sub}</p>${body}<div class="foot"><button class="btn" id="back">${step===1?'Cancel':'Back'}</button><button class="btn primary" id="next" ${valid?'':'disabled'}>${primary}</button></div><p class="note">Suggestions come from the AI and are only suggestions. Nothing changes until you confirm.</p></div>`;
		 ROOT.querySelectorAll('.opt input[data-v]').forEach(i=>i.onchange=()=>{const k=i.name==='dec'?'dec':'comment';a[k]=i.dataset.v;if(k==='dec')a.comment=null;renderApprove();const el=ROOT.querySelector(`[name="${i.name}"][data-v="${CSS.escape(i.dataset.v)}"]`);if(el)el.focus()});
		 ROOT.querySelectorAll('input[id^=own-]').forEach(t=>{const f=()=>{const r=t.closest('.opt').querySelector('input[type=radio]');r.checked=true;a.comment=t.value.trim()||null;$('#next').disabled=!a.comment};t.oninput=f;t.onfocus=()=>{if(!t.closest('.opt').querySelector('input[type=radio]').checked)f()}});
		 ROOT.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{step=+b.dataset.goto;renderApprove()});
		 $('#exit').onclick=()=>{view='list';wiz=null;renderList();toast('Nothing changed.')};
		 $('#back').onclick=()=>{if(step===1){view='list';wiz=null;renderList()}else{step--;renderApprove()}};
		 $('#next').onclick=()=>{if($('#next').disabled)return;if(step<3){step++;renderApprove();return}
		  if(a.dec==='Approve'){ensure(g);if(g.pending){Object.assign(g,g.pending.nw);g.also=g.pending.al;g.pending=null}g.status='ok';g.statusText='Approved';g.note=null;g.approvals.unshift({who:'Omar Saleh, ED Digital',d:TODAY,dec:'Approved',why:''});g.audit.unshift({d:TODAY,t:'Approved · Omar Saleh, ED Digital'});toast('Approved. The Director has been notified.')}else{ensure(g);if(g.pending){g.pending=null}else{g.status='att';g.statusText='Returned for changes'}g.note=a.comment;g.approvals.unshift({who:'Omar Saleh, ED Digital',d:TODAY,dec:'Returned for changes',why:a.comment});g.audit.unshift({d:TODAY,t:'Returned for changes · Omar Saleh, ED Digital'});toast('Returned to the Director with your comment.')}
		  view='list';wiz=null;renderList()};
		 wizScroll();$('#q').focus({preventScroll:true})}
		function diffRows(g){const p=g.pending.nw,L={title:'Title',desc:'Description',measure:'Measure',target:'Target',start:'Start date',due:'Due date',parent:'Main link'};const r=Object.keys(p).filter(k=>p[k]!==g[k]).map(k=>[L[k],g[k],p[k]]);if(JSON.stringify(g.pending.al)!==JSON.stringify(g.also||[]))r.push(['Also supports',(g.also||[]).join(', ')||'None',g.pending.al.join(', ')||'None']);return r}
		function diffHtml(g){return `<div class="card" style="background:var(--attbg);border-color:#E3C66B;margin-bottom:16px"><h3 style="font-size:17px;margin-bottom:8px">Requested change</h3>${diffRows(g).map(r=>`<div style="font-size:14px;margin-bottom:8px"><b>${r[0]}</b><div style="color:var(--muted);text-decoration:line-through">${esc(r[1]||'Not set')}</div><div>${esc(r[2]||'Not set')}</div></div>`).join('')}</div>`}
		function renderGoal(){
		 const g=ensure(goals.find(x=>x.id===gid)||{});if(!g.id){view='list';renderList();return}
		 crumb('Goal');tabs();const locked=g.statusText==='Approved',pend=(/awaiting/i.test(g.statusText)||!!g.pending),mpar=MGMT.find(m=>m.t===g.parent)||{};
 
		 const field=(l,v,pt)=>`<span class="fl">${l}${pt?'<span class="pt">Proposed field</span>':''}</span><div class="fv">${v||'<span style="color:var(--muted)">Not set</span>'}</div>`;
		 let main='';
		 const inlineEdit=!locked&&!g.pending;if(inlineEdit||gEdit){const dates=[...new Set([...DATES.map(x=>x[0]),g.due])];
		  const opt=(arr,v,none)=>(none?'<option value="">None</option>':'')+arr.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
		  const also=g.also||[],ps=MGMT.map(m=>m.t);
		  main=`<div class="card"><h2 style="font-size:20px">Edit goal</h2>${!locked?'<p style="color:var(--muted);margin:6px 0 0;font-size:14px">This goal is not approved yet, so every field can be edited.</p>':''}${locked?'<div class="card" style="background:var(--attbg);border-color:#E3C66B;margin-top:10px;padding:10px 14px;font-size:14px"><strong>This goal is approved.</strong> Your changes do not apply until Omar Saleh approves them again.</div>':''}
		  <label class="fl" for="f_title">Goal title</label><input type="text" id="f_title" value="${esc(g.title)}">
		  <label class="fl" for="f_desc">Description <span class="pt">Proposed field</span></label><textarea id="f_desc" rows="3">${esc(g.desc)}</textarea>
		  <label class="fl" for="f_measure">How you will know it is done (measure)</label><textarea id="f_measure" rows="2">${esc(g.measure)}</textarea>
		  <div class="g2" style="gap:14px;margin-top:0"><div><label class="fl" for="f_target">Target <span class="pt">Proposed field</span></label><input type="text" id="f_target" value="${esc(g.target)}"></div><div><label class="fl" for="f_start">Start date <span class="pt">Proposed field</span></label><input type="text" id="f_start" value="${esc(g.start)}"></div></div>
		  <label class="fl" for="f_due">Due date</label><select id="f_due" style="width:100%">${opt(dates,g.due)}</select>
		  <label class="fl" for="f_parent">Supports (main link)</label><select id="f_parent" style="width:100%">${opt(ps,g.parent)}</select>
		  <div class="g2" style="gap:14px;margin-top:0"><div><label class="fl" for="f_a1">Also supports (optional)</label><select id="f_a1" style="width:100%">${opt(ps.filter(x=>x!==g.parent),also[0]||'',true)}</select></div><div><label class="fl" for="f_a2">Also supports (optional)</label><select id="f_a2" style="width:100%">${opt(ps.filter(x=>x!==g.parent),also[1]||'',true)}</select></div></div>
		  <div class="row" style="justify-content:flex-end;margin-top:20px;gap:10px"><button class="btn" id="gCancel">${locked?'Cancel':'Discard changes'}</button><button class="btn primary" id="gSave">${locked?'Submit change for approval':(g.statusText==='Returned for changes'?'Save and resubmit for approval':'Save changes')}</button></div></div>`;}
		 else{main=`<div class="card"><div class="row" style="justify-content:space-between"><h2 style="font-size:20px">Details</h2></div>${field('Description',esc(g.desc),1)}${field('How you will know it is done',esc(g.measure))}<div class="g2" style="gap:14px"><div>${field('Target',esc(g.target),1)}</div><div>${field('Start date',esc(g.start),1)}</div></div>${field('Due date',esc(g.due))}${field('Supports',esc(g.parent)+((g.also&&g.also.length)?'<div style="font-size:14px;color:var(--muted);margin-top:2px">Also supports: '+g.also.map(esc).join(', ')+'</div>':''))}</div>`;}
		 main+=`<div class="card" style="margin-top:16px"><h2 style="font-size:20px;margin-bottom:6px">Progress</h2><div class="row" style="justify-content:space-between;font-size:14px"><span>Owner: you</span><span>${g.own}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${g.own}%"></div></div>${rollup(g,true)}
		  <h3 style="font-size:16px;margin:20px 0 4px">Add a status update</h3><div class="g2" style="gap:12px"><div><label class="fl" for="u_p">Progress (%)</label><input type="text" id="u_p" inputmode="numeric" value="${g.own}"></div><div style="grid-column:span 1"><label class="fl" for="u_n">What changed?</label><input type="text" id="u_n" placeholder="One line on what moved"></div></div><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn small primary" id="uSave">Save update</button></div>
		  <ul class="tl" style="margin-top:14px">${g.updates.length?g.updates.map(u=>`<li><b>${u.p}%</b> &middot; ${esc(u.n)}<small>${esc(u.d)}</small></li>`).join(''):'<li style="color:var(--muted)">No updates yet.</li>'}</ul></div>`;
		 const C=aiChecks(g);
		 if(g.pending)main=diffHtml(g)+main;
		 const side=`<div class="card"><h3 style="font-size:17px;margin-bottom:8px">Approval</h3>${g.approvals.length?g.approvals.map(a=>`<div style="font-size:14px;margin-bottom:8px"><b>${esc(a.dec)}</b><div style="color:var(--muted)">${esc(a.who)} &middot; ${esc(a.d)}</div>${a.why?`<div>${esc(a.why)}</div>`:''}</div>`).join(''):'<div style="font-size:14px;color:var(--muted)">Waiting for Omar Saleh, ED Digital.</div>'}</div>
		 <div class="card" style="margin-top:16px"><h3 style="font-size:17px;margin-bottom:8px">Where it sits</h3><div style="display:flex;flex-direction:column;gap:6px;font-size:13px"><span class="node">${esc(mpar.s||'')}</span><span class="node">${esc(g.parent)} <span style="color:var(--muted)">(${esc(mpar.o||'')})</span></span><span class="node you">This goal</span></div></div>
		 ${contribCard(g)}
		 <div class="card" style="margin-top:16px;background:var(--warm)">${aihead('Quick check of this goal.')}<ul class="checks">${C.map(c=>`<li><span class="mark ${c[0]?'ok':'warn'}" aria-hidden="true">${c[0]?'&#10003;':'!'}</span><span>${c[0]?c[1]:c[2]}</span></li>`).join('')}</ul></div>
		 <div class="card" style="margin-top:16px"><h3 style="font-size:17px;margin-bottom:8px">Activity</h3><ul class="tl">${g.audit.map(a=>`<li>${esc(a.t)}<small>${esc(a.d)}</small></li>`).join('')}</ul></div>`;
		 $('#app').innerHTML=`<div class="row" style="justify-content:space-between;align-items:flex-start;gap:12px"><h1>${esc(g.title)}</h1><span class="row" style="gap:8px"><button class="btn" id="gAlign">Alignment</button><button class="btn" id="gPush">Push down</button>${(inlineEdit||gEdit)?'':(g.pending?'<button class="btn" id="gWithdraw">Withdraw change request</button>':'<button class="btn primary" id="gEdit">Request a change</button>')}</span></div><p class="sub"><button class="link" id="gBack">&lsaquo; My goals</button> &nbsp; ${chip(g)} &nbsp; ${g.pending?'Change waiting for approval':(locked?'Locked since 5 Nov 2026':(pend?'Waiting for approval':''))}</p>
		 <div class="facts"><div class="fact"><span>Owner</span><b>You, Director, Digital</b></div><div class="fact"><span>Approver</span><b>Omar Saleh, ED Digital</b></div><div class="fact"><span>Due</span><b>${esc(g.due)}</b></div><div class="fact"><span>Progress</span><b>${g.own}%</b></div><div class="fact"><span>Team progress</span><b>${teamAvg(g)==null?'Not pushed down':teamAvg(g)+'% average'}</b></div><div class="fact"><span>Contributors</span><b>${(g.contribs||[]).length}</b></div></div>
		 <div class="g2"><div>${main}</div><div>${side}</div></div>`;
		 const bk=$('#gBack');bk.onclick=()=>{view='list';gEdit=false;cAddOpen=false;renderList()};
		 const ed=$('#gEdit');if(ed)ed.onclick=()=>{gEdit=true;renderGoal()};
		 const cn=$('#gCancel');if(cn)cn.onclick=()=>{gEdit=false;renderGoal()};
		 const sv=$('#gSave');if(sv)sv.onclick=()=>{const v=id=>$('#'+id).value.trim();if(!v('f_title')||!v('f_measure')){toast('Add a title and a measure first.');return}
		  const nw={title:v('f_title'),desc:v('f_desc'),measure:v('f_measure'),target:v('f_target'),start:v('f_start'),due:$('#f_due').value,parent:$('#f_parent').value},al=[$('#f_a1').value,$('#f_a2').value].filter(Boolean);
		  const ch=Object.keys(nw).filter(k=>nw[k]!==g[k]);if(JSON.stringify(al)!==JSON.stringify(g.also||[]))ch.push('links');
		  if(!ch.length){gEdit=false;renderGoal();toast('No changes to save.');return}
		  if(locked){g.pending={nw,al,d:TODAY};g.note=null;g.audit.unshift({d:TODAY,t:'Change requested ('+ch.join(', ')+') · You, Director, Digital'});toast('Change sent to Omar Saleh for approval.')}
		  else{const re=g.statusText==='Returned for changes';Object.assign(g,nw);g.also=al;g.audit.unshift({d:TODAY,t:'Edited '+ch.join(', ')+(re?' and resubmitted for approval':'')+' · You, Director, Digital'});if(re){g.status='att';g.statusText='Awaiting approval';g.note=null;toast('Saved and resubmitted to Omar Saleh.')}else toast('Saved.')}
		  gEdit=false;renderGoal()};
		 const ga=$('#gAlign');if(ga)ga.onclick=()=>{alGoal=g.id;alFrom='goal';view='align';renderList()};
		 const gp=$('#gPush');if(gp)gp.onclick=()=>startWiz('push',g.id);
		 const rr=()=>renderGoal();
		 const ca=$('#cAdd');if(ca)ca.onclick=()=>{cAddOpen=!cAddOpen;rr()};
		 const co=$('#cOk');if(co)co.onclick=()=>{const w=$('#cSel').value;g.contribs.push({who:w,goal:null,p:null,status:'Invited'});g.audit.unshift({d:TODAY,t:'Invited '+w+' to contribute · You, Director, Digital'});cAddOpen=false;toast('Invited '+w+'. They link one of their own goals to yours.');rr()};
		 ROOT.querySelectorAll('[data-cdel]').forEach(b=>b.onclick=()=>{const c=g.contribs.splice(+b.dataset.cdel,1)[0];g.audit.unshift({d:TODAY,t:'Removed contributor '+c.who+' · You, Director, Digital'});toast('Removed '+c.who+'.');rr()});
		 ROOT.querySelectorAll('[data-csim]').forEach(b=>b.onclick=()=>{const c=g.contribs[+b.dataset.csim];c.status='Linked';c.goal='A goal of their own, linked to this one';c.p=10;g.audit.unshift({d:TODAY,t:c.who+' linked a goal · '+c.who});toast(c.who+' linked a goal.');rr()});
		 const wd=$('#gWithdraw');if(wd)wd.onclick=()=>{g.pending=null;g.audit.unshift({d:TODAY,t:'Change request withdrawn · You, Director, Digital'});toast('Change request withdrawn.');renderGoal()};
		 const us=$('#uSave');if(us)us.onclick=()=>{const p=parseInt($('#u_p').value,10),n=$('#u_n').value.trim();if(isNaN(p)||p<0||p>100){toast('Progress must be a number from 0 to 100.');return}if(!n){toast('Add one line on what changed.');return}
		  g.own=p;g.updates.unshift({d:TODAY,n,p});g.audit.unshift({d:TODAY,t:'Progress update: '+p+'% · You, Director, Digital'});toast('Update saved.');renderGoal()};
		}
		function renderList(){
		 if(view==='goal'){renderGoal();return}
		 if(view==='dash'){renderDash();return}
		 if($('#role').value==='ed'&&view!=='align'){renderApprovals();return}
		 if(view==='align'){renderAlign();return}
		 crumb('My goals');tabs();
		 const role=$('#role').value,mname=MGRS[role],mgr=!!mname;
		 let h=`<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">My goals</h1>${mgr?'':'<button class="btn primary" id="newGoal">New goal</button>'}</div>
		 <p class="sub">${mgr?'You are viewing as '+mname+'. Goals pushed down to you appear on your plan. Update your progress and it shows on the Director\'s goal.':'Goal year 2027. You have '+goals.length+' goals. The target is 3 to 5.'}</p>`;
		 h+=`<div class="strip" aria-label="Your place in the cascade"><span class="node">Strategy</span><span class="arrow">&rarr;</span><span class="node">ED Digital</span><span class="arrow">&rarr;</span><span class="node you">${mgr?'Director, Digital':'Director, Digital (you)'}</span><span class="arrow">&rarr;</span><span class="node ${mgr?'you':''}">Managers${mgr?' (you)':''}</span></div>`;
		 if(mgr){
		  const got=goals.flatMap(g=>g.pushed.filter(x=>x.who===mname).map(x=>({g,x})));
		  if(!got.length)h+=`<div class="empty">Nothing has been pushed down to you yet.<br>Switch to the Director and push a goal down to ${esc(mname)}.</div>`;
		  got.forEach(({g,x})=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><h3 style="font-size:20px;flex:1;min-width:240px">${esc(g.title)}</h3><span class="chip ok"><span aria-hidden="true">&#10003;</span>On your plan</span></div><div style="color:var(--muted);font-size:14px;margin-top:4px">From Director, Digital &middot; Due ${esc(x.due||g.due)}</div>${bar1('Your progress',x.p,'','Last update: '+esc(x.n||'None')+' &middot; '+esc(x.d))}
		   <div class="g2" style="gap:12px;margin-top:12px"><div><label class="fl" for="rp_${g.id}" style="margin-top:0">Progress (%)</label><input type="text" id="rp_${g.id}" inputmode="numeric" value="${x.p}"></div><div><label class="fl" for="rn_${g.id}" style="margin-top:0">What changed?</label><input type="text" id="rn_${g.id}" placeholder="One line"></div></div><div class="row" style="justify-content:flex-end;margin-top:10px;gap:8px"><button class="btn small" data-align="${g.id}">Alignment</button><button class="btn small primary" data-rup="${g.id}">Save progress</button></div></div>`});
		 }else{
		  goals.forEach(g=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><h3 style="font-size:20px;flex:1;min-width:240px">${esc(g.title)}</h3>${chip(g)}</div>
		  ${g.note?`<div class="card" style="background:var(--attbg);border-color:#D9A93B;margin-top:10px;padding:10px 14px;font-size:14px"><strong>Returned by Omar Saleh:</strong> ${esc(g.note)}</div>`:''}<div style="color:var(--muted);font-size:14px;margin-top:4px">Supports: ${esc(g.parent)}${g.also&&g.also.length?' (+'+g.also.length+' more)':''} &middot; Due ${esc(g.due)}</div>${bars(g)}
		  <div class="row" style="justify-content:space-between;margin-top:14px"><span style="font-size:14px;color:var(--muted)">${g.pushed.length?'Pushed down to '+g.pushed.length+' manager'+(g.pushed.length>1?'s':'')+': '+esc(g.pushed.map(x=>x.who).join(', ')):''}</span><span class="row" style="gap:8px"><button class="btn small" data-align="${g.id}">Alignment</button><button class="btn small" data-open="${g.id}">Open</button><button class="btn small" data-push="${g.id}">Push down</button></span></div></div>`});
		 }
		 $('#app').innerHTML=h;
		 const n=$('#newGoal');if(n)n.onclick=()=>startWiz('new');
		 ROOT.querySelectorAll('[data-align]').forEach(b=>b.onclick=()=>{alGoal=+b.dataset.align;alFrom='list';view='align';renderList()});
		 ROOT.querySelectorAll('[data-push]').forEach(b=>b.onclick=()=>startWiz('push',+b.dataset.push));
		 ROOT.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{gid=+b.dataset.open;gEdit=false;cAddOpen=false;view='goal';renderList()});
		 ROOT.querySelectorAll('[data-rup]').forEach(b=>b.onclick=()=>{const g=goals.find(x=>x.id===+b.dataset.rup),rec=g.pushed.find(x=>x.who===mname),p=parseInt($('#rp_'+g.id).value,10),n=$('#rn_'+g.id).value.trim();if(isNaN(p)||p<0||p>100){toast('Progress must be a number from 0 to 100.');return}rec.p=p;rec.d=TODAY;if(n)rec.n=n;ensure(g);g.audit.unshift({d:TODAY,t:mname+' updated progress to '+p+'%'+(n?': '+n:'')});toast('Saved. The Director sees '+p+'% on their goal.');renderList()});
		}

		/* ---------- wizard engine ---------- */
		const NEW_STEPS=['Goal','Measure','Parent','Due date','Review'];
		const PUSH_STEPS=['Goal','Who','Wording','Date','Review'];
		function startWiz(kind,gid){wiz={kind,a:{also:[]},gid};step=1;view='wiz';if(kind==='push'){const g=goals.find(x=>x.id===gid);wiz.a.goal=g.title;wiz.a.due=g.due;step=2;wiz.a.who=[];}renderWiz()}
		function stepper(names){return `<nav aria-label="Progress"><ol class="stepper">${names.map((n,i)=>{const k=i+1,c=k<step?'done':k===step?'cur':'';const dot=k<step?'&#10003;':k;const lab=`Step ${k}: ${n}${k<step?' (done)':k===step?' (current)':''}`;return `<li class="${c}" aria-label="${lab}"><span class="dot">${dot}</span><span>${n}</span></li>${k<names.length?'<li class="line" aria-hidden="true"></li>':''}`}).join('')}</ol></nav>`}
		function optHtml(name,type,items,selFn,recIdx){return items.map((it,i)=>{const sel=selFn(it[0]);return `<label class="opt ${sel?'sel':''}"><input type="${type}" name="${name}" data-v="${esc(it[0])}" ${sel?'checked':''}><span><span class="t">${esc(it[0])}${recIdx.includes(i)?'<span class="rec">Recommended</span>':''}</span><span class="r" style="display:block">${esc(it[1])}</span></span></label>`}).join('')}
		function ownOpt(key,ph,val,isOwn){return `<div class="opt ${isOwn?'sel':''}" style="display:block"><label style="display:flex;gap:14px;align-items:center;cursor:pointer"><input type="radio" name="${key}" data-own="1" ${isOwn?'checked':''}><span class="t">Write my own</span></label><input type="text" id="own-${key}" placeholder="${ph}" value="${isOwn?esc(val):''}" aria-label="Your own answer"></div>`}
		function ctxBar(){return wiz.a.goal?`<div class="card" style="background:var(--warm);margin-bottom:22px;padding:12px 16px"><div style="font-size:13px;color:var(--muted)">Your goal</div><div style="font-family:Manrope,Inter,sans-serif;font-size:18px;font-weight:600">${esc(wiz.a.goal)}</div></div>`:''}
		function renderWiz(){
		 const push=wiz.kind==='push',names=push?PUSH_STEPS:NEW_STEPS,a=wiz.a;
		 crumb(push?'Push down a goal':'New goal');$('#tabList').classList.remove('on');$('#tabAlign').classList.remove('on');
		 let q,sub,body='',valid=false,primary='Continue';
		 if(!push&&step===1){q='What do you want to achieve?';sub='Pick a suggestion, change it, or write your own.';
		  const isOwn=a.goal&&!GOAL_IDEAS.some(x=>x[0]===a.goal);
		  body=aihead('Based on the goals your ED has set. You decide.')+optHtml('goal','radio',GOAL_IDEAS,t=>a.goal===t,[0])+ownOpt('goal','Type your goal in one sentence',a.goal||'',isOwn);valid=!!a.goal;}
		 if(!push&&step===2){q='How will you know this goal is done?';sub='Pick a suggestion, change it, or write your own.';const M=MEASURES(a.goal);const isOwn=a.measure&&!M.some(x=>x[0]===a.measure);
		  body=ctxBar()+aihead('Based on your goal. You decide.')+optHtml('measure','radio',M,t=>a.measure===t,[0])+ownOpt('measure','What should be true when this is done?',a.measure||'',isOwn);valid=!!a.measure;}
		 if(!push&&step===3){q='Which management goal does this support?';sub='The AI compared your goal and measure with the management goals. Pick one main goal. You decide.';
		  const R=rankMgmt(a),top=R[0].score>0?0:-1;
		  const items=R.map(r=>[r.m.t,strength(r.score)+' · '+r.m.o+' · '+(r.hit.length?'Matches your words: '+r.hit.slice(0,4).join(', '):'No clear match in your words')]);
		  body=ctxBar()+aihead('Ranked by how well each fits your goal.')+optHtml('parent','radio',items,t=>a.parent===t,top>=0?[0]:[]);valid=!!a.parent;
		  if(a.parent){const m=MGMT.find(x=>x.t===a.parent);
		   body+=`<div class="card" style="background:var(--warm);padding:12px 16px;font-size:14px;margin-bottom:18px"><div style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px">Where your goal will sit</div><span class="node">${esc(m.s)}</span> <span class="arrow">&rarr;</span> <span class="node">${esc(m.t)}</span> <span style="color:var(--muted)">(${esc(m.o)})</span> <span class="arrow">&rarr;</span> <span class="node you">Your goal</span></div>`;
		   const rest=R.filter(r=>r.m.t!==a.parent&&r.score>0).map(r=>[r.m.t,r.m.o]);
		   if(rest.length)body+=`<h2 style="font-size:20px;margin:6px 0 4px">Also supports (optional)</h2><p class="sub" style="margin:0 0 12px">Up to two more links. These are related management goals.</p>`+optHtml('also','checkbox',rest,t=>a.also.includes(t),[]);}}
		 if(!push&&step===4){q='When should it be done?';sub='Goals usually end at a quarter end.';const isOwn=a.due&&!DATES.some(x=>x[0]===a.due);
		  body=ctxBar()+aihead('Matched to your measure.')+optHtml('due','radio',DATES,t=>a.due===t,[0])+ownOpt('due','For example 15 August 2027',a.due||'',isOwn);valid=!!a.due;}
		 if(!push&&step===5){q='Check your goal before you submit';sub='Everything below goes to your approver. You can change any answer.';primary='Submit for approval';valid=true;
		  const rows=[['Goal',a.goal,1],['Measure',a.measure,2],['Management goal',a.parent,3],...(a.also.length?[['Also supports',a.also.join(', '),3]]:[]),['Due date',a.due,4],['Approver','Omar Saleh, ED Digital',0]];
		  body=`<div class="card" style="padding:6px 20px;margin-bottom:18px">${rows.map(r=>`<div class="sumrow"><span class="k">${r[0]}</span><span class="v">${esc(r[1])}</span>${r[2]?`<button class="link" data-goto="${r[2]}" aria-label="Change ${r[0]}">Change</button>`:'<span></span>'}</div>`).join('')}</div>`;
		  const ch=[[/\d/.test(a.measure),'Measurable: the measure has a number','Measurable: add a number so progress can be tracked'],[!!a.due,'Has a date','Add a date'],[!!a.parent,'Aligned to a management goal','Choose a management goal'],[goals.length<5,'You have room: '+(goals.length+1)+' of 5 goals','You would have more than 5 goals']];
		  body+=`<div class="card" style="background:var(--warm);margin-bottom:16px">${aihead('A quick quality check.')}<ul class="checks">${ch.map(c=>`<li><span class="mark ${c[0]?'ok':'warn'}" aria-hidden="true">${c[0]?'&#10003;':'!'}</span><span>${c[0]?c[1]:c[2]}<span class="sr" style="position:absolute;left:-9999px">${c[0]?' (passed)':' (needs attention)'}</span></span></li>`).join('')}</ul></div>`;}
		 if(push&&step===2){q='Who should carry this goal?';sub='Pick one or more teams. Goals go one level down.';
		  body=ctxBar()+aihead('Based on who owns related goals. You decide.')+optHtml('who','checkbox',TEAMS,t=>a.who.includes(t),[0,1])+`<div class="note" style="margin-top:0">You can pick people yourself in the real app. This demo lists teams only.</div>`;valid=a.who.length>0;}
		 if(push&&step===3){q='How should the goal be worded for them?';sub='Choose how much each manager can change.';const W=[['Same wording, each manager adds their own measure','Keeps the goal consistent across teams.'],['Each manager may reword it','Use when teams work very differently.']];
		  body=ctxBar()+aihead('Based on how similar goals were pushed before.')+optHtml('word','radio',W,t=>a.word===t,[0]);valid=!!a.word;}
		 if(push&&step===4){q='When should they be done by?';sub='Their date cannot be later than yours.';const D=[[a.goalDue||wiz.a.due,'Same as your goal.'],['31 March 2027','Earlier, to leave time to review.']];
		  body=ctxBar()+aihead('Matched to your own due date.')+optHtml('pdate','radio',D,t=>a.pdate===t,[0]);valid=!!a.pdate;}
		 if(push&&step===5){q='Check before you push this down';sub=a.who.length+' manager'+(a.who.length>1?'s':'')+' will receive this goal on their goal plan.';primary='Push down';valid=true;
		  const rows=[['Goal',a.goal,0],['Going to',a.who.join(', '),2],['Wording',a.word,3],['Due date',a.pdate,4]];
		  body=`<div class="card" style="padding:6px 20px;margin-bottom:18px">${rows.map(r=>`<div class="sumrow"><span class="k">${r[0]}</span><span class="v">${esc(r[1])}</span>${r[2]?`<button class="link" data-goto="${r[2]}" aria-label="Change ${r[0]}">Change</button>`:'<span></span>'}</div>`).join('')}</div>
		  <div class="card" style="background:var(--warm);margin-bottom:16px">${aihead('A quick check before it goes out.')}<ul class="checks"><li><span class="mark ok" aria-hidden="true">&#10003;</span>Everyone you chose sits below you in the cascade</li><li><span class="mark ok" aria-hidden="true">&#10003;</span>The goal has a due date</li><li><span class="mark ok" aria-hidden="true">&#10003;</span>No manager ends up over 5 goals</li></ul></div><div class="note" style="margin-top:0">Each manager gets this goal on their own goal plan. Their progress shows on your goal.</div>`;}
		 $('#app').innerHTML=`<div style="max-width:720px;margin:0 auto"><div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn small" id="exit">Save and exit</button></div>${stepper(names)}<div style="font-size:13px;font-weight:600;color:var(--muted)">Step ${step} of ${names.length}</div><h1 style="font-size:34px;line-height:1.25;margin:4px 0 6px" id="q" tabindex="-1">${q}</h1><p class="sub">${sub}</p>${body}
		 <div class="foot"><button class="btn" id="back">${step===(push?2:1)?'Cancel':'Back'}</button><button class="btn primary" id="next" ${valid?'':'disabled'}>${primary}</button></div>
		 <p class="note">Suggestions come from the AI and are only suggestions. Nothing is saved until you ${push?'push down':'submit'}.</p></div>`;
		 wire(push);$('#q').focus({preventScroll:true});wizScroll();
		}
		function wire(push){
		 const a=wiz.a,K={1:'goal',2:'measure',3:'parent',4:'due'};
		 const key=push?{2:'who',3:'word',4:'pdate'}[step]:K[step];
		 ROOT.querySelectorAll('.opt input[data-v]').forEach(i=>i.onchange=()=>{
		  if(i.type==='checkbox'){const v=i.dataset.v,L=push?'who':'also';a[L]=i.checked?[...a[L],v]:a[L].filter(x=>x!==v);if(L==='also')a.also=a.also.slice(0,2)}else{a[key]=i.dataset.v;if(!push&&step===3)a.also=a.also.filter(x=>x!==a.parent);if(!push&&step===1){a.measure=a.parent=a.due=null;a.also=[]}}
		  renderWiz();const el=ROOT.querySelector(`[name="${i.name}"][data-v="${CSS.escape(i.dataset.v)}"]`);if(el)el.focus()});
		 ROOT.querySelectorAll('input[data-own]').forEach(i=>i.onchange=()=>{const t=$('#own-'+i.name);t.focus()});
		 ROOT.querySelectorAll('input[id^=own-]').forEach(t=>{t.oninput=()=>{a[key]=t.value.trim()||null;$('#next').disabled=!a[key]};t.onfocus=()=>{const r=t.closest('.opt').querySelector('input[type=radio]');if(r&&!r.checked){r.checked=true;a[key]=t.value.trim()||null;$('#next').disabled=!a[key]}}});
		 ROOT.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{step=+b.dataset.goto;renderWiz()});
		 $('#exit').onclick=()=>{view='list';wiz=null;renderList();toast('Draft not saved in this demo.')};
		 $('#back').onclick=()=>{if(step===(push?2:1)){view='list';wiz=null;renderList()}else{step--;renderWiz()}};
		 $('#next').onclick=()=>{if($('#next').disabled)return;
		  if(step<5){step++;renderWiz();return}
		  if(!push){goals.unshift({id:++idc,title:a.goal,parent:a.parent,also:a.also,status:'att',statusText:'Awaiting approval',own:0,contribs:[],measure:a.measure,due:a.due,pushed:[]});toast('Submitted to Omar Saleh, ED Digital, for approval.')}
		  else{const g=ensure(goals.find(x=>x.id===wiz.gid));a.who.forEach(w=>{if(!g.pushed.some(x=>x.who===w))g.pushed.push({who:w,p:0,d:TODAY,n:'Received. Not started.',due:a.pdate})});g.audit.unshift({d:TODAY,t:'Pushed down to '+a.who.join(', ')+' · You, Director, Digital'});toast('Pushed down to '+a.who.length+' manager'+(a.who.length>1?'s':'')+'. It is now on their goal plans.')}
		  view='list';wiz=null;renderList()};
		}
		$('#role').onchange=()=>{view='list';wiz=null;alUp=0;alDown=0;alGoal=null;renderList()};
		$('#tabList').onclick=()=>{view='list';wiz=null;renderList()};$('#tabDash').onclick=()=>{view='dash';wiz=null;renderList()};$('#tabAlign').onclick=()=>{view='align';wiz=null;alGoal=null;renderList()};
		function hoist(){const app=$('#app'),H=$('#hero');const q=app.querySelector('#q');let n=[];
		 if(q){const w=q.parentElement,ex=w.querySelector('#exit'),nav=w.querySelector('nav');n=[ex&&ex.parentElement,nav,q.previousElementSibling,q,q.nextElementSibling].filter(Boolean)}
		 else{const h=app.querySelector('h1');if(h){const row=h.parentElement===app?h:h.parentElement;const sub=row.nextElementSibling;n=[row];if(sub&&sub.classList.contains('sub'))n.push(sub)}}
		 if(!n.length)return;
		 mo.disconnect();H.innerHTML='';n.forEach(x=>H.appendChild(x));ROOT.classList.toggle('wide',view==='align');app.classList.toggle('wiz',!!q);H.classList.toggle('wiz',!!q);
		 if(q){q.setAttribute('tabindex','-1');q.focus({preventScroll:true})}
		 if(keepY!==null){scrollToY(keepY,'instant');keepY=null}
		 mo.observe(app,{childList:true})}
		function wizScroll(){const k=step+'';if(wiz&&wiz.k!==k){wiz.k=k;keepY=null;if(scrollYNow()>0)scrollToY(0,'smooth')}}
		{const D=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty($('#app'),'innerHTML',{configurable:true,get(){return D.get.call(this)},set(v){keepY=view==='wiz'?scrollYNow():null;$('#hero').innerHTML='';D.set.call(this,v)}})}
		let keepY=null;const mo=new MutationObserver(hoist);mo.observe($('#app'),{childList:true});
		$('#homeLink').onclick=()=>NAV.to('home');
		renderList();
		if(START==='new')startWiz('new');
	}
	return { start: start };
});
