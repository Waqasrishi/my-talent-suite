sap.ui.define([], function () {
"use strict";
/* AJMN People: the page's own people, sample data, rules and workflow (goals-hub.html), unchanged, as a module with no screen in it. */

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
const KEY='ajmn-people-fiori',TODAY=new Date().toISOString().slice(0,10),STALE=30;
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
const health=g=>{const c=g.checkins[g.checkins.length-1];return !c?'none':age(c.at)>STALE&&open(g)?'stale':c.status};
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
function parse(h){h=(h??'').replace(/^#/,'')||'/home';const [p,qs]=h.split('?');return {path:p.startsWith('/')?p:'/'+p,parts:p.split('/').filter(Boolean),q:Object.fromEntries(new URLSearchParams(qs||''))}}
const href=(path,q)=>{const qs=new URLSearchParams(Object.entries(q||{}).filter(([k,v])=>v!=null&&v!=='')).toString();return '#'+path+(qs?'?'+qs:'')};
const SECS=[['overview','Form overview',0],['profile','Employee profile',1],['objectives','Performance objectives',1],['tna','Training needs assessment',1],['summary','Overall performance summary',1],['comments','Comments',0],['attachments','Attachments',0],['history','Form history',0]];
const secNo=id=>{if(!S.config.numbers)return '';const n=SECS.filter(s=>s[2]).findIndex(s=>s[0]===id);return n<0?'':String(n+1).padStart(2,'0')};
const canSeeDev=d=>!!d&&(d.emp===ME()||below(ME()).includes(d.emp)||isHR());
function apOwnerOk(a){const c=CYC(a.cycle);return ownerOf(a)===ME()&&a.step!=='done'&&!c.closed}
function syncDev(a){const keep=new Set();a.tna.filter(t=>t.area.trim()).forEach(t=>{let d=t.devId&&DV(t.devId);const f={area:t.area.trim(),gap:t.gap.trim(),learningId:t.learningId||'',outcome:t.outcome.trim(),due:t.due};
  if(d){Object.assign(d,f);d.hist.push({at:TODAY,by:ME(),w:'Updated from the appraisal'})}else{d=Object.assign({id:'dv'+(S.seq++),emp:a.emp,cycle:a.cycle,plan:'tna',status:'Planned',source:a.id,hist:[{at:TODAY,by:ME(),w:`Created from the ${CYC(a.cycle).name} appraisal`}]},f);S.dev.push(d);t.devId=d.id}keep.add(d.id)});
 S.dev.filter(d=>d.source===a.id&&!keep.has(d.id)&&d.status!=='Withdrawn').forEach(d=>{d.status='Withdrawn';d.hist.push({at:TODAY,by:ME(),w:'Removed from the appraisal'})})}

/* =====================================================================================
   Below: what the Fiori app adds around the rules above. The rules, sample data and workflow
   are the AJMN People page's own, unchanged; this part turns them into view models and actions.
   ===================================================================================== */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=x=>JSON.parse(JSON.stringify(x));
let notify=()=>{};
const toast=m=>notify(m);
let S;
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(x){}
 S=s&&s.goals&&s.appraisals&&s.config&&PEOPLE[s.as]?s:seed()}
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(S));U.saveErr=false;return true}catch(x){U.saveErr=true;return false}}
const save=()=>saveNow();

/* where we are, and the filters and open panels that belong to a screen */
const N={name:'home',args:{},q:{}};
const U={q:'',fd:'',ft:'',fs:'',fh:'',farch:false,sort:'due',scope:'all',ck:null,add:null,apErr:null,apSaveErr:null,saveErr:false};

const ICON={home:'home',tree:'org-chart',target:'target-group',form:'survey',chat:'discussion',grow:'trend-up',cap:'education',users:'group',ladder:'career-path',book:'course-book',flow:'workflow-tasks',bars:'bar-chart',help:'headset',gear:'action-settings',plus:'add',feedback:'feedback',bell:'bell',alert:'alert',check:'accept'};
const ico=k=>'sap-icon://'+(ICON[k]||'document');
const PS={ok:'Success',wait:'Warning',bad:'Error',draft:'None'};
const stOf=s=>({text:STATUS[s][0],state:PS[STATUS[s][1]]});
const lstOf=s=>({text:LST[s][0],state:PS[LST[s][1]]});
const hOf=g=>{const h=health(g);return {text:HEALTH[h][0],state:PS[HEALTH[h][1]],key:h}};
const barState=g=>g.status!=='approved'?'None':({on:'Success',risk:'Warning',off:'Error'}[health(g)]||'Information');
const measure=k=>k.type==='binary'?(k.current?'Done':'Not done'):k.type==='milestone'?`${k.steps.filter(s=>s.done).length} of ${k.steps.length} steps`:`${k.current==null?'–':k.current} ${k.unit} · from ${k.start} to ${k.target} ${k.unit}${num(k.target)<num(k.start)?' (lower is better)':''}`;
const noAccess=m=>({denied:true,title:'Not available',msg:m});
const notFound=()=>({denied:true,title:'Page not found',msg:'This address does not match a page or a record you can open. It may have been removed or archived.'});
const cycSub=()=>cyc().name+' cycle';
const initials=id=>P(id).name.split(' ').map(w=>w[0]).join('').slice(0,2);
const opt=(key,text)=>({key,text});

/* ---------- routes: every screen keeps the address it has in the page ---------- */
function toRoute(h){const r=parse(h),p=r.parts,a=p[0]||'home';let name='notFound',args={};
 if(['home','strategy','performance','team','training','activities','approvals','admin'].includes(a))name=a;
 else if(a==='goals')name=p[1]==='all'?'goalsAll':'goals';
 else if(a==='appraisal'&&p[1]){name='appraisal';args={id:p[1]}}
 else if(a==='development'){name=p[1]?'devRecord':'development';if(p[1])args={id:p[1]}}
 else if(a==='learning'){name=p[1]?'learningItem':'learning';if(p[1])args={id:p[1]}}
 else if(a==='reports'){name=p[1]?'drill':'reports';if(p[1])args={m:p[1]}}
 else if(a==='apps'&&p[1]){name='app';args={id:p[1]}}
 return {name,args,q:r.q}}
function setRoute(name,args,q){N.name=name;N.args=args||{};N.q=q||{}}
const route=()=>({name:N.name,args:N.args,q:N.q});
const navKeyOf=()=>({home:'home',goals:'goals',goalsAll:'goals',strategy:'strategy',performance:'performance',appraisal:'performance',activities:'cpm',development:'development',devRecord:'development',training:'development',team:'team',learning:'learning',learningItem:'learning',approvals:'approvals',reports:'reports',drill:'reports',admin:'admin'}[N.name]||'');
/* one-off parameters (open a form, start a check-in) act once and are then removed from the address */
function takeQuery(){const q=N.q,rest=Object.assign({},q),o={form:null,strip:false,rest};
 if(q.new&&N.name==='goals'){delete rest.new;o.strip=true;if(isPart()&&!cyc().closed)o.form=openForm({});else toast('You cannot create a goal here.')}
 if(q.edit&&q.goal){const g=G(q.goal);delete rest.edit;o.strip=true;if(g&&may.edit(g))o.form=openForm(formFromGoal(g))}
 if(q.checkin&&q.goal){const g=G(q.goal);delete rest.checkin;o.strip=true;if(g&&may.checkin(g))U.ck=g.id;else toast('You cannot check in on this goal.')}
 return o}

/* ---------- shell: header, side menu, search, notifications ---------- */
const APP_ROUTE=a=>a.kind==='internal'?'#'+a.route:'#/apps/'+a.id;
const badgeOf=a=>a.kind==='internal'?(a.sample?'Sample data':''):avail(a)?'External':'Not configured';
function crumbs(){const p=toParts(),a=x=>APPS.find(y=>y.id===x),c=[['Home','#/home']];
 const map={goals:p[1]==='all'?[['My Goals','#/goals'],['All goals',null]]:[['My Goals',null]],strategy:[['Strategy & Alignment',null]],performance:[['Performance',null]],
  appraisal:[['Performance','#/performance'],[AP(p[1])&&canSeeAp(AP(p[1]))?`${P(AP(p[1]).emp).name} · ${CYC(AP(p[1]).cycle).name} appraisal`:'Appraisal',null]],team:[['My Team',null]],
  development:p[1]?[['My Development','#/development'],[DV(p[1])?DV(p[1]).area:'Record',null]]:[['My Development',null]],training:[['Training Needs',null]],activities:[['Continuous Performance',null]],
  learning:p[1]?[['Learning','#/learning'],[LR(p[1])?LR(p[1]).title:'Course',null]]:[['Learning',null]],approvals:[['Workflows & Approvals',null]],reports:p[1]?[['Reports & Analytics','#/reports'],['Details',null]]:[['Reports & Analytics',null]],
  admin:[['Admin Center',null]],apps:[[a(p[1])?a(p[1]).label:'Application',null]]};
 if(p[0]==='home'||N.name==='notFound')return {links:[],current:''};
 const all=[...c,...(map[p[0]]||[['Not found',null]])],last=all[all.length-1];
 return {links:all.slice(0,-1).map(([text,h])=>({text,href:h})),current:last[0]}}
const toParts=()=>{const m={home:['home'],goals:['goals'],goalsAll:['goals','all'],strategy:['strategy'],performance:['performance'],appraisal:['appraisal',N.args.id],team:['team'],development:['development'],devRecord:['development',N.args.id],training:['training'],activities:['activities'],learning:['learning'],learningItem:['learning',N.args.id],approvals:['approvals'],reports:['reports'],drill:['reports',N.args.m],admin:['admin'],app:['apps',N.args.id]};return m[N.name]||['notfound']};
function searchResults(q){q=q.trim().toLowerCase();if(!q)return [];const R=[],m=s=>s.toLowerCase().includes(q);
 S.goals.filter(g=>g.cycle===S.cycle&&canSee(g)&&!g.archived&&(m(g.title)||m(P(g.owner).name))).slice(0,5).forEach(g=>R.push({k:'Goal · '+P(g.owner).name,t:g.title,h:href(g.owner===ME()?'/goals':'/goals/all',{goal:g.id})}));
 S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&m(P(a.emp).name+' appraisal')).slice(0,3).forEach(a=>R.push({k:'Appraisal · '+STEPS[a.step],t:P(a.emp).name,h:'#/appraisal/'+a.id}));
 PART.filter(p=>m(P(p).name)&&(p===ME()||below(ME()).includes(p)||isHR())).slice(0,3).forEach(p=>R.push({k:'Person · '+P(p).title,t:P(p).name,h:href('/goals/all',{owner:p})}));
 APPS.filter(a=>allowed(a)&&m(a.label)).forEach(a=>R.push({k:'Application',t:a.label,h:APP_ROUTE(a)}));return R.slice(0,9)}
function shell(){const me=ME(),T=tasks();
 return {me:{id:me,name:P(me).name,initials:initials(me),title:P(me).title,dept:P(me).dept,line:`${ROLE[roleOf(me)]} · demo persona`,role:ROLE[roleOf(me)]},
  personas:Object.keys(PEOPLE).map(id=>opt(id,`${P(id).name} · ${P(id).title} (${ROLE[roleOf(id)]})`)),
  cycles:S.cycles.map(c=>opt(c.id,c.name+(c.closed?' (closed)':''))),cycle:S.cycle,cycleName:cyc().name,
  nav:APPS.filter(a=>a.nav&&allowed(a)).map(a=>({key:a.id,text:a.label,icon:ico(a.icon),href:APP_ROUTE(a)})),navKey:navKeyOf(),
  bell:{count:T.length,text:String(T.length),items:T.slice(0,7).map(t=>({title:t.obj,type:t.type,desc:t.who+(t.due?' · due '+fmt(t.due):''),href:t.href}))},
  launcher:APPS.filter(a=>a.id!=='home').map(a=>({key:a.id,text:a.label,icon:ico(a.icon),enabled:allowed(a),badge:badgeOf(a),href:APP_ROUTE(a),ext:a.kind==='external'&&avail(a)?appUrl(a):''})),
  saveErr:U.saveErr,crumbs:crumbs()}}

/* ---------- goal rows shared by lists ---------- */
function gRow(g){const s=stOf(g.status),p=goalPct(g),h=g.status==='approved'?hOf(g):null;
 return {id:g.id,title:g.title,archived:!!g.archived,owner:P(g.owner).name,dept:P(g.owner).dept,type:TYPES[g.type],
  line:`${TYPES[g.type]}${g.weight!=null?' · weight '+g.weight+'%':''} · ${alignText(g)}`,ownerLine:`${P(g.owner).name} · ${P(g.owner).dept} · ${TYPES[g.type]}`,notAligned:!primary(g),
  due:g.due?fmt(g.due):'–',pct:p==null?0:p,pctText:p==null?'No data yet':p+'%',barState:barState(g),status:s.text,statusState:s.state,hasHealth:!!h,health:h?h.text:'',healthState:h?h.state:'None'}}
const alignText=g=>{const p=primary(g);if(!p)return 'Not aligned';const n=out(g).filter(l=>l.status!=='rejected').length,i=inb(g).filter(l=>l.status!=='rejected').length;return `Supports: ${nodeName(p.to)}${p.status==='pending'?' (pending)':''} · out ${n} · in ${i}`};

/* ---------- home ---------- */
function pHome(){const me=ME(),h=new Date().getHours(),greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening',T=tasks(),a=myAp(me),part=isPart();
 const ckGoal=S.goals.filter(g=>own(g)&&may.checkin(g)&&g.cycle===S.cycle).sort((x,y)=>(['none','stale'].includes(health(y))?1:0)-(['none','stale'].includes(health(x))?1:0))[0];
 const qa=[['Create Goal','target',part&&!cyc().closed,href('/goals',{new:1}),'Only people with goals in an open cycle can create one'],
  ['Update Progress','grow',part&&!!ckGoal,ckGoal?href('/goals',{goal:ckGoal.id,checkin:1}):'','You have no approved goals to update'],
  ['Request Feedback','feedback',part,href('/activities',{tab:'feedback',new:1}),'Only people with goals can request feedback'],
  ['Create Activity','plus',part,href('/activities',{new:1}),'Only people with goals can log activities'],
  ['Review Team','users',hasTeam(),'#/team','You have no direct reports'],['View Reports','bars',canReports(),'#/reports','Reports are for managers and HR']];
 const hero=part?[['My Goals','#/goals','Emphasized'],['My Performance',a&&canSeeAp(a)?'#/appraisal/'+a.id:'#/performance','Default'],['My Development','#/development','Default']]
  :isHR()?[['Appraisals in progress','#/performance','Emphasized'],['Reports','#/reports','Default'],['My tasks','#/approvals','Default']]:[['Admin Center','#/admin','Emphasized'],['Strategy & Alignment','#/strategy','Default']];
 return {title:'Home',greet:`${greet}, ${first(me)}`,cycle:cycSub(),
  hero:hero.map(([text,href,type])=>({text,href,type})),qa:qa.map(([text,ic,ok,href,why])=>({text,icon:ico(ic),enabled:!!(ok&&href),href,why:ok&&href?'':why})),
  naCount:T.length,na:T.slice(0,6).map(t=>({icon:ico(t.icon),type:t.type,obj:t.obj,who:t.who,cycle:t.cycle+' cycle',due:t.due?'Due '+fmt(t.due):'No due date',late:!!(t.due&&t.due<TODAY),state:t.state,act:t.act,href:t.href})),
  tiles:APPS.filter(x=>x.id!=='home').map(x=>({key:x.id,text:x.label,desc:x.desc||'',icon:ico(x.icon),enabled:allowed(x),foot:[badgeOf(x),!allowed(x)?'Not for your role':''].filter(Boolean).join(' · '),
   ext:x.kind==='external'&&avail(x)?appUrl(x):'',href:APP_ROUTE(x)}))}}

/* ---------- my goals, all goals ---------- */
function nextSteps(){const me=ME(),r=[],my=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle&&!g.archived);
 my.filter(g=>g.status==='draft').forEach(g=>r.push({t:`“${g.title}” is still a draft.`,b:'Finish and submit',h:href('/goals',{goal:g.id,edit:1})}));
 my.forEach(g=>out(g).filter(l=>l.status==='rejected').forEach(l=>r.push({t:`${P(nodeOwner(l.to)).name} declined to align “${g.title}” to “${nodeName(l.to)}”${l.reason?': '+l.reason:''}.`,b:'Open',h:href('/goals',{goal:g.id})})));
 my.filter(g=>g.status==='approved'&&!primary(g)).forEach(g=>r.push({t:`“${g.title}” is not aligned to strategy.`,b:'Align it',h:href('/goals',{goal:g.id})}));return r}
function pMine(){const me=ME();if(!isPart())return noAccess('My Goals is for people who own goals.');
 const T=tasks().filter(t=>t.icon==='target'||t.icon==='tree'),st=nextSteps(),c=cyc(),gs=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle),live=gs.filter(g=>!g.archived),arc=gs.filter(g=>g.archived),ws=weightsOf(me,S.cycle),wt=ws.reduce((a,g)=>a+num(g.weight),0);
 return {title:'My Goals',sub:`${P(me).name} · ${P(me).title} · ${c.name} cycle`,closed:c.closed,
  banner:c.closed?'This cycle is closed. Its goals are read-only.':'',weightBanner:ws.length&&wt!==100?`Your goal weights add up to ${wt}%. They must add up to 100% before your appraisal can be submitted.`:'',
  steps:[...T.map(t=>({text:`${t.type} · ${t.obj}`,btn:t.act,href:t.href,pri:true})),...st.map(s=>({text:s.t,btn:s.b,href:s.h,pri:false}))],showSteps:!c.closed,
  rows:live.map(gRow),arc:arc.map(gRow),arcTitle:`Archived (${arc.length})`,hasArc:arc.length>0}}
const GFILT={types:[opt('','All'),...Object.entries(TYPES).map(([k,v])=>opt(k,v))],statuses:[opt('','All'),...Object.entries(STATUS).map(([k,v])=>opt(k,v[0]))],healths:[opt('','All'),...Object.entries(HEALTH).map(([k,v])=>opt(k,v[0]))],
 depts:[opt('','All'),opt('Operations','Operations'),opt('Digital','Digital')],sorts:[opt('due','Due date'),opt('progress','Progress, highest first'),opt('updated','Latest check-in'),opt('owner','Owner')]};
function listRows(){const q=U.q.trim().toLowerCase();let gs=S.goals.filter(g=>g.cycle===S.cycle&&canSee(g)&&(U.farch||!g.archived));
 if(N.q.owner)gs=gs.filter(g=>g.owner===N.q.owner);
 if(q)gs=gs.filter(g=>(g.title+' '+P(g.owner).name+' '+g.krs.map(k=>k.t).join(' ')).toLowerCase().includes(q));
 if(U.fd)gs=gs.filter(g=>P(g.owner).dept===U.fd);if(U.ft)gs=gs.filter(g=>g.type===U.ft);if(U.fs)gs=gs.filter(g=>g.status===U.fs);if(U.fh)gs=gs.filter(g=>g.status==='approved'&&health(g)===U.fh);
 const last=g=>{const c=g.checkins[g.checkins.length-1];return c?c.at:''},cmp={due:(a,b)=>(a.due||'9').localeCompare(b.due||'9'),progress:(a,b)=>(goalPct(b)??-1)-(goalPct(a)??-1),owner:(a,b)=>P(a.owner).name.localeCompare(P(b.owner).name),updated:(a,b)=>last(b).localeCompare(last(a))}[U.sort];
 return gs.slice().sort(cmp)}
function pAll(){const rows=listRows();return {title:'All goals',sub:`${cyc().name} cycle · ${rows.length} goal${rows.length===1?'':'s'}${N.q.owner?` · owned by ${P(N.q.owner).name}`:''}`,ownerFilter:N.q.owner?P(N.q.owner).name:'',
  rows:rows.map(gRow),count:rows.length,opts:GFILT}}
const filterState=()=>({q:U.q,fd:U.fd,ft:U.ft,fs:U.fs,fh:U.fh,farch:U.farch,sort:U.sort});
function setFilters(f){['q','fd','ft','fs','fh','sort'].forEach(k=>{U[k]=f[k]??''});U.farch=!!f.farch;if(!U.sort)U.sort='due'}
function csv(){const rows=listRows(),q=v=>`"${String(v??'').replace(/"/g,'""')}"`,head=['Cycle','Goal','Owner','Department','Type','Approval','Health','Progress %','Due','Weight %','Main alignment','Archived'];
 const text=[head,...rows.map(g=>{const p=primary(g);return [cyc().name,g.title,P(g.owner).name,P(g.owner).dept,TYPES[g.type],STATUS[g.status][0],g.status==='approved'?HEALTH[health(g)][0]:'',goalPct(g)??'',g.due,g.weight??'',p?nodeName(p.to)+(p.status==='accepted'?'':' ('+p.status+')'):'',g.archived?'Yes':'No']})].map(r=>r.map(q).join(',')).join('\r\n');
 return {text:'﻿'+text,name:`goals-${cyc().name}.csv`,count:rows.length}}

/* ---------- strategy map: the same layout as the page, drawn as boxes and curves ---------- */
function layout(){const W=210,H=74,CW=260,RH=90,TOP=46,nodes=[],tree=[];let row=0;const vis=S.goals.filter(g=>shown(g)&&g.status!=='draft'),placed=new Set();
 const kids=id=>vis.filter(g=>{const p=primary(g);return p&&p.to===id}).map(g=>({k:'g',id:g.id,lv:P(g.owner).lv}));
 const place=n=>{if(n.k==='g')placed.add(n.id);const ks=kids(n.id).filter(c=>!placed.has(c.id));let y;if(!ks.length)y=row++;else{const ys=ks.map(c=>{tree.push([n,c]);return place(c)});y=(ys[0]+ys[ys.length-1])/2}n.y=y;nodes.push(n);return y};
 S.pillars.forEach(p=>{place({k:'p',id:p.id,lv:0});row+=.35});
 const rest=vis.filter(g=>!placed.has(g.id));let band=null;if(rest.length){row+=.4;band=row;rest.filter(g=>!rest.some(x=>{const p=primary(g);return p&&p.to===x.id})).forEach(g=>place({k:'g',id:g.id,lv:P(g.owner).lv}));vis.filter(g=>!placed.has(g.id)).forEach(g=>place({k:'g',id:g.id,lv:P(g.owner).lv}))}
 nodes.forEach(n=>{n.x=16+n.lv*CW;n.top=TOP+12+n.y*RH});const at=id=>nodes.find(n=>n.id===id);
 const extra=S.links.filter(l=>!l.primary&&l.status!=='rejected'&&at(l.from)&&at(l.to)).map(l=>[at(l.to),at(l.from),l]);
 return {nodes,tree,extra,band:band==null?null:TOP+12+band*RH-26,W,H,CW,width:16+LEVELS.length*CW,height:TOP+24+Math.max(row,1)*RH}}
function pMap(){const L=layout(),fg=N.q.focus&&G(N.q.focus),fp=fg&&canSee(fg)?path(fg):null,on=new Set(fp?[fg.id,...fp.chain.map(x=>x.id),fp.pillar].filter(Boolean):[]);
 const box=n=>{const st=`left:${n.x}px;top:${n.top}px;width:${L.W}px;height:${L.H}px`,f=fp?(on.has(n.id)?' focus':' dim'):'';
  if(n.k==='p'){const p=PL(n.id);return `<button type="button" class="tsBox pillar${f}" style="${st}" data-pillar="${esc(p.id)}"><small>Pillar</small><b>${esc(p.name)}</b></button>`}
  const g=G(n.id),pr=primary(g),p=goalPct(g),h=g.status==='approved'?health(g):null;
  return `<button type="button" class="tsBox ${g.status!=='approved'?'wait':''} ${!pr||!aligned(g)&&!(pr&&pr.status==='pending')?'loose':''} h-${h}${f}" style="${st}" data-goal="${esc(g.id)}" data-id="${esc(g.id)}"><b>${esc(g.title)}</b><small>${esc(P(g.owner).name)} · ${esc(P(g.owner).dept)}${g.status!=='approved'?' · '+STATUS[g.status][0]:h?' · '+HEALTH[h][0]:''}</small><span class="tsBar"><i style="width:${p??0}%"></i></span></button>`};
 const curve=(a,b,cls)=>{const x1=a.x+L.W,y1=a.top+L.H/2,x2=b.x,y2=b.top+L.H/2,m=(x1+x2)/2;return `<path d="M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}" class="${cls}${fp&&on.has(a.id)&&on.has(b.id)?' hot':''}"/>`};
 const pl=l=>l&&l.status==='pending'?'pend':'';
 const html=`<div class="tsMapWrap"><div class="tsMap" style="width:${L.width}px;height:${L.height}px"><div class="tsColh" style="width:${L.width}px">${LEVELS.map(l=>`<div style="width:${L.CW}px">${esc(l)}</div>`).join('')}</div>
  <svg width="${L.width}" height="${L.height}" aria-hidden="true">${L.tree.map(([a,b])=>curve(a,b,'ln '+(b.k==='g'?pl(primary(G(b.id))):''))).join('')}${L.extra.map(([a,b,l])=>curve(a,b,'ln x '+pl(l))).join('')}</svg>
  ${L.band!=null?`<div class="tsBand" style="top:${L.band}px">Not aligned to strategy</div>`:''}${L.nodes.map(box).join('')}</div></div>`;
 let banner='',bt='Information';
 if(fg){if(fp){banner=`Showing the path of “${fg.title}” to ${fp.pillar?`the pillar “${PL(fp.pillar).name}”${fp.ok?'':' (a link on the way is not accepted yet)'}`:'strategy: it does not reach a pillar'}.`}else{banner='That goal is not available to you.';bt='Error'}}
 return {title:'Strategy & Alignment',sub:`${cyc().name} cycle, pillars to staff. Grey lines are each goal’s main alignment; blue dashed lines are extra links, often across departments; dotted lines wait to be accepted.`,
  banner,bannerType:bt,showAll:!!fg,html,focus:fg&&fp?fg.id:''}}

/* ---------- reports ---------- */
const scopePeople=()=>isHR()||P(ME()).lv===1&&U.scope==='all'?PART:[ME(),...below(ME())].filter(p=>P(p).lv>=1);
function pReports(){if(!canReports())return noAccess('Reports are for managers and HR.');
 const ppl=scopePeople(),gs=S.goals.filter(g=>shown(g)&&ppl.includes(g.owner)),ap=gs.filter(g=>g.status==='approved');
 const has=p=>ap.some(g=>g.owner===p),pv=l=>l.map(goalPct).filter(x=>x!=null),avg=l=>{const v=pv(l);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null},al=ap.filter(aligned),dl=m=>'#/reports/'+m;
 const lv=[1,2,3,4,5].map(l=>{const at=ppl.filter(p=>P(p).lv===l);return at.length?{text:LEVELS[l],pct:Math.round(at.filter(has).length/at.length*100),n:`${at.filter(has).length} of ${at.length}`,href:dl('coverage-'+l)}:null}).filter(Boolean);
 const pls=S.pillars.map(p=>{const l=al.filter(g=>rootPillar(g)===p.id),a=avg(l);return {text:p.name,pct:a??0,n:a==null?'no data':a+'%',href:dl('pillar-'+p.id)}});
 const aps=S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&ppl.includes(a.emp)),a0=avg(ap),un=ap.filter(g=>!aligned(g));
 return {title:'Reports & Analytics',sub:`${cyc().name} cycle · ${isHR()||P(ME()).lv===1&&U.scope==='all'?'everyone':'you and your team'}. Select any figure to see the records behind it.`,
  isEd:P(ME()).lv===1,scope:U.scope==='all'?'all':'team',
  stats:[{n:String(ap.length),text:`approved goals${gs.length>ap.length?` · ${gs.length-ap.length} in progress`:''}`,href:dl('approved')},
   {n:(ap.length?Math.round(al.length/ap.length*100):0)+'%',text:`trace to a pillar through accepted links (${al.length} of ${ap.length})`,href:dl('aligned')},
   {n:a0==null?'–':a0+'%',text:`average progress, from ${pv(ap).length} goals with data`,href:dl('approved')}],
  apSteps:['self','manager','calibration','ack','appeal','done'].map(s=>({text:`${STEPS[s]} · ${aps.filter(a=>a.step===s).length}`,state:s==='done'?'Success':'None',href:dl('ap-'+s)})),
  health:Object.keys(HEALTH).map(h=>({text:`${HEALTH[h][0]} · ${ap.filter(g=>health(g)===h).length}`,state:PS[HEALTH[h][1]],href:dl('health-'+h)})),healthNote:`From each goal’s latest check-in; older than ${STALE} days counts as overdue.`,
  levels:lv,pillars:pls,unText:`Not aligned to strategy (${un.length})`,unHref:dl('unaligned')}}
function pDrill(){if(!canReports())return noAccess('Reports are for managers and HR.');
 const m=N.args.m,ppl=scopePeople(),gs=S.goals.filter(g=>shown(g)&&ppl.includes(g.owner)),ap=gs.filter(g=>g.status==='approved');let title='',rows=null,aps=null;
 if(m==='approved'){title='Approved goals';rows=ap}else if(m==='aligned'){title='Goals that trace to a pillar';rows=ap.filter(aligned)}else if(m==='unaligned'){title='Goals not aligned to strategy';rows=ap.filter(g=>!aligned(g))}
 else if(m.startsWith('health-')){const h=m.slice(7);title='Health: '+(HEALTH[h]||['?'])[0];rows=ap.filter(g=>health(g)===h)}
 else if(m.startsWith('pillar-')){const p=PL(m.slice(7));title='Goals under '+(p?p.name:'?');rows=ap.filter(g=>aligned(g)&&rootPillar(g)===m.slice(7))}
 else if(m.startsWith('coverage-')){const l=+m.slice(9);title=LEVELS[l]+': approved goals';rows=ap.filter(g=>P(g.owner).lv===l)}
 else if(m.startsWith('ap-')){const s=m.slice(3);title='Appraisals at '+(STEPS[s]||'?');aps=S.appraisals.filter(a=>a.cycle===S.cycle&&canSeeAp(a)&&ppl.includes(a.emp)&&a.step===s)}
 else return notFound();
 const n=(rows||aps).length;
 return {title,sub:`${cyc().name} cycle · ${n} record${n===1?'':'s'} · same scope and calculations as the report`,goals:(rows||[]).map(gRow),isGoals:!!rows,
  aps:(aps||[]).map(apRow),count:n}}
function setScope(s){U.scope=s}

/* ---------- performance list, team ---------- */
const apRow=a=>({id:a.id,name:P(a.emp).name,title:P(a.emp).title,cycle:CYC(a.cycle).name,step:STEPS[a.step],stepState:a.step==='done'?'Success':'Warning',with:a.step!=='done'&&ownerOf(a)?P(ownerOf(a)).name:'',due:a.step!=='done'&&dueOf(a)?'Due '+fmt(dueOf(a)):'',href:'#/appraisal/'+a.id});
function pPerformance(){const me=ME(),mine=S.appraisals.filter(a=>a.emp===me),cur=mine.find(a=>a.cycle===S.cycle),team=S.appraisals.filter(a=>a.cycle===S.cycle&&a.emp!==me&&below(me).includes(a.emp)),all=isHR()?S.appraisals.filter(a=>a.cycle===S.cycle):[];
 return {title:'Performance',sub:cycSub(),isPart:isPart(),cur:cur?[apRow(cur)]:[],others:mine.filter(a=>a.cycle!==S.cycle).map(apRow),team:team.map(apRow),all:all.map(apRow),
  none:!isPart()&&!isHR()&&!team.length}}
function pTeam(){if(!hasTeam())return noAccess('My Team is for people with direct reports.');const me=ME(),ppl=P(me).lv<=2?below(me):reports(me);
 return {title:'My Team',sub:`${cyc().name} cycle · ${P(me).lv<=2?'everyone in your organisation':'your direct reports'}`,rows:ppl.map(u=>{
  const gs=S.goals.filter(g=>g.owner===u&&shown(g)),ap=gs.filter(g=>g.status==='approved'),pv=ap.map(goalPct).filter(x=>x!=null),av=pv.length?Math.round(pv.reduce((a,b)=>a+b,0)/pv.length):null,a=myAp(u),
   att=gs.filter(g=>g.status==='submitted'||['off','risk','stale','none'].includes(g.status==='approved'?health(g):'x')).length,tn=S.dev.filter(d=>d.emp===u&&d.cycle===S.cycle&&d.status!=='Withdrawn').length;
  return {id:u,name:P(u).name,title:P(u).title,goals:`${ap.length} approved${gs.length>ap.length?` · ${gs.length-ap.length} other`:''}`,goalsHref:href('/goals/all',{owner:u}),pct:av??0,pctText:av==null?'No data yet':av+'%',att:att?String(att):'–',
   ap:a?STEPS[a.step]:'Not launched',apHref:a?'#/appraisal/'+a.id:'',tn:tn?String(tn):'–'}})}}

/* ---------- development, training, continuous performance, learning, approvals ---------- */
const devRow=d=>({id:d.id,area:d.area,sub:`${P(d.emp).name} · ${d.learningId&&LR(d.learningId)?LR(d.learningId).title:'No catalogue course'} · target ${fmt(d.due)||'–'}`,status:d.status,source:`From ${CYC(d.cycle).name} appraisal`,href:'#/development/'+d.id});
function pDevelopment(){if(!isPart())return noAccess('Development records are for people with goals.');return {title:'My Development',sub:'Your development plans',rows:S.dev.filter(d=>d.emp===ME()).map(devRow)}}
function pDevRecord(){const d=DV(N.args.id);if(!d)return notFound();if(!canSeeDev(d))return noAccess('You do not have access to this development record.');
 const l=d.learningId&&LR(d.learningId),a=AP(d.source),edit=d.emp===ME()||P(d.emp).mgr===ME();
 return {title:d.area,sub:`${P(d.emp).name} · Training Needs Assessment plan · ${CYC(d.cycle).name}`,id:d.id,
  kv:[['Capability gap',d.gap||'–'],['Expected outcome',d.outcome||'–'],['Target date',fmt(d.due)||'–'],['Status',d.status]].map(([k,v])=>({k,v})),
  canStatus:edit&&d.status!=='Withdrawn',status:d.status,statuses:['Planned','In progress','Completed'].map(s=>opt(s,s)),
  learn:l?{text:l.title,sub:l.format,href:'#/learning/'+l.id}:null,
  source:a&&canSeeAp(a)?{text:`${CYC(a.cycle).name} Performance Appraisal · training needs section`,href:href('/appraisal/'+a.id,{s:'tna'})}:null,
  hist:d.hist.slice().reverse().map(h=>({text:`${fmt(h.at)} · ${P(h.by).name} · ${h.w}`}))}}
function pTraining(){if(!isPart())return noAccess('Training needs are for people with goals.');const me=ME(),mine=S.dev.filter(d=>d.emp===me&&d.plan==='tna'),team=S.dev.filter(d=>below(me).includes(d.emp)&&d.plan==='tna'),pend=S.appraisals.filter(a=>a.cycle===S.cycle&&a.step==='manager'&&ownerOf(a)===me);
 return {title:'Training Needs',sub:'Training Needs Assessment plan · records created from appraisals',pend:pend.map(a=>({name:P(a.emp).name,sub:`${a.tna.filter(t=>t.area.trim()).length} of up to ${S.config.tnaMax} training needs`,href:href('/appraisal/'+a.id,{s:'tna'})})),mine:mine.map(devRow),team:team.map(devRow)}}
const ACT_STATUS=['Not started','In progress','Done'].map(s=>opt(s,s));
function pActivities(){if(!isPart())return noAccess('Continuous performance is for people with goals.');
 const me=ME(),tab=N.q.tab==='feedback'?'feedback':'activities',myGoals=S.goals.filter(g=>g.owner===me&&g.cycle===S.cycle&&g.status==='approved'&&!g.archived),fg=N.q.goal&&G(N.q.goal);
 const acts=S.activities.filter(x=>(x.owner===me||below(me).includes(x.owner))&&(!fg||x.goalId===fg.id)).map(x=>{const g=G(x.goalId),ok=g&&canSee(g);return {title:x.title,sub:`${P(x.owner).name} · ${fmt(x.at)}${x.notes?' · '+x.notes:''}`,goal:ok?g.title:'Goal not available',goalHref:ok?href(g.owner===me?'/goals':'/goals/all',{goal:g.id}):'',status:x.status}});
 const inq=S.feedback.filter(f=>f.to===me).map(f=>({id:f.id,from:P(f.from).name,q:f.q,goal:f.goalId&&G(f.goalId)?G(f.goalId).title:'',goalHref:f.goalId&&G(f.goalId)?href('/goals/all',{goal:f.goalId}):'',open:f.status==='requested',hl:N.q.fb===f.id,
  done:f.status==='given'?`You answered: “${f.a}”`:'Declined',ans:''}));
 const outq=S.feedback.filter(f=>f.from===me).map(f=>({to:P(f.to).name,q:f.q,status:f.status==='requested'?'Waiting':f.status==='given'?'Answered':'Declined',state:f.status==='requested'?'Warning':f.status==='given'?'Success':'None',a:f.status==='given'?f.a:''}));
 return {title:'Continuous Performance',sub:'Activities and feedback that support your goals',tab,showNew:!!N.q.new,focusBanner:fg?`Activities supporting “${fg.title}”.`:'',acts,inq,outq,
  goals:myGoals.map(g=>opt(g.id,g.title)),goalsOpt:[opt('','No specific goal'),...myGoals.map(g=>opt(g.id,g.title))],others:PART.filter(p=>p!==me).map(p=>opt(p,`${P(p).name} · ${P(p).title}`)),statuses:ACT_STATUS,
  newBtn:tab==='feedback'?'Request Feedback':'Create Activity'}}
function pLearning(){return {title:'Learning',sub:'Sample catalogue · not connected to a learning system',rows:S.learning.map(l=>({id:l.id,text:l.title,desc:l.format,href:'#/learning/'+l.id}))}}
function pLearningItem(){const l=LR(N.args.id);if(!l)return notFound();const ds=S.dev.filter(d=>d.learningId===l.id&&canSeeDev(d));return {title:l.title,sub:`${l.format} · ${l.provider}`,rows:ds.map(devRow)}}
function pApprovals(){const T=tasks(),groups=[...new Set(T.map(t=>t.type))];
 return {title:'Workflows & Approvals',sub:`${cyc().name} cycle · ${T.length} item${T.length===1?'':'s'} waiting on you`,count:T.length,groups:groups.map(gp=>({type:gp,items:T.filter(t=>t.type===gp).map(t=>({obj:t.obj,sub:`${t.who} · ${t.cycle} cycle`,state:t.state+(t.due?' · due '+fmt(t.due):''),act:t.act,href:t.href}))}))}}
function pApp(){const a=APPS.find(x=>x.id===N.args.id);if(!a)return notFound();
 return {title:a.label,sub:a.desc||'',internal:a.kind==='internal',href:a.kind==='internal'?'#'+a.route:'',note:a.note||'This application is not available.',admin:isAdmin()&&a.kind==='external'}}

/* ---------- admin center ---------- */
function pAdmin(){if(!isAdmin())return noAccess('The Admin Center is for administrators.');const c=S.config;
 return {title:'Admin Center',sub:'Platform configuration · changes apply at once, including to forms in progress',
  apps:APPS.map(a=>({id:a.id,label:a.label,icon:ico(a.icon),kind:a.kind==='internal'?'Internal module':a.kind==='external'?'External application':'Unavailable',
   avail:avail(a)?(a.sample?'Available · sample data':'Available'):'Not configured',availState:avail(a)?'Success':'Warning',
   who:({participant:'People with goals',manager:'People with direct reports',reports:'Managers and HR',admin:'Administrators'})[a.need]||'Everyone',
   route:a.kind==='internal'?'#'+a.route:'',external:a.kind==='external',url:c.apps[a.id]||''})),
  cal:c.calibration,appeal:c.appeal,noTna:c.noTnaAllowed,numbers:c.numbers,flow:`Sequence: ${flow().map(s=>STEPS[s]).join(' → ')}${c.appeal?' (→ HR appeal review if appealed)':''} → Completed.`,tnaMax:`Maximum per appraisal: ${c.tnaMax}. Training needs are never scored.`,
  scale:c.scale.map(s=>({v:String(s.v),label:s.label})),decimals:String(c.decimals),decOpts:[0,1,2].map(n=>opt(String(n),String(n))),theme:S.theme==='gold'?'gold':'light',themes:[opt('light','Broadcast Light'),opt('gold','Executive Gold')]}}


/* ---------- goal detail panel ---------- */
function gDialog(){const id=N.q.goal;if(!id)return null;const g=G(id);
 if(!g||!canSee(g))return {open:true,missing:true,title:'Goal not available',msg:'This goal does not exist or is not available to you.'};
 const me=ME(),mine=own(g),p=path(g),os=out(g),is=inb(g),c=CYC(g.cycle),last=g.checkins[g.checkins.length-1],ap=S.appraisals.find(a=>a.emp===g.owner&&a.cycle===g.cycle),
  acts=S.activities.filter(x=>x.goalId===g.id&&(x.owner===me||below(me).includes(x.owner)||g.owner===me)),s=stOf(g.status),pc=goalPct(g),T=targets(g),h=g.status==='approved'?hOf(g):null;
 let kind='';if(mine&&(g.status==='draft'||g.status==='returned')&&open(g))kind='draft';else if(may.approve(g))kind='approve';else if(mine&&g.review)kind='review';else if(mine&&g.status==='submitted')kind='waiting';
 const next={kind,title:'',text:'',back:g.back||'',canEdit:may.edit(g)};
 if(kind==='draft'){next.title=g.status==='returned'?'Sent back':'Not submitted yet';next.text=`Finish it and submit it to ${P(g.owner).mgr?P(P(g.owner).mgr).name:'approve it'}.`}
 if(kind==='approve'){next.title='Your approval';next.text=`${P(g.owner).name} submitted this goal.${os.some(l=>l.status==='pending'&&nodeOwner(l.to)===me)?' Approving also accepts its link to your goal.':''}`}
 if(kind==='review'){next.title='Review this goal';next.text=g.review.why}
 if(kind==='waiting'){next.title='Waiting for approval';next.text=`With ${P(P(g.owner).mgr).name}.`}
 const ck=U.ck===g.id?{open:true,status:last&&['on','risk','off'].includes(last.status)?last.status:'on',note:'',items:g.krs.map((k,i)=>({i,kind:k.type,label:k.t,hint:k.type==='number'?`(from ${k.start} to ${k.target} ${k.unit})`:'',value:k.current==null?'':String(k.current),checked:k.type==='binary'?!!k.current:false,steps:k.steps.map(x=>({text:x.t,done:!!x.done}))}))}:{open:false,items:[]};
 const addOpts=[...T.pillars.map(x=>opt(x.id,'Pillar · '+x.name)),...T.mine.map(x=>opt(x.id,'Your manager’s goal · '+x.title)),...T.other.map(x=>opt(x.id,x.title+' · '+who(x.owner)))];
 return {open:true,missing:false,id:g.id,title:g.title,status:s.text,statusState:s.state,hasHealth:!!h,health:h?h.text:'',healthState:h?h.state:'None',archived:!!g.archived,
  owner:`${P(g.owner).name} · ${P(g.owner).title} · ${P(g.owner).dept}`,meta:`${TYPES[g.type]} · ${c.name} cycle${c.closed?' (closed)':''} · due ${fmt(g.due)||'not set'}${g.weight!=null?' · weight '+g.weight+'%':''} · progress from ${g.rollup==='aligned'?'goals aligned to it':'its key results'}`,
  archNote:`Archived ${g.archivedAt?fmt(g.archivedAt):''}. It is hidden from the map, reports and new links.`,canUnarchive:may.unarchive(g),
  hasPath:!!p.pillar,pathText:p.pillar?[PL(p.pillar).name+' (pillar)',...p.chain.map(x=>x.title+' · '+P(x.owner).name),'this goal'].join(' › ')+(p.ok?'':' · a link on this path is not accepted yet'):'',pathWarn:!p.pillar?'Not aligned to strategy. Align it to a goal it supports.':(p.ok?'':'A link on this path is not accepted yet.'),
  mapHref:href('/strategy',{focus:g.id}),hasAp:!!(ap&&canSeeAp(ap)),apHref:ap?href('/appraisal/'+ap.id,{s:'objectives'}):'',apText:`Open in ${c.name} appraisal`,actsHref:href('/activities',{goal:g.id}),actsText:`Activities (${acts.length})`,
  pct:pc==null?0:pc,pctText:pc==null?'No data yet':pc+'%',barState:barState(g),lastText:last?`Last check-in ${fmt(last.at)} by ${P(last.by).name}${last.note?': “'+last.note+'”':''}`:'',rollNote:g.rollup==='aligned'?'Progress is the average of the goals aligned to it through accepted links. Their own weights are not used.':'',
  krs:g.krs.map(k=>({t:k.t,weight:num(k.weight)!=null?`weight ${k.weight}%`:'',label:krLabel(k),state:krRaw(k)<0?'Error':'None',measure:measure(k),isMs:k.type==='milestone',steps:k.steps.map(x=>({text:(x.done?'☑ ':'☐ ')+x.t}))})),desc:g.desc||'',
  next,backMsg:'',canCheckin:may.checkin(g)&&U.ck!==g.id,ck,statuses:['on','risk','off'].map(x=>opt(x,HEALTH[x][0])),
  outCount:`Outbound alignment · goals this one supports (${os.length})`,
  out:os.map(l=>{const pil=isPillar(l.to),tg=G(l.to),ls=lstOf(l.status);return {id:l.id,toId:l.to,isPillar:pil,title:nodeName(l.to),sub:(pil?'Pillar':who(nodeOwner(l.to)))+(tg&&tg.archived?' · archived':''),primary:!!l.primary,status:ls.text,state:ls.state,
   reason:l.status==='rejected'&&l.reason?`“${l.reason}”`:'',canMain:may.withdraw(l)&&!l.primary&&l.status!=='rejected',canWithdraw:may.withdraw(l),wText:l.status==='rejected'?'Remove':'Withdraw'}}),
  canAlign:may.align(g),addOpen:U.add===g.id,addTo:addOpts.length?addOpts[0].key:'',addOpts,addHint:`${T.pillars.length?'Links to a pillar are accepted at once. ':''}The owner of the goal you pick accepts or rejects the link.`,
  inCount:`Inbound alignment · goals that support this one (${is.length})`,
  in:is.map(l=>{const f=G(l.from),dec=may.decide(l)&&l.status!=='rejected',ls=lstOf(l.status);return {id:l.id,fromId:f.id,title:f.title,sub:who(f.owner)+(f.status!=='approved'?' · '+STATUS[f.status][0]:'')+(f.archived?' · archived':''),status:ls.text,state:ls.state,
   reason:l.status==='rejected'&&l.reason?`“${l.reason}”`:'',canDecide:dec,pending:l.status==='pending',why:'',whyHint:l.status==='pending'?'Reason, if you reject':'Reason for removing',rejectText:l.status==='pending'?'Reject':'Remove'}}),
  ckCount:`Check-ins (${g.checkins.length})`,checkins:g.checkins.slice().reverse().map(x=>({text:`${fmt(x.at)} · ${P(x.by).name} · ${HEALTH[x.status][0]}${x.note?' · '+x.note:''}`})),
  hist:g.hist.slice().reverse().map(x=>({text:`${fmt(x.at)} · ${P(x.by).name} · ${x.w}`})),
  canEdit:may.edit(g)&&g.status==='approved',canArchive:may.archive(g)}}

/* ---------- goal form ---------- */
const blankKr=()=>({t:'',type:'number',start:'',target:'',current:'',unit:'',weight:'',steps:'',err:''});
const formFromGoal=g=>({id:g.id,title:g.title,type:g.type,due:g.due,weight:g.weight??'',rollup:g.rollup,desc:g.desc,krs:g.krs.length?g.krs.map(k=>({t:k.t,type:k.type,start:k.start??'',target:k.target??'',current:k.type==='number'?(k.current??''):'',unit:k.unit,weight:k.weight??'',steps:k.steps.map(s=>s.t).join('\n'),err:''})):[blankKr()]});
function openForm(o){const me=ME(),lv=P(me).lv;const f=Object.assign({id:null,to:'',title:'',type:lv===1?'org':lv===2?'team':'individual',due:cyc().end,weight:'',rollup:'krs',krs:[blankKr()],desc:'',hint:''},o);
 const g=f.id&&G(f.id),T=targets(g||{id:'_new',owner:me,cycle:S.cycle}),c=g?CYC(g.cycle):cyc();
 if(!f.id&&!f.to){const x=[...T.pillars,...T.mine,...T.other][0];f.to=x?x.id:''}
 f.heading=g?(g.status==='approved'?'Edit approved goal':'Edit goal'):'Create Goal';f.isEdit=!!g;f.approvedNote=!!(g&&g.status==='approved');f.canDraft=!(g&&g.status==='approved');f.submitText=P(me).mgr?'Submit for approval':'Save';
 f.toOpts=[...T.pillars.map(x=>opt(x.id,'Pillar · '+x.name)),...T.mine.map(x=>opt(x.id,'Your manager’s goal · '+x.title)),...T.other.map(x=>opt(x.id,x.title+' · '+who(x.owner)))];
 f.toHint=lv===1?'Links to a pillar are accepted at once.':'A link to your manager’s goal is accepted when they approve this goal. A link to anyone else’s goal waits for its owner.';
 f.typeOpts=Object.entries(TYPES).filter(([k])=>k==='individual'||(k==='team'&&lv<=4)||(k==='org'&&lv<=2)).map(([k,v])=>opt(k,v));
 f.dueMin=c.start;f.dueMax=c.end;f.err={title:'',due:'',weight:'',krs:'',to:''};f.ai=null;f.canAddKr=f.krs.length<5;return f}
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
 return {err,kr,krs}}
function saveForm(f,draft){const me=ME(),g0=f.id&&G(f.id);
 if(g0&&!may.edit(g0)){denied('You cannot edit this goal.');return {closed:true}}
 if(draft&&g0&&g0.status==='approved'){toast('An approved goal cannot go back to draft. Submit it for approval.');return {stop:true}}
 const c=g0?CYC(g0.cycle):cyc();if(c.closed){toast('This cycle is closed.');return {closed:true}}
 const {err,kr,krs}=checkForm(f,draft,c);
 if(!g0&&(!f.to||!validTarget({id:'_new',owner:me,cycle:S.cycle},f.to)))err.to='Choose a goal or pillar from the list.';
 if(!TYPES[f.type])err.title='Choose a type.';
 if(Object.keys(err).length||Object.keys(kr).length)return {errors:{err,kr}};
 const nk=krs.map(k=>({t:k.t.trim(),type:k.type,start:k.type==='number'?+k.start:null,target:k.type==='number'?+k.target:null,current:k.type==='number'?num(k.current):k.type==='binary'?!!(g0&&(g0.krs.find(x=>x.t===k.t.trim())||{}).current):null,unit:k.type==='number'?k.unit.trim():'',weight:num(k.weight),steps:k.type==='milestone'?k.steps.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>({t:s,done:!!(g0&&g0.krs.some(x=>x.steps.some(y=>y.t===s&&y.done)))})):[]}));
 let g=g0;const wasApproved=g&&g.status==='approved',before=g&&JSON.stringify([g.title,g.krs.map(k=>[k.t,k.type,k.target])]);
 if(!g){g={id:'g'+(S.seq++),owner:me,cycle:S.cycle,status:'draft',archived:false,review:null,back:'',checkins:[],hist:[]};S.goals.push(g);hist(g,'Created');propose(g,f.to)}
 Object.assign(g,{title:f.title.trim(),type:f.type,due:f.due,weight:num(f.weight),rollup:f.rollup,desc:(f.desc||'').trim(),krs:nk});
 if(draft){hist(g,'Saved as draft');toast('Draft saved')}
 else{if(wasApproved){hist(g,'Edited after approval');if(before!==JSON.stringify([g.title,g.krs.map(k=>[k.t,k.type,k.target])]))flagSupporters(g,`“${g.title}”, which this goal supports, changed its wording or targets.`)}
  submitGoal(g);if(g.status==='approved')acceptOwnLinks(g);toast(g.status==='approved'?'Goal saved':'Submitted to '+P(P(g.owner).mgr).name)}
 save();return {goal:g.id}}

/* ---------- AI goal design: scripted in this prototype, as in the page ---------- */
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
function aiSuggest(f){const me=ME(),to=f.id?(primary(G(f.id))||{}).to:f.to,tg=to&&!isPillar(to)?G(to):null,pl=tg?(rootPillar(tg)||'p2'):(to||'p2'),area=(P(me).title.split(',')[1]||P(me).title).trim(),own_=S.goals.filter(g=>g.owner===me).map(g=>g.title.toLowerCase());
 const lv=P(me).lv,scope=lv>=5?' (your own work)':lv===4?' (your section)':'',above=tg?tg.title:(PL(pl)||{name:'strategy'}).name;let items=(LIB[pl]||LIB.p2).map(([t,k,w])=>({title:t.replace('{a}',area)+scope,krs:k,why:`Supports “${above}” through ${w}.`}));
 const h=(f.hint||'').trim();if(h)items=[{title:`${h[0].toUpperCase()+h.slice(1)} in ${area}`,krs:items[0].krs,why:`Built from your priority “${h}”. Supports “${above}”.`},...items.slice(0,2)];
 return items.filter(s=>!own_.includes(s.title.toLowerCase())).slice(0,3).map(s=>({title:s.title,why:s.why,lines:s.krs.map(k=>`${k[0]} · from ${k[1]} to ${k[2]} ${k[3]}`),krs:s.krs}))}
function aiReview(f){const t=(f.title||'').trim(),krs=f.krs.filter(k=>k.t.trim()),lv=P(ME()).lv,c=[];
 const act=/^(attend|hold|do|work on|help|support|participate|join|try|complete training|be )/i.test(t);
 c.push(!t?{ok:false,label:'There is no goal yet',tip:'Start with the result you want, not the task.'}:act?{ok:false,label:'Reads as an activity, not an outcome',tip:'Say what will be different when it is done, for example “Cut … to …”.'}:{ok:true,label:'Reads as an outcome'});
 const vague=krs.filter(k=>k.type==='number'&&(k.start===''||k.target===''));c.push(!krs.length?{ok:f.rollup==='aligned',label:f.rollup==='aligned'?'Progress comes from aligned goals':'No key results yet',tip:f.rollup==='aligned'?'':'Add one to three key results with a start and a target.'}:vague.length?{ok:false,label:`${vague.length} number key result(s) have no start or target`,tip:'For example: from 50k to 70k sign-ups.'}:{ok:true,label:'Key results are measurable'});
 if(krs.length>3)c.push({ok:false,label:'More than three key results',tip:'Keep the ones that matter most.'});
 if(krs.length&&krs.every(k=>k.type!=='number'))c.push({ok:false,label:'No key result measures an outcome with a number',tip:'Completed steps show effort; pair them with a result, for example “successor ready now: 2 people”.'});
 c.push(lv>=4&&/all channels|whole network|company-wide|across the network|every market/i.test(t)?{ok:false,label:'The scope looks too wide for your level',tip:'Narrow it to what your section or your own work controls.'}:{ok:true,label:'Scope fits your level'});
 const to=f.id?(primary(G(f.id))||{}).to:f.to;c.push(to?{ok:true,label:'Supports “'+nodeName(to)+'”'}:{ok:false,label:'Not aligned to a goal above',tip:'Choose what it supports.'});
 const words=s=>new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3)),tw=words(t),dup=S.goals.find(g=>g.owner===ME()&&g.cycle===S.cycle&&g.id!==f.id&&tw.size&&[...words(g.title)].filter(w=>tw.has(w)).length/tw.size>=.5);
 c.push(dup?{ok:false,label:'Overlaps a goal you already have',tip:'“'+dup.title+'”'}:{ok:true,label:'No overlap with your other goals'});
 return c.map(x=>({ok:x.ok,label:x.label,tip:x.tip||'',icon:x.ok?'sap-icon://accept':'sap-icon://alert',state:x.ok?'Success':'Warning'}))}

function editForm(id){const g=G(id);if(!g||!may.edit(g)){denied('You cannot edit this goal.');return null}return openForm(formFromGoal(g))}
/* ---------- pillar panel ---------- */
function pillarForm(id){const p=PL(id);if(!p)return null;const gs=S.links.filter(l=>l.to===p.id).map(l=>G(l.from)).filter(g=>g&&shown(g)),ed=canEditStrategy();
 return {id:p.id,name:p.name,canEdit:ed,canGoal:ed&&!cyc().closed,goalsTitle:`Goals aligned to it in ${cyc().name} (${gs.length})`,goals:gs.map(g=>({id:g.id,text:`${P(g.owner).name} · ${g.title}`})),newName:'',role:P(ME()).title}}

/* ---------- appraisal workspace ---------- */
const rText=v=>num(v)==null?'Not rated':`${v} · ${scaleLabel(num(v))}`;
const secT=id=>{const s=SECS.find(x=>x[0]===id),n=s[2]?secNo(id):'';return (n?n+' · ':'')+s[1]};
function commitAp(a,msg){const i=S.appraisals.findIndex(x=>x.id===a.id),prev=S.appraisals[i];a.saved=TODAY;if(msg)a.hist.push({at:TODAY,by:ME(),w:msg});S.appraisals[i]=copy(a);
 if(!saveNow()){S.appraisals[i]=prev;a.hist.pop();U.apSaveErr=a.id;return false}U.apSaveErr=null;U.apErr=null;return true}
function pAppraisal(){const id=N.args.id,a=AP(id);if(!a)return notFound();if(!canSeeAp(a))return noAccess('You do not have access to this appraisal.');
 const me=ME(),isEmp=a.emp===me,c=CYC(a.cycle),owner=ownerOf(a)===me&&a.step!=='done'&&!c.closed,can=s=>owner&&a.step===s,p=P(a.emp),os=objectives(a);
 const showEmp=isEmp||a.step!=='self',showMgr=!isEmp||empSees(a),showCal=!isEmp,mgr=p.mgr,dl=dueOf(a),errs=U.apErr&&U.apErr.id===id?U.apErr.list:[];
 const f=flow(),seq=[...f,'appeal','done'],ci=a.step==='done'?seq.length:seq.indexOf(a.step);
 const stState=s=>{if(s==='appeal'){if(a.step==='appeal')return 'cur';if(a.appeal)return 'done';if(a.step==='done'||(a.ack&&a.ack.decision==='accept'))return 'skp';return 'cond'}if(s==='done')return a.step==='done'?'done':'up';const i=seq.indexOf(s);return a.step==='done'||i<ci?'done':i===ci?'cur':'up'};
 const SUB={done:'Completed',cur:'In progress',up:'Upcoming',skp:'Not needed',cond:'Only if appealed'};
 const steps=seq.map(s=>{const st=stState(s);return {key:s,text:STEPS[s],sub:SUB[st],state:st==='done'?'Success':st==='cur'?'Information':'None',icon:st==='done'?'sap-icon://accept':''}});
 const edit=can('manager'),tnaVis=!isEmp||a.frozen,sc=overall(a,'mr'),fr=finalRating(a);
 const empCell=!showEmp?'hidden':can('self')?'edit':'read',mgrCell=!showMgr?'hidden':can('manager')?'edit':a.step==='self'?'hidden':'read';
 const wsum=os.reduce((s,o)=>s+(num(o.weight)||0),0);
 return {id,title:`${c.name} Performance Appraisal`,who:`${p.name} · ${p.title}`,empName:p.name,empInitials:initials(a.emp),eid:p.eid,theme:S.theme==='gold'?'gold':'light',
  status:a.step==='done'?'Completed':'In progress',statusState:a.step==='done'?'Success':'Warning',stepLine:`${STEPS[a.step]}${a.step!=='done'&&ownerOf(a)?' · with '+P(ownerOf(a)).name:''}${dl&&a.step!=='done'?' · due '+fmt(dl):''}`,saved:'Saved '+fmt(a.saved),
  steps,canSave:owner&&a.step!=='ack',submitLabel:{self:'Submit to manager',manager:'Submit to '+STEPS[nextOf(a)],calibration:'Release to employee',appeal:'Close appeal'}[a.step]||'Submit',canReturn:can('manager')||can('calibration'),returnTo:prevOf(a)?STEPS[prevOf(a)]:'',
  goalPlan:href(isEmp?'/goals':'/goals/all',isEmp?{}:{owner:a.emp}),back:a.back&&owner?`Returned for revision: “${a.back}”`:'',saveFail:U.apSaveErr===id,
  errs:errs.map(x=>({text:x.t,s:x.s})),
  canSelf:can('self'),canMgr:can('manager'),empCell,mgrCell,hiddenEmp:'Not submitted yet',hiddenMgr:a.step==='self'?'After self-assessment':'Shown at acknowledgement',
  sec:{overview:secT('overview'),profile:secT('profile'),objectives:secT('objectives'),tna:secT('tna'),summary:secT('summary'),comments:secT('comments')+` (${a.comments.length})`,attachments:secT('attachments')+` (${a.files.length})`,history:secT('history')},
  overview:[['Review period',`${fmt(c.start)} – ${fmt(c.end)}`],['Route',f.map(s=>STEPS[s]).join(' → ')+(S.config.appeal?' (→ HR appeal review if appealed)':'')],['Current step',STEPS[a.step]],['With',a.step!=='done'&&ownerOf(a)?P(ownerOf(a)).name:'–'],['Step due',dl&&a.step!=='done'?fmt(dl):'–']].map(([k,v])=>({k,v})),
  overviewNote:a.frozen?'This form keeps the version of each goal from when the manager review was submitted. Later goal changes do not alter it; the link to each goal is kept.':'Until the manager review is submitted, objectives come live from the employee’s approved goals.',
  profile:[['Name',p.name],['Employee ID',p.eid],['Job title',p.title],['Department',p.dept],['Manager',mgr?P(mgr).name:'–'],['Division / channel',p.div]].map(([k,v])=>({k,v})),
  scale:[opt('','Select rating'),...S.config.scale.map(s=>opt(String(s.v),`${s.v} · ${s.label}`))],calScale:[opt('','Keep calculated'),...S.config.scale.map(s=>opt(String(s.v),`${s.v} · ${s.label}`))],apScale:S.config.scale.map(s=>opt(String(s.v),`${s.v} · ${s.label}`)),
  wsumText:`${wsum}%`,wsumWarn:wsum!==100?'Must total 100% before submitting. Weights come from the goals in My Goals.':'',noRows:!os.length,
  tnaVis,tnaEdit:edit,tnaMax:S.config.tnaMax,tnaIntro:`Up to ${S.config.tnaMax} training needs. Each becomes a record in the Training Needs Assessment development plan when the manager review is submitted.`,
  learn:[opt('','Other (describe in outcome)'),...S.learning.map(l=>opt(l.id,l.title))],noTnaShow:S.config.noTnaAllowed&&(edit||a.noTna.on),
  empSumEdit:can('self'),empSumShow:showEmp,mgrSumEdit:can('manager'),mgrSumShow:showMgr&&a.step!=='self',
  calShow:showCal&&(S.config.calibration||a.calib.rating!=null),calEdit:can('calibration'),calRead:(a.calib.rating!=null?rText(a.calib.rating):'Not calibrated yet')+(a.calib.note?' · '+a.calib.note:''),
  ackShow:can('ack'),ackText:`Final rating: ${fr!=null?rText(fr):sc.ok?rText(Math.round(sc.v)):'–'}. Acknowledge to complete the form, or appeal to HR with a reason.`,canAppealBtn:S.config.appeal,
  appealShow:!!a.appeal,appealReason:a.appeal?`Employee’s reason: “${a.appeal.reason}”`:'',appealEdit:can('appeal'),appealRead:a.appeal&&a.appeal.note?`HR decision: ${a.appeal.decision==='revise'?'rating revised to '+rText(a.appeal.rating):'rating upheld'} · ${a.appeal.note}`:'Waiting for HR.',
  comments:a.comments.map(x=>({text:`${fmt(x.at)} · ${P(x.by).name} · ${x.t}`})),canAdd:a.step!=='done',
  files:a.files.map(x=>({text:`${x.name} · ${Math.max(1,Math.round(x.size/1024))} KB · ${P(x.by).name} · ${fmt(x.at)}`})),hist:a.hist.slice().reverse().map(h=>({text:`${fmt(h.at)} · ${P(h.by).name} · ${h.w}`}))}}
/* the editable part of an appraisal: what the person types is kept here until Save or Submit */
function apForm(id){const a0=AP(id);if(!a0||!canSeeAp(a0))return {id:null,rows:[],tna:[],calc:{}};const a=copy(a0),os=objectives(a),me=ME(),p=ap=>String(ap??'');
 const f={id,dirty:false,
  rows:os.map((o,i)=>{const r=a.r[o.id]||{},lv=o.live,chg=a.frozen&&lv&&(lv.title!==o.title||lv.weight!==o.weight);
   return {id:o.id,n:i+1,title:o.title,href:href(lv&&lv.owner===me?'/goals':'/goals/all',{goal:o.id}),weightText:o.weight==null?'–':o.weight+'%',pct:o.pct==null?0:o.pct,pctText:o.pct==null?'No data yet':o.pct+'%',
    align:o.align?'Supports: '+o.align:'Not aligned',chg:!!chg,er:p(r.er),ec:r.ec||'',ev:r.ev||'',mr:p(r.mr),mc:r.mc||''}}),
  tna:a.tna.map((t,i)=>tnaRow(t,i)),tnaMax:S.config.tnaMax,noTnaOn:!!a.noTna.on,noTnaReason:a.noTna.reason||'',empSum:a.empSum||'',mgrSum:a.mgrSum||'',
  calRating:p(a.calib.rating),calNote:a.calib.note||'',appealDecision:a.appeal?a.appeal.decision:'uphold',appealRating:a.appeal?p(a.appeal.rating):'3',appealNote:a.appeal?a.appeal.note||'':'',
  ret:'',ackText:'',newComment:''};
 f.tnaCanAdd=f.tna.length<f.tnaMax;f.calc=apCalc(f);return f}
function tnaRow(t,i){const d=t.devId&&DV(t.devId);return {n:i+1,id:t.id,area:t.area,gap:t.gap,learningId:t.learningId||'',outcome:t.outcome,due:t.due||'',devId:t.devId||'',
 rec:d?(canSeeDev(d)?'Open record':'Linked'):'Created on submit',recHref:d&&canSeeDev(d)?'#/development/'+t.devId:''}}
function newTna(f){const t={id:'tn'+(S.seq++),area:'',gap:'',learningId:'',outcome:'',due:'',devId:null};return tnaRow(t,f.tna.length)}
function applyAp(a,f){f.rows.forEach(r=>{const x=a.r[r.id]||(a.r[r.id]={});x.er=num(r.er);x.ec=r.ec;x.ev=r.ev;x.mr=num(r.mr);x.mc=r.mc});
 a.tna=f.tna.map(t=>({id:t.id,area:t.area,gap:t.gap,learningId:t.learningId||'',outcome:t.outcome,due:t.due||'',devId:t.devId||null}));
 a.noTna={on:!!f.noTnaOn,reason:f.noTnaReason||''};a.empSum=f.empSum||'';a.mgrSum=f.mgrSum||'';a.calib=Object.assign({},a.calib,{rating:num(f.calRating),note:f.calNote||''});
 if(a.appeal){a.appeal.decision=f.appealDecision;a.appeal.rating=num(f.appealRating);a.appeal.note=f.appealNote||''}return a}
function apCalc(f){const a0=AP(f.id);if(!a0)return {};const a=applyAp(copy(a0),f),isEmp=a.emp===ME(),selfMode=isEmp&&!empSees(a),sc=selfMode?overall(a,'er'):overall(a,'mr');
 const shownFinal=a.step==='done'?a.final:(!isEmp||empSees(a))?(a.calib.rating??null):null,big=a.step==='done'?a.final:(shownFinal??(sc.ok?sc.v:null)),d=S.config.decimals;
 return {big:big==null?0:big,bigText:big==null?'–':(typeof big==='number'?big.toFixed(d):String(big)),has:big!=null,
  kind:a.step==='done'?'Final rating':shownFinal!=null?'Calibrated rating':selfMode?'Your self-rating (not the final rating)':'Calculated rating',
  label:big==null?'Not available yet':scaleLabel(Math.round(big)),why:!sc.ok&&big==null?sc.why:'',comp:sc.ok?sc.v.toFixed(d):'–',
  rule:`Rule: rating × objective weight, summed and divided by 100, rounded to ${d} decimal places; the label is the nearest whole point on the ${S.config.scale.length}-point scale.`}}
function apTransition(w,fn,okMsg){if(!w||!apOwnerOk(w)){denied('This form is not at a step you own.');return {fail:true}}
 const a=copy(w),devBefore=copy(S.dev),res=fn(a);if(res===false)return {fail:true,errors:true};
 if(!commitAp(a,res)){S.dev=devBefore;return {fail:true}}toast(okMsg(a));return {ok:true}}

/* ---------- actions: each one checks the rule itself, as the page does ---------- */
const act={
 persona(id){if(!PEOPLE[id])return {};S.as=id;U.ck=U.add=null;U.apErr=null;toast('Demo persona: '+P(id).name+' · '+ROLE[roleOf(id)]);save();return {nav:'#/home',forms:true}},
 cycle(id){if(!CYC(id))return {};S.cycle=id;toast(cyc().name+' cycle'+(cyc().closed?' (closed, read-only)':''));save();return {}},
 reset(){S=seed();U.ck=U.add=null;U.apErr=null;toast('Demo data restored');save();return {nav:'#/home',forms:true}},
 setTheme(t){S.theme=t==='gold'?'gold':'light';save();return {}},
 /* goals */
 approve(id){const g=G(id);if(!g||!may.approve(g)){denied();return {}}g.status='approved';g.back='';hist(g,'Approved');acceptOwnLinks(g);save();toast('Approved');return {}},
 sendback(id,m){const g=G(id);if(!g||!may.sendback(g)){denied();return {}}m=(m||'').trim();if(!m){toast('Say what to change before sending it back');return {stop:true}}g.status='returned';g.back=m;hist(g,'Sent back: '+m);save();toast('Sent back to '+P(g.owner).name);return {}},
 reviewed(id){const g=G(id);if(!g||!may.review(g)){denied();return {}}hist(g,'Reviewed after a change above: still right');g.review=null;save();toast('Marked as reviewed');return {}},
 archiveAsk(id){const g=G(id);if(!g||!may.archive(g)){denied();return null}const n=S.links.filter(l=>l.to===g.id&&l.status==='accepted'&&G(l.from)&&!G(l.from).archived).length;
  return n?`${n} goal${n===1?' is':'s are'} aligned to this one. Archiving keeps their links but asks their owners to review them, and they stop tracing to strategy through it. Archive?`:'Archive this goal? You can unarchive it later.'},
 archive(id){const g=G(id);if(!g||!may.archive(g)){denied();return {}}g.archived=true;g.archivedAt=TODAY;hist(g,'Archived');flagSupporters(g,`“${g.title}”, which this goal supports, was archived.`);save();toast('Archived');return {}},
 unarchive(id){const g=G(id);if(!g||!may.unarchive(g)){denied();return {}}g.archived=false;hist(g,'Unarchived');save();toast('Unarchived');return {}},
 remove(id){const g=G(id);if(!g||!may.delete(g)){denied();return {}}S.goals=S.goals.filter(x=>x!==g);S.links=S.links.filter(l=>l.from!==g.id&&l.to!==g.id);save();toast('Draft deleted');return {close:true}},
 ckOpen(id){const g=G(id);if(!g||!may.checkin(g)){denied();return {}}U.ck=g.id;return {goal:g.id}},
 ckCancel(){U.ck=null;return {}},
 ckSave(id,ck){const g=G(id);if(!g||!may.checkin(g)){denied();return {}}
  if(ck.items.some(x=>x.kind==='number'&&x.value!==''&&!isFinite(+x.value))){toast('Enter numbers only.');return {stop:true}}
  ck.items.forEach(x=>{const k=g.krs[x.i];if(k.type==='binary')k.current=!!x.checked;else if(k.type==='milestone')x.steps.forEach((s,j)=>{k.steps[j].done=!!s.done});else k.current=num(x.value)});
  g.checkins.push({at:TODAY,by:ME(),status:ck.status,note:(ck.note||'').trim()});hist(g,`Checked in: ${HEALTH[ck.status][0]}, progress ${goalPct(g)??'no data'}${goalPct(g)!=null?'%':''}`);U.ck=null;save();toast('Check-in saved');return {}},
 addOpen(id){U.add=id;return {}},addCancel(){U.add=null;return {}},
 propose(id,to){const g=G(id);if(!g||!may.align(g)){denied();return {}}if(!propose(g,to)){toast('That link is not allowed. It would point to your own goal or close a loop.');return {stop:true}}U.add=null;save();toast(isPillar(to)?'Aligned to the pillar':'Link sent to '+P(nodeOwner(to)).name);return {}},
 accept(id){const l=LK(id);if(!l||!may.decide(l)||l.status!=='pending'){denied();return {}}l.status='accepted';hist(G(l.to),`Accepted “${G(l.from).title}” as support`);hist(G(l.from),`${P(ME()).name} accepted the link to “${nodeName(l.to)}”`);save();toast('Link accepted');return {}},
 reject(id,why){const l=LK(id);if(!l||!may.decide(l)||l.status==='rejected'){denied();return {}}const r=(why||'').trim();if(!r){toast('Give a reason so the owner knows what to change');return {stop:true}}
  const was=l.status;l.status='rejected';l.reason=r;hist(G(l.to),`${was==='pending'?'Rejected':'Removed'} “${G(l.from).title}”: ${r}`);hist(G(l.from),`${P(ME()).name} ${was==='pending'?'rejected':'removed'} the link to “${nodeName(l.to)}”: ${r}`);save();toast(was==='pending'?'Link rejected':'Link removed');return {}},
 withdraw(id){const l=LK(id);if(!l||!may.withdraw(l)){denied();return {}}const g=G(l.from);S.links=S.links.filter(x=>x!==l);hist(g,`Removed the link to “${nodeName(l.to)}”`);promote(g);save();toast('Link removed');return {}},
 primary(id){const l=LK(id);if(!l||!may.withdraw(l)||l.status==='rejected'){denied();return {}}out(G(l.from)).forEach(x=>x.primary=false);l.primary=true;hist(G(l.from),`Main alignment set to “${nodeName(l.to)}”`);save();toast('Main alignment changed');return {}},
 form:saveForm,
 /* pillars */
 pillarRename(id,v){if(!canEditStrategy()){denied();return {}}v=(v||'').trim();if(!v)return {stop:true};PL(id).name=v;save();toast('Pillar renamed');return {}},
 pillarAdd(v){if(!canEditStrategy()){denied();return {}}v=(v||'').trim();if(!v)return {stop:true};S.pillars.push({id:'p'+(S.seq++),name:v});save();toast('Pillar added');return {}},
 pillarGoal(id){if(!canEditStrategy()||cyc().closed){denied();return null}return openForm({to:id})},
 /* appraisal */
 apSave(f){const a0=AP(f.id),w=a0&&applyAp(copy(a0),f);if(!w||!apOwnerOk(w)){denied('This form is not at a step you own.');return {}}if(commitAp(copy(w),'Draft saved')){toast('Draft saved');return {saved:true}}return {}},
 apSubmit(f){const a0=AP(f.id),w=a0&&applyAp(copy(a0),f);if(!w||!apOwnerOk(w)){denied('This form is not at a step you own.');return {}}
  const er=validate(w);if(er.length){U.apErr={id:w.id,list:er};return {errors:true}}
  const r=apTransition(w,a=>{const from=a.step;
   if(from==='self'){a.step=nextOf(a);return `Self-assessment submitted to ${P(P(a.emp).mgr).name}`}
   if(from==='manager'){freeze(a);syncDev(a);a.back='';a.step=nextOf(a);return `Manager review submitted to ${STEPS[a.step]}`}
   if(from==='calibration'){a.back='';a.step='ack';return 'Calibration completed and released to the employee'}
   if(from==='appeal'){if(!(a.appeal.note||'').trim()){U.apErr={id:a.id,list:[{s:'summary',t:'Write the decision note.'}]};return false}
    const o=overall(a,'mr');a.final=a.appeal.decision==='revise'?num(a.appeal.rating):(finalRating(a)??(o.ok?o.v:null));a.step='done';return `Appeal closed: ${a.appeal.decision==='revise'?'rating revised':'rating upheld'}`}
   return false},a=>({manager:'Submitted to your manager',calibration:'Submitted to calibration',ack:'Released to the employee',done:'Appraisal completed'})[a.step]||'Submitted');
  return Object.assign({top:true},r)},
 apReturn(f,m){m=(m||'').trim();if(!m){toast('Say what needs to change');return {stop:true}}const a0=AP(f.id),w=a0&&applyAp(copy(a0),f);if(!w||!['manager','calibration'].includes(w.step)){denied();return {}}
  const r=apTransition(w,a=>{const to=prevOf(a);a.back=m;a.step=to;return `Returned to ${STEPS[to]}: ${m}`},a=>`Returned to ${STEPS[a.step]}`);return Object.assign({top:true},r)},
 apAck(f,d,txt){const a0=AP(f.id),w=a0&&applyAp(copy(a0),f);if(!w||w.step!=='ack'){denied();return {}}txt=(txt||'').trim();
  if(d==='appeal'&&!S.config.appeal){denied('Appeals are switched off.');return {}}if(d==='appeal'&&!txt){toast('Give a reason for the appeal');return {stop:true}}
  const r=apTransition(w,a=>{const o=overall(a,'mr'),fr=finalRating(a)??(o.ok?o.v:null);if(d==='accept'){a.ack={at:TODAY,decision:'accept',comment:''};a.final=fr;a.step='done';return 'Acknowledged by the employee'}
   a.ack={at:TODAY,decision:'appeal',comment:txt};a.appeal={reason:txt,decision:'uphold',rating:fr!=null?Math.round(fr):3,note:''};a.step='appeal';return 'Appealed to HR: '+txt},a=>a.step==='done'?'Appraisal completed':'Appeal sent to HR');return Object.assign({top:true},r)},
 apComment(id,t){t=(t||'').trim();if(!t)return {stop:true};const a0=AP(id);if(!a0||!canSeeAp(a0)){denied();return {}}const c={at:TODAY,by:ME(),t};a0.comments.push(c);if(!saveNow()){a0.comments.pop();toast('The comment could not be saved. Try again.');return {stop:true}}toast('Comment added');return {}},
 apFile(id,x){const a0=AP(id);if(!a0||!canSeeAp(a0)){denied();return {}}const y={name:x.name,size:x.size,by:ME(),at:TODAY};a0.files.push(y);if(!saveNow()){a0.files.pop();toast('The attachment could not be saved.');return {}}toast('Attachment added (name and size only)');return {}},
 /* continuous performance, development, admin */
 actSave(f){const t=(f.title||'').trim();if(!t||!f.goalId){toast(!t?'Describe the activity.':'You need an approved goal to link the activity to.');return {stop:true}}
  S.activities.unshift({id:'ac'+(S.seq++),owner:ME(),goalId:f.goalId,title:t,status:f.status,at:TODAY,notes:(f.notes||'').trim()});save();toast('Activity saved');return {nav:href('/activities'),reset:'act'}},
 fbSend(f){const q=(f.q||'').trim();if(!q){toast('Write your question.');return {stop:true}}S.feedback.unshift({id:'fb'+(S.seq++),from:ME(),to:f.to,goalId:f.goalId||null,q,status:'requested',a:'',at:TODAY});save();toast('Request sent to '+P(f.to).name);return {nav:href('/activities',{tab:'feedback'}),reset:'fbn'}},
 fbGive(id,txt){const f=S.feedback.find(x=>x.id===id);if(!f||f.to!==ME()||f.status!=='requested'){denied();return {}}const v=(txt||'').trim();if(!v){toast('Write your feedback first');return {stop:true}}f.a=v;f.status='given';save();toast('Feedback sent to '+P(f.from).name);return {}},
 fbDecline(id){const f=S.feedback.find(x=>x.id===id);if(!f||f.to!==ME()||f.status!=='requested'){denied();return {}}f.status='declined';save();toast('Request declined');return {}},
 devStatus(id,v){const d=DV(id);if(!d||!(d.emp===ME()||P(d.emp).mgr===ME())){denied();return {}}if(d.status===v)return {stop:true};d.status=v;d.hist.push({at:TODAY,by:ME(),w:'Status set to '+v});save();toast('Status updated');return {}},
 cfg(k,v){if(!isAdmin()){denied();return {}}if(k==='theme')S.theme=v==='gold'?'gold':'light';else if(k==='decimals')S.config.decimals=+v;else S.config[k]=!!v;save();toast('Setting saved');return {}},
 setUrl(id,v){if(!isAdmin()){denied();return {}}v=(v||'').trim();if(v){let u;try{u=new URL(v)}catch(x){toast('That is not a valid address.');return {stop:true}}if(u.protocol!=='https:'){toast('The address must start with https://');return {stop:true}}}S.config.apps[id]=v;save();toast(v?'Address saved':'Address removed; the application shows as not configured');return {}}};

/* ---------- everything the views bind to ---------- */
const PAGES={home:pHome,goals:pMine,goalsAll:pAll,strategy:pMap,performance:pPerformance,appraisal:pAppraisal,team:pTeam,development:pDevelopment,devRecord:pDevRecord,training:pTraining,activities:pActivities,learning:pLearning,learningItem:pLearningItem,approvals:pApprovals,reports:pReports,drill:pDrill,admin:pAdmin,app:pApp,notFound:notFound};
function derive(){const d={sh:shell(),gd:gDialog(),route:N.name},pg=(PAGES[N.name]||notFound)();if(pg.denied===undefined)pg.denied=false;d[N.name]=pg;return d}
function formDefaults(){return {q:'',gf:filterState(),act:{title:'',goalId:'',status:'Not started',notes:''},fbn:{to:'',goalId:'',q:''},gform:{krs:[],err:{},toOpts:[],typeOpts:[],ai:null},ap:{id:null,rows:[],tna:[],calc:{}},pil:{id:'',goals:[]}}}
function stateKey(){return S.as+'|'+S.cycle}
function setNotifier(fn){notify=fn}
const ROUTES=['home','goals','goalsAll','strategy','performance','appraisal','team','development','devRecord','training','activities','learning','learningItem','approvals','reports','drill','admin','app','notFound'];
return {load,editForm,state:()=>S,derive,formDefaults,toRoute,setRoute,route,takeQuery,setNotifier,act,openForm,aiSuggest,aiReview,pillarForm,apForm,apCalc,newTna,tnaRow,setFilters,filterState,csv,search:searchResults,setScope,stateKey,ROUTES};
});
