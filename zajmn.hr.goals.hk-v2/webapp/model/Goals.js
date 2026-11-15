// Goals module (demo 1): the screens and sample data of the prototype, unchanged, as a module of this component.
// opts.nav opens the home page; opts.start is "new" when the home page asked for the new-goal wizard.
sap.ui.define([], function () {
	var started = false;
	function start(opts) {
		if (started) { return; }
		started = true;
		const ROOT=document.querySelector('.ajmng'),NAV=opts.nav,START=opts.start;
		function scrollTop(){window.scrollTo(0,0);let n=ROOT;while(n&&n!==document.body){if(n.scrollHeight>n.clientHeight&&/(auto|scroll)/.test(getComputedStyle(n).overflowY))n.scrollTop=0;n=n.parentElement}}
		const $=s=>ROOT.querySelector(s);
		const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
		let goals=[
		 {id:1,title:'Cut publishing delay on breaking stories',parent:'Faster digital delivery',status:'ok',statusText:'Approved',own:40,contrib:45,measure:'Median time from filing to publish under 6 minutes by Q2',due:'30 June 2027',pushed:[],also:[]},
		 {id:2,title:'Launch the new video player on all apps',parent:'Faster digital delivery',status:'att',statusText:'Awaiting approval',own:15,contrib:null,measure:'Player live on web, iOS and Android',due:'30 September 2027',pushed:[],also:[]},
		 {id:3,title:'Grow weekly digital audience by 12%',parent:'Reach more Arabic-speaking audiences',status:'ok',statusText:'Approved',own:55,contrib:null,measure:'Weekly unique users up 12% on 2026',due:'31 December 2027',pushed:[],also:[]}
		];
		let view='list',wiz=null,step=1,idc=10;
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
		const TEAMS=[['Director, Video','6 managers. Owns two goals about publishing speed.'],['Director, Web','4 managers. Owns the publishing tools this goal depends on.'],['Director, Social','5 managers. Little overlap with this goal so far.']];

		function crumb(t){$('#crumb').textContent=t}
		function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',3500)}
		const SP='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A4300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>';
		const aihead=t=>`<div class="aihead"><span class="aitag">${SP}Suggested for you</span><span>${t}</span></div>`;

		/* ---------- list ---------- */
		function bars(g){
		 let h=`<div style="margin-top:12px"><div class="row" style="justify-content:space-between;font-size:14px"><span>Owner: you</span><span>${g.own}%</span></div><div class="bar-track" role="img" aria-label="Owner progress ${g.own} percent"><div class="bar-fill" style="width:${g.own}%"></div></div></div>`;
		 if(g.contrib!=null)h+=`<div style="margin-top:10px"><div class="row" style="justify-content:space-between;font-size:14px;color:var(--muted)"><span>Contributor: Director, Video</span><span>${g.contrib}%</span></div><div class="bar-track" role="img" aria-label="Contributor progress ${g.contrib} percent"><div class="bar-fill c" style="width:${g.contrib}%"></div></div></div>`;
		 return h}
		function chip(g){const i={ok:'&#10003;',att:'&#9201;',neu:'&#8226;'}[g.status];return `<span class="chip ${g.status}"><span aria-hidden="true">${i}</span>${esc(g.statusText)}</span>`}
		function tabs(){$('#tabDash').classList.toggle('on',view==='dash');$('#tabDash').setAttribute('aria-current',view==='dash'?'page':'false');$('#tabList').classList.toggle('on',view==='list');$('#tabAlign').classList.toggle('on',view==='align');$('#tabList').setAttribute('aria-current',view==='list'?'page':'false');$('#tabAlign').setAttribute('aria-current',view==='align'?'page':'false')}
		function renderDash(){crumb('Dashboard');tabs();
		 const n=goals.length,ap=goals.filter(g=>g.statusText==='Approved').length,aw=goals.filter(g=>g.statusText==='Awaiting approval').length,rt=goals.filter(g=>g.statusText==='Returned for changes').length,avg=Math.round(goals.reduce((t,g)=>t+g.own,0)/(n||1));
		 const T=[['Goals',n+' of 5',n>=3&&n<=5?'In range (3 to 5)':'Outside the 3 to 5 range'],['Approved',ap,'Live and tracked'],['Awaiting approval',aw,'With Omar Saleh'],['Returned',rt,'Needs your changes'],['Average progress',avg+'%','Across your goals']];
		 let h=`<h1 style="font-size:34px">Dashboard</h1><p class="sub">Where your goals stand today. Updates as you create, submit and approve goals in this demo.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px">${T.map(t=>`<div class="card" style="padding:14px 16px"><div style="font-size:13px;color:var(--muted)">${t[0]}</div><div style="font-family:'Source Serif 4',serif;font-size:32px;font-weight:600;line-height:1.2">${t[1]}</div><div style="font-size:13px;color:var(--muted)">${t[2]}</div></div>`).join('')}</div>`;
		 h+=`<div class="card" style="margin-bottom:16px"><h2 style="font-size:22px;margin-bottom:4px">Progress by management goal</h2><p class="sub" style="margin:0 0 14px">Average owner progress of your goals under each management goal.</p>`;
		 const rows=MGMT.map(m=>{const gs=goals.filter(g=>g.parent===m.t);return {m,gs,p:gs.length?Math.round(gs.reduce((t,g)=>t+g.own,0)/gs.length):null}});
		 rows.forEach(r=>{h+=`<div style="margin:12px 0"><div class="row" style="justify-content:space-between;font-size:14px"><span><strong>${esc(r.m.t)}</strong> <span style="color:var(--muted)">&middot; ${esc(r.m.o)}</span></span><span>${r.p===null?'No goals yet':r.p+'% ('+r.gs.length+' goal'+(r.gs.length>1?'s':'')+')'}</span></div><div class="bar-track" role="img" aria-label="${esc(r.m.t)}: ${r.p===null?'no goals':r.p+' percent'}"><div class="bar-fill" style="width:${r.p||0}%"></div></div></div>`});
		 h+=`</div>`;
		 const att=goals.filter(g=>g.statusText!=='Approved');
		 h+=`<div class="card"><h2 style="font-size:22px;margin-bottom:10px">Needs attention</h2>${att.length?att.map(g=>`<div class="sumrow"><span class="v">${esc(g.title)}</span>${chip(g)}</div>`).join(''):'<div style="color:var(--muted)">Nothing needs attention.</div>'}</div>`;
		 $('#app').innerHTML=h}
		function renderAlign(){crumb('Alignment');tabs();
		 let h=`<h1 style="font-size:34px">Alignment</h1><p class="sub">How your goals connect to the management goals and strategy. Management goals with none of your goals are shown so gaps are visible.</p>`;
		 STRAT.forEach(st=>{h+=`<div class="card" style="margin-bottom:16px"><div style="font-size:13px;font-weight:600;color:var(--muted)">Strategy objective</div><h2 style="font-size:22px;margin-bottom:12px">${esc(st)}</h2>`;
		  MGMT.filter(m=>m.s===st).forEach(m=>{const mine=goals.filter(g=>g.parent===m.t),also=goals.filter(g=>g.parent!==m.t&&(g.also||[]).includes(m.t));
		   h+=`<div style="border-left:3px solid #D9A93B;padding:4px 0 4px 16px;margin:10px 0"><div style="font-weight:600">${esc(m.t)}</div><div style="font-size:14px;color:var(--muted)">${esc(m.o)}</div>`;
		   if(!mine.length&&!also.length)h+=`<div style="margin-top:8px"><span class="chip neu">No goal of yours yet</span></div>`;
		   mine.concat(also).forEach(g=>{h+=`<div style="margin-top:8px"><span class="node you" style="display:inline-block">${esc(g.title)}</span> <span style="font-size:13px;color:var(--muted)">${g.parent===m.t?'main link':'also supports'} &middot; ${esc(g.statusText)}</span></div>`});
		   h+='</div>'});
		  h+='</div>'});
		 $('#app').innerHTML=h}
		function renderApprovals(){crumb('Approvals');tabs();
		 const P=goals.filter(g=>g.statusText==='Awaiting approval');
		 let h=`<h1 style="font-size:34px">Approvals</h1><p class="sub">${P.length?P.length+' goal'+(P.length>1?'s':'')+' waiting for your decision.':'Nothing is waiting for you.'}</p>`;
		 if(!P.length)h+='<div class="empty">All caught up. Submit a goal as the Director to see it arrive here.</div>';
		 P.forEach(g=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><h3 style="font-size:20px;flex:1;min-width:240px">${esc(g.title)}</h3>${chip(g)}</div><div style="color:var(--muted);font-size:14px;margin-top:4px">From Director, Digital &middot; Supports: ${esc(g.parent)} &middot; Due ${esc(g.due)}</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary small" data-appr="${g.id}">Review</button></div></div>`});
		 $('#app').innerHTML=h;ROOT.querySelectorAll('[data-appr]').forEach(b=>b.onclick=()=>{wiz={kind:'approve',gid:+b.dataset.appr,a:{}};step=1;view='wiz';renderApprove()})}
		function aiChecks(g){return [[/\d/.test(g.measure),'Measurable: the measure has a number','Not measurable: the measure has no number'],[!!g.due,'Has a due date','No due date'],[!!g.parent,'Aligned to '+g.parent,'Not aligned to a management goal'],[g.own<=100,'Owner has room within 3 to 5 goals','Owner would have more than 5 goals']]}
		function renderApprove(){
		 const g=goals.find(x=>x.id===wiz.gid),a=wiz.a,N=['Goal','Decision','Review'];crumb('Approve or return');
		 $('#tabList').classList.remove('on');$('#tabAlign').classList.remove('on');
		 const C=aiChecks(g),fails=C.filter(c=>!c[0]);let q,sub,body='',valid=true,primary='Continue';
		 const card=`<div class="card" style="margin-bottom:18px;padding:6px 20px"><div class="sumrow"><span class="k">Goal</span><span class="v">${esc(g.title)}</span><span></span></div><div class="sumrow"><span class="k">Measure</span><span class="v">${esc(g.measure)}</span><span></span></div><div class="sumrow"><span class="k">Supports</span><span class="v">${esc(g.parent)}</span><span></span></div><div class="sumrow"><span class="k">Due date</span><span class="v">${esc(g.due)}</span><span></span></div><div class="sumrow"><span class="k">From</span><span class="v">Director, Digital</span><span></span></div></div>`;
		 if(step===1){q='Is this goal ready to approve?';sub='Read the goal and the AI check, then decide on the next page.';
		  body=card+`<div class="card" style="background:var(--warm)">${aihead('A quick check of the goal.')}<ul class="checks">${C.map(c=>`<li><span class="mark ${c[0]?'ok':'warn'}" aria-hidden="true">${c[0]?'&#10003;':'!'}</span><span>${c[0]?c[1]:c[2]}<span style="position:absolute;left:-9999px">${c[0]?' (passed)':' (needs attention)'}</span></span></li>`).join('')}</ul></div>`;}
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
		  if(a.dec==='Approve'){g.status='ok';g.statusText='Approved';g.note=null;toast('Approved. The Director has been notified.')}else{g.status='att';g.statusText='Returned for changes';g.note=a.comment;toast('Returned to the Director with your comment.')}
		  view='list';wiz=null;renderList()};
		 scrollTop();$('#q').focus({preventScroll:true})}
		function renderList(){
		 if(view==='dash'){renderDash();return}
		 if($('#role').value==='ed'&&view!=='align'){renderApprovals();return}
		 if(view==='align'){renderAlign();return}
		 crumb('My goals');tabs();
		 const mgr=$('#role').value==='mgr';
		 let h=`<div class="row" style="justify-content:space-between;margin-bottom:4px"><h1 style="font-size:34px">My goals</h1>${mgr?'':'<button class="btn primary" id="newGoal">New goal</button>'}</div>
		 <p class="sub">${mgr?'You are viewing as a Manager. Goals pushed down to you appear here.':'Goal year 2027. You have '+goals.length+' goals. The target is 3 to 5.'}</p>`;
		 h+=`<div class="strip" aria-label="Your place in the cascade"><span class="node">Strategy</span><span class="arrow">&rarr;</span><span class="node">ED Digital</span><span class="arrow">&rarr;</span><span class="node you">${mgr?'Director, Video':'Director, Digital'}${mgr?'':' (you)'}</span><span class="arrow">&rarr;</span><span class="node ${mgr?'you':''}">Managers${mgr?' (you)':''}</span></div>`;
		 if(mgr){
		  const got=goals.filter(g=>g.pushed.length);
		  if(!got.length)h+=`<div class="empty">Nothing has been pushed down to you yet.<br>Switch back to the Director and push a goal down to see it arrive here.</div>`;
		  got.forEach(g=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><h3 style="font-size:20px">${esc(g.title)}</h3><span class="chip att"><span aria-hidden="true">&#9201;</span>Waiting for you to link a goal</span></div><div style="color:var(--muted);font-size:14px;margin-top:4px">From Director, Digital. Due ${esc(g.due)}.</div></div>`});
		 }else{
		  goals.forEach(g=>{h+=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><h3 style="font-size:20px;flex:1;min-width:240px">${esc(g.title)}</h3>${chip(g)}</div>
		  ${g.note?`<div class="card" style="background:var(--attbg);border-color:#FA9000;margin-top:10px;padding:10px 14px;font-size:14px"><strong>Returned by Omar Saleh:</strong> ${esc(g.note)}</div>`:''}<div style="color:var(--muted);font-size:14px;margin-top:4px">Supports: ${esc(g.parent)}${g.also&&g.also.length?' (+'+g.also.length+' more)':''} &middot; Due ${esc(g.due)}</div>${bars(g)}
		  <div class="row" style="justify-content:space-between;margin-top:14px"><span style="font-size:14px;color:var(--muted)">${g.pushed.length?'Pushed down to '+g.pushed.length+' Director'+(g.pushed.length>1?'s':'')+': '+esc(g.pushed.join(', ')):''}</span><button class="btn small" data-push="${g.id}">Push down</button></div></div>`});
		 }
		 $('#app').innerHTML=h;
		 const n=$('#newGoal');if(n)n.onclick=()=>startWiz('new');
		 ROOT.querySelectorAll('[data-push]').forEach(b=>b.onclick=()=>startWiz('push',+b.dataset.push));
		}

		/* ---------- wizard engine ---------- */
		const NEW_STEPS=['Goal','Measure','Parent','Due date','Review'];
		const PUSH_STEPS=['Goal','Who','Wording','Date','Review'];
		function startWiz(kind,gid){wiz={kind,a:{also:[]},gid};step=1;view='wiz';if(kind==='push'){const g=goals.find(x=>x.id===gid);wiz.a.goal=g.title;wiz.a.due=g.due;step=2;wiz.a.who=[];}renderWiz()}
		function stepper(names){return `<nav aria-label="Progress"><ol class="stepper">${names.map((n,i)=>{const k=i+1,c=k<step?'done':k===step?'cur':'';const dot=k<step?'&#10003;':k;const lab=`Step ${k}: ${n}${k<step?' (done)':k===step?' (current)':''}`;return `<li class="${c}" aria-label="${lab}"><span class="dot">${dot}</span><span>${n}</span></li>${k<names.length?'<li class="line" aria-hidden="true"></li>':''}`}).join('')}</ol></nav>`}
		function optHtml(name,type,items,selFn,recIdx){return items.map((it,i)=>{const sel=selFn(it[0]);return `<label class="opt ${sel?'sel':''}"><input type="${type}" name="${name}" data-v="${esc(it[0])}" ${sel?'checked':''}><span><span class="t">${esc(it[0])}${recIdx.includes(i)?'<span class="rec">Recommended</span>':''}</span><span class="r" style="display:block">${esc(it[1])}</span></span></label>`}).join('')}
		function ownOpt(key,ph,val,isOwn){return `<div class="opt ${isOwn?'sel':''}" style="display:block"><label style="display:flex;gap:14px;align-items:center;cursor:pointer"><input type="radio" name="${key}" data-own="1" ${isOwn?'checked':''}><span class="t">Write my own</span></label><input type="text" id="own-${key}" placeholder="${ph}" value="${isOwn?esc(val):''}" aria-label="Your own answer"></div>`}
		function ctxBar(){return wiz.a.goal?`<div class="card" style="background:var(--warm);margin-bottom:22px;padding:12px 16px"><div style="font-size:13px;color:var(--muted)">Your goal</div><div style="font-family:'Source Serif 4',serif;font-size:18px;font-weight:600">${esc(wiz.a.goal)}</div></div>`:''}
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
		 if(push&&step===3){q='How should the goal be worded for them?';sub='Choose how much each Director can change.';const W=[['Same wording, each Director adds their own measure','Keeps the goal consistent across teams.'],['Each Director may reword it','Use when teams work very differently.']];
		  body=ctxBar()+aihead('Based on how similar goals were pushed before.')+optHtml('word','radio',W,t=>a.word===t,[0]);valid=!!a.word;}
		 if(push&&step===4){q='When should they be done by?';sub='Their date cannot be later than yours.';const D=[[a.goalDue||wiz.a.due,'Same as your goal.'],['31 March 2027','Earlier, to leave time to review.']];
		  body=ctxBar()+aihead('Matched to your own due date.')+optHtml('pdate','radio',D,t=>a.pdate===t,[0]);valid=!!a.pdate;}
		 if(push&&step===5){q='Check before you push this down';sub=a.who.length+' Director'+(a.who.length>1?'s':'')+' will receive this goal.';primary='Push down';valid=true;
		  const rows=[['Goal',a.goal,0],['Going to',a.who.join(', '),2],['Wording',a.word,3],['Due date',a.pdate,4]];
		  body=`<div class="card" style="padding:6px 20px;margin-bottom:18px">${rows.map(r=>`<div class="sumrow"><span class="k">${r[0]}</span><span class="v">${esc(r[1])}</span>${r[2]?`<button class="link" data-goto="${r[2]}" aria-label="Change ${r[0]}">Change</button>`:'<span></span>'}</div>`).join('')}</div>
		  <div class="card" style="background:var(--warm);margin-bottom:16px">${aihead('A quick check before it goes out.')}<ul class="checks"><li><span class="mark ok" aria-hidden="true">&#10003;</span>Both teams sit below you in the cascade</li><li><span class="mark ok" aria-hidden="true">&#10003;</span>The goal has a due date</li><li><span class="mark ok" aria-hidden="true">&#10003;</span>No Director ends up over 5 goals</li></ul></div><div class="note" style="margin-top:0">Each Director is notified and links their own goals to this one.</div>`;}
		 $('#app').innerHTML=`<div style="max-width:720px;margin:0 auto"><div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn small" id="exit">Save and exit</button></div>${stepper(names)}<div style="font-size:13px;font-weight:600;color:var(--muted)">Step ${step} of ${names.length}</div><h1 style="font-size:34px;line-height:1.25;margin:4px 0 6px" id="q" tabindex="-1">${q}</h1><p class="sub">${sub}</p>${body}
		 <div class="foot"><button class="btn" id="back">${step===(push?2:1)?'Cancel':'Back'}</button><button class="btn primary" id="next" ${valid?'':'disabled'}>${primary}</button></div>
		 <p class="note">Suggestions come from the AI and are only suggestions. Nothing is saved until you ${push?'push down':'submit'}.</p></div>`;
		 wire(push);$('#q').focus({preventScroll:true});scrollTop();
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
		  if(!push){goals.unshift({id:++idc,title:a.goal,parent:a.parent,also:a.also,status:'att',statusText:'Awaiting approval',own:0,contrib:null,measure:a.measure,due:a.due,pushed:[],also:[]});toast('Submitted to Omar Saleh, ED Digital, for approval.')}
		  else{const g=goals.find(x=>x.id===wiz.gid);g.pushed=[...a.who].map(x=>x.replace('Director, ',''));g.pushed=g.pushed.map(x=>'Director, '+x);toast('Pushed down to '+a.who.length+' Director'+(a.who.length>1?'s':'')+'. They have been notified.')}
		  view='list';wiz=null;renderList()};
		}
		$('#role').onchange=()=>{view='list';wiz=null;renderList()};
		$('#tabList').onclick=()=>{view='list';wiz=null;renderList()};$('#tabDash').onclick=()=>{view='dash';wiz=null;renderList()};$('#tabAlign').onclick=()=>{view='align';wiz=null;renderList()};
		$('#homeLink').onclick=()=>NAV.to('home');
		renderList();
		if(START==='new')startWiz('new');
	}
	return { start: start };
});
