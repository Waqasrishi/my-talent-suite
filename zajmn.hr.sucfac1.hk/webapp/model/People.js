// AJMN People: the screens, rules and sample data of the sandbox page, unchanged, as a module of this component.
// Navigation goes through the component's UI5 router, so it works inside the Fiori launchpad.
sap.ui.define([], function () {
	var started = false;
	function start(router) {
		if (started) { return; }
		started = true;
		const ROUTER=router||null;
		const normHash=h=>{const r=parse(h),qs=new URLSearchParams(r.q).toString();return '#'+(r.path.replace(/\/+$/,'')||'/home')+(qs?'?'+qs:'')};
		const hashNow=()=>{const h=ROUTER?ROUTER.getHashChanger().getHash():location.hash.slice(1);return h?normHash(h):''};
		function setHash(h,replace){const r=parse(h);if(ROUTER){const a={'all*':r.parts.join('/')};if(Object.keys(r.q).length)a['?query']=r.q;ROUTER.navTo('page',a,replace===true)}else if(replace)history.replaceState(null,'',h);else location.hash=h}
		function scrollTop(){window.scrollTo(0,0);let n=document.getElementById('app');while(n&&n!==document.body){if(n.scrollHeight>n.clientHeight&&/(auto|scroll)/.test(getComputedStyle(n).overflowY))n.scrollTop=0;n=n.parentElement}}
		/* AJMN People: one in-house platform for strategy, goals, performance and development.
		   Sample data and demonstration personas only. Records live in this browser; there is no backend and no SAP connection. */

		/* ---------- people: fictional, in two departments, plus HR and an administrator ---------- */
		const LEVELS=['Corporate strategy','Executive Directors','Directors','Managers','Section Heads','Staff'];
		const PEOPLE={
		 ed1:{name:'Omar Rahman',title:'Executive Director, Operations',lv:1,mgr:null,dept:'Operations',div:'Network Operations',eid:'10000101'},
		 ed2:{name:'Sara Nasser',title:'Executive Director, Digital',lv:1,mgr:null,dept:'Digital',div:'Digital Division',eid:'10000102'},
		 d1:{name:'Marco Silva',title:'Director, Studio Operations',lv:2,mgr:'ed1',dept:'Operations',div:'Network Operations',eid:'10000201'},
		 d2:{name:'Hana Yousef',title:'Director, Digital Products',lv:2,mgr:'ed2',dept:'Digital',div:'Digital Division',eid:'10000202'},
		 m1:{name:'Daniel Okafor',title:'Manager, Broadcast Engineering',lv:3,mgr:'d1',dept:'Operations',div:'Network Operations',eid:'10000301'},
		 m2:{name:'Rana Aziz',title:'Manager, Studio Production',lv:3,mgr:'d1',dept:'Operations',div:'Network Operations',eid:'10000302'},
		 m3:{name:'Leo Martins',title:'Manager, Audience Growth',lv:3,mgr:'d2',dept:'Digital',div:'Digital Division',eid:'10000303'},
		 s1:{name:'Nadia Karim',title:'Section Head, Playout',lv:4,mgr:'m1',dept:'Operations',div:'Network Operations',eid:'10000401'},
		 s2:{name:'Yusuf Ali',title:'Section Head, Studio Crew',lv:4,mgr:'m2',dept:'Operations',div:'Network Operations',eid:'10000402'},
		 t1:{name:'Mei Chen',title:'Broadcast Engineer',lv:5,mgr:'s1',dept:'Operations',div:'Network Operations',eid:'10000501'},
		 t2:{name:'Tomas Ruiz',title:'Playout Technician',lv:5,mgr:'s1',dept:'Operations',div:'Network Operations',eid:'10000502'},
		 t3:{name:'Aisha Bello',title:'Floor Manager',lv:5,mgr:'s2',dept:'Operations',div:'Network Operations',eid:'10000503'},
		 t4:{name:'Priya Nair',title:'Audience Analyst',lv:5,mgr:'m3',dept:'Digital',div:'Digital Division',eid:'10000504'},
		 hr:{name:'Layla Haddad',title:'HR Business Partner',lv:0,mgr:null,dept:'Human Resources',div:'Human Resources',eid:'10000901',role:'hr'},
		 adm:{name:'Platform Administrator',title:'People Systems Administrator',lv:0,mgr:null,dept:'People Systems',div:'Human Resources',eid:'10000902',role:'admin'}};
		const HRID='hr';
		const KEY='ajmn-people-v1',OLDKEY='ajmn-goals-hub-v3',TODAY=new Date().toISOString().slice(0,10),STALE=30;
		const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
		const addDays=(d,n)=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
		const age=d=>Math.round((new Date(TODAY)-new Date(d))/864e5);
		const TYPES={org:'Organisation goal',team:'Team goal',individual:'Individual goal'};
		const HEALTH={on:['On track','ok'],risk:['At risk','wait'],off:['Off track','bad'],none:['No check-in yet','draft'],stale:['Check-in overdue','draft']};
		const STEPS={self:'Self-assessment',manager:'Manager review',calibration:'Calibration',ack:'Employee acknowledgement',appeal:'HR appeal review',done:'Completed'};

		/* ---------- application registry: one place for labels, routes, availability and who may use each area ---------- */
		const APPS=[
		 {id:'home',label:'Home',icon:'home',route:'/home',kind:'internal',nav:1},
		 {id:'strategy',label:'Strategy & Alignment',icon:'tree',route:'/strategy',kind:'internal',nav:1,desc:'Pillars to every goal, and how each goal aligns'},
		 {id:'goals',label:'My Goals',icon:'target',route:'/goals',kind:'internal',nav:1,need:'participant',desc:'Set goals, check in and align them'},
		 {id:'performance',label:'My Performance',icon:'form',route:'/performance',kind:'internal',nav:1,need:'participant',desc:'Your appraisal and its workflow'},
		 {id:'cpm',label:'Continuous Performance',icon:'chat',route:'/activities',kind:'internal',nav:1,need:'participant',desc:'Activities and feedback linked to goals'},
		 {id:'development',label:'My Development',icon:'grow',route:'/development',kind:'internal',nav:1,need:'participant',desc:'Development records, including training needs'},
		 {id:'training',label:'Training Needs',icon:'cap',route:'/training',kind:'internal',need:'participant',desc:'Training needs agreed in appraisals'},
		 {id:'team',label:'My Team',icon:'users',route:'/team',kind:'internal',nav:1,need:'manager',desc:'Your team’s goals, appraisals and approvals'},
		 {id:'succession',label:'Succession & Career',icon:'ladder',kind:'unavailable',desc:'Successors and career paths',note:'Not configured in this platform yet. Succession data is not connected.'},
		 {id:'learning',label:'Learning',icon:'book',route:'/learning',kind:'internal',nav:1,sample:1,desc:'A sample course catalogue, not connected to a learning system'},
		 {id:'approvals',label:'Workflows & Approvals',icon:'flow',route:'/approvals',kind:'internal',nav:1,desc:'Everything waiting on you'},
		 {id:'reports',label:'Reports & Analytics',icon:'bars',route:'/reports',kind:'internal',nav:1,need:'reports',desc:'Alignment, health and appraisal progress'},
		 {id:'hrservices',label:'HR Services',icon:'help',kind:'external',desc:'Requests and answers from HR',note:'No HR Services address is configured. An administrator can add one in the Admin Center.'},
		 {id:'admin',label:'Admin Center',icon:'gear',route:'/admin',kind:'internal',nav:1,need:'admin',desc:'Workflow, rating scale, applications'}];
		const OTHER=[];
		const IC={home:'M3 10.5 10 4l7 6.5V17h-4.5v-4.5h-5V17H3z',tree:'M10 3v4M4 13v-3h12v3M10 7v3M2.5 13h3v4h-3zM8.5 13h3v4h-3zM14.5 13h3v4h-3zM8.5 2h3v3h-3z',target:'M10 17.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM10 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM10 10l6-6',form:'M5 2.5h10v15H5zM7.5 6.5h5M7.5 9.5h5M7.5 12.5h3',chat:'M3 4h14v9H8l-4 3v-3H3zM6 7.5h8M6 10h5',grow:'M3 16l5-5 3 3 6-7M13 7h4v4',cap:'M2 8l8-4 8 4-8 4zM5 9.5v4c3 2 7 2 10 0v-4',users:'M7.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 17c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 4a3 3 0 0 1 0 5.5M15 12c1.8.7 2.7 2.2 3 4.5',ladder:'M6 2v16M14 2v16M6 6h8M6 10h8M6 14h8',book:'M2.5 4.5h6a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2h-6zM17.5 4.5h-5a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5z',flow:'M4 3h5v4H4zM11 13h5v4h-5zM6.5 7v4.5h7V13',bars:'M3 16h14M5 16V9M10 16V4M15 16v-5',help:'M3.5 11V9a6.5 6.5 0 0 1 13 0v2M2.5 10.5h3v5h-3zM14.5 10.5h3v5h-3z',gear:'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M15.7 4.3l-1.8 1.8M6.1 13.9l-1.8 1.8',bell:'M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13zM8.5 17.5h3',grid:'M3 3h4v4H3zM8 3h4v4H8zM13 3h4v4h-4zM3 8h4v4H3zM8 8h4v4H8zM13 8h4v4h-4zM3 13h4v4H3zM8 13h4v4H8zM13 13h4v4h-4z',search:'M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 13l4 4',menu:'M3 5h14M3 10h14M3 15h14',plus:'M10 4v12M4 10h12',check:'M4 10.5l4 4 8-9',feedback:'M3 4h14v9H8l-4 3v-3H3zM10 6.5v3M10 11.5h.01',print:'M5 8V3h10v5M5 14H3V8h14v6h-2M5 11h10v6H5z',alert:'M10 3l8 14H2zM10 8v4M10 14.5h.01',up:'M4 12l6-6 6 6'};
		const icon=(k,c)=>`<svg class="ic ${c||''}" viewBox="0 0 20 20" aria-hidden="true"><path d="${IC[k]||IC.form}"/></svg>`;

		/* ---------- sample data ---------- */
		function seed(){
		 const kr=(t,start,target,current,unit,weight)=>({t,type:'number',start,target,current,unit:unit||'',weight:weight??null,steps:[]});
		 const bin=(t,done,weight)=>({t,type:'binary',start:null,target:null,current:!!done,unit:'',weight:weight??null,steps:[]});
		 const ms=(t,steps,weight)=>({t,type:'milestone',start:null,target:null,current:null,unit:'',weight:weight??null,steps:steps.map(([s,d])=>({t:s,done:!!d}))});
		 const ck=(n,status,note)=>({at:daysAgo(n),by:null,status,note});
		 const g=(id,owner,type,title,krs,x)=>{const o=Object.assign({id,owner,cycle:'c26',type,title,desc:'',due:'2026-12-31',weight:null,rollup:'krs',krs,status:'approved',archived:false,review:null,back:'',checkins:[],hist:[{at:'2026-01-15',by:owner,w:'Goal approved'}]},x||{});o.checkins.forEach(c=>c.by=owner);return o};
		 const l=(id,from,to,status,primary)=>({id,from,to,status,primary:!!primary,at:'2026-02-01',reason:''});
		 const ap=(id,emp,step,x)=>Object.assign({id,emp,cycle:'c26',step,r:{},tna:[],noTna:{on:false,reason:''},empSum:'',mgrSum:'',calib:{rating:null,note:''},ack:null,appeal:null,frozen:false,snap:{},snapOrder:[],final:null,back:'',comments:[],files:[],hist:[{at:'2026-11-01',by:HRID,w:'Form launched at Self-assessment'}],saved:'2026-11-01'},x||{});
		 const goals=[
		   g('g1','ed1','org','Cut unplanned studio downtime across all channels',[kr('Unplanned downtime per month',120,30,75,'minutes',60),kr('Mean time to restore',40,15,22,'minutes',40)],{checkins:[ck(40,'risk','Two long outages in September'),ck(9,'on','October well under 60 minutes')]}),
		   g('g2','ed2','org','Double weekly active users on digital platforms',[kr('Weekly active users',1.2,2.4,1.6,'M')],{rollup:'aligned',checkins:[ck(14,'on','Homepage pilot lifting returning visitors')]}),
		   g('g3','ed1','org','Build a skilled, adaptable operations workforce',[ms('Operations learning paths',[['Design the paths',1],['Pilot with one team',1],['Roll out to all teams',0],['Review completion',0]],50),kr('Open roles filled by internal moves',10,30,14,'%',50)],{checkins:[ck(21,'on','')]}),
		   g('g4','d1','team','Keep studio service levels above 99.5%',[kr('Studio availability',99,99.5,99.4,'%',50),bin('No live show lost to a studio fault',true,50)],{weight:40,checkins:[ck(45,'risk','Availability dipped in the August heat')]}),
		   g('g5','d2','team','Launch a personalised homepage in three markets',[ms('Markets live',[['United Kingdom',1],['France',0],['Malaysia',0]],60),kr('Recommendation click-through',4,8,6.5,'%',40)],{weight:50,due:'2026-09-30',checkins:[ck(3,'on','France launch next sprint')]}),
		   g('g9','d2','team','Publish breaking stories within 10 minutes',[kr('Breaking stories live within 10 minutes',60,90,72,'%')],{weight:50,checkins:[ck(12,'on','')]}),
		   g('g6','m1','individual','Keep playout incidents under three a month',[kr('Playout incidents per month',7,3,4,'incidents')],{weight:100,checkins:[ck(5,'risk','Four incidents in October')]}),
		   g('g7','m3','individual','Grow newsletter sign-ups by 40%',[kr('Newsletter sign-ups',50,70,null,'k',70),kr('Welcome series open rate',38,45,null,'%',30)],{status:'submitted',weight:100,hist:[{at:daysAgo(2),by:'m3',w:'Submitted for approval'}]}),
		   g('g8','t4','individual','Build audience dashboards for the studio team',[ms('Dashboard build',[['Data sources agreed',1],['First version live',1],['Studio feedback round',0]]),bin('Used in weekly planning meetings',false)],{weight:100,checkins:[ck(20,'on','')]}),
		   g('g10','s1','individual','Cut playout recovery time to under 15 minutes',[kr('Median recovery time',35,15,null,'minutes')],{weight:100}),
		   g('g11','t1','individual','Automate playout health checks',[kr('Servers with automated checks',0,40,46,'servers')],{weight:60,checkins:[ck(2,'on','Covered the six spare servers too')]}),
		   g('g14','t1','individual','Document recovery runbooks for every playout chain',[ms('Runbooks',[['Channel 1',1],['Channel 2',1],['Channel 3',0],['Backup chain',0]])],{weight:40,checkins:[ck(8,'on','Two of four done')]}),
		   g('g12','m2','individual','Reduce studio changeover time to 20 minutes',[kr('Average changeover time',30,20,33,'minutes')],{weight:100,checkins:[ck(40,'off','New set design adds time')]}),
		   g('g19','ed1','org','Modernise studio infrastructure',[bin('Studio 3 refit complete',true)],{cycle:'c25',due:'2025-12-31',checkins:[ck(330,'on','Done')]}),
		   g('g20','d1','team','Refit the Studio 3 control room',[bin('Control room back on air',true)],{cycle:'c25',due:'2025-10-31',weight:100,checkins:[ck(380,'on','Back on air')]}),
		   g('g21','m1','individual','Move playout to IP routing',[ms('IP migration',[['Design',1],['Test channel',1],['All channels',1]])],{cycle:'c25',due:'2025-12-31',weight:100,checkins:[ck(340,'on','')]})];
		 const snapOf=id=>{const x=goals.find(y=>y.id===id);return {title:x.title,weight:x.weight,pct:null,align:''}};
		 return {as:'t1',cycle:'c26',seq:100,theme:'light',
		  config:{calibration:true,appeal:true,noTnaAllowed:true,tnaMax:3,numbers:true,decimals:2,
		   scale:[{v:1,label:'Unsatisfactory'},{v:2,label:'Needs improvement'},{v:3,label:'Meets expectations'},{v:4,label:'Exceeds expectations'},{v:5,label:'Outstanding'}],
		   deadlines:{c26:{self:'2026-11-30',manager:'2026-12-15',calibration:'2027-01-10',ack:'2027-01-20',appeal:'2027-01-31'},c25:{}},apps:{hrservices:''}},
		  cycles:[{id:'c25',name:'2025',start:'2025-01-01',end:'2025-12-31',closed:true},{id:'c26',name:'2026',start:'2026-01-01',end:'2026-12-31',closed:false}],
		  pillars:[{id:'p1',name:'Grow trusted digital audiences'},{id:'p2',name:'Operational excellence'},{id:'p3',name:'Invest in our people'}],
		  goals,
		  links:[l('l1','g1','p2','accepted',1),l('l2','g2','p1','accepted',1),l('l3','g3','p3','accepted',1),l('l4','g4','g1','accepted',1),l('l5','g5','g2','accepted',1),l('l6','g9','g2','accepted',1),
		   l('l7','g6','g4','accepted',1),l('l8','g7','g5','pending',1),l('l9','g8','g5','accepted',1),l('l10','g8','g4','pending'),l('l11','g4','g9','pending'),l('l12','g10','g6','accepted',1),l('l13','g11','g10','accepted',1),l('l14','g14','g10','accepted',1),
		   l('l19','g19','p2','accepted',1),l('l20','g20','g19','accepted',1),l('l21','g21','g20','accepted',1)],
		  appraisals:[
		   ap('a1','t1','self'),
		   ap('a2','m1','manager',{r:{g6:{er:4,ec:'Incidents fell from seven to four a month.',ev:'Incident log, October',mr:null,mc:''}},empSum:'Good progress; the last step to three a month needs the new monitoring.',hist:[{at:'2026-11-01',by:HRID,w:'Form launched at Self-assessment'},{at:daysAgo(3),by:'m1',w:'Self-assessment submitted to Marco Silva'}]}),
		   ap('a3','t4','ack',{frozen:true,snap:{g8:Object.assign(snapOf('g8'),{pct:67,align:'Launch a personalised homepage in three markets'})},snapOrder:['g8'],r:{g8:{er:4,ec:'Dashboard is live and used by two desks.',ev:'Dashboard usage report',mr:4,mc:'Strong delivery; adoption in planning meetings still to come.'}},empSum:'A productive year building audience tools.',mgrSum:'Priya delivered the first dashboard ahead of plan.',calib:{rating:4,note:'Consistent with Digital calibration.'},
		    tna:[{id:'tn1',area:'Data visualisation',gap:'Builds charts but not interactive dashboards',learningId:'L5',outcome:'Builds the studio dashboard without help',due:'2027-03-31',devId:'dv1'},{id:'tn2',area:'Presenting insights',gap:'Findings not yet presented to editors',learningId:'L1',outcome:'Leads a monthly insight briefing',due:'2027-06-30',devId:'dv2'}],
		    hist:[{at:'2026-11-01',by:HRID,w:'Form launched at Self-assessment'},{at:daysAgo(10),by:'t4',w:'Self-assessment submitted to Leo Martins'},{at:daysAgo(6),by:'m3',w:'Manager review submitted to Calibration'},{at:daysAgo(2),by:HRID,w:'Calibration submitted to Employee acknowledgement'}]}),
		   ap('a4','m2','calibration',{frozen:true,snap:{g12:Object.assign(snapOf('g12'),{pct:0,align:''})},snapOrder:['g12'],r:{g12:{er:3,ec:'Changeover is hard with the new set.',ev:'',mr:2,mc:'Changeover time went up, not down.'}},mgrSum:'Needs a plan to get changeover back under 25 minutes.',noTna:{on:false,reason:''},
		    tna:[{id:'tn3',area:'Process improvement',gap:'No structured way to cut changeover steps',learningId:'L4',outcome:'A changeover plan agreed with the crew',due:'2027-02-28',devId:'dv3'}],hist:[{at:'2026-11-01',by:HRID,w:'Form launched at Self-assessment'},{at:daysAgo(8),by:'m2',w:'Self-assessment submitted to Marco Silva'},{at:daysAgo(4),by:'d1',w:'Manager review submitted to Calibration'}]}),
		   ap('a5','d1','self'),
		   ap('a0','m1','done',{cycle:'c25',frozen:true,snap:{g21:Object.assign(snapOf('g21'),{pct:100,align:'Refit the Studio 3 control room'})},snapOrder:['g21'],r:{g21:{er:5,ec:'All channels moved.',ev:'',mr:5,mc:'Excellent delivery.'}},final:5,calib:{rating:5,note:''},ack:{at:'2026-01-20',decision:'accept',comment:''},hist:[{at:'2026-01-20',by:'m1',w:'Acknowledged and completed'}]})],
		  dev:[{id:'dv1',emp:'t4',cycle:'c26',plan:'tna',area:'Data visualisation',gap:'Builds charts but not interactive dashboards',learningId:'L5',outcome:'Builds the studio dashboard without help',due:'2027-03-31',status:'In progress',source:'a3',hist:[{at:daysAgo(6),by:'m3',w:'Created from the 2026 appraisal'}]},
		   {id:'dv2',emp:'t4',cycle:'c26',plan:'tna',area:'Presenting insights',gap:'Findings not yet presented to editors',learningId:'L1',outcome:'Leads a monthly insight briefing',due:'2027-06-30',status:'Planned',source:'a3',hist:[{at:daysAgo(6),by:'m3',w:'Created from the 2026 appraisal'}]},
		   {id:'dv3',emp:'m2',cycle:'c26',plan:'tna',area:'Process improvement',gap:'No structured way to cut changeover steps',learningId:'L4',outcome:'A changeover plan agreed with the crew',due:'2027-02-28',status:'Planned',source:'a4',hist:[{at:daysAgo(4),by:'d1',w:'Created from the 2026 appraisal'}]}],
		  learning:[{id:'L1',title:'Presenting data to editorial teams',format:'Workshop, half day',provider:'AJMN Institute (sample)'},{id:'L2',title:'Broadcast systems resilience',format:'Online course, 6 hours',provider:'AJMN Institute (sample)'},
		   {id:'L3',title:'Leading teams through change',format:'Programme, 4 sessions',provider:'AJMN Institute (sample)'},{id:'L4',title:'Lean process improvement',format:'Online course, 3 hours',provider:'AJMN Institute (sample)'},
		   {id:'L5',title:'Interactive dashboards for reporting',format:'Online course, 5 hours',provider:'AJMN Institute (sample)'},{id:'L6',title:'Safety on location',format:'Classroom, 1 day',provider:'AJMN Institute (sample)'}],
		  activities:[{id:'ac1',owner:'t1',goalId:'g11',title:'Script health checks for the spare servers',status:'Done',at:daysAgo(4),notes:'Six spare servers covered.'},{id:'ac2',owner:'m1',goalId:'g6',title:'Weekly incident review meeting',status:'In progress',at:daysAgo(7),notes:''},{id:'ac3',owner:'d1',goalId:'g4',title:'October studio availability report',status:'Done',at:daysAgo(9),notes:''}],
		  feedback:[{id:'fb1',from:'t1',to:'s1',goalId:'g11',q:'How have the automated checks helped the night shift?',status:'requested',a:'',at:daysAgo(3)}]};
		}
		/* goals, links and pillars people created in the earlier Goals Cycle Hub carry over; its copies of the sample records do not,
		   so the sample data stays consistent */
		function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(x){}
		 if(s&&s.goals&&s.appraisals&&s.config&&PEOPLE[s.as])return s;s=seed();
		 try{const o=JSON.parse(localStorage.getItem(OLDKEY));if(o&&o.goals&&o.links){const gi=new Set(s.goals.map(g=>g.id)),li=new Set(s.links.map(l=>l.id)),pi=new Set(s.pillars.map(p=>p.id));
		  s.pillars.push(...(o.pillars||[]).filter(p=>!pi.has(p.id)));s.goals.push(...o.goals.filter(g=>!gi.has(g.id)&&PEOPLE[g.owner]));
		  const ok=id=>s.goals.some(g=>g.id===id)||s.pillars.some(p=>p.id===id);s.links.push(...o.links.filter(l=>!li.has(l.id)&&ok(l.from)&&ok(l.to)));s.seq=Math.max(s.seq,(o.seq||0)+1)}}catch(x){}
		 return s}
		let S=load();
		const U={dr:null,form:null,ai:null,err:{},add:null,ck:null,saveErr:false,q:'',fd:'',ft:'',fs:'',fh:'',farch:false,sort:'due',scope:'all',pop:null,search:'',nav:false,ap:null,apErr:null,ret:null,last:''};
		/* storage can fail (private mode, quota): say so instead of losing changes silently */
		function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(S));U.saveErr=false;return true}catch(x){U.saveErr=true;return false}}
		const save=()=>{const was=U.saveErr;if(!saveNow()&&!was)setTimeout(render)};
		/* another tab changed the data: take its copy, so this tab's next save does not overwrite it */
		window.addEventListener('storage',ev=>{if(ev.key!==KEY||!ev.newValue)return;try{const n=JSON.parse(ev.newValue);if(n&&n.goals&&n.appraisals){S=n;if(U.ap&&!U.ap.dirty)U.ap=null;render();toast('Updated with changes from another tab')}}catch(x){}});

		/* ---------- helpers ---------- */
		const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
		const P=id=>PEOPLE[id],ME=()=>S.as,G=id=>S.goals.find(g=>g.id===id),PL=id=>S.pillars.find(p=>p.id===id),LK=id=>S.links.find(l=>l.id===id);
		const AP=id=>S.appraisals.find(a=>a.id===id),DV=id=>S.dev.find(d=>d.id===id),LR=id=>S.learning.find(x=>x.id===id),AC=id=>S.activities.find(a=>a.id===id);
		const CYC=id=>S.cycles.find(c=>c.id===id),cyc=()=>CYC(S.cycle),open=g=>!CYC(g.cycle).closed;
		const isPillar=id=>!!PL(id);
		const reports=id=>Object.keys(PEOPLE).filter(k=>PEOPLE[k].mgr===id);
		const below=id=>reports(id).flatMap(r=>[r,...below(r)]);
		const PART=Object.keys(PEOPLE).filter(k=>PEOPLE[k].lv>=1);
		const fmt=d=>d?new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
		const hist=(g,w)=>g.hist.push({at:TODAY,by:ME(),w});
		const who=id=>`${P(id).name}${P(id).dept!==P(ME()).dept&&P(ME()).lv>=1?' ('+P(id).dept+')':''}`;
		const first=id=>P(id).name.split(' ')[0];
		const nodeName=id=>isPillar(id)?PL(id).name:G(id)?G(id).title:'';
		const nodeOwner=id=>isPillar(id)?null:G(id)&&G(id).owner;
		const STATUS={draft:['Draft','draft'],submitted:['Waiting for approval','wait'],approved:['Approved','ok'],returned:['Sent back','bad']};
		const LST={pending:['Pending','wait'],accepted:['Accepted','ok'],rejected:['Rejected','bad']};
		const pill=s=>`<span class="pill ${STATUS[s][1]}">${STATUS[s][0]}</span>`,lpill=s=>`<span class="pill ${LST[s][1]}">${LST[s][0]}</span>`;
		function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3400)}
		const num=v=>v===''||v==null?null:Number(v);
		/* roles: derived from the reporting line, except HR and the administrator; persona switching is a demonstration, not sign-in */
		const roleOf=id=>P(id).role||(P(id).lv===1?'ed':P(id).lv===2?'director':reports(id).length?'manager':'employee');
		const ROLE={employee:'Employee',manager:'Manager',director:'Director',ed:'Executive Director',hr:'HR',admin:'Administrator'};
		const isHR=()=>roleOf(ME())==='hr',isAdmin=()=>roleOf(ME())==='admin',isPart=()=>P(ME()).lv>=1,hasTeam=()=>reports(ME()).length>0;
		const canReports=()=>isHR()||(isPart()&&hasTeam());
		const allowed=a=>!a.need||(a.need==='participant'&&isPart())||(a.need==='manager'&&hasTeam())||(a.need==='reports'&&canReports())||(a.need==='admin'&&isAdmin());
		const appUrl=a=>a.kind==='external'?(S.config.apps[a.id]||''):'';
		const avail=a=>a.kind==='internal'||(a.kind==='external'&&!!appUrl(a));

		const canSee=g=>!!g&&(g.status!=='draft'||g.owner===ME());
		const shown=g=>g.cycle===S.cycle&&!g.archived&&canSee(g);

		/* ---------- measures: progress comes from key results, or from the goals aligned to it ---------- */
		function krRaw(k){if(k.type==='binary')return k.current?100:0;if(k.type==='milestone')return k.steps.length?k.steps.filter(s=>s.done).length/k.steps.length*100:null;
		 const s=num(k.start),t=num(k.target),c=num(k.current);if(s==null||t==null||c==null||s===t)return null;return (c-s)/(t-s)*100}
		const clamp=v=>Math.max(0,Math.min(100,v));
		/* weighted by key-result weight; with no weights set, each key result counts equally. Goal weights are not used here. */
		function goalPct(g,d=0){if(g.rollup==='aligned'&&d<12){const v=S.links.filter(l=>l.to===g.id&&l.status==='accepted').map(l=>G(l.from)).filter(x=>x&&!x.archived&&x.status!=='draft').map(x=>goalPct(x,d+1)).filter(x=>x!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null}
		 const v=g.krs.map(k=>({p:krRaw(k),w:num(k.weight)})).filter(x=>x.p!=null);if(!v.length)return null;const anyW=g.krs.some(k=>num(k.weight)!=null);
		 const tw=anyW?v.reduce((a,x)=>a+(x.w||0),0):v.length;if(!tw)return null;return Math.round(v.reduce((a,x)=>a+clamp(x.p)*(anyW?(x.w||0):1),0)/tw)}
		const krLabel=k=>{const r=krRaw(k);return r==null?'No data yet':r<0?'Behind start':r>100?`Exceeded · ${Math.round(r)}%`:Math.round(r)+'%'};
		const measure=k=>k.type==='binary'?(k.current?'Done':'Not done'):k.type==='milestone'?`${k.steps.filter(s=>s.done).length} of ${k.steps.length} steps`:`${k.current==null?'–':k.current} ${e(k.unit)} · from ${k.start} to ${k.target} ${e(k.unit)}${num(k.target)<num(k.start)?' (lower is better)':''}`;
		const pbar=p=>p==null?'<div class="prog"><div class="bar"></div>No data yet</div>':`<div class="prog"><div class="bar"><i style="width:${clamp(p)}%"></i></div>${p}%</div>`;
		const progHtml=g=>pbar(goalPct(g));
		const health=g=>{const c=g.checkins[g.checkins.length-1];return !c?'none':age(c.at)>STALE&&open(g)?'stale':c.status};
		const hpill=g=>{const h=health(g);return `<span class="pill ${HEALTH[h][1]}">${HEALTH[h][0]}</span>`};

		/* ---------- alignment: outbound = links from a goal, inbound = links to it ---------- */
		const out=g=>S.links.filter(l=>l.from===g.id);
		const inb=g=>S.links.filter(l=>l.to===g.id&&canSee(G(l.from)));
		const primary=g=>out(g).find(l=>l.primary&&l.status!=='rejected');
		/* the path to strategy follows accepted main links to live goals only, so each goal counts once */
		function path(g){const c=[];let x=g,ok=true;for(let i=0;i<20;i++){const l=primary(x);if(!l)return {pillar:null,chain:c,ok:false};if(l.status!=='accepted')ok=false;if(isPillar(l.to))return {pillar:l.to,chain:c,ok};x=G(l.to);if(!x||x.archived)return {pillar:null,chain:c,ok:false};c.unshift(x)}return {pillar:null,chain:c,ok:false}}
		const aligned=g=>{const p=path(g);return p.ok&&!!p.pillar};
		const rootPillar=g=>{const p=path(g);return p.ok?p.pillar:null};
		/* goals that already support this one, directly or further down: linking to any of them would close a loop.
		   Targets are live goals in the same cycle, owned by people at the same level or above. */
		function supporters(id){const seen=new Set(),st=[id];while(st.length){const x=st.pop();S.links.forEach(l=>{if(l.to===x&&l.status!=='rejected'&&!seen.has(l.from)){seen.add(l.from);st.push(l.from)}})}return seen}
		function targets(g){const mgr=P(g.owner).mgr,sup=supporters(g.id),taken=new Set(out(g).filter(l=>l.status!=='rejected').map(l=>l.to)),cy=g.cycle||S.cycle;
		 const gs=S.goals.filter(x=>x.status==='approved'&&!x.archived&&x.cycle===cy&&x.owner!==g.owner&&x.id!==g.id&&!sup.has(x.id)&&!taken.has(x.id)&&P(x.owner).lv<=P(g.owner).lv);
		 return {mine:gs.filter(x=>x.owner===mgr),other:gs.filter(x=>x.owner!==mgr),pillars:P(g.owner).lv===1?S.pillars.filter(p=>!taken.has(p.id)):[]}}
		const validTarget=(g,to)=>{const t=targets(g);return [...t.mine,...t.other,...t.pillars].some(x=>x.id===to)};
		/* goals aligned to this one are told when it changes or is archived, so their owners can review them */
		function flagSupporters(g,why){S.links.filter(l=>l.to===g.id&&l.status==='accepted').forEach(l=>{const x=G(l.from);if(x&&!x.archived){x.review={at:TODAY,why};hist(x,'Needs review: '+why)}})}

		/* ---------- every goal action is checked here, not only by hiding its button ---------- */
		const own=g=>g.owner===ME(),isMgr=g=>P(g.owner).mgr===ME();
		const may={approve:g=>g.status==='submitted'&&isMgr(g)&&open(g),sendback:g=>g.status==='submitted'&&isMgr(g)&&open(g),
		 edit:g=>own(g)&&open(g)&&!g.archived&&['draft','returned','approved'].includes(g.status),delete:g=>own(g)&&g.status==='draft',
		 checkin:g=>own(g)&&open(g)&&!g.archived&&g.status==='approved',align:g=>own(g)&&open(g)&&!g.archived,
		 archive:g=>(own(g)||isMgr(g))&&!g.archived&&g.status==='approved',unarchive:g=>(own(g)||isMgr(g))&&g.archived,review:g=>own(g)&&!!g.review,
		 decide:l=>nodeOwner(l.to)===ME()&&canSee(G(l.from))&&(isPillar(l.to)||open(G(l.to))),withdraw:l=>G(l.from)&&own(G(l.from))&&open(G(l.from))};
		const denied=m=>toast(m||'You cannot do that.');
		const canEditStrategy=()=>P(ME()).lv===1;
		function propose(g,to){if(!may.align(g)||!validTarget(g,to))return false;const first=!primary(g),pillar=isPillar(to);
		 S.links.push({id:'l'+(S.seq++),from:g.id,to,status:pillar?'accepted':'pending',primary:first,at:TODAY,reason:''});
		 hist(g,`Aligned to “${nodeName(to)}”${pillar?'':' (waiting for '+P(nodeOwner(to)).name+')'}`);if(!pillar)hist(G(to),`${P(g.owner).name} asked to align “${g.title}” to this goal`);return true}
		function promote(g){if(!primary(g)){const n=out(g).find(l=>l.status!=='rejected');if(n)n.primary=true}}
		function submitGoal(g){if(!P(g.owner).mgr){g.status='approved';hist(g,'Approved (no manager above)')}else{g.status='submitted';g.back='';hist(g,'Submitted for approval to '+P(P(g.owner).mgr).name)}}
		function acceptOwnLinks(g){out(g).filter(l=>l.status==='pending'&&nodeOwner(l.to)===ME()).forEach(l=>{l.status='accepted';hist(G(l.to),`Accepted “${g.title}” as support`)})}
		const weightsOf=(u,cy)=>S.goals.filter(g=>g.owner===u&&g.cycle===cy&&!g.archived&&g.status!=='draft'&&num(g.weight)!=null);

		/* ---------- appraisals: workflow, access, versioning and scoring ---------- */
		const flow=()=>['self','manager',...(S.config.calibration?['calibration']:[]),'ack'];
		const ownerOf=a=>({self:a.emp,manager:P(a.emp).mgr,calibration:HRID,ack:a.emp,appeal:HRID}[a.step]||null);
		/* who may open an appraisal: the employee, their management line, and HR. The administrator configures but does not read appraisals. */
		const canSeeAp=a=>!!a&&(a.emp===ME()||below(ME()).includes(a.emp)||isHR());
		const nextOf=(a,appeal)=>{if(a.step==='ack')return appeal?'appeal':'done';if(a.step==='appeal')return 'done';const f=flow(),i=f.indexOf(a.step);return f[i+1]||'done'};
		const prevOf=a=>{const f=flow(),i=f.indexOf(a.step);return i>0?f[i-1]:null};
		const dueOf=a=>((S.config.deadlines||{})[a.cycle]||{})[a.step]||'';
		const empSees=a=>['ack','appeal','done'].includes(a.step);
		const myAp=(u,cy)=>S.appraisals.find(a=>a.emp===u&&a.cycle===(cy||S.cycle));
		/* versioning: until the manager review is submitted, an appraisal shows its goals live; from then on it keeps a snapshot,
		   so later goal edits never rewrite a submitted or completed appraisal. The link to the goal is kept either way. */
		function objectives(a){if(a.frozen)return a.snapOrder.map(id=>Object.assign({id,live:G(id)},a.snap[id]));
		 return S.goals.filter(g=>g.owner===a.emp&&g.cycle===a.cycle&&g.status==='approved'&&!g.archived).map(g=>{const p=primary(g);return {id:g.id,title:g.title,weight:g.weight,pct:goalPct(g),align:p?nodeName(p.to):'',live:g}})}
		function freeze(a){const os=objectives(a);a.snap={};a.snapOrder=os.map(o=>o.id);os.forEach(o=>a.snap[o.id]={title:o.title,weight:o.weight,pct:o.pct,align:o.align});a.frozen=true}
		const scaleLabel=v=>{const s=S.config.scale.find(x=>x.v===v);return s?s.label:''};
		/* overall rating = sum of (rating × objective weight) ÷ 100, rounded to the configured decimals; the label is the nearest whole point.
		   Missing ratings or weights that do not total 100% give no score rather than a misleading one. Achievement % is never converted into a rating. */
		function overall(a,k){const os=objectives(a),w=os.reduce((s,o)=>s+(num(o.weight)||0),0),miss=os.filter(o=>num((a.r[o.id]||{})[k])==null).length;
		 if(!os.length)return {ok:false,why:'No objectives in this appraisal.'};if(w!==100)return {ok:false,why:`Objective weights total ${w}%, not 100%.`};if(miss)return {ok:false,why:`${miss} of ${os.length} objective${os.length===1?' is':'s are'} not rated yet.`};
		 const raw=os.reduce((s,o)=>s+a.r[o.id][k]*o.weight,0)/100,d=S.config.decimals,v=Math.round(raw*10**d)/10**d;return {ok:true,v,label:scaleLabel(Math.min(5,Math.max(1,Math.round(v))))}}
		const finalRating=a=>a.final!=null?a.final:a.calib&&a.calib.rating!=null?a.calib.rating:null;
		function validate(a){const os=objectives(a),w=os.reduce((s,o)=>s+(num(o.weight)||0),0),er=[];const add=(s,t,el)=>er.push({s,t,el});
		 if(a.step==='self'||a.step==='manager'){if(!os.length)add('objectives','There are no approved goals with a weight in this cycle.');else if(w!==100)add('objectives',`Objective weights total ${w}%. They must total 100% before submitting; change the goal weights in My Goals.`)}
		 if(a.step==='self')os.forEach((o,i)=>{if(num((a.r[o.id]||{}).er)==null)add('objectives',`Rate objective ${i+1}: “${o.title}”.`,o.id+'-er')});
		 if(a.step==='manager'){os.forEach((o,i)=>{if(num((a.r[o.id]||{}).mr)==null)add('objectives',`Rate objective ${i+1}: “${o.title}”.`,o.id+'-mr')});
		  if(!a.mgrSum.trim())add('summary','Write the manager summary.','mgrsum');
		  const rows=a.tna.filter(t=>t.area.trim());if(a.tna.some(t=>!t.area.trim()))add('tna','Every training need row needs a development area, or remove the empty row.');
		  if(rows.length>S.config.tnaMax)add('tna',`No more than ${S.config.tnaMax} training needs.`);
		  if(!rows.length){if(!(S.config.noTnaAllowed&&a.noTna.on))add('tna',S.config.noTnaAllowed?'Add at least one training need, or tick “No training needs identified” and give a reason.':'Add at least one training need.');else if(!a.noTna.reason.trim())add('tna','Give a reason for “No training needs identified”.','nonereason')}}
		 if(a.step==='calibration'){const o=overall(a,'mr');if(a.calib.rating!=null&&o.ok&&Math.round(o.v)!==a.calib.rating&&!a.calib.note.trim())add('summary','Explain why the calibrated rating differs from the calculated rating.','calnote')}
		 return er}

		/* ---------- tasks: one list feeds Needs Attention, notifications, approvals and counts ---------- */
		function tasks(){const me=ME(),T=[],cy=S.cycle,cn=cyc().name,goalT=(type,g,act,next,q,due)=>T.push({type,icon:'target',who:P(g.owner).name,obj:g.title,cycle:CYC(g.cycle).name,due,state:next,act,href:href('/goals',Object.assign({goal:g.id},q||{}))});
		 S.goals.filter(g=>g.cycle===cy&&g.status==='submitted'&&isMgr(g)).forEach(g=>goalT('Goal awaiting your approval',g,'Review goal','Waiting for approval',{},null));
		 S.goals.filter(g=>g.cycle===cy&&own(g)&&g.status==='returned').forEach(g=>goalT('Goal returned for revision',g,'Revise goal','Sent back',{edit:1},null));
		 S.goals.filter(g=>g.cycle===cy&&own(g)&&g.review&&!g.archived).forEach(g=>goalT('Parent objective changed',g,'Review goal','Needs review',{},null));
		 S.goals.filter(g=>g.cycle===cy&&own(g)&&g.status==='approved'&&open(g)&&!g.archived&&['none','stale'].includes(health(g))).forEach(g=>{const c=g.checkins[g.checkins.length-1];goalT('Goal check-in overdue',g,'Check in',c?`Last check-in ${age(c.at)} days ago`:'No check-in yet',{checkin:1},c?addDays(c.at,STALE):null)});
		 S.goals.filter(g=>g.cycle===cy&&own(g)&&!g.archived).forEach(g=>inb(g).filter(l=>l.status==='pending'&&G(l.from).status!=='draft').forEach(l=>{const f=G(l.from);T.push({type:'Alignment request',icon:'tree',who:P(f.owner).name,obj:`“${f.title}” → “${g.title}”`,cycle:cn,state:'Waiting for your decision',act:'Accept or reject',href:href('/goals',{goal:g.id})})}));
		 S.appraisals.filter(a=>a.cycle===cy&&a.step!=='done'&&ownerOf(a)===me).forEach(a=>{const t={self:['Self-assessment awaiting completion','Complete self-assessment'],manager:['Team appraisal awaiting manager review','Review appraisal'],calibration:['Appraisal awaiting calibration','Calibrate'],ack:['Acknowledge your appraisal','Acknowledge or appeal'],appeal:['Appeal awaiting HR review','Review appeal']}[a.step];
		  T.push({type:t[0],icon:'form',who:P(a.emp).name,obj:`${CYC(a.cycle).name} Performance Appraisal`,cycle:CYC(a.cycle).name,due:dueOf(a),state:STEPS[a.step],act:t[1],href:href('/appraisal/'+a.id,{s:a.step==='manager'?'objectives':a.step==='ack'||a.step==='appeal'||a.step==='calibration'?'summary':'objectives'})});
		  if(a.step==='manager'&&!a.tna.some(x=>x.area.trim())&&!a.noTna.on)T.push({type:'Mandatory training needs missing',icon:'cap',who:P(a.emp).name,obj:'Training needs assessment',cycle:CYC(a.cycle).name,due:dueOf(a),state:'Required before submitting',act:'Add training needs',href:href('/appraisal/'+a.id,{s:'tna'})})});
		 S.feedback.filter(f=>f.to===me&&f.status==='requested').forEach(f=>T.push({type:'Feedback requested',icon:'chat',who:P(f.from).name,obj:f.goalId&&G(f.goalId)?G(f.goalId).title:f.q,cycle:cn,state:'Waiting for your feedback',act:'Give feedback',href:href('/activities',{tab:'feedback',fb:f.id})}));
		 return T}

		/* ---------- routing: every screen has a URL, so links, back/forward and refresh work ---------- */
		function parse(h){h=(h??hashNow()).replace(/^#/,'')||'/home';const [p,qs]=h.split('?');return {path:p.startsWith('/')?p:'/'+p,parts:p.split('/').filter(Boolean),q:Object.fromEntries(new URLSearchParams(qs||''))}}
		const href=(path,q)=>{const qs=new URLSearchParams(Object.entries(q||{}).filter(([k,v])=>v!=null&&v!=='')).toString();return '#'+path+(qs?'?'+qs:'')};
		const R=()=>parse();
		const withQ=o=>{const r=R(),q=Object.assign({},r.q,o);return href(r.path,q)};
		/* unsaved appraisal edits or an open goal form are protected when leaving */
		const dirty=()=>(U.ap&&U.ap.dirty)||(U.form&&U.form.dirty);
		function go(h,replace){if(replace){U.last=normHash(h);setHash(h,true);render()}else if(hashNow()===normHash(h))render();else setHash(h)}
		function onHash(){const now=hashNow();if(now===U.last)return;const a=parse(U.last),b=R(),leaving=a.path!==b.path;
		 if(leaving&&dirty()&&!confirm('You have unsaved changes. Leave without saving them?')){setHash(U.last,true);return}
		 if(leaving){if(U.ap&&U.ap.dirty)U.ap=null;U.form=null;U.dr=null;U.pop=null;U.nav=false;U.ck=null;U.add=null}
		 U.last=now;render();if(leaving)scrollTop()}
		if(ROUTER)ROUTER.attachRouteMatched(onHash);else window.addEventListener('hashchange',onHash);
		/* inside the launchpad the address belongs to the shell, so links in the page go through the router, never the browser */
		document.addEventListener('click',ev=>{const a=ev.target.closest&&ev.target.closest('a[href^="#"]'),app=document.getElementById('app');if(!a||!app||!app.contains(a))return;const h=a.getAttribute('href');ev.preventDefault();if(h.length>1&&h!=='#main')go(h)},true);
		window.addEventListener('beforeunload',ev=>{if(dirty()){ev.preventDefault();ev.returnValue=''}});

		/* ---------- shell ---------- */
		const crumbsFor=r=>{const p=r.parts,a=x=>APPS.find(y=>y.id===x),c=[['Home','#/home']];
		 const map={goals:p[1]==='all'?[['My Goals','#/goals'],['All goals',null]]:[['My Goals',null]],strategy:[['Strategy & Alignment',null]],performance:[['Performance',null]],
		  appraisal:[['Performance','#/performance'],[AP(p[1])&&canSeeAp(AP(p[1]))?`${P(AP(p[1]).emp).name} · ${CYC(AP(p[1]).cycle).name} appraisal`:'Appraisal',null]],team:[['My Team',null]],
		  development:p[1]?[['My Development','#/development'],[DV(p[1])?DV(p[1]).area:'Record',null]]:[['My Development',null]],training:[['Training Needs',null]],activities:[['Continuous Performance',null]],
		  learning:p[1]?[['Learning','#/learning'],[LR(p[1])?LR(p[1]).title:'Course',null]]:[['Learning',null]],approvals:[['Workflows & Approvals',null]],reports:p[1]?[['Reports & Analytics','#/reports'],['Details',null]]:[['Reports & Analytics',null]],
		  admin:[['Admin Center',null]],apps:[[a(p[1])?a(p[1]).label:'Application',null]]};
		 return p[0]==='home'?[]:[...c,...(map[p[0]]||[['Not found',null]])]};
		function shell(r,page){const me=ME(),T=tasks(),pop=U.pop;
		 const navItems=APPS.filter(a=>a.nav&&allowed(a));const active=a=>r.path===a.route||(a.route!=='/home'&&r.path.startsWith(a.route))||(a.id==='performance'&&r.parts[0]==='appraisal')||(a.id==='development'&&r.parts[0]==='training');
		 const sr=searchResults(U.search);
		 return `<a class="skip" href="#main" data-a="skip">Skip to content</a><header class="top">
		 <button class="hb" data-a="navtoggle" aria-label="Menu" aria-expanded="${U.nav}">${icon('menu')}</button>
		 <a class="brand" href="#/home" aria-label="AJMN People home"><span class="mark" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#0B3D91"/><path d="M8 20c3-9 13-9 16 0M11 20c2-5 8-5 10 0" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="16" cy="11" r="2.2" fill="#F2B233"/></svg></span><span><b>AJMN People</b><small>Al Jazeera Media Network · in-house platform</small></span></a>
		 <div class="gsearch" role="search">${icon('search')}<input type="search" data-key="gsearch" data-a="gs" value="${e(U.search)}" placeholder="Search goals, people, appraisals or apps" aria-label="Search" autocomplete="off">
		  ${U.search.trim()?`<div class="pop sp-search" role="listbox">${sr.length?sr.map(x=>`<a role="option" href="${x.h}" data-a="popclose"><span class="muted small">${x.k}</span>${e(x.t)}</a>`).join(''):'<div class="muted small pad">Nothing you can open matches.</div>'}</div>`:''}</div>
		 <span class="sp"></span>
		 <div class="tb"><button class="tbb" data-a="pop" data-p="bell" aria-label="Notifications, ${T.length} waiting" aria-expanded="${pop==='bell'}">${icon('bell')}${T.length?`<i class="badge">${T.length}</i>`:''}</button>
		  ${pop==='bell'?`<div class="pop sp-bell"><b class="pad">Waiting on you (${T.length})</b>${T.slice(0,7).map(t=>`<a href="${t.href}" data-a="popclose"><span class="muted small">${e(t.type)}</span>${e(t.obj)}<span class="muted small">${e(t.who)}${t.due?' · due '+fmt(t.due):''}</span></a>`).join('')||'<div class="muted small pad">Nothing is waiting on you.</div>'}<a class="all" href="#/approvals" data-a="popclose">Open Workflows & Approvals</a></div>`:''}</div>
		 <div class="tb"><button class="tbb" data-a="pop" data-p="apps" aria-label="Applications" aria-expanded="${pop==='apps'}">${icon('grid')}</button>
		  ${pop==='apps'?`<div class="pop sp-apps"><div class="lgrid">${APPS.filter(a=>a.id!=='home').map(a=>tileLink(a,`<span class="li">${icon(a.icon)}</span><span>${e(a.label)}</span>${badgeFor(a,1)}`,'lt')).join('')}</div></div>`:''}</div>
		 <div class="tb"><button class="me" data-a="pop" data-p="me" aria-expanded="${pop==='me'}"><span class="av">${P(me).name.split(' ').map(w=>w[0]).join('').slice(0,2)}</span><span class="mt"><b>${e(P(me).name)}</b><small>${ROLE[roleOf(me)]} · demo persona</small></span></button>
		  ${pop==='me'?`<div class="pop sp-me"><div class="pad"><b>${e(P(me).name)}</b><div class="muted small">${e(P(me).title)} · ${e(P(me).dept)}</div></div>
		  <label class="pad block small">Switch demo persona <span class="muted">(not secure sign-in)</span><select class="in" data-a="as">${Object.entries(ROLE).map(([k,l])=>`<optgroup label="${l}">${Object.keys(PEOPLE).filter(p=>roleOf(p)===k).map(p=>`<option value="${p}" ${p===me?'selected':''}>${e(P(p).name)} · ${e(P(p).title)}</option>`).join('')}</optgroup>`).join('')}</select></label>
		  <label class="pad block small">Review cycle<select class="in" data-a="cycle">${S.cycles.map(c=>`<option value="${c.id}" ${c.id===S.cycle?'selected':''}>${e(c.name)}${c.closed?' (closed)':''}</option>`).join('')}</select></label>
		  <button class="link pad" data-a="reset">Reset demo data</button></div>`:''}</div></header>
		 <div class="shell"><nav class="side ${U.nav?'open':''}" aria-label="Platform">${navItems.map(a=>`<a href="#${a.route}" ${active(a)?'aria-current="page"':''}>${icon(a.icon)}<span>${e(a.label)}</span></a>`).join('')}<div class="sidefoot">Demonstration · sample data<br>Not connected to SAP</div></nav>
		 <main class="main" id="main" tabindex="-1">${crumbsFor(r).length?`<nav class="crumbs" aria-label="Breadcrumb">${crumbsFor(r).map(([l,h],i,arr)=>h&&i<arr.length-1?`<a href="${h}">${e(l)}</a>`:`<span aria-current="page">${e(l)}</span>`).join('<span class="sep">›</span>')}</nav>`:''}
		 ${U.saveErr?'<div class="banner bad" role="alert">Changes could not be saved in this browser. They will be lost when you reload. Check that site data is allowed, then try again.</div>':''}
		 ${page}<footer class="foot">AJMN People · sample data and demo personas · records stay in this browser</footer></main></div>`}
		const badgeFor=(a,short)=>a.kind==='internal'?(a.sample?'<span class="tag t-sample">Sample data</span>':''):avail(a)?'<span class="tag t-ext">External</span>':`<span class="tag t-na">${short?'Not configured':'Not configured'}</span>`;
		const tileLink=(a,inner,cls)=>!allowed(a)?`<span class="${cls} off" title="Not available for your role">${inner}</span>`:a.kind==='external'&&avail(a)?`<a class="${cls}" href="${e(appUrl(a))}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<a class="${cls}" href="${a.kind==='internal'?'#'+a.route:'#/apps/'+a.id}">${inner}</a>`;
		function searchResults(q){q=q.trim().toLowerCase();if(!q)return [];const R=[],m=s=>s.toLowerCase().includes(q);
		 S.goals.filter(g=>g.cycle===S.cycle&&canSee(g)&&!g.archived&&(m(g.title)||m(P(g.owner).name))).slice(0,5).forEach(g=>R.push({k:'Goal · '+P(g.owner).name,t:g.title,h:href(g.owner===ME()?'/goals':'/goals/all',{goal:g.id})}));
		 S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&m(P(a.emp).name+' appraisal')).slice(0,3).forEach(a=>R.push({k:'Appraisal · '+STEPS[a.step],t:P(a.emp).name,h:'#/appraisal/'+a.id}));
		 PART.filter(p=>m(P(p).name)&&(p===ME()||below(ME()).includes(p)||isHR())).slice(0,3).forEach(p=>R.push({k:'Person · '+P(p).title,t:P(p).name,h:href('/goals/all',{owner:p})}));
		 APPS.filter(a=>allowed(a)&&m(a.label)).forEach(a=>R.push({k:'Application',t:a.label,h:a.kind==='internal'?'#'+a.route:'#/apps/'+a.id}));return R.slice(0,9)}

		/* ---------- home ---------- */
		function pageHome(){const me=ME(),h=new Date().getHours(),greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening',T=tasks(),a=myAp(me),part=isPart();
		 const qa=[['Create Goal','target',part&&!cyc().closed,href('/goals',{new:1}),'Only people with goals in an open cycle can create one'],
		  ['Update Progress','grow',part&&S.goals.some(g=>own(g)&&may.checkin(g)&&g.cycle===S.cycle),(()=>{const g=S.goals.filter(g=>own(g)&&may.checkin(g)&&g.cycle===S.cycle).sort((x,y)=>(['none','stale'].includes(health(y))?1:0)-(['none','stale'].includes(health(x))?1:0))[0];return g?href('/goals',{goal:g.id,checkin:1}):''})(),'You have no approved goals to update'],
		  ['Request Feedback','feedback',part,href('/activities',{tab:'feedback',new:1}),'Only people with goals can request feedback'],
		  ['Create Activity','plus',part,href('/activities',{new:1}),'Only people with goals can log activities'],
		  ['Review Team','users',hasTeam(),'#/team','You have no direct reports'],['View Reports','bars',canReports(),'#/reports','Reports are for managers and HR']];
		 const card=t=>`<article class="na"><div class="nah"><span class="nai">${icon(t.icon)}</span><span class="muted small">${e(t.type)}</span></div><h3>${e(t.obj)}</h3><div class="small">${e(t.who)}</div>
		  <div class="chips"><span class="chip">${e(t.cycle)} cycle</span>${t.due?`<span class="chip ${t.due<TODAY?'late':''}">Due ${fmt(t.due)}</span>`:'<span class="chip">No due date</span>'}<span class="chip st">${e(t.state)}</span></div><a class="btn pri sm" href="${t.href}">${e(t.act)} →</a></article>`;
		 return `<section class="hero"><div class="hero-art" aria-hidden="true"><svg viewBox="0 0 600 260" preserveAspectRatio="xMaxYMid slice"><defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#cfe0f7"/><stop offset="1" stop-color="#f4f8fd"/></linearGradient></defs><rect width="600" height="260" fill="url(#hg)"/>
		  <g fill="#9fb9de" opacity=".55"><rect x="250" y="120" width="26" height="140"/><rect x="282" y="80" width="34" height="180"/><rect x="322" y="140" width="22" height="120"/><rect x="350" y="60" width="30" height="200"/><rect x="386" y="110" width="40" height="150"/><rect x="432" y="40" width="24" height="220"/><rect x="462" y="95" width="36" height="165"/><rect x="504" y="130" width="28" height="130"/><rect x="538" y="70" width="40" height="190"/></g>
		  <g fill="none" stroke="#0B5CAD" stroke-width="2" opacity=".35"><path d="M220 230c120-120 260-150 380-120"/><path d="M260 250c110-100 230-120 340-95"/></g><circle cx="520" cy="70" r="34" fill="#F2B233" opacity=".35"/></svg></div>
		  <div class="hero-c"><p class="eyebrow">${greet}, ${e(first(me))}</p><h1>Your contribution.<br>Our shared impact.</h1><p class="lead">Connect your goals, performance, and development to the future of Al Jazeera.</p>
		  <div class="hero-b">${part?`<a class="btn pri" href="#/goals">My Goals →</a><a class="btn" href="${a&&canSeeAp(a)?'#/appraisal/'+a.id:'#/performance'}">My Performance</a><a class="btn" href="#/development">My Development</a>`
		   :isHR()?`<a class="btn pri" href="#/performance">Appraisals in progress →</a><a class="btn" href="#/reports">Reports</a><a class="btn" href="#/approvals">My tasks</a>`:`<a class="btn pri" href="#/admin">Admin Center →</a><a class="btn" href="#/strategy">Strategy & Alignment</a>`}</div></div></section>
		 <section class="qa" aria-label="Quick actions">${qa.map(([l,ic,ok,h,why])=>ok&&h?`<a class="qai" href="${h}">${icon(ic)}<span>${l}</span></a>`:`<span class="qai off" title="${e(why)}" aria-disabled="true">${icon(ic)}<span>${l}</span></span>`).join('')}</section>
		 <section class="sec"><div class="sech"><div><h2>Needs Attention</h2><p class="muted">Items that need your action · ${e(cyc().name)} cycle</p></div><a href="#/approvals" class="va">View all (${T.length}) →</a></div>
		 ${T.length?`<div class="nas">${T.slice(0,6).map(card).join('')}</div>`:'<div class="card empty">Nothing needs your action right now.</div>'}</section>
		 <section class="sec"><div class="sech"><div><h2>Explore and Take Action</h2><p class="muted">Everything in one place. Areas that are not set up yet say so.</p></div></div>
		 <div class="tiles">${APPS.filter(a=>a.id!=='home').map(a=>tileLink(a,`<span class="ti">${icon(a.icon)}</span><b>${e(a.label)}</b><span class="muted small">${e(a.desc||'')}</span>${badgeFor(a)}${!allowed(a)?'<span class="tag t-na">Not for your role</span>':''}`,'tile')).join('')}</div></section>`}

		/* ---------- goals: my goals ---------- */
		function alignLine(g){const p=primary(g);if(!p)return '<span class="flag">Not aligned</span>';const n=out(g).filter(l=>l.status!=='rejected').length,i=inb(g).filter(l=>l.status!=='rejected').length;
		 return `Supports: ${e(nodeName(p.to))}${p.status==='pending'?' (pending)':''} · <span class="io">out ${n} · in ${i}</span>`}
		const row=g=>`<a class="row" href="${withQ({goal:g.id})}"><span><b>${e(g.title)}</b><small><span class="ty">${TYPES[g.type]}</span>${g.weight!=null?' · weight '+g.weight+'%':''} · ${alignLine(g)}</small></span>${progHtml(g)}<span class="pills">${pill(g.status)}${g.status==='approved'?hpill(g):''}</span></a>`;
		function nextSteps(){const me=ME(),r=[],my=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle&&!g.archived);
		 my.filter(g=>g.status==='draft').forEach(g=>r.push({t:`“${g.title}” is still a draft.`,b:'Finish and submit',h:withQ({goal:g.id,edit:1})}));
		 my.forEach(g=>out(g).filter(l=>l.status==='rejected').forEach(l=>r.push({t:`${P(nodeOwner(l.to)).name} declined to align “${g.title}” to “${nodeName(l.to)}”${l.reason?': '+l.reason:''}.`,b:'Open',h:withQ({goal:g.id})})));
		 my.filter(g=>g.status==='approved'&&!primary(g)).forEach(g=>r.push({t:`“${g.title}” is not aligned to strategy.`,b:'Align it',h:withQ({goal:g.id})}));return r}
		function pageMine(){const me=ME();if(!isPart())return noAccess('My Goals is for people who own goals.');const T=tasks().filter(t=>t.icon==='target'||t.icon==='tree'),st=nextSteps(),c=cyc(),gs=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle),live=gs.filter(g=>!g.archived),arc=gs.filter(g=>g.archived),ws=weightsOf(me,S.cycle),wt=ws.reduce((a,g)=>a+num(g.weight),0);
		 return `<div class="ph"><div><h1>My Goals</h1><p class="muted">${e(P(me).name)} · ${e(P(me).title)} · ${e(c.name)} cycle${c.closed?' <span class="pill draft">Closed</span>':''}</p></div><span class="sp"></span><a class="btn" href="#/goals/all">All goals</a><a class="btn" href="#/strategy">Strategy map</a>${c.closed?'':`<a class="btn pri" href="${withQ({new:1})}">Create Goal</a>`}</div>
		 ${c.closed?'<div class="banner">This cycle is closed. Its goals are read-only.</div>':''}
		 ${ws.length&&wt!==100?`<div class="banner">Your goal weights add up to ${wt}%. They must add up to 100% before your appraisal can be submitted.</div>`:''}
		 ${c.closed?'':`<div class="card"><h2 class="h2s">Next steps</h2>${T.length+st.length?`<ul class="steps">${T.map(t=>`<li><span><b>${e(t.type)}</b> · ${e(t.obj)}</span><a class="btn sm pri" href="${t.href}">${e(t.act)}</a></li>`).join('')}${st.map(s=>`<li><span>${e(s.t)}</span><a class="btn sm" href="${s.h}">${s.b}</a></li>`).join('')}</ul>`:'<p class="muted m0">Nothing is waiting on you.</p>'}</div>`}
		 <div class="rows">${live.map(row).join('')||'<div class="empty">You have no goals in this cycle.</div>'}</div>
		 ${arc.length?`<details class="mt"><summary>Archived (${arc.length})</summary><div class="rows">${arc.map(row).join('')}</div></details>`:''}`}

		/* all goals: search, filters and sort; the export uses exactly these rows and the same calculations */
		function listRows(){const q=U.q.trim().toLowerCase(),r=R();let gs=S.goals.filter(g=>g.cycle===S.cycle&&canSee(g)&&(U.farch||!g.archived));
		 if(r.q.owner)gs=gs.filter(g=>g.owner===r.q.owner);
		 if(q)gs=gs.filter(g=>(g.title+' '+P(g.owner).name+' '+g.krs.map(k=>k.t).join(' ')).toLowerCase().includes(q));
		 if(U.fd)gs=gs.filter(g=>P(g.owner).dept===U.fd);if(U.ft)gs=gs.filter(g=>g.type===U.ft);if(U.fs)gs=gs.filter(g=>g.status===U.fs);if(U.fh)gs=gs.filter(g=>g.status==='approved'&&health(g)===U.fh);
		 const last=g=>{const c=g.checkins[g.checkins.length-1];return c?c.at:''},cmp={due:(a,b)=>(a.due||'9').localeCompare(b.due||'9'),progress:(a,b)=>(goalPct(b)??-1)-(goalPct(a)??-1),owner:(a,b)=>P(a.owner).name.localeCompare(P(b.owner).name),updated:(a,b)=>last(b).localeCompare(last(a))}[U.sort];
		 return gs.slice().sort(cmp)}
		function pageAll(){const r=R(),rows=listRows(),sel=(k,l,o)=>`<label>${l}<select class="in" data-f="${k}" data-key="f-${k}">${o.map(([v,t])=>`<option value="${v}" ${U[k]===v?'selected':''}>${t}</option>`).join('')}</select></label>`;
		 return `<div class="ph"><div><h1>All goals</h1><p class="muted">${e(cyc().name)} cycle · ${rows.length} goal${rows.length===1?'':'s'}${r.q.owner?` · owned by ${e(P(r.q.owner).name)} <a href="#/goals/all">show everyone</a>`:''}</p></div><span class="sp"></span><button class="btn" data-a="export">Export CSV</button></div>
		 <div class="filters"><label class="q">Search<input class="in" type="search" data-f="q" data-key="f-q" value="${e(U.q)}" placeholder="Goal, person or key result"></label>
		 ${sel('fd','Department',[['','All'],['Operations','Operations'],['Digital','Digital']])}${sel('ft','Type',[['',"All"],...Object.entries(TYPES)])}${sel('fs','Approval',[['','All'],...Object.entries(STATUS).map(([k,v])=>[k,v[0]])])}${sel('fh','Health',[['','All'],...Object.entries(HEALTH).map(([k,v])=>[k,v[0]])])}${sel('sort','Sort by',[['due','Due date'],['progress','Progress, highest first'],['updated','Latest check-in'],['owner','Owner']])}
		 <label class="chkl"><input type="checkbox" data-f="farch" ${U.farch?'checked':''}> Include archived</label></div>
		 <div class="rows">${rows.map(g=>`<a class="row r4" href="${withQ({goal:g.id})}"><span><b>${e(g.title)}${g.archived?' <span class="pill draft">Archived</span>':''}</b><small>${e(P(g.owner).name)} · ${e(P(g.owner).dept)} · ${TYPES[g.type]}</small></span><span class="small muted">Due ${fmt(g.due)||'–'}</span>${progHtml(g)}<span class="pills">${pill(g.status)}${g.status==='approved'?hpill(g):''}</span></a>`).join('')||'<div class="empty">No goals match.</div>'}</div>`}
		function exportCsv(){const rows=listRows(),q=v=>`"${String(v??'').replace(/"/g,'""')}"`,head=['Cycle','Goal','Owner','Department','Type','Approval','Health','Progress %','Due','Weight %','Main alignment','Archived'];
		 const csv=[head,...rows.map(g=>{const p=primary(g);return [cyc().name,g.title,P(g.owner).name,P(g.owner).dept,TYPES[g.type],STATUS[g.status][0],g.status==='approved'?HEALTH[health(g)][0]:'',goalPct(g)??'',g.due,g.weight??'',p?nodeName(p.to)+(p.status==='accepted'?'':' ('+p.status+')'):'',g.archived?'Yes':'No']})].map(r=>r.map(q).join(',')).join('\r\n');
		 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));a.download=`goals-${cyc().name}.csv`;document.body.appendChild(a);a.click();a.remove();toast(`Exported ${rows.length} goal${rows.length===1?'':'s'}`)}

		/* ---------- strategy map, with an optional focused goal and its path to a pillar ---------- */
		function layout(){const W=210,H=74,CW=260,RH=90,TOP=46,nodes=[],tree=[];let row=0;const vis=S.goals.filter(g=>shown(g)&&g.status!=='draft'),placed=new Set();
		 const kids=id=>vis.filter(g=>{const p=primary(g);return p&&p.to===id}).map(g=>({k:'g',id:g.id,lv:P(g.owner).lv}));
		 const place=n=>{if(n.k==='g')placed.add(n.id);const ks=kids(n.id).filter(c=>!placed.has(c.id));let y;if(!ks.length)y=row++;else{const ys=ks.map(c=>{tree.push([n,c]);return place(c)});y=(ys[0]+ys[ys.length-1])/2}n.y=y;nodes.push(n);return y};
		 S.pillars.forEach(p=>{place({k:'p',id:p.id,lv:0});row+=.35});
		 const rest=vis.filter(g=>!placed.has(g.id));let band=null;if(rest.length){row+=.4;band=row;rest.filter(g=>!rest.some(x=>{const p=primary(g);return p&&p.to===x.id})).forEach(g=>place({k:'g',id:g.id,lv:P(g.owner).lv}));vis.filter(g=>!placed.has(g.id)).forEach(g=>place({k:'g',id:g.id,lv:P(g.owner).lv}))}
		 nodes.forEach(n=>{n.x=16+n.lv*CW;n.top=TOP+12+n.y*RH});const at=id=>nodes.find(n=>n.id===id);
		 const extra=S.links.filter(l=>!l.primary&&l.status!=='rejected'&&at(l.from)&&at(l.to)).map(l=>[at(l.to),at(l.from),l]);
		 return {nodes,tree,extra,band:band==null?null:TOP+12+band*RH-26,W,H,CW,width:16+LEVELS.length*CW,height:TOP+24+Math.max(row,1)*RH}}
		function pageMap(){const L=layout(),r=R(),fg=r.q.focus&&G(r.q.focus),fp=fg&&canSee(fg)?path(fg):null,on=new Set(fp?[fg.id,...fp.chain.map(x=>x.id),fp.pillar].filter(Boolean):[]);
		 const box=n=>{const st=`left:${n.x}px;top:${n.top}px;width:${L.W}px;height:${L.H}px`,f=fp?(on.has(n.id)?' focus':' dim'):'';
		  if(n.k==='p'){const p=PL(n.id);return `<button class="box pillar${f}" style="${st}" data-a="pillar" data-id="${p.id}"><small>Pillar</small><b>${e(p.name)}</b></button>`}
		  const g=G(n.id),pr=primary(g),p=goalPct(g),h=g.status==='approved'?health(g):null;return `<a class="box ${g.status!=='approved'?'wait':''} ${!pr||!aligned(g)&&!(pr&&pr.status==='pending')?'loose':''} h-${h}${f}" style="${st}" href="${withQ({goal:g.id})}" data-id="${g.id}"><b>${e(g.title)}</b><small>${e(P(g.owner).name)} · ${e(P(g.owner).dept)}${g.status!=='approved'?' · '+STATUS[g.status][0]:h?' · '+HEALTH[h][0]:''}</small><div class="bar"><i style="width:${p??0}%"></i></div></a>`};
		 const curve=(a,b,cls)=>{const x1=a.x+L.W,y1=a.top+L.H/2,x2=b.x,y2=b.top+L.H/2,m=(x1+x2)/2;return `<path d="M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}" class="${cls}${fp&&on.has(a.id)&&on.has(b.id)?' hot':''}"/>`};
		 const pl=l=>l&&l.status==='pending'?'pend':'';
		 return `<div class="ph"><div><h1>Strategy & Alignment</h1><p class="muted">${e(cyc().name)} cycle, pillars to staff. Grey lines are each goal’s main alignment; blue dashed lines are extra links, often across departments; dotted lines wait to be accepted.</p></div></div>
		 ${fg?(fp?`<div class="banner info">Showing the path of <b>${e(fg.title)}</b> to ${fp.pillar?`the pillar <b>${e(PL(fp.pillar).name)}</b>${fp.ok?'':' (a link on the way is not accepted yet)'}`:'strategy: <b>it does not reach a pillar</b>'}. <a href="${href('/strategy')}">Show everything</a></div>`:'<div class="banner bad">That goal is not available to you.</div>'):''}
		 <div class="mapwrap" id="mapwrap"><div class="map" style="width:${L.width}px;height:${L.height}px"><div class="colh" style="width:${L.width}px">${LEVELS.map(l=>`<div style="width:${L.CW}px">${l}</div>`).join('')}</div>
		 <svg width="${L.width}" height="${L.height}" aria-hidden="true">${L.tree.map(([a,b])=>curve(a,b,'ln '+(b.k==='g'?pl(primary(G(b.id))):''))).join('')}${L.extra.map(([a,b,l])=>curve(a,b,'ln x '+pl(l))).join('')}</svg>
		 ${L.band!=null?`<div class="bandh" style="top:${L.band}px">Not aligned to strategy</div>`:''}${L.nodes.map(box).join('')}</div></div>
		 <div class="legend"><span><i style="background:var(--accent);border-color:var(--accent)"></i>Pillar</span><span><i></i>Approved goal</span><span><i style="border-color:#E3C27A"></i>Waiting for approval</span><span><i style="border-color:var(--bad)"></i>Not aligned</span><span>Drafts and archived goals are not shown.</span></div>`}

		/* ---------- reports, each metric drills into its records ---------- */
		const scopePeople=()=>isHR()||P(ME()).lv===1&&U.scope==='all'?PART:[ME(),...below(ME())].filter(p=>P(p).lv>=1);
		function pageReports(){if(!canReports())return noAccess('Reports are for managers and HR.');const r=R();if(r.parts[1])return pageDrill(r.parts[1]);
		 const ppl=scopePeople(),gs=S.goals.filter(g=>shown(g)&&ppl.includes(g.owner)),ap=gs.filter(g=>g.status==='approved');
		 const has=p=>ap.some(g=>g.owner===p),pv=l=>l.map(goalPct).filter(x=>x!=null),avg=l=>{const v=pv(l);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null},al=ap.filter(aligned),dl=m=>'#/reports/'+m;
		 const lv=[1,2,3,4,5].map(l=>{const at=ppl.filter(p=>P(p).lv===l);return at.length?`<a class="lv" href="${dl('coverage-'+l)}"><span>${LEVELS[l]}</span><div class="bar"><i style="width:${Math.round(at.filter(has).length/at.length*100)}%"></i></div><em>${at.filter(has).length} of ${at.length}</em></a>`:''}).join('');
		 const pls=S.pillars.map(p=>{const l=al.filter(g=>rootPillar(g)===p.id),a=avg(l);return `<a class="lv" href="${dl('pillar-'+p.id)}"><span>${e(p.name)}</span><div class="bar"><i style="width:${a??0}%"></i></div><em>${a==null?'no data':a+'%'}</em></a>`}).join('');
		 const aps=S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&ppl.includes(a.emp)),a0=avg(ap),un=ap.filter(g=>!aligned(g));
		 return `<div class="ph"><div><h1>Reports & Analytics</h1><p class="muted">${e(cyc().name)} cycle · ${isHR()||P(ME()).lv===1&&U.scope==='all'?'everyone':'you and your team'}. Select any figure to see the records behind it.</p></div><span class="sp"></span>${P(ME()).lv===1?`<div class="seg"><button data-a="scope" data-s="all" aria-pressed="${U.scope==='all'}">Everyone</button><button data-a="scope" data-s="team" aria-pressed="${U.scope!=='all'}">My organisation</button></div>`:''}</div>
		 <div class="stats"><a class="stat" href="${dl('approved')}"><b>${ap.length}</b><span>approved goals${gs.length>ap.length?` · ${gs.length-ap.length} in progress`:''}</span></a><a class="stat" href="${dl('aligned')}"><b>${ap.length?Math.round(al.length/ap.length*100):0}%</b><span>trace to a pillar through accepted links (${al.length} of ${ap.length})</span></a><a class="stat" href="${dl('approved')}"><b>${a0==null?'–':a0+'%'}</b><span>average progress, from ${pv(ap).length} goals with data</span></a></div>
		 <div class="card"><h2 class="h2s">Appraisal progress</h2><div class="hbar">${['self','manager','calibration','ack','appeal','done'].map(s=>`<a class="pill ${s==='done'?'ok':'draft'}" href="${dl('ap-'+s)}">${STEPS[s]} · ${aps.filter(a=>a.step===s).length}</a>`).join('')}</div></div>
		 <div class="card"><h2 class="h2s">Health of approved goals</h2><div class="hbar">${Object.keys(HEALTH).map(h=>`<a class="pill ${HEALTH[h][1]}" href="${dl('health-'+h)}">${HEALTH[h][0]} · ${ap.filter(g=>health(g)===h).length}</a>`).join('')}</div><p class="small muted m0" style="margin-top:8px">From each goal’s latest check-in; older than ${STALE} days counts as overdue.</p></div>
		 <div class="two"><div class="card"><h2 class="h2s">Coverage by level</h2><p class="small muted m0">People with an approved goal</p>${lv}</div><div class="card"><h2 class="h2s">Progress by pillar</h2><p class="small muted m0">Each goal counted once, through its main alignment</p>${pls}</div></div>
		 <div class="card"><h2 class="h2s"><a href="${dl('unaligned')}">Not aligned to strategy (${un.length})</a></h2></div>`}
		function pageDrill(m){const ppl=scopePeople(),gs=S.goals.filter(g=>shown(g)&&ppl.includes(g.owner)),ap=gs.filter(g=>g.status==='approved');let title='',rows=null,aps=null;
		 if(m==='approved'){title='Approved goals';rows=ap}else if(m==='aligned'){title='Goals that trace to a pillar';rows=ap.filter(aligned)}else if(m==='unaligned'){title='Goals not aligned to strategy';rows=ap.filter(g=>!aligned(g))}
		 else if(m.startsWith('health-')){const h=m.slice(7);title='Health: '+(HEALTH[h]||['?'])[0];rows=ap.filter(g=>health(g)===h)}
		 else if(m.startsWith('pillar-')){const p=PL(m.slice(7));title='Goals under '+(p?p.name:'?');rows=ap.filter(g=>aligned(g)&&rootPillar(g)===m.slice(7))}
		 else if(m.startsWith('coverage-')){const l=+m.slice(9);title=LEVELS[l]+': approved goals';rows=ap.filter(g=>P(g.owner).lv===l)}
		 else if(m.startsWith('ap-')){const s=m.slice(3);title='Appraisals at '+(STEPS[s]||'?');aps=S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&ppl.includes(a.emp)&&a.step===s)}
		 else return notFound();
		 return `<div class="ph"><div><h1>${e(title)}</h1><p class="muted">${e(cyc().name)} cycle · ${(rows||aps).length} record${(rows||aps).length===1?'':'s'} · same scope and calculations as the report</p></div><span class="sp"></span><a class="btn" href="#/reports">← Back to reports</a></div>
		 <div class="rows">${rows?rows.map(g=>`<a class="row r4" href="${href('/goals/all',{goal:g.id})}"><span><b>${e(g.title)}</b><small>${e(P(g.owner).name)} · ${e(P(g.owner).dept)}</small></span><span class="small muted">Due ${fmt(g.due)}</span>${progHtml(g)}<span class="pills">${hpill(g)}</span></a>`).join(''):aps.map(a=>`<a class="row" href="#/appraisal/${a.id}"><span><b>${e(P(a.emp).name)}</b><small>${e(P(a.emp).title)}</small></span><span class="small">${STEPS[a.step]}</span><span class="small muted">${dueOf(a)?'Due '+fmt(dueOf(a)):''}</span></a>`).join('')}${!(rows||aps).length?'<div class="empty">No records.</div>':''}</div>`}
		const noAccess=m=>`<div class="ph"><div><h1>Not available</h1></div></div><div class="card"><p class="m0">${e(m)}</p><p><a class="btn" href="#/home">Back to Home</a></p></div>`;
		const notFound=()=>`<div class="ph"><div><h1>Page not found</h1></div></div><div class="card"><p class="m0">This address does not match a page or a record you can open. It may have been removed or archived.</p><p><a class="btn" href="#/home">Back to Home</a></p></div>`;

		/* ---------- performance appraisal workspace ---------- */
		const copy=x=>JSON.parse(JSON.stringify(x));
		const SECS=[['overview','Form overview',0],['profile','Employee profile',1],['objectives','Performance objectives',1],['tna','Training needs assessment',1],['summary','Overall performance summary',1],['comments','Comments',0],['attachments','Attachments',0],['history','Form history',0]];
		const secNo=id=>{if(!S.config.numbers)return '';const n=SECS.filter(s=>s[2]).findIndex(s=>s[0]===id);return n<0?'':String(n+1).padStart(2,'0')};
		const canSeeDev=d=>!!d&&(d.emp===ME()||below(ME()).includes(d.emp)||isHR());
		function workAp(id){const a0=AP(id);if(!U.ap||U.ap.id!==id||!U.ap.dirty)U.ap={id,d:copy(a0),dirty:U.ap&&U.ap.id===id?U.ap.dirty:false};return U.ap.d}
		const ratingSel=(key,v,lbl)=>`<select class="in sm" data-ap="${key}" data-key="ap-${key}" id="${key.replace(/\./g,'-').replace(/^r-/,'')}" aria-label="${e(lbl)}"><option value="">Select rating</option>${S.config.scale.map(s=>`<option value="${s.v}" ${num(v)===s.v?'selected':''}>${s.v} · ${e(s.label)}</option>`).join('')}</select>`;
		const rText=v=>num(v)==null?'<span class="muted">Not rated</span>':`${v} · ${e(scaleLabel(num(v)))}`;
		function gauge(v,max){const p=v==null?0:v/max,c=2*Math.PI*44;return `<svg class="gauge" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="gt"/><circle cx="50" cy="50" r="44" class="gv" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 50 50)"/></svg>`}
		function pageAppraisal(id){const a0=AP(id);if(!a0)return notFound();if(!canSeeAp(a0))return noAccess('You do not have access to this appraisal.');
		 const a=workAp(id),me=ME(),isEmp=a.emp===me,c=CYC(a.cycle),owner=ownerOf(a)===me&&a.step!=='done'&&!c.closed,can=s=>owner&&a.step===s,p=P(a.emp),os=objectives(a),theme=S.theme==='gold'?'gold':'light';
		 const showEmp=isEmp||a.step!=='self',showMgr=!isEmp||empSees(a),showCal=!isEmp,mgr=P(a.emp).mgr,dl=dueOf(a),errs=U.apErr&&U.apErr.id===id?U.apErr.list:[];
		 const f=flow(),seq=[...f,'appeal','done'],ci=a.step==='done'?seq.length:seq.indexOf(a.step);
		 const stState=s=>{if(s==='appeal'){if(a.step==='appeal')return 'cur';if(a.appeal)return 'done';if(a.step==='done'||(a.ack&&a.ack.decision==='accept'))return 'skp';return 'cond'}if(s==='done')return a.step==='done'?'done':'up';const i=seq.indexOf(s);return a.step==='done'||i<ci&&!(a.step==='appeal'&&false)?'done':i===ci?'cur':'up'};
		 const tl=`<ol class="tl">${seq.map(s=>{const st=stState(s);return `<li class="${st}"><button data-a="stepinfo" data-s="${s}" aria-label="${STEPS[s]}: ${({done:'completed',cur:'current step',up:'upcoming',skp:'skipped',cond:'only if the employee appeals'})[st]}"><span class="dot">${st==='done'?icon('check'):''}</span><span class="tlt">${STEPS[s]}<small>${({done:'Completed',cur:'In progress',up:'Upcoming',skp:'Not needed',cond:'Only if appealed'})[st]}</small></span></button></li>`}).join('')}</ol>`;
		 const submitLbl={self:'Submit to manager',manager:'Submit to '+STEPS[nextOf(a)],calibration:'Release to employee',appeal:'Close appeal'}[a.step];
		 const canReturn=(can('manager'))||(can('calibration'));
		 const head=`<div class="aph"><div class="aphl"><span class="mk">AJMN</span><div><p class="eyebrow">People · Performance · Development · Impact</p><h1>${e(c.name)} Performance Appraisal</h1><p class="aps">${e(p.name)} · ${e(p.title)}</p></div></div>
		  <div class="thm" role="group" aria-label="Form theme"><button data-a="theme" data-t="light" aria-pressed="${theme==='light'}">Broadcast Light</button><button data-a="theme" data-t="gold" aria-pressed="${theme==='gold'}">Executive Gold</button></div></div>${tl}`;
		 const bar=`<div class="apbar"><span class="pill ${a.step==='done'?'ok':'wait'}">${a.step==='done'?'Completed':'In progress'}</span><span class="small">${STEPS[a.step]}${a.step!=='done'&&ownerOf(a)?' · with '+e(P(ownerOf(a)).name):''}${dl&&a.step!=='done'?' · due '+fmt(dl):''}</span>
		  <span class="small muted" id="savest">${U.ap.dirty?'Unsaved changes':'Saved '+fmt(a.saved)}</span><span class="sp"></span>
		  <details class="menu"><summary class="btn sm">Actions</summary><div class="pop">${canReturn?`<button data-a="apretopen">Return for revision</button>`:''}<a href="${href(isEmp?'/goals':'/goals/all',isEmp?{}:{owner:a.emp})}">Open goal plan</a><a href="#/performance">All appraisals</a></div></details>
		  <button class="btn sm" data-a="print">${icon('print')} Print / Save as PDF</button>${owner&&a.step!=='ack'?`<button class="btn sm" data-a="apsave">Save draft</button><button class="btn sm pri" data-a="apsubmit">${submitLbl}</button>`:''}</div>
		  ${U.ret===id?`<div class="banner"><label class="block small" for="retmsg"><b>Return to ${STEPS[prevOf(a)]}</b> · say what needs to change</label><textarea class="in" id="retmsg" maxlength="500"></textarea><p class="m0" style="margin-top:8px"><button class="btn sm pri" data-a="apreturn">Return</button> <button class="btn sm" data-a="apretcancel">Cancel</button></p></div>`:''}
		  ${U.apSaveErr===id?'<div class="banner bad" role="alert">Saving failed. Your changes are still on this page and the last saved version is unchanged. Try again.</div>':''}
		  ${errs.length?`<div class="banner bad" role="alert"><b>${errs.length} item${errs.length===1?'':'s'} to fix before submitting:</b><ul>${errs.map(x=>`<li><button class="link" data-a="jump" data-s="${x.s}" data-el="${x.el||''}">${e(x.t)}</button></li>`).join('')}</ul></div>`:''}
		  ${a.back&&owner?`<div class="banner">Returned for revision: “${e(a.back)}”</div>`:''}`;
		 const sh=(id,extra)=>{const s=SECS.find(x=>x[0]===id),n=s[2]?secNo(id):'';return `<div class="csh">${n?`<span class="sn">${n}</span>`:''}<h2>${s[1]}</h2>${extra||''}</div>`};
		 const ov=`<section class="cs" id="s-overview">${sh('overview')}<div class="kv"><div><small>Review period</small>${fmt(c.start)} – ${fmt(c.end)}</div><div><small>Route</small>${f.map(s=>STEPS[s]).join(' → ')}${S.config.appeal?' (→ HR appeal review if appealed)':''}</div><div><small>Current step</small>${STEPS[a.step]}</div><div><small>With</small>${a.step!=='done'&&ownerOf(a)?e(P(ownerOf(a)).name):'–'}</div><div><small>Step due</small>${dl&&a.step!=='done'?fmt(dl):'–'}</div></div>
		  <p class="small muted m0" style="margin-top:10px">${a.frozen?'This form keeps the version of each goal from when the manager review was submitted. Later goal changes do not alter it; the link to each goal is kept.':'Until the manager review is submitted, objectives come live from the employee’s approved goals.'}</p></section>`;
		 const prof=`<section class="cs" id="s-profile">${sh('profile')}<div class="kv">${[['Name',p.name],['Employee ID',p.eid],['Job title',p.title],['Department',p.dept],['Manager',mgr?P(mgr).name:'–'],['Division / channel',p.div]].map(([k,v])=>`<div><small>${k}</small>${e(v)}</div>`).join('')}</div></section>`;
		 const wsum=os.reduce((s,o)=>s+(num(o.weight)||0),0);
		 const orow=(o,i)=>{const r=a.r[o.id]||{},lv=o.live,chg=a.frozen&&lv&&(lv.title!==o.title||lv.weight!==o.weight);return `<tr><td>${i+1}</td><td class="ot"><a href="${href(lv&&lv.owner===me?'/goals':'/goals/all',{goal:o.id})}">${e(o.title)}</a><small>${o.align?'Supports: '+e(o.align):'<span class="flag">Not aligned</span>'} · <a href="${href('/strategy',{focus:o.id})}">path to strategy</a></small>${chg?'<small class="flag">The goal changed after this form was submitted; the form keeps the submitted version.</small>':''}</td>
		  <td class="num">${o.weight==null?'<span class="flag">–</span>':o.weight+'%'}</td><td class="ach">${pbar(o.pct)}</td>
		  <td>${showEmp?(can('self')?ratingSel(`r.${o.id}.er`,r.er,'Employee rating for objective '+(i+1))+`<textarea class="in sm" data-ap="r.${o.id}.ec" data-key="ap-r.${o.id}.ec" rows="2" placeholder="Your comment" aria-label="Employee comment for objective ${i+1}">${e(r.ec||'')}</textarea>`:`${rText(r.er)}${r.ec?`<div class="small">${e(r.ec)}</div>`:''}`):'<span class="muted small">Not submitted yet</span>'}</td>
		  <td>${showMgr?(can('manager')?ratingSel(`r.${o.id}.mr`,r.mr,'Manager rating for objective '+(i+1))+`<textarea class="in sm" data-ap="r.${o.id}.mc" data-key="ap-r.${o.id}.mc" rows="2" placeholder="Manager comment" aria-label="Manager comment for objective ${i+1}">${e(r.mc||'')}</textarea>`:a.step==='self'?'<span class="muted small">After self-assessment</span>':`${rText(r.mr)}${r.mc?`<div class="small">${e(r.mc)}</div>`:''}`):'<span class="muted small">Shown at acknowledgement</span>'}</td>
		  <td>${can('self')?`<input class="in sm" data-ap="r.${o.id}.ev" data-key="ap-r.${o.id}.ev" value="${e(r.ev||'')}" placeholder="Report, link or note" aria-label="Evidence for objective ${i+1}">`:e(r.ev||'–')}</td></tr>`};
		 const obj=`<section class="cs" id="s-objectives">${sh('objectives',`<span class="chip">Contributes 100% to the overall rating</span>`)}<p class="small muted m0">Achievement is each goal’s measured progress, for reference. It does not set a rating; ratings are chosen by the employee and the manager.</p>
		  <div class="tw"><table class="tbl"><thead><tr><th>#</th><th>Objective and alignment</th><th>Weight</th><th>Achievement</th><th>Employee rating and comment</th><th>Manager rating and comment</th><th>Evidence</th></tr></thead><tbody>${os.map(orow).join('')||'<tr><td colspan="7" class="empty">No approved goals with a weight in this cycle.</td></tr>'}</tbody>
		  <tfoot><tr><td></td><td>Total weight</td><td class="num ${wsum!==100?'flag':''}">${wsum}%</td><td colspan="4">${wsum!==100?'<span class="flag">Must total 100% before submitting. Weights come from the goals in My Goals.</span>':''}</td></tr></tfoot></table></div></section>`;
		 const tnaVis=!isEmp||a.frozen,rows=a.tna,max=S.config.tnaMax,edit=can('manager');
		 const trow=(t,i)=>`<tr><td>${i+1}</td>${edit?`<td><input class="in sm" data-ap="tna.${i}.area" data-key="ap-tna.${i}.area" value="${e(t.area)}" placeholder="Development area" aria-label="Development area ${i+1}"></td><td><input class="in sm" data-ap="tna.${i}.gap" data-key="ap-tna.${i}.gap" value="${e(t.gap)}" placeholder="Capability gap" aria-label="Capability gap ${i+1}"></td>
		  <td><select class="in sm" data-ap="tna.${i}.learningId" aria-label="Learning intervention ${i+1}"><option value="">Other (describe in outcome)</option>${S.learning.map(l=>`<option value="${l.id}" ${t.learningId===l.id?'selected':''}>${e(l.title)}</option>`).join('')}</select></td><td><input class="in sm" data-ap="tna.${i}.outcome" data-key="ap-tna.${i}.outcome" value="${e(t.outcome)}" placeholder="Expected outcome" aria-label="Expected outcome ${i+1}"></td><td><input class="in sm" type="date" data-ap="tna.${i}.due" value="${e(t.due)}" aria-label="Target date ${i+1}"></td>`
		  :`<td>${e(t.area)}</td><td>${e(t.gap)}</td><td>${t.learningId&&LR(t.learningId)?e(LR(t.learningId).title):'Other'}</td><td>${e(t.outcome)}</td><td>${fmt(t.due)||'–'}</td>`}
		  <td>${t.devId&&DV(t.devId)?(canSeeDev(DV(t.devId))?`<a href="#/development/${t.devId}">Open record</a>`:'Linked'):'<span class="muted small">Created on submit</span>'}</td><td>${edit?`<button class="x" data-a="tnadel" data-i="${i}" aria-label="Remove training need ${i+1}">×</button>`:''}</td></tr>`;
		 const tna=`<section class="cs" id="s-tna">${sh('tna',`<span class="chip warn">Manager required</span><span class="chip">Development plan: Training Needs Assessment</span><span class="chip">Not scored</span>`)}
		  ${!tnaVis?'<p class="muted m0">Your manager completes this section during the manager review. You will see it once it is submitted.</p>':`<p class="small muted m0">Up to ${max} training needs. Each becomes a record in the Training Needs Assessment development plan when the manager review is submitted.</p>
		  <div class="tw"><table class="tbl"><thead><tr><th>#</th><th>Development area</th><th>Capability gap</th><th>Proposed learning</th><th>Expected outcome</th><th>Target date</th><th>Development record</th><th></th></tr></thead><tbody>${rows.map(trow).join('')||'<tr><td colspan="8" class="empty">No training needs yet.</td></tr>'}</tbody></table></div>
		  ${edit?`<p>${rows.length<max?'<button class="btn sm" data-a="tnaadd">+ Add training need</button>':`<span class="small muted">Maximum of ${max} training needs reached.</span>`}</p>`:''}
		  ${S.config.noTnaAllowed&&(edit||a.noTna.on)?`<label class="block"><input type="checkbox" data-ap="noTna.on" ${a.noTna.on?'checked':''} ${edit?'':'disabled'}> No training needs identified</label>${a.noTna.on?(edit?`<input class="in" id="nonereason" data-ap="noTna.reason" data-key="ap-noTna.reason" value="${e(a.noTna.reason)}" placeholder="Reason (required)" aria-label="Reason for no training needs">`:`<p class="small">Reason: ${e(a.noTna.reason)}</p>`):''}`:''}`}</section>`;
		 const selfMode=isEmp&&!empSees(a),sc=selfMode?overall(a,'er'):overall(a,'mr'),fr=finalRating(a),shownFinal=a.step==='done'?a.final:showCal||empSees(a)?(a.calib.rating??null):null,big=a.step==='done'?a.final:(shownFinal??(sc.ok?sc.v:null));
		 const sum=`<section class="cs" id="s-summary">${sh('summary')}<div class="sumg"><div class="gw">${gauge(big,5)}<div class="gl"><b>${big==null?'–':big.toFixed?big.toFixed(S.config.decimals):big}</b><small>of 5</small></div></div>
		  <div><p class="small muted m0">${a.step==='done'?'Final rating':shownFinal!=null?'Calibrated rating':selfMode?'Your self-rating (not the final rating)':'Calculated rating'}</p><p class="rl">${big==null?'<span class="muted">Not available yet</span>':e(scaleLabel(Math.round(big)))}</p>${!sc.ok&&big==null?`<p class="small flag m0">${e(sc.why)}</p>`:''}
		  <p class="small muted">Rule: rating × objective weight, summed and divided by 100, rounded to ${S.config.decimals} decimal places; the label is the nearest whole point on the ${S.config.scale.length}-point scale.</p></div>
		  <table class="tbl comp"><thead><tr><th>Component</th><th>Weight</th><th>Score</th></tr></thead><tbody><tr><td>Performance objectives</td><td>100%</td><td>${sc.ok?sc.v.toFixed(S.config.decimals):'–'}</td></tr><tr><td>Training needs assessment</td><td>–</td><td>Not scored</td></tr></tbody></table></div>
		  <div class="two"><div><label class="f" for="empsum">Employee summary</label>${can('self')?`<textarea class="in" id="empsum" data-ap="empSum" data-key="ap-empSum" maxlength="2000">${e(a.empSum)}</textarea>`:`<p>${showEmp?e(a.empSum)||'–':'<span class="muted">Not submitted yet</span>'}</p>`}</div>
		  <div><label class="f" for="mgrsum">Manager summary ${can('manager')?'<span class="flag">*</span>':''}</label>${can('manager')?`<textarea class="in" id="mgrsum" data-ap="mgrSum" data-key="ap-mgrSum" maxlength="2000">${e(a.mgrSum)}</textarea>`:`<p>${showMgr&&a.step!=='self'?e(a.mgrSum)||'–':'<span class="muted">Shown at acknowledgement</span>'}</p>`}</div></div>
		  ${showCal&&(S.config.calibration||a.calib.rating!=null)?`<div class="calb"><h3>Calibration <span class="muted small">· visible to managers and HR only</span></h3>${can('calibration')?`<label class="f" for="calr">Calibrated rating <span class="muted small">(leave blank to keep the calculated rating)</span></label><select class="in sm" id="calr" data-ap="calib.rating"><option value="">Keep calculated</option>${S.config.scale.map(s=>`<option value="${s.v}" ${a.calib.rating===s.v?'selected':''}>${s.v} · ${e(s.label)}</option>`).join('')}</select><label class="f" for="calnote">Calibration note</label><textarea class="in" id="calnote" data-ap="calib.note" data-key="ap-calib.note">${e(a.calib.note)}</textarea>`
		   :`<p class="m0">${a.calib.rating!=null?rText(a.calib.rating):'<span class="muted">Not calibrated yet</span>'}${a.calib.note?' · '+e(a.calib.note):''}</p>`}</div>`:''}
		  ${can('ack')?`<div class="calb"><h3>Your acknowledgement</h3><p class="small">Final rating: <b>${fr!=null?rText(fr):sc.ok?rText(Math.round(sc.v)):'–'}</b>. Acknowledge to complete the form, or appeal to HR with a reason.</p><textarea class="in" id="appealtxt" placeholder="Reason for appeal (required to appeal)" maxlength="1000"></textarea><p style="margin-top:8px"><button class="btn pri sm" data-a="apack" data-d="accept">Acknowledge</button> <button class="btn sm" data-a="apack" data-d="appeal">Appeal to HR</button></p></div>`:''}
		  ${a.appeal?`<div class="calb"><h3>Appeal</h3><p class="small">Employee’s reason: “${e(a.appeal.reason)}”</p>${can('appeal')?`<label class="block"><input type="radio" name="apd" value="uphold" ${a.appeal.decision!=='revise'?'checked':''} data-ap="appeal.decision"> Uphold the rating</label><label class="block"><input type="radio" name="apd" value="revise" ${a.appeal.decision==='revise'?'checked':''} data-ap="appeal.decision"> Revise the rating to <select class="in sm" data-ap="appeal.rating" aria-label="Revised rating">${S.config.scale.map(s=>`<option value="${s.v}" ${a.appeal.rating===s.v?'selected':''}>${s.v} · ${e(s.label)}</option>`).join('')}</select></label><label class="f" for="apnote">Decision note <span class="flag">*</span></label><textarea class="in" id="apnote" data-ap="appeal.note" data-key="ap-appeal.note">${e(a.appeal.note||'')}</textarea>`
		   :a.appeal.note?`<p class="small m0">HR decision: ${a.appeal.decision==='revise'?'rating revised to '+rText(a.appeal.rating):'rating upheld'} · ${e(a.appeal.note)}</p>`:'<p class="small muted m0">Waiting for HR.</p>'}</div>`:''}</section>`;
		 const com=`<section class="cs" id="s-comments">${sh('comments')}<ul class="hist">${a.comments.map(x=>`<li>${fmt(x.at)} · <b>${e(P(x.by).name)}</b> · ${e(x.t)}</li>`).join('')||'<li>No comments yet.</li>'}</ul>${a.step!=='done'?`<div class="row2"><input class="in" id="newcom" maxlength="500" placeholder="Add a comment for everyone who can open this form" aria-label="New comment"><button class="btn sm" data-a="apcomment">Add</button></div>`:''}</section>`;
		 const att=`<section class="cs" id="s-attachments">${sh('attachments')}<p class="small muted m0">Only the file name and size are kept in this prototype; files are not uploaded or stored.</p><ul class="hist">${a.files.map(x=>`<li>${e(x.name)} · ${Math.max(1,Math.round(x.size/1024))} KB · ${e(P(x.by).name)} · ${fmt(x.at)}</li>`).join('')||'<li>No attachments.</li>'}</ul>${a.step!=='done'?`<label class="btn sm">Add file <input type="file" data-a="apfile" hidden></label>`:''}</section>`;
		 const his=`<section class="cs" id="s-history">${sh('history')}<ul class="hist">${a.hist.slice().reverse().map(h=>`<li>${fmt(h.at)} · <b>${e(P(h.by).name)}</b> · ${e(h.w)}</li>`).join('')}</ul></section>`;
		 return `<div class="apf ${theme}">${head}${bar}<div class="apw"><nav class="apn" aria-label="Form sections"><div class="apnp"><span class="av">${p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</span><div><b>${e(p.name)}</b><small>Employee ID ${e(p.eid)}</small></div></div>${SECS.map(([sid,l,num_])=>`<button data-a="jump" data-s="${sid}">${num_&&secNo(sid)?`<span class="sn2">${secNo(sid)}</span>`:''}${l}${sid==='attachments'?` (${a.files.length})`:sid==='comments'?` (${a.comments.length})`:''}</button>`).join('')}</nav>
		 <div class="apc">${ov}${prof}${obj}${tna}${sum}${com}${att}${his}</div></div></div>`}
		function setPath(o,path,v){const k=path.split('.');let x=o;for(let i=0;i<k.length-1;i++){if(x[k[i]]==null)x[k[i]]={};x=x[k[i]]}x[k[k.length-1]]=v}
		/* only the step owner changes a form; every change is committed only if saving succeeds, so the last saved version stays intact */
		function commitAp(a,msg){const i=S.appraisals.findIndex(x=>x.id===a.id),prev=S.appraisals[i];a.saved=TODAY;if(msg)a.hist.push({at:TODAY,by:ME(),w:msg});S.appraisals[i]=copy(a);
		 if(!saveNow()){S.appraisals[i]=prev;a.hist.pop();U.apSaveErr=a.id;render();return false}U.apSaveErr=null;U.ap=null;U.apErr=null;return true}
		function apOwnerOk(a){const c=CYC(a.cycle);return ownerOf(a)===ME()&&a.step!=='done'&&!c.closed}
		function syncDev(a){const keep=new Set();a.tna.filter(t=>t.area.trim()).forEach(t=>{let d=t.devId&&DV(t.devId);const f={area:t.area.trim(),gap:t.gap.trim(),learningId:t.learningId||'',outcome:t.outcome.trim(),due:t.due};
		  if(d){Object.assign(d,f);d.hist.push({at:TODAY,by:ME(),w:'Updated from the appraisal'})}else{d=Object.assign({id:'dv'+(S.seq++),emp:a.emp,cycle:a.cycle,plan:'tna',status:'Planned',source:a.id,hist:[{at:TODAY,by:ME(),w:`Created from the ${CYC(a.cycle).name} appraisal`}]},f);S.dev.push(d);t.devId=d.id}keep.add(d.id)});
		 S.dev.filter(d=>d.source===a.id&&!keep.has(d.id)&&d.status!=='Withdrawn').forEach(d=>{d.status='Withdrawn';d.hist.push({at:TODAY,by:ME(),w:'Removed from the appraisal'})})}

		/* ---------- performance list, team, development, training ---------- */
		function pageCycleTitle(t,sub,right){return `<div class="ph"><div><h1>${t}</h1><p class="muted">${sub||e(cyc().name)+' cycle'}</p></div><span class="sp"></span>${right||''}</div>`}
		const apRow=a=>`<a class="row" href="#/appraisal/${a.id}"><span><b>${e(P(a.emp).name)}</b><small>${e(P(a.emp).title)} · ${e(CYC(a.cycle).name)}</small></span><span class="small">${STEPS[a.step]}${a.step!=='done'&&ownerOf(a)?' · with '+e(P(ownerOf(a)).name):''}</span><span class="small muted">${a.step!=='done'&&dueOf(a)?'Due '+fmt(dueOf(a)):''}</span></a>`;
		function pagePerformance(){const me=ME(),mine=S.appraisals.filter(a=>a.emp===me),cur=mine.find(a=>a.cycle===S.cycle),team=S.appraisals.filter(a=>a.cycle===S.cycle&&a.emp!==me&&below(me).includes(a.emp)),all=isHR()?S.appraisals.filter(a=>a.cycle===S.cycle):[];
		 return pageCycleTitle('Performance')+(isPart()?`<div class="card"><h2 class="h2s">My appraisal</h2>${cur?`<div class="rows">${apRow(cur)}</div>`:'<p class="muted m0">No appraisal has been launched for you in this cycle.</p>'}${mine.filter(a=>a.cycle!==S.cycle).length?`<details class="mt"><summary>Other cycles</summary><div class="rows">${mine.filter(a=>a.cycle!==S.cycle).map(apRow).join('')}</div></details>`:''}</div>`:'')
		 +(team.length?`<div class="card"><h2 class="h2s">My team’s appraisals</h2><div class="rows">${team.map(apRow).join('')}</div></div>`:'')+(all.length?`<div class="card"><h2 class="h2s">All appraisals (HR)</h2><div class="rows">${all.map(apRow).join('')}</div></div>`:'')
		 +(!isPart()&&!isHR()?'<div class="card"><p class="m0 muted">Appraisals are for employees, their managers and HR.</p></div>':'')}
		function pageTeam(){if(!hasTeam())return noAccess('My Team is for people with direct reports.');const me=ME(),ppl=P(me).lv<=2?below(me):reports(me);
		 return pageCycleTitle('My Team',`${e(cyc().name)} cycle · ${P(me).lv<=2?'everyone in your organisation':'your direct reports'}`)+`<div class="tw card np"><table class="tbl"><thead><tr><th>Person</th><th>Goals</th><th>Average progress</th><th>Needs attention</th><th>Appraisal</th><th>Training needs</th></tr></thead><tbody>${ppl.map(u=>{const gs=S.goals.filter(g=>g.owner===u&&shown(g)),ap=gs.filter(g=>g.status==='approved'),pv=ap.map(goalPct).filter(x=>x!=null),av=pv.length?Math.round(pv.reduce((a,b)=>a+b,0)/pv.length):null,a=myAp(u),att=gs.filter(g=>g.status==='submitted'||['off','risk','stale','none'].includes(g.status==='approved'?health(g):'x')).length,tn=S.dev.filter(d=>d.emp===u&&d.cycle===S.cycle&&d.status!=='Withdrawn').length;
		  return `<tr><td><b>${e(P(u).name)}</b><div class="small muted">${e(P(u).title)}</div></td><td><a href="${href('/goals/all',{owner:u})}">${ap.length} approved${gs.length>ap.length?` · ${gs.length-ap.length} other`:''}</a></td><td>${pbar(av)}</td><td>${att?`<span class="pill wait">${att}</span>`:'–'}</td><td>${a?`<a href="#/appraisal/${a.id}">${STEPS[a.step]}</a>`:'<span class="muted">Not launched</span>'}</td><td>${tn?`<a href="#/training">${tn}</a>`:'–'}</td></tr>`}).join('')}</tbody></table></div>`}
		const devRow=d=>`<a class="row" href="#/development/${d.id}"><span><b>${e(d.area)}</b><small>${e(P(d.emp).name)} · ${d.learningId&&LR(d.learningId)?e(LR(d.learningId).title):'No catalogue course'} · target ${fmt(d.due)||'–'}</small></span><span class="small">${e(d.status)}</span><span class="small muted">From ${e(CYC(d.cycle).name)} appraisal</span></a>`;
		function pageDevelopment(){const r=R();if(r.parts[1])return pageDevRecord(r.parts[1]);if(!isPart())return noAccess('Development records are for people with goals.');const ds=S.dev.filter(d=>d.emp===ME());
		 return pageCycleTitle('My Development','Your development plans')+`<div class="card"><h2 class="h2s">Training Needs Assessment plan</h2><p class="small muted m0">Agreed with your manager in your appraisal.</p><div class="rows mt">${ds.map(devRow).join('')||'<div class="empty">No training needs recorded for you yet.</div>'}</div></div>
		 <div class="card"><h2 class="h2s">Career development plan</h2><p class="m0"><span class="tag t-na">Not configured</span> Career development plans are not set up in this platform yet.</p></div>`}
		function pageDevRecord(id){const d=DV(id);if(!d)return notFound();if(!canSeeDev(d))return noAccess('You do not have access to this development record.');const l=d.learningId&&LR(d.learningId),a=AP(d.source),edit=d.emp===ME()||P(d.emp).mgr===ME();
		 return `<div class="ph"><div><h1>${e(d.area)}</h1><p class="muted">${e(P(d.emp).name)} · Training Needs Assessment plan · ${e(CYC(d.cycle).name)}</p></div></div>
		 <div class="card"><div class="kv">${[['Capability gap',d.gap||'–'],['Expected outcome',d.outcome||'–'],['Target date',fmt(d.due)||'–'],['Status',d.status]].map(([k,v])=>`<div><small>${k}</small>${e(v)}</div>`).join('')}</div>
		 ${edit&&d.status!=='Withdrawn'?`<label class="f" for="dvst">Update status</label><select class="in sm" id="dvst" data-a="dvstatus" data-id="${d.id}" style="max-width:220px">${['Planned','In progress','Completed'].map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select>`:''}</div>
		 <div class="card"><h2 class="h2s">Learning</h2>${l?`<p class="m0"><a href="#/learning/${l.id}">${e(l.title)}</a> · ${e(l.format)}</p>`:'<p class="m0 muted">No catalogue course is linked. The intervention is described in the expected outcome.</p>'}</div>
		 <div class="card"><h2 class="h2s">Source</h2>${a&&canSeeAp(a)?`<p class="m0"><a href="${href('/appraisal/'+a.id,{s:'tna'})}">${e(CYC(a.cycle).name)} Performance Appraisal · training needs section</a></p>`:'<p class="m0 muted">The source appraisal is not available to you.</p>'}<ul class="hist mt">${d.hist.slice().reverse().map(h=>`<li>${fmt(h.at)} · <b>${e(P(h.by).name)}</b> · ${e(h.w)}</li>`).join('')}</ul></div>`}
		function pageTraining(){if(!isPart())return noAccess('Training needs are for people with goals.');const me=ME(),mine=S.dev.filter(d=>d.emp===me&&d.plan==='tna'),team=S.dev.filter(d=>below(me).includes(d.emp)&&d.plan==='tna'),pend=S.appraisals.filter(a=>a.cycle===S.cycle&&a.step==='manager'&&ownerOf(a)===me);
		 return pageCycleTitle('Training Needs','Training Needs Assessment plan · records created from appraisals')+(pend.length?`<div class="card"><h2 class="h2s">To complete in your team’s appraisals</h2><div class="rows">${pend.map(a=>`<a class="row" href="${href('/appraisal/'+a.id,{s:'tna'})}"><span><b>${e(P(a.emp).name)}</b><small>${a.tna.filter(t=>t.area.trim()).length} of up to ${S.config.tnaMax} training needs</small></span><span class="small">Manager review</span><span></span></a>`).join('')}</div></div>`:'')
		 +`<div class="card"><h2 class="h2s">Mine</h2><div class="rows">${mine.map(devRow).join('')||'<div class="empty">None yet.</div>'}</div></div>${team.length?`<div class="card"><h2 class="h2s">My team</h2><div class="rows">${team.map(devRow).join('')}</div></div>`:''}`}

		/* ---------- continuous performance: activities and feedback, each tied to a goal ---------- */
		function pageActivities(){if(!isPart())return noAccess('Continuous performance is for people with goals.');const r=R(),me=ME(),tab=r.q.tab==='feedback'?'feedback':'activities',myGoals=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle&&g.status==='approved'&&!g.archived),fg=r.q.goal&&G(r.q.goal);
		 const tabs=`<div class="seg mb"><a href="${href('/activities',{})}" aria-current="${tab==='activities'?'page':'false'}">Activities</a><a href="${href('/activities',{tab:'feedback'})}" aria-current="${tab==='feedback'?'page':'false'}">Feedback</a></div>`;
		 if(tab==='activities'){const acts=S.activities.filter(x=>(x.owner===me||below(me).includes(x.owner))&&(!fg||x.goalId===fg.id));
		  return pageCycleTitle('Continuous Performance','Activities and feedback that support your goals',`<a class="btn pri" href="${href('/activities',{new:1})}">Create Activity</a>`)+tabs+(fg?`<div class="banner info">Activities supporting <b>${e(fg.title)}</b>. <a href="#/activities">Show all</a></div>`:'')
		  +(r.q.new?`<div class="card"><h2 class="h2s">New activity</h2><label class="f" for="actt">What did you do or plan?</label><input class="in" id="actt" maxlength="200"><label class="f" for="actg">Supports which goal?</label><select class="in" id="actg">${myGoals.map(g=>`<option value="${g.id}">${e(g.title)}</option>`).join('')}</select><label class="f" for="acts">Status</label><select class="in" id="acts"><option>Not started</option><option>In progress</option><option>Done</option></select><label class="f" for="actn">Notes</label><textarea class="in" id="actn" maxlength="500"></textarea><div class="err" id="acterr" hidden></div><p><button class="btn pri" data-a="actsave">Save activity</button> <a class="btn" href="#/activities">Cancel</a></p></div>`:'')
		  +`<div class="rows">${acts.map(x=>{const g=G(x.goalId);return `<div class="row"><span><b>${e(x.title)}</b><small>${e(P(x.owner).name)} · ${fmt(x.at)}${x.notes?' · '+e(x.notes):''}</small></span><span class="small">${g&&canSee(g)?`Supports <a href="${href(g.owner===me?'/goals':'/goals/all',{goal:g.id})}">${e(g.title)}</a>`:'Goal not available'}</span><span class="small">${e(x.status)}</span></div>`}).join('')||'<div class="empty">No activities yet.</div>'}</div>`}
		 const inq=S.feedback.filter(f=>f.to===me),outq=S.feedback.filter(f=>f.from===me),others=PART.filter(p=>p!==me);
		 return pageCycleTitle('Continuous Performance','Activities and feedback that support your goals',`<a class="btn pri" href="${href('/activities',{tab:'feedback',new:1})}">Request Feedback</a>`)+tabs
		 +(r.q.new?`<div class="card"><h2 class="h2s">Request feedback</h2><label class="f" for="fbto">From</label><select class="in" id="fbto">${others.map(p=>`<option value="${p}">${e(P(p).name)} · ${e(P(p).title)}</option>`).join('')}</select><label class="f" for="fbg">About which goal? <span class="muted small">(optional)</span></label><select class="in" id="fbg"><option value="">No specific goal</option>${myGoals.map(g=>`<option value="${g.id}">${e(g.title)}</option>`).join('')}</select><label class="f" for="fbq">Your question</label><textarea class="in" id="fbq" maxlength="500"></textarea><div class="err" id="fberr" hidden></div><p><button class="btn pri" data-a="fbsend">Send request</button> <a class="btn" href="${href('/activities',{tab:'feedback'})}">Cancel</a></p></div>`:'')
		 +`<div class="card"><h2 class="h2s">Requests to you</h2>${inq.map(f=>`<div class="fbi ${r.q.fb===f.id?'hl':''}"><p class="m0"><b>${e(P(f.from).name)}</b> asks: “${e(f.q)}”${f.goalId&&G(f.goalId)?` · about <a href="${href('/goals/all',{goal:f.goalId})}">${e(G(f.goalId).title)}</a>`:''}</p>${f.status==='requested'?`<textarea class="in" id="fba-${f.id}" maxlength="1000" placeholder="Your feedback"></textarea><p><button class="btn sm pri" data-a="fbgive" data-id="${f.id}">Send feedback</button> <button class="btn sm" data-a="fbdecline" data-id="${f.id}">Decline</button></p>`:`<p class="small muted m0">${f.status==='given'?'You answered: “'+e(f.a)+'”':'Declined'}</p>`}</div>`).join('')||'<p class="muted m0">No requests.</p>'}</div>
		 <div class="card"><h2 class="h2s">Requests you sent</h2>${outq.map(f=>`<div class="fbi"><p class="m0">To <b>${e(P(f.to).name)}</b>: “${e(f.q)}” · ${f.status==='requested'?'<span class="pill wait">Waiting</span>':f.status==='given'?'<span class="pill ok">Answered</span>':'<span class="pill draft">Declined</span>'}</p>${f.status==='given'?`<p class="small m0">“${e(f.a)}”</p>`:''}</div>`).join('')||'<p class="muted m0">None yet.</p>'}</div>`}

		/* ---------- learning (sample catalogue), approvals, admin, unavailable apps ---------- */
		function pageLearning(){const r=R();if(r.parts[1]){const l=LR(r.parts[1]);if(!l)return notFound();const ds=S.dev.filter(d=>d.learningId===l.id&&canSeeDev(d));
		  return `<div class="ph"><div><h1>${e(l.title)}</h1><p class="muted">${e(l.format)} · ${e(l.provider)}</p></div></div><div class="banner">Sample catalogue entry. Enrolment is not connected to a learning system.</div><div class="card"><h2 class="h2s">Linked development records you can see</h2><div class="rows">${ds.map(devRow).join('')||'<div class="empty">None.</div>'}</div></div>`}
		 return pageCycleTitle('Learning','Sample catalogue · not connected to a learning system')+`<div class="tiles">${S.learning.map(l=>`<a class="tile" href="#/learning/${l.id}"><span class="ti">${icon('book')}</span><b>${e(l.title)}</b><span class="muted small">${e(l.format)}</span><span class="tag t-sample">Sample</span></a>`).join('')}</div>`}
		function pageApprovals(){const T=tasks(),groups=[...new Set(T.map(t=>t.type))];
		 return pageCycleTitle('Workflows & Approvals',`${e(cyc().name)} cycle · ${T.length} item${T.length===1?'':'s'} waiting on you`)+(T.length?groups.map(gp=>`<div class="card"><h2 class="h2s">${e(gp)}</h2><div class="rows">${T.filter(t=>t.type===gp).map(t=>`<a class="row" href="${t.href}"><span><b>${e(t.obj)}</b><small>${e(t.who)} · ${e(t.cycle)} cycle</small></span><span class="small">${e(t.state)}${t.due?' · due '+fmt(t.due):''}</span><span class="btn sm pri">${e(t.act)}</span></a>`).join('')}</div></div>`).join(''):'<div class="card empty">Nothing is waiting on you.</div>')}
		function pageAdmin(){if(!isAdmin())return noAccess('The Admin Center is for administrators.');const c=S.config,tg=(k,l)=>`<label class="block"><input type="checkbox" data-cfg="${k}" ${c[k]?'checked':''}> ${l}</label>`;
		 return pageCycleTitle('Admin Center','Platform configuration · changes apply at once, including to forms in progress')+`<div class="card"><h2 class="h2s">Applications</h2><div class="tw"><table class="tbl"><thead><tr><th>Application</th><th>Type</th><th>Availability</th><th>Who can use it</th><th>Address</th></tr></thead><tbody>${APPS.map(a=>`<tr><td>${icon(a.icon)} ${e(a.label)}</td><td>${a.kind==='internal'?'Internal module':a.kind==='external'?'External application':'Unavailable'}</td><td>${avail(a)?(a.sample?'Available · sample data':'Available'):'Not configured'}</td><td>${({participant:'People with goals',manager:'People with direct reports',reports:'Managers and HR',admin:'Administrators'})[a.need]||'Everyone'}</td><td>${a.kind==='internal'?'<code>#'+e(a.route)+'</code>':a.kind==='external'?`<div class="row2"><input class="in sm" id="url-${a.id}" value="${e(c.apps[a.id]||'')}" placeholder="https://…" aria-label="${e(a.label)} address"><button class="btn sm" data-a="seturl" data-id="${a.id}">Save</button></div>`:'–'}</td></tr>`).join('')}</tbody></table></div><p class="small muted">External addresses must start with https://. Nothing is fabricated: with no address, the application shows as not configured.</p></div>
		 <div class="card"><h2 class="h2s">Appraisal workflow</h2>${tg('calibration','Include a Calibration step after the manager review')}${tg('appeal','Let employees appeal to HR at acknowledgement')}<p class="small muted m0">Sequence: ${flow().map(s=>STEPS[s]).join(' → ')}${c.appeal?' (→ HR appeal review if appealed)':''} → Completed.</p></div>
		 <div class="card"><h2 class="h2s">Training needs</h2>${tg('noTnaAllowed','Allow “No training needs identified”, with a required reason')}<p class="small muted m0">Maximum per appraisal: ${c.tnaMax}. Training needs are never scored.</p></div>
		 <div class="card"><h2 class="h2s">Rating</h2><div class="tw"><table class="tbl"><thead><tr><th>Value</th><th>Label</th></tr></thead><tbody>${c.scale.map(s=>`<tr><td>${s.v}</td><td>${e(s.label)}</td></tr>`).join('')}</tbody></table></div><label class="f" for="cfgdec">Decimal places for the overall rating</label><select class="in sm" id="cfgdec" data-cfg="decimals" style="max-width:120px">${[0,1,2].map(n=>`<option ${c.decimals===n?'selected':''}>${n}</option>`).join('')}</select></div>
		 <div class="card"><h2 class="h2s">Performance form</h2>${tg('numbers','Number the form sections (01, 02 …)')}<label class="f" for="cfgth">Default form theme</label><select class="in sm" id="cfgth" data-cfg="theme" style="max-width:220px"><option value="light" ${S.theme!=='gold'?'selected':''}>Broadcast Light</option><option value="gold" ${S.theme==='gold'?'selected':''}>Executive Gold</option></select></div>`}
		function pageApp(id){const a=APPS.find(x=>x.id===id);if(!a)return notFound();if(a.kind==='internal')return `<div class="card"><a class="btn" href="#${a.route}">Open ${e(a.label)}</a></div>`;
		 return `<div class="ph"><div><h1>${e(a.label)}</h1><p class="muted">${e(a.desc||'')}</p></div></div><div class="card"><p class="m0"><span class="tag t-na">Not configured</span> ${e(a.note||'This application is not available.')}</p>${isAdmin()&&a.kind==='external'?'<p><a class="btn" href="#/admin">Configure in the Admin Center</a></p>':''}<p><a class="btn" href="#/home">Back to Home</a></p></div>`}

		/* ---------- drawer: one goal ---------- */
		function drawerGoal(g){const me=ME(),mine=own(g),p=path(g),os=out(g),is=inb(g),c=CYC(g.cycle),last=g.checkins[g.checkins.length-1],ap=S.appraisals.find(a=>a.emp===g.owner&&a.cycle===g.cycle),acts=S.activities.filter(x=>x.goalId===g.id&&(x.owner===me||below(me).includes(x.owner)||g.owner===me));
		 let next='';
		 if(mine&&(g.status==='draft'||g.status==='returned')&&open(g))next=`<div class="next"><h3>${g.status==='returned'?'Sent back':'Not submitted yet'}</h3>${g.back?`<p>“${e(g.back)}”</p>`:''}<p>Finish it and submit it to ${P(g.owner).mgr?e(P(P(g.owner).mgr).name):'approve it'}.</p><div class="btns"><button class="btn pri" data-a="edit" data-id="${g.id}">Edit and submit</button><button class="btn" data-a="delete" data-id="${g.id}">Delete draft</button></div></div>`;
		 else if(may.approve(g))next=`<div class="next"><h3>Your approval</h3><p>${e(P(g.owner).name)} submitted this goal.${os.some(l=>l.status==='pending'&&nodeOwner(l.to)===me)?' Approving also accepts its link to your goal.':''}</p><label class="f" for="backmsg" style="font-weight:400">If you send it back, say what to change</label><textarea class="in" id="backmsg" maxlength="400"></textarea><div class="btns" style="margin-top:10px"><button class="btn pri" data-a="approve" data-id="${g.id}">Approve</button><button class="btn" data-a="sendback" data-id="${g.id}">Send back</button></div></div>`;
		 else if(mine&&g.review)next=`<div class="next"><h3>Review this goal</h3><p>${e(g.review.why)}</p><div class="btns"><button class="btn pri" data-a="reviewed" data-id="${g.id}">Still right, mark as reviewed</button>${may.edit(g)?`<button class="btn" data-a="edit" data-id="${g.id}">Edit it</button>`:''}</div></div>`;
		 else if(mine&&g.status==='submitted')next=`<div class="next"><h3>Waiting for approval</h3><p style="margin:0">With ${e(P(P(g.owner).mgr).name)}.</p></div>`;
		 const pathHtml=p.pillar?`<div class="meta small">Path to strategy: ${[e(PL(p.pillar).name)+' (pillar)',...p.chain.map(x=>e(x.title)+' · '+e(P(x.owner).name))].join(' › ')} › <b>this goal</b>${p.ok?'':' · <b>a link on this path is not accepted yet</b>'}</div>`:'<div class="note">Not aligned to strategy. Align it to a goal it supports.</div>';
		 const oli=l=>{const t=isPillar(l.to),tg=G(l.to);return `<li><span class="dir">→</span><span class="lt"><b>${t?e(nodeName(l.to)):`<a href="${withQ({goal:l.to})}">${e(nodeName(l.to))}</a>`}</b><small>${t?'Pillar':e(who(nodeOwner(l.to)))}${tg&&tg.archived?' · archived':''}${l.primary?' · <span class="prim">Main alignment</span>':''}</small>${l.status==='rejected'&&l.reason?`<small class="rs">“${e(l.reason)}”</small>`:''}</span><span class="la">${lpill(l.status)}${may.withdraw(l)&&!l.primary&&l.status!=='rejected'?`<button class="link small" data-a="primary" data-id="${l.id}">Make main</button>`:''}${may.withdraw(l)?`<button class="link small" data-a="withdraw" data-id="${l.id}">${l.status==='rejected'?'Remove':'Withdraw'}</button>`:''}</span></li>`};
		 const ili=l=>{const f=G(l.from),dec=may.decide(l)&&l.status!=='rejected';return `<li><span class="dir">←</span><span class="lt"><a href="${withQ({goal:f.id})}">${e(f.title)}</a><small>${e(who(f.owner))}${f.status!=='approved'?' · '+STATUS[f.status][0]:''}${f.archived?' · archived':''}</small>${l.status==='rejected'&&l.reason?`<small class="rs">“${e(l.reason)}”</small>`:''}</span><span class="la">${lpill(l.status)}</span>${dec?`<div class="dec">${l.status==='pending'?`<button class="btn sm pri" data-a="accept" data-id="${l.id}">Accept</button>`:''}<input class="in" id="why-${l.id}" placeholder="${l.status==='pending'?'Reason, if you reject':'Reason for removing'}" maxlength="200" aria-label="Reason"><button class="btn sm" data-a="reject" data-id="${l.id}">${l.status==='pending'?'Reject':'Remove'}</button></div>`:''}</li>`};
		 const T=targets(g),opt=(x,l)=>`<option value="${x.id}">${e(l)}</option>`;
		 const krli=k=>`<li><div class="krh"><span>${e(k.t)}${num(k.weight)!=null?` <span class="muted small">· weight ${k.weight}%</span>`:''}</span><b class="${krRaw(k)<0?'neg':''}">${krLabel(k)}</b></div><div class="small muted">${measure(k)}</div>${k.type==='milestone'?`<ul class="msl">${k.steps.map(s=>`<li>${s.done?'☑':'☐'} ${e(s.t)}</li>`).join('')}</ul>`:''}</li>`;
		 const ckForm=U.ck===g.id?`<div class="addl"><h3 style="margin-bottom:8px">Check in</h3>${g.krs.map((k,i)=>k.type==='binary'?`<label class="ckr"><input type="checkbox" data-ck="${i}" ${k.current?'checked':''}> ${e(k.t)}</label>`:k.type==='milestone'?`<div class="ckr"><b class="small">${e(k.t)}</b>${k.steps.map((s,j)=>`<label style="display:block"><input type="checkbox" data-ck="${i}" data-j="${j}" ${s.done?'checked':''}> ${e(s.t)}</label>`).join('')}</div>`:`<label class="ckr">${e(k.t)} <span class="muted small">(from ${k.start} to ${k.target} ${e(k.unit)})</span><input class="in" type="number" step="any" data-ck="${i}" value="${k.current??''}" aria-label="Current value for ${e(k.t)}"></label>`).join('')}
		  <label class="f" for="ckst">How is it going?</label><select class="in" id="ckst">${['on','risk','off'].map(h=>`<option value="${h}" ${last&&last.status===h?'selected':''}>${HEALTH[h][0]}</option>`).join('')}</select>
		  <label class="f" for="cknote">Note or evidence <span class="muted small" style="font-weight:400">(optional)</span></label><textarea class="in" id="cknote" maxlength="500" placeholder="What changed, and where the numbers come from"></textarea><div class="err" id="ckerr" hidden></div>
		  <div class="btns" style="margin-top:10px"><button class="btn pri" data-a="cksave" data-id="${g.id}">Save check-in</button><button class="btn" data-a="ckcancel">Cancel</button></div></div>`:'';
		 return `<div class="dh"><div style="flex:1"><div class="pills">${pill(g.status)}${g.status==='approved'?hpill(g):''}${g.archived?'<span class="pill draft">Archived</span>':''}</div><h2 style="margin-top:8px">${e(g.title)}</h2><div class="meta">${e(P(g.owner).name)} · ${e(P(g.owner).title)} · ${e(P(g.owner).dept)}</div><div class="meta small">${TYPES[g.type]} · ${e(c.name)} cycle${c.closed?' (closed)':''} · due ${fmt(g.due)||'not set'}${g.weight!=null?' · weight '+g.weight+'%':''} · progress from ${g.rollup==='aligned'?'goals aligned to it':'its key results'}</div></div><button class="x" data-a="close" aria-label="Close">×</button></div>
		 <div class="db">${g.archived?`<div class="note">Archived ${g.archivedAt?fmt(g.archivedAt):''}. It is hidden from the map, reports and new links.${may.unarchive(g)?` <button class="link" data-a="unarchive" data-id="${g.id}">Unarchive</button>`:''}</div>`:''}${pathHtml}
		 <div class="conn"><a href="${href('/strategy',{focus:g.id})}">${icon('tree')} Show in Strategy & Alignment</a>${ap&&canSeeAp(ap)?`<a href="${href('/appraisal/'+ap.id,{s:'objectives'})}">${icon('form')} Open in ${e(c.name)} appraisal</a>`:''}<a href="${href('/activities',{goal:g.id})}">${icon('chat')} Activities (${acts.length})</a></div>
		 <div style="margin-top:12px">${progHtml(g)}</div>${last?`<div class="meta small">Last check-in ${fmt(last.at)} by ${e(P(last.by).name)}${last.note?': “'+e(last.note)+'”':''}</div>`:''}
		 ${g.rollup==='aligned'?'<p class="small muted">Progress is the average of the goals aligned to it through accepted links. Their own weights are not used.</p>':''}
		 <h3 style="margin-top:14px">Key results</h3><ul class="krs">${g.krs.map(krli).join('')||'<li class="muted small">None.</li>'}</ul>${g.desc?`<p class="muted">${e(g.desc)}</p>`:''}
		 ${next}${may.checkin(g)&&U.ck!==g.id?`<p><button class="btn ${next?'':'pri'}" data-a="ckopen" data-id="${g.id}">Check in</button></p>`:''}${ckForm}
		 <section class="al"><h3>Outbound alignment <span class="muted small">· goals this one supports (${os.length})</span></h3><ul class="links">${os.map(oli).join('')||'<li class="muted small">None yet.</li>'}</ul>
		 ${may.align(g)?(U.add===g.id?`<div class="addl"><label class="f" for="ato">Align to</label><select class="in" id="ato">${T.pillars.length?`<optgroup label="Pillars">${T.pillars.map(x=>opt(x,x.name)).join('')}</optgroup>`:''}${T.mine.length?`<optgroup label="Your manager’s goals">${T.mine.map(x=>opt(x,x.title)).join('')}</optgroup>`:''}${T.other.length?`<optgroup label="Other teams and departments">${T.other.map(x=>opt(x,x.title+' · '+who(x.owner))).join('')}</optgroup>`:''}</select>
		  <p class="hint">${T.pillars.length?'Links to a pillar are accepted at once. ':''}The owner of the goal you pick accepts or rejects the link.</p><div class="btns"><button class="btn sm pri" data-a="propose" data-id="${g.id}">Send link</button><button class="btn sm" data-a="addcancel">Cancel</button></div></div>`
		  :`<button class="link" data-a="addlink" data-id="${g.id}" style="margin-top:8px">+ Align to another goal</button>`):''}</section>
		 <section class="al"><h3>Inbound alignment <span class="muted small">· goals that support this one (${is.length})</span></h3><ul class="links">${is.map(ili).join('')||'<li class="muted small">None yet.</li>'}</ul></section>
		 <details><summary>Check-ins (${g.checkins.length})</summary>${g.checkins.length?`<ul class="hist">${g.checkins.slice().reverse().map(x=>`<li>${fmt(x.at)} · <b>${e(P(x.by).name)}</b> · ${HEALTH[x.status][0]}${x.note?' · '+e(x.note):''}</li>`).join('')}</ul>`:'<p class="muted small" style="margin:0">No check-ins yet.</p>'}</details>
		 <details><summary>History</summary><ul class="hist">${g.hist.slice().reverse().map(h=>`<li>${fmt(h.at)} · <b>${e(P(h.by).name)}</b> · ${e(h.w)}</li>`).join('')}</ul></details>
		 ${(may.edit(g)&&g.status==='approved')||may.archive(g)?`<div class="btns" style="margin-top:14px">${may.edit(g)&&g.status==='approved'?`<button class="btn" data-a="edit" data-id="${g.id}">Edit (needs approval again)</button>`:''}${may.archive(g)?`<button class="btn" data-a="archive" data-id="${g.id}">Archive</button>`:''}</div>`:''}</div>`}

		/* ---------- drawer: add or edit a goal ---------- */
		const blankKr=()=>({t:'',type:'number',start:'',target:'',current:'',unit:'',weight:'',steps:''});
		function openForm(o,quiet){const me=ME(),lv=P(me).lv;U.form=Object.assign({id:null,to:'',title:'',type:lv===1?'org':lv===2?'team':'individual',due:cyc().end,weight:'',rollup:'krs',krs:[blankKr()],desc:'',hint:'',dirty:false},o);
		 if(!U.form.id&&!U.form.to){const t=targets({id:'_new',owner:me,cycle:S.cycle}),f=[...t.pillars,...t.mine,...t.other][0];U.form.to=f?f.id:''}U.ai=null;U.err={};U.dr={k:'form'};if(!quiet)render()}
		const formFromGoal=g=>({id:g.id,title:g.title,type:g.type,due:g.due,weight:g.weight??'',rollup:g.rollup,desc:g.desc,krs:g.krs.length?g.krs.map(k=>({t:k.t,type:k.type,start:k.start??'',target:k.target??'',current:k.type==='number'?(k.current??''):'',unit:k.unit,weight:k.weight??'',steps:k.steps.map(s=>s.t).join('\n')})):[blankKr()]});
		function drawerForm(){const f=U.form,me=ME(),g=f.id&&G(f.id),er=U.err,ai=U.ai,T=targets(g||{id:'_new',owner:me,cycle:S.cycle}),lv=P(me).lv,c=g?CYC(g.cycle):cyc();
		 const types=Object.entries(TYPES).filter(([k])=>k==='individual'||(k==='team'&&lv<=4)||(k==='org'&&lv<=2));
		 const krRow=(k,i)=>`<div class="krbox"><div class="kr"><input class="in" data-ff="kr" data-i="${i}" data-k="t" data-key="ff-kr-${i}-t" value="${e(k.t)}" maxlength="200" placeholder="Key result, for example: Newsletter sign-ups" aria-label="Key result ${i+1}"><select class="in" style="flex:none;width:auto" data-ff="kr" data-i="${i}" data-k="type" aria-label="Measure type for key result ${i+1}"><option value="number" ${k.type==='number'?'selected':''}>Number</option><option value="binary" ${k.type==='binary'?'selected':''}>Done / not done</option><option value="milestone" ${k.type==='milestone'?'selected':''}>Milestones</option></select>${f.krs.length>1?`<button class="x" data-a="krdel" data-i="${i}" aria-label="Remove key result ${i+1}">×</button>`:''}</div>
		  <div class="krm">${k.type==='number'?`<label>Start<input class="in" type="number" step="any" data-ff="kr" data-i="${i}" data-k="start" data-key="ff-kr-${i}-start" value="${e(k.start)}"></label><label>Target<input class="in" type="number" step="any" data-ff="kr" data-i="${i}" data-k="target" data-key="ff-kr-${i}-target" value="${e(k.target)}"></label><label>Current<input class="in" type="number" step="any" data-ff="kr" data-i="${i}" data-k="current" data-key="ff-kr-${i}-current" value="${e(k.current)}" placeholder="optional"></label><label>Unit<input class="in" data-ff="kr" data-i="${i}" data-k="unit" data-key="ff-kr-${i}-unit" value="${e(k.unit)}" maxlength="20" placeholder="%, QAR, minutes"></label>`
		   :k.type==='milestone'?`<label class="wide">Steps, one per line<textarea class="in" data-ff="kr" data-i="${i}" data-k="steps" data-key="ff-kr-${i}-steps" rows="3">${e(k.steps)}</textarea></label>`:'<span class="small muted">Counts as 0% until it is done, then 100%.</span>'}<label>Weight %<input class="in" type="number" min="0" max="100" step="1" data-ff="kr" data-i="${i}" data-k="weight" data-key="ff-kr-${i}-weight" value="${e(k.weight)}" placeholder="equal"></label></div>${(er.kr||{})[i]?`<div class="err">${er.kr[i]}</div>`:''}</div>`;
		 return `<div class="dh"><h2>${g?(g.status==='approved'?'Edit approved goal':'Edit goal'):'Create Goal'}</h2><button class="x" data-a="close" aria-label="Close">×</button></div><div class="db">
		 ${g&&g.status==='approved'?'<div class="note">Saving sends it to your manager for approval again, and the owners of goals aligned to it are asked to review theirs.</div>':''}
		 ${g?'<p class="hint" style="margin-top:0">Alignment is managed on the goal itself.</p>':`<label class="f" for="fto">Supports <span class="muted small" style="font-weight:400">(main outbound alignment)</span></label><select class="in" id="fto" data-ff="to" ${er.to?'aria-invalid="true"':''}>${T.pillars.length?`<optgroup label="Pillars">${T.pillars.map(x=>`<option value="${x.id}" ${x.id===f.to?'selected':''}>${e(x.name)}</option>`).join('')}</optgroup>`:''}${T.mine.length?`<optgroup label="Your manager’s goals">${T.mine.map(x=>`<option value="${x.id}" ${x.id===f.to?'selected':''}>${e(x.title)}</option>`).join('')}</optgroup>`:''}${T.other.length?`<optgroup label="Other teams and departments">${T.other.map(x=>`<option value="${x.id}" ${x.id===f.to?'selected':''}>${e(x.title)} · ${e(who(x.owner))}</option>`).join('')}</optgroup>`:''}</select>${er.to?`<div class="err">${er.to}</div>`:''}<div class="hint">${lv===1?'Links to a pillar are accepted at once.':'A link to your manager’s goal is accepted when they approve this goal. A link to anyone else’s goal waits for its owner.'}</div>`}
		 <label class="f" for="ftitle">Goal</label><input class="in" id="ftitle" data-ff="title" data-key="ff-title" maxlength="200" value="${e(f.title)}" placeholder="An outcome, for example: Cut playout incidents to under three a month" ${er.title?'aria-invalid="true"':''}>${er.title?`<div class="err">${er.title}</div>`:''}
		 <div class="g3"><label>Type<select class="in" data-ff="type">${types.map(([k,l])=>`<option value="${k}" ${f.type===k?'selected':''}>${l}</option>`).join('')}</select></label><label>Due date<input class="in" type="date" data-ff="due" value="${e(f.due)}" min="${c.start}" max="${c.end}" ${er.due?'aria-invalid="true"':''}></label><label>Weight in your goals %<input class="in" type="number" min="0" max="100" step="1" data-ff="weight" data-key="ff-weight" value="${e(f.weight)}" placeholder="optional" ${er.weight?'aria-invalid="true"':''}></label></div>${er.due?`<div class="err">${er.due}</div>`:''}${er.weight?`<div class="err">${er.weight}</div>`:''}
		 <div class="aibar"><div class="r"><button class="btn sm ai" data-a="aisuggest">✦ Suggest goals for me</button><button class="btn sm ai" data-a="aireview">✦ Review my draft</button><input class="in" data-ff="hint" data-key="ff-hint" value="${e(f.hint)}" placeholder="Priorities, in a few words (optional)" aria-label="Priorities for suggestions" maxlength="120"></div>
		 ${ai?`<div style="margin-top:6px"><span class="tag t-sample">Prototype · scripted, not from a model</span></div>`+(ai.kind==='suggest'?ai.items.map((s,i)=>`<div class="sug"><b>${e(s.title)}</b><ul>${s.krs.map(k=>`<li>${e(k[0])}${k[1]!=null?` · from ${k[1]} to ${k[2]} ${e(k[3])}`:''}</li>`).join('')}</ul><p>${e(s.why)}</p><button class="btn sm" data-a="aiuse" data-i="${i}">Use this</button></div>`).join(''):`<ul class="chk">${ai.checks.map(c=>`<li>${c.ok?'✅':'⚠️'} ${e(c.label)}${c.tip?`<small>${e(c.tip)}</small>`:''}</li>`).join('')}</ul>`)+`<p style="margin:8px 0 0"><button class="link small" data-a="aiclose">Hide</button></p>`:''}</div>
		 <label class="f">Progress comes from</label><label class="rad"><input type="radio" name="rollup" data-ff="rollup" value="krs" ${f.rollup==='krs'?'checked':''}> Its key results</label><label class="rad"><input type="radio" name="rollup" data-ff="rollup" value="aligned" ${f.rollup==='aligned'?'checked':''}> The goals aligned to it <span class="muted small">(average of accepted inbound goals)</span></label>
		 <label class="f">Key results</label>${f.krs.map(krRow).join('')}${er.krs?`<div class="err">${er.krs}</div>`:''}
		 ${f.krs.length<5?'<button class="link" data-a="kradd">+ Add another</button>':''}
		 <details ${f.desc?'open':''} style="margin-top:14px"><summary>Description</summary><textarea class="in" id="fdesc" data-ff="desc" data-key="ff-desc" maxlength="1000" aria-label="Description">${e(f.desc)}</textarea></details></div>
		 <div class="df"><button class="btn" data-a="close">Cancel</button>${g&&g.status==='approved'?'':'<button class="btn" data-a="fsave" data-d="1">Save draft</button>'}<button class="btn pri" data-a="fsave">${P(me).mgr?'Submit for approval':'Save'}</button></div>`}
		function readForm(t){const f=U.form,k=t.dataset.ff;if(!f||!k)return;f.dirty=true;if(k==='kr'){f.krs[+t.dataset.i][t.dataset.k]=t.value;if(t.dataset.k==='type')render()}else if(k==='rollup'){if(t.checked)f.rollup=t.value}else f[k]=t.value}
		function checkForm(f,draft,c){const err={},kr={},krs=f.krs.filter(k=>k.t.trim()||k.start!==''||k.target!==''||k.steps.trim());
		 if(!f.title.trim())err.title='Add a goal.';
		 if(f.due&&(f.due<c.start||f.due>c.end))err.due=`Choose a due date inside the ${c.name} cycle (${fmt(c.start)} to ${fmt(c.end)}).`;
		 if(f.weight!==''&&!(Number.isInteger(+f.weight)&&+f.weight>=0&&+f.weight<=100))err.weight='Weight must be a whole number from 0 to 100.';
		 if(!draft&&f.rollup==='krs'&&!krs.length)err.krs='Add at least one key result, or take progress from the goals aligned to it.';
		 krs.forEach(k=>{const i=f.krs.indexOf(k),m=[];if(!k.t.trim())m.push('Describe the key result.');
		  if(k.type==='number'){if(k.start===''||k.target==='')m.push('Give a start and a target.');else if(+k.start===+k.target)m.push('Start and target must be different.');}
		  if(k.type==='milestone'&&!k.steps.split('\n').some(s=>s.trim()))m.push('Add at least one step.');
		  if(k.weight!==''&&!(Number.isInteger(+k.weight)&&+k.weight>=0&&+k.weight<=100))m.push('Weight must be a whole number from 0 to 100.');if(m.length)kr[i]=m.join(' ')});
		 const ws=krs.filter(k=>k.weight!=='');if(ws.length&&!err.krs&&!Object.keys(kr).length){const t=ws.reduce((a,k)=>a+ +k.weight,0);if(ws.length!==krs.length||t!==100)err.krs=`Key-result weights add up to ${t}%${ws.length!==krs.length?' and not every key result has one':''}. Give every key result a weight adding up to 100%, or leave them all blank to count equally.`}
		 if(Object.keys(kr).length)err.kr=kr;return {err,krs}}
		function saveForm(draft){const f=U.form,me=ME(),g0=f.id&&G(f.id);
		 if(g0&&!may.edit(g0)){U.dr=U.form=null;render();return denied('You cannot edit this goal.')}
		 if(draft&&g0&&g0.status==='approved')return toast('An approved goal cannot go back to draft. Submit it for approval.');
		 const c=g0?CYC(g0.cycle):cyc();if(c.closed){U.dr=U.form=null;render();return toast('This cycle is closed.')}
		 const {err,krs}=checkForm(f,draft,c);
		 if(!g0&&(!f.to||!validTarget({id:'_new',owner:me,cycle:S.cycle},f.to)))err.to='Choose a goal or pillar from the list.';
		 if(!TYPES[f.type])err.title='Choose a type.';
		 U.err=err;if(Object.keys(err).length){render();const x=document.querySelector('.drawer [aria-invalid=true]')||document.querySelector('.drawer .err');if(x){x.scrollIntoView({block:'center'});if(x.focus)x.focus()}return}
		 const nk=krs.map(k=>({t:k.t.trim(),type:k.type,start:k.type==='number'?+k.start:null,target:k.type==='number'?+k.target:null,current:k.type==='number'?num(k.current):k.type==='binary'?!!(g0&&(g0.krs.find(x=>x.t===k.t.trim())||{}).current):null,unit:k.type==='number'?k.unit.trim():'',weight:num(k.weight),steps:k.type==='milestone'?k.steps.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>({t:s,done:!!(g0&&g0.krs.some(x=>x.steps.some(y=>y.t===s&&y.done)))})):[]}));
		 let g=g0;const wasApproved=g&&g.status==='approved',before=g&&JSON.stringify([g.title,g.krs.map(k=>[k.t,k.type,k.target])]);
		 if(!g){g={id:'g'+(S.seq++),owner:me,cycle:S.cycle,status:'draft',archived:false,review:null,back:'',checkins:[],hist:[]};S.goals.push(g);hist(g,'Created');propose(g,f.to)}
		 Object.assign(g,{title:f.title.trim(),type:f.type,due:f.due,weight:num(f.weight),rollup:f.rollup,desc:f.desc.trim(),krs:nk});
		 if(draft){hist(g,'Saved as draft');toast('Draft saved')}
		 else{if(wasApproved){hist(g,'Edited after approval');if(before!==JSON.stringify([g.title,g.krs.map(k=>[k.t,k.type,k.target])]))flagSupporters(g,`“${g.title}”, which this goal supports, changed its wording or targets.`)}
		  submitGoal(g);if(g.status==='approved')acceptOwnLinks(g);toast(g.status==='approved'?'Goal saved':'Submitted to '+P(P(g.owner).mgr).name)}
		 U.form=U.ai=null;U.dr=null;go(withQ({goal:g.id}))}

		/* ---------- AI goal design: scripted in this prototype ---------- */
		const LIB={
		 p1:[['Grow the {a} audience on digital platforms',[['Weekly active users',100,120,'k'],['Returning visitors',30,35,'%']],'more people reaching our journalism every week'],
		  ['Make {a} content easier to find',[['Search click-through',22,30,'%'],['Time to first click',12,8,'seconds']],'more visits that turn into regular use'],
		  ['Publish {a} stories faster',[['Median filing-to-publish time',35,20,'minutes'],['Breaking stories live within 10 minutes',70,90,'%']],'audiences coming to us first']],
		 p2:[['Reduce unplanned outages in {a}',[['Unplanned outage per month',60,30,'minutes'],['Mean time to restore',25,15,'minutes']],'less downtime across the channels'],
		  ['Standardise maintenance across {a}',[['Preventive maintenance done on schedule',80,95,'%'],['Repeat faults within 30 days',6,0,'faults']],'fewer failures before they happen'],
		  ['Strengthen fault handling in {a}',[['Team trained on the fault runbook',40,100,'%'],['Fault drills held',0,8,'drills']],'faster, calmer recovery when something breaks']],
		 p3:[['Build core skills across {a}',[['Team members with two learning paths done',20,100,'%'],['Open skills gaps',10,5,'gaps']],'a workforce ready for new formats'],
		  ['Grow future leaders in {a}',[['Key roles with two named successors',30,100,'%'],['Internal moves or stretch assignments',1,4,'moves']],'more roles filled from inside'],
		  ['Make {a} a place people stay',[['Voluntary turnover',12,8,'%'],['Engagement score',68,73,'points']],'keeping the skills we invest in']]};
		function aiSuggest(){const f=U.form,me=ME(),to=f.id?(primary(G(f.id))||{}).to:f.to,tg=to&&!isPillar(to)?G(to):null,pl=tg?(rootPillar(tg)||'p2'):(to||'p2'),area=(P(me).title.split(',')[1]||P(me).title).trim(),own_=S.goals.filter(g=>g.owner===me).map(g=>g.title.toLowerCase());
		 const lv=P(me).lv,scope=lv>=5?' (your own work)':lv===4?' (your section)':'',above=tg?tg.title:(PL(pl)||{name:'strategy'}).name;let items=(LIB[pl]||LIB.p2).map(([t,k,w])=>({title:t.replace('{a}',area)+scope,krs:k,why:`Supports “${above}” through ${w}.`}));
		 const h=f.hint.trim();if(h)items=[{title:`${h[0].toUpperCase()+h.slice(1)} in ${area}`,krs:items[0].krs,why:`Built from your priority “${h}”. Supports “${above}”.`},...items.slice(0,2)];
		 return items.filter(s=>!own_.includes(s.title.toLowerCase())).slice(0,3)}
		function aiReview(){const f=U.form,t=f.title.trim(),krs=f.krs.filter(k=>k.t.trim()),lv=P(ME()).lv,c=[];
		 const act=/^(attend|hold|do|work on|help|support|participate|join|try|complete training|be )/i.test(t);
		 c.push(!t?{ok:false,label:'There is no goal yet',tip:'Start with the result you want, not the task.'}:act?{ok:false,label:'Reads as an activity, not an outcome',tip:'Say what will be different when it is done, for example “Cut … to …”.'}:{ok:true,label:'Reads as an outcome'});
		 const vague=krs.filter(k=>k.type==='number'&&(k.start===''||k.target===''));c.push(!krs.length?{ok:f.rollup==='aligned',label:f.rollup==='aligned'?'Progress comes from aligned goals':'No key results yet',tip:f.rollup==='aligned'?'':'Add one to three key results with a start and a target.'}:vague.length?{ok:false,label:`${vague.length} number key result(s) have no start or target`,tip:'For example: from 50k to 70k sign-ups.'}:{ok:true,label:'Key results are measurable'});
		 if(krs.length>3)c.push({ok:false,label:'More than three key results',tip:'Keep the ones that matter most.'});
		 if(krs.length&&krs.every(k=>k.type!=='number'))c.push({ok:false,label:'No key result measures an outcome with a number',tip:'Completed steps show effort; pair them with a result, for example “successor ready now: 2 people”.'});
		 c.push(lv>=4&&/all channels|whole network|company-wide|across the network|every market/i.test(t)?{ok:false,label:'The scope looks too wide for your level',tip:'Narrow it to what your section or your own work controls.'}:{ok:true,label:'Scope fits your level'});
		 const to=f.id?(primary(G(f.id))||{}).to:f.to;c.push(to?{ok:true,label:'Supports “'+nodeName(to)+'”'}:{ok:false,label:'Not aligned to a goal above',tip:'Choose what it supports.'});
		 const words=s=>new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3)),tw=words(t),dup=S.goals.find(g=>g.owner===ME()&&g.cycle===S.cycle&&g.id!==f.id&&tw.size&&[...words(g.title)].filter(w=>tw.has(w)).length/tw.size>=.5);
		 c.push(dup?{ok:false,label:'Overlaps a goal you already have',tip:'“'+dup.title+'”'}:{ok:true,label:'No overlap with your other goals'});return c}

		/* ---------- drawer: pillar ---------- */
		function drawerPillar(p){const gs=S.links.filter(l=>l.to===p.id).map(l=>G(l.from)).filter(g=>g&&shown(g)),ed=canEditStrategy();
		 return `<div class="dh"><div style="flex:1"><span class="pill ok">Pillar</span><h2 style="margin-top:8px">${e(p.name)}</h2></div><button class="x" data-a="close" aria-label="Close">×</button></div><div class="db">
		 ${ed?`<label class="f" for="pname">Pillar name</label><div style="display:flex;gap:8px"><input class="in" id="pname" value="${e(p.name)}" maxlength="120"><button class="btn" data-a="prename" data-id="${p.id}">Save</button></div>
		 ${cyc().closed?'':`<div class="next"><h3>Add a goal under this pillar</h3><p>It becomes one of your goals as ${e(P(ME()).title)}.</p><button class="btn pri" data-a="pgoal" data-id="${p.id}">Create Goal</button></div>`}`:`<p class="muted">Pillars are managed by the Executive Directors.</p>`}
		 <h3 style="margin-top:14px">Goals aligned to it in ${e(cyc().name)} (${gs.length})</h3><ul class="hist">${gs.map(g=>`<li><b>${e(P(g.owner).name)}</b> · <a href="${withQ({goal:g.id})}">${e(g.title)}</a></li>`).join('')||'<li>None yet.</li>'}</ul>
		 ${ed?`<details><summary>Add a pillar</summary><div style="display:flex;gap:8px"><input class="in" id="pnew" maxlength="120" placeholder="Pillar name"><button class="btn" data-a="padd">Add</button></div></details>`:''}</div>`}

		/* ---------- render: the URL decides the page; one-off parameters open forms and are then removed ---------- */
		function render(){let r=R();const af=document.activeElement,key=af&&af.dataset&&af.dataset.key,caret=af&&typeof af.selectionStart==='number'?af.selectionStart:null,was=!!document.querySelector('.drawer');
		 if(r.q.cycle&&CYC(r.q.cycle)&&r.q.cycle!==S.cycle)S.cycle=r.q.cycle;
		 const strip=k=>{const q=Object.assign({},r.q);k.forEach(x=>delete q[x]);const nh=href(r.path,q);U.last=normHash(nh);setHash(nh,true);r=R()};
		 if(r.q.new&&r.parts[0]==='goals'){strip(['new']);if(isPart()&&!cyc().closed)openForm({},true);else toast('You cannot create a goal here.')}
		 if(r.q.edit&&r.q.goal){const g=G(r.q.goal);strip(['edit']);if(g&&may.edit(g))openForm(formFromGoal(g),true)}
		 if(r.q.checkin&&r.q.goal){const g=G(r.q.goal);strip(['checkin']);if(g&&may.checkin(g))U.ck=g.id;else toast('You cannot check in on this goal.')}
		 const p0=r.parts[0]||'home',pages={home:pageHome,goals:()=>r.parts[1]==='all'?pageAll():pageMine(),strategy:pageMap,performance:pagePerformance,appraisal:()=>pageAppraisal(r.parts[1]),team:pageTeam,development:pageDevelopment,training:pageTraining,activities:pageActivities,learning:pageLearning,approvals:pageApprovals,reports:pageReports,admin:pageAdmin,apps:()=>pageApp(r.parts[1])};
		 const page=(pages[p0]||notFound)();
		 let d='';const gq=r.q.goal&&G(r.q.goal);
		 const inner=U.form&&U.dr&&U.dr.k==='form'?drawerForm():U.dr&&U.dr.k==='pillar'&&PL(U.dr.id)?drawerPillar(PL(U.dr.id)):r.q.goal?(gq&&canSee(gq)?drawerGoal(gq):`<div class="dh"><h2>Goal not available</h2><button class="x" data-a="close" aria-label="Close">×</button></div><div class="db"><p>This goal does not exist or is not available to you.</p></div>`):'';
		 if(inner)d=`<div class="mask" data-a="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Details" tabindex="-1">${inner}</aside>`;
		 document.getElementById('app').innerHTML=shell(r,page)+d;
		 const dw=document.querySelector('.drawer');
		 if(key){const x=document.querySelector(`[data-key="${CSS.escape(key)}"]`);if(x){x.focus();if(caret!=null&&x.setSelectionRange&&/text|search|textarea/.test(x.type||x.tagName.toLowerCase()))try{x.setSelectionRange(caret,caret)}catch(_){}}}
		 else if(dw&&!was)(dw.querySelector('.dh .x')||dw).focus();
		 if(r.parts[0]==='strategy'&&r.q.focus&&U.focused!==hashNow()){U.focused=hashNow();const b=document.querySelector(`.box[data-id="${CSS.escape(r.q.focus)}"]`);if(b)b.scrollIntoView({block:'center',inline:'center'})}
		 if(r.parts[0]==='appraisal'&&r.q.s&&U.jumped!==hashNow()){U.jumped=hashNow();const s=document.getElementById('s-'+r.q.s);if(s)setTimeout(()=>s.scrollIntoView({block:'start'}),0)}
		 save()}

		/* ---------- actions ---------- */
		const closeDrawer=()=>{if(U.form&&U.form.dirty&&!confirm('Discard the changes in this goal form?'))return;U.form=U.ai=U.add=U.ck=null;U.dr=null;const r=R();if(r.q.goal)go(withQ({goal:null}));else render()};
		const apData=()=>U.ap&&U.ap.d;
		function apTransition(fn,okMsg){const w=apData();if(!w||!apOwnerOk(w))return denied('This form is not at a step you own.');const a=copy(w),devBefore=copy(S.dev),res=fn(a);if(res===false)return;
		 if(!commitAp(a,res)){S.dev=devBefore;return}toast(okMsg(a));render();scrollTop()}
		const A={
		 skip:(el,ev)=>{const m=document.getElementById('main');if(m)m.focus()},
		 navtoggle:()=>{U.nav=!U.nav;render()},
		 pop:el=>{U.pop=U.pop===el.dataset.p?null:el.dataset.p;U.search='';render()},
		 popclose:()=>{U.pop=null;U.search='';U.nav=false},
		 reset:()=>{if(!confirm('Reset all demo data in this browser? Everything entered here is cleared.'))return;S=seed();U.ap=U.form=U.dr=null;U.pop=null;try{localStorage.removeItem(OLDKEY)}catch(x){}go('#/home');toast('Demo data restored')},
		 close:closeDrawer,
		 edit:el=>{const g=G(el.dataset.id);if(!g||!may.edit(g))return denied('You cannot edit this goal.');openForm(formFromGoal(g))},
		 delete:el=>{const g=G(el.dataset.id);if(!g||!may.delete(g))return denied();if(!confirm('Delete this draft?'))return;S.goals=S.goals.filter(x=>x!==g);S.links=S.links.filter(l=>l.from!==g.id&&l.to!==g.id);go(withQ({goal:null}));toast('Draft deleted')},
		 approve:el=>{const g=G(el.dataset.id);if(!g||!may.approve(g))return denied();g.status='approved';g.back='';hist(g,'Approved');acceptOwnLinks(g);render();toast('Approved')},
		 sendback:el=>{const g=G(el.dataset.id);if(!g||!may.sendback(g))return denied();const t=document.getElementById('backmsg'),m=t.value.trim();if(!m){t.setAttribute('aria-invalid','true');t.focus();toast('Say what to change before sending it back');return}g.status='returned';g.back=m;hist(g,'Sent back: '+m);render();toast('Sent back to '+P(g.owner).name)},
		 reviewed:el=>{const g=G(el.dataset.id);if(!g||!may.review(g))return denied();hist(g,'Reviewed after a change above: still right');g.review=null;render();toast('Marked as reviewed')},
		 archive:el=>{const g=G(el.dataset.id);if(!g||!may.archive(g))return denied();const n=S.links.filter(l=>l.to===g.id&&l.status==='accepted'&&G(l.from)&&!G(l.from).archived).length;
		  if(!confirm(n?`${n} goal${n===1?' is':'s are'} aligned to this one. Archiving keeps their links but asks their owners to review them, and they stop tracing to strategy through it. Archive?`:'Archive this goal? You can unarchive it later.'))return;
		  g.archived=true;g.archivedAt=TODAY;hist(g,'Archived');flagSupporters(g,`“${g.title}”, which this goal supports, was archived.`);render();toast('Archived')},
		 unarchive:el=>{const g=G(el.dataset.id);if(!g||!may.unarchive(g))return denied();g.archived=false;hist(g,'Unarchived');render();toast('Unarchived')},
		 ckopen:el=>{const g=G(el.dataset.id);if(!g||!may.checkin(g))return denied();U.ck=g.id;if(R().q.goal!==g.id)go(withQ({goal:g.id}));else render();const x=document.querySelector('[data-ck]');if(x)x.focus()},
		 ckcancel:()=>{U.ck=null;render()},
		 cksave:el=>{const g=G(el.dataset.id);if(!g||!may.checkin(g))return denied();const vals=[...document.querySelectorAll('[data-ck]')],errEl=document.getElementById('ckerr');
		  const bad=vals.filter(x=>x.type==='number'&&x.value!==''&&!isFinite(+x.value));if(bad.length){errEl.textContent='Enter numbers only.';errEl.hidden=false;bad[0].focus();return}
		  vals.forEach(x=>{const k=g.krs[+x.dataset.ck];if(k.type==='binary')k.current=x.checked;else if(k.type==='milestone')k.steps[+x.dataset.j].done=x.checked;else k.current=num(x.value)});
		  const st=document.getElementById('ckst').value,note=document.getElementById('cknote').value.trim();g.checkins.push({at:TODAY,by:ME(),status:st,note});hist(g,`Checked in: ${HEALTH[st][0]}, progress ${goalPct(g)??'no data'}${goalPct(g)!=null?'%':''}`);U.ck=null;render();toast('Check-in saved')},
		 addlink:el=>{U.add=el.dataset.id;render();const s=document.getElementById('ato');if(s)s.focus()},
		 addcancel:()=>{U.add=null;render()},
		 propose:el=>{const g=G(el.dataset.id),to=document.getElementById('ato').value;if(!g||!may.align(g))return denied();if(!propose(g,to)){toast('That link is not allowed. It would point to your own goal or close a loop.');return}U.add=null;render();toast(isPillar(to)?'Aligned to the pillar':'Link sent to '+P(nodeOwner(to)).name)},
		 accept:el=>{const l=LK(el.dataset.id);if(!l||!may.decide(l)||l.status!=='pending')return denied();l.status='accepted';hist(G(l.to),`Accepted “${G(l.from).title}” as support`);hist(G(l.from),`${P(ME()).name} accepted the link to “${nodeName(l.to)}”`);render();toast('Link accepted')},
		 reject:el=>{const l=LK(el.dataset.id);if(!l||!may.decide(l)||l.status==='rejected')return denied();const t=document.getElementById('why-'+l.id),r=t.value.trim();if(!r){t.setAttribute('aria-invalid','true');t.focus();toast('Give a reason so the owner knows what to change');return}
		  const was=l.status;l.status='rejected';l.reason=r;hist(G(l.to),`${was==='pending'?'Rejected':'Removed'} “${G(l.from).title}”: ${r}`);hist(G(l.from),`${P(ME()).name} ${was==='pending'?'rejected':'removed'} the link to “${nodeName(l.to)}”: ${r}`);render();toast(was==='pending'?'Link rejected':'Link removed')},
		 withdraw:el=>{const l=LK(el.dataset.id);if(!l||!may.withdraw(l))return denied();const g=G(l.from);S.links=S.links.filter(x=>x!==l);hist(g,`Removed the link to “${nodeName(l.to)}”`);promote(g);render();toast('Link removed')},
		 primary:el=>{const l=LK(el.dataset.id);if(!l||!may.withdraw(l)||l.status==='rejected')return denied();out(G(l.from)).forEach(x=>x.primary=false);l.primary=true;hist(G(l.from),`Main alignment set to “${nodeName(l.to)}”`);render();toast('Main alignment changed')},
		 export:()=>exportCsv(),
		 scope:el=>{U.scope=el.dataset.s;render()},
		 fsave:el=>saveForm(!!el.dataset.d),
		 kradd:()=>{U.form.krs.push(blankKr());U.form.dirty=true;render();const x=document.querySelectorAll('[data-ff=kr][data-k=t]');x[x.length-1].focus()},
		 krdel:el=>{U.form.krs.splice(+el.dataset.i,1);U.form.dirty=true;U.err={};render()},
		 aisuggest:()=>{U.ai={kind:'suggest',items:aiSuggest()};render()},
		 aireview:()=>{U.ai={kind:'review',checks:aiReview()};render()},
		 aiuse:el=>{const s=U.ai.items[+el.dataset.i];U.form.title=s.title;U.form.krs=s.krs.map(([t,a,b,u])=>({t,type:'number',start:String(a),target:String(b),current:'',unit:u,weight:'',steps:''}));U.form.dirty=true;U.ai=null;U.err={};render();toast('Filled in. Change anything before you submit.')},
		 aiclose:()=>{U.ai=null;render()},
		 pillar:el=>{U.dr={k:'pillar',id:el.dataset.id};render()},
		 prename:el=>{if(!canEditStrategy())return denied();const v=document.getElementById('pname').value.trim();if(!v)return;PL(el.dataset.id).name=v;render();toast('Pillar renamed')},
		 padd:()=>{if(!canEditStrategy())return denied();const v=document.getElementById('pnew').value.trim();if(!v)return;S.pillars.push({id:'p'+(S.seq++),name:v});render();toast('Pillar added')},
		 pgoal:el=>{if(!canEditStrategy()||cyc().closed)return denied();openForm({to:el.dataset.id})},
		 /* appraisal */
		 theme:el=>{S.theme=el.dataset.t==='gold'?'gold':'light';render()},
		 stepinfo:el=>{const s=el.dataset.s,a=apData();toast(`${STEPS[s]}${s==='appeal'?' happens only if the employee appeals.':''} Steps change only through Submit, Return or Acknowledge, never by selecting the timeline.`)},
		 print:()=>window.print(),
		 jump:el=>{const s=document.getElementById('s-'+el.dataset.s);if(s)s.scrollIntoView({block:'start'});const x=el.dataset.el&&document.getElementById(el.dataset.el);if(x)setTimeout(()=>x.focus(),50)},
		 apsave:()=>{const w=apData();if(!w||!apOwnerOk(w))return denied('This form is not at a step you own.');const a=copy(w);if(commitAp(a,'Draft saved')){toast('Draft saved');render()}},
		 apsubmit:()=>{const w=apData();if(!w||!apOwnerOk(w))return denied('This form is not at a step you own.');const er=validate(w);if(er.length){U.apErr={id:w.id,list:er};render();scrollTop();return}
		  apTransition(a=>{const from=a.step;
		   if(from==='self'){a.step=nextOf(a);return `Self-assessment submitted to ${P(P(a.emp).mgr).name}`}
		   if(from==='manager'){freeze(a);syncDev(a);a.back='';a.step=nextOf(a);return `Manager review submitted to ${STEPS[a.step]}`}
		   if(from==='calibration'){a.back='';a.step='ack';return 'Calibration completed and released to the employee'}
		   if(from==='appeal'){if(!(a.appeal.note||'').trim()){U.apErr={id:a.id,list:[{s:'summary',t:'Write the decision note.',el:'apnote'}]};render();return false}
		    const o=overall(a,'mr');a.final=a.appeal.decision==='revise'?num(a.appeal.rating):(finalRating(a)??(o.ok?o.v:null));a.step='done';return `Appeal closed: ${a.appeal.decision==='revise'?'rating revised':'rating upheld'}`}
		   return false},a=>({manager:'Submitted to your manager',calibration:'Submitted to calibration',ack:'Released to the employee',done:'Appraisal completed'})[a.step]||'Submitted')},
		 apretopen:el=>{U.ret=U.ap&&U.ap.id;el.closest('details')&&el.closest('details').removeAttribute('open');render();const t=document.getElementById('retmsg');if(t)t.focus()},
		 apretcancel:()=>{U.ret=null;render()},
		 apreturn:()=>{const t=document.getElementById('retmsg'),m=t.value.trim();if(!m){t.setAttribute('aria-invalid','true');t.focus();return toast('Say what needs to change')}const w=apData();if(!w||!['manager','calibration'].includes(w.step))return denied();
		  apTransition(a=>{const to=prevOf(a);a.back=m;a.step=to;U.ret=null;return `Returned to ${STEPS[to]}: ${m}`},a=>`Returned to ${STEPS[a.step]}`)},
		 apack:el=>{const w=apData();if(!w||w.step!=='ack')return denied();const d=el.dataset.d,txt=(document.getElementById('appealtxt')||{}).value||'';
		  if(d==='appeal'&&!S.config.appeal)return denied('Appeals are switched off.');if(d==='appeal'&&!txt.trim()){const t=document.getElementById('appealtxt');t.setAttribute('aria-invalid','true');t.focus();return toast('Give a reason for the appeal')}
		  apTransition(a=>{const o=overall(a,'mr'),fr=finalRating(a)??(o.ok?o.v:null);if(d==='accept'){a.ack={at:TODAY,decision:'accept',comment:''};a.final=fr;a.step='done';return 'Acknowledged by the employee'}
		   a.ack={at:TODAY,decision:'appeal',comment:txt.trim()};a.appeal={reason:txt.trim(),decision:'uphold',rating:fr!=null?Math.round(fr):3,note:''};a.step='appeal';return 'Appealed to HR: '+txt.trim()},a=>a.step==='done'?'Appraisal completed':'Appeal sent to HR')},
		 tnaadd:()=>{const a=apData();if(!a||!apOwnerOk(a)||a.step!=='manager')return denied();if(a.tna.length>=S.config.tnaMax)return toast(`No more than ${S.config.tnaMax} training needs can be added.`);a.tna.push({id:'tn'+(S.seq++),area:'',gap:'',learningId:'',outcome:'',due:'',devId:null});a.noTna.on=false;U.ap.dirty=true;render();const x=document.querySelector(`[data-key="ap-tna.${a.tna.length-1}.area"]`);if(x)x.focus()},
		 tnadel:el=>{const a=apData();if(!a||!apOwnerOk(a)||a.step!=='manager')return denied();a.tna.splice(+el.dataset.i,1);U.ap.dirty=true;render()},
		 apcomment:()=>{const t=document.getElementById('newcom'),v=t.value.trim();if(!v)return;const a0=AP(U.ap.id),c={at:TODAY,by:ME(),t:v};a0.comments.push(c);U.ap.d.comments.push(c);if(!saveNow()){a0.comments.pop();U.ap.d.comments.pop();return toast('The comment could not be saved. Try again.')}render();toast('Comment added')},
		 /* modules */
		 actsave:()=>{const t=document.getElementById('actt').value.trim(),g=document.getElementById('actg').value,er=document.getElementById('acterr');if(!t||!g){er.textContent=!t?'Describe the activity.':'You need an approved goal to link the activity to.';er.hidden=false;return}
		  S.activities.unshift({id:'ac'+(S.seq++),owner:ME(),goalId:g,title:t,status:document.getElementById('acts').value,at:TODAY,notes:document.getElementById('actn').value.trim()});go(href('/activities'));toast('Activity saved')},
		 fbsend:()=>{const q=document.getElementById('fbq').value.trim(),er=document.getElementById('fberr');if(!q){er.textContent='Write your question.';er.hidden=false;return}const to=document.getElementById('fbto').value;
		  S.feedback.unshift({id:'fb'+(S.seq++),from:ME(),to,goalId:document.getElementById('fbg').value||null,q,status:'requested',a:'',at:TODAY});go(href('/activities',{tab:'feedback'}));toast('Request sent to '+P(to).name)},
		 fbgive:el=>{const f=S.feedback.find(x=>x.id===el.dataset.id);if(!f||f.to!==ME()||f.status!=='requested')return denied();const t=document.getElementById('fba-'+f.id),v=t.value.trim();if(!v){t.setAttribute('aria-invalid','true');t.focus();return toast('Write your feedback first')}f.a=v;f.status='given';render();toast('Feedback sent to '+P(f.from).name)},
		 fbdecline:el=>{const f=S.feedback.find(x=>x.id===el.dataset.id);if(!f||f.to!==ME()||f.status!=='requested')return denied();f.status='declined';render();toast('Request declined')},
		 seturl:el=>{if(!isAdmin())return denied();const v=document.getElementById('url-'+el.dataset.id).value.trim();if(v){let u;try{u=new URL(v)}catch(x){return toast('That is not a valid address.')}if(u.protocol!=='https:')return toast('The address must start with https://')}S.config.apps[el.dataset.id]=v;render();toast(v?'Address saved':'Address removed; the application shows as not configured')}};
		document.addEventListener('click',ev=>{if(!ev.target.closest('.tb,.gsearch')&&(U.pop||U.search)){U.pop=null;U.search='';if(!ev.target.closest('[data-a]')&&!ev.target.closest('a')){render();return}}
		 const a=ev.target.closest('a[href^="#"]');if(a&&!a.dataset.a){U.pop=null;U.search='';U.nav=false}
		 const el=ev.target.closest('[data-a]');if(!el||el.tagName==='SELECT'||(el.tagName==='INPUT'&&el.type!=='button'))return;const f=A[el.dataset.a];if(f){if(el.tagName!=='A')ev.preventDefault();f(el,ev)}});
		document.addEventListener('input',ev=>{const t=ev.target;if(t.getAttribute('aria-invalid')&&t.value)t.removeAttribute('aria-invalid');
		 if(t.dataset.a==='gs'){U.search=t.value;U.pop=null;render();return}
		 if(t.dataset.ff&&t.type!=='radio'&&t.tagName!=='SELECT')readForm(t);
		 if(t.dataset.f==='q'){U.q=t.value;render();return}
		 if(t.dataset.ap&&!['SELECT'].includes(t.tagName)&&!['checkbox','radio','date','file'].includes(t.type)&&U.ap){setPath(U.ap.d,t.dataset.ap,t.value);U.ap.dirty=true;const s=document.getElementById('savest');if(s)s.textContent='Unsaved changes'}});
		document.addEventListener('change',ev=>{const t=ev.target;
		 if(t.dataset.a==='as'){if(dirty()&&!confirm('You have unsaved changes. Switch persona and discard them?')){t.value=ME();return}S.as=t.value;U.ap=U.form=U.dr=null;U.pop=null;U.ck=null;go('#/home');toast('Demo persona: '+P(t.value).name+' · '+ROLE[roleOf(t.value)]);return}
		 if(t.dataset.a==='cycle'){S.cycle=t.value;U.pop=null;const r=R();if(r.q.cycle)go(withQ({cycle:t.value}),true);else render();toast(cyc().name+' cycle'+(cyc().closed?' (closed, read-only)':''));return}
		 if(t.dataset.a==='apfile'){const fl=t.files&&t.files[0];if(!fl||!U.ap)return;const a0=AP(U.ap.id),x={name:fl.name,size:fl.size,by:ME(),at:TODAY};a0.files.push(x);U.ap.d.files.push(x);if(!saveNow()){a0.files.pop();U.ap.d.files.pop();toast('The attachment could not be saved.');return}render();toast('Attachment added (name and size only)');return}
		 if(t.dataset.a==='dvstatus'){const d=DV(t.dataset.id);if(!d||!(d.emp===ME()||P(d.emp).mgr===ME()))return denied();d.status=t.value;d.hist.push({at:TODAY,by:ME(),w:'Status set to '+t.value});render();toast('Status updated');return}
		 if(t.dataset.cfg){if(!isAdmin())return denied();const k=t.dataset.cfg;if(k==='theme')S.theme=t.value;else if(k==='decimals')S.config.decimals=+t.value;else S.config[k]=t.checked;render();toast('Setting saved');return}
		 if(t.dataset.ap&&U.ap){let v=t.type==='checkbox'?t.checked:t.value;if(/\.(er|mr|rating)$/.test(t.dataset.ap))v=num(v);setPath(U.ap.d,t.dataset.ap,v);U.ap.dirty=true;render();return}
		 if(t.dataset.ff&&(t.type==='radio'||t.tagName==='SELECT'||t.type==='date'||t.type==='number'))readForm(t);
		 else if(t.dataset.f&&t.dataset.f!=='q'){U[t.dataset.f]=t.type==='checkbox'?t.checked:t.value;render()}});
		document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if(U.pop||U.search){U.pop=null;U.search='';render();return}if(U.nav){U.nav=false;render();return}if(document.querySelector('.drawer')){closeDrawer();return}}
		 const dw=document.querySelector('.drawer');if(ev.key==='Tab'&&dw){const f=[...dw.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
		  if(ev.shiftKey&&(document.activeElement===f[0]||!dw.contains(document.activeElement))){ev.preventDefault();f[f.length-1].focus()}else if(!ev.shiftKey&&document.activeElement===f[f.length-1]){ev.preventDefault();f[0].focus()}}});
		if(!hashNow())setHash('#/home',true);U.last=hashNow();
		render();
	}
	return { start: start };
});
