const ATT_KEY='skhs_attendance';
const readAtt=()=>JSON.parse(localStorage.getItem(ATT_KEY)||'{}');
const writeAtt=a=>localStorage.setItem(ATT_KEY,JSON.stringify(a));
const todayStr=()=>new Date().toISOString().slice(0,10);
const roster=()=>loadApps().filter(a=>a.status==='approved');
const LINE='border border-slate-300 dark:border-slate-700';
const FIELD='px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm';
let view='members',query='',classFilter='',sortBy='name',draft={};
function initMembers(){
const s=getSession();
if(!s){location.replace('signin.html');return;}
if(s.role!=='patron'){document.getElementById('denied').classList.remove('hidden');return;}
document.getElementById('admin').classList.remove('hidden');
document.getElementById('att-date').value=todayStr();
loadDraft();
render();
}
function stats(){
const att=readAtt(),dates=Object.keys(att);
return roster().map(m=>{
let p=0,l=0,a=0;
dates.forEach(d=>{const v=att[d][m.id];if(v==='present')p++;else if(v==='late')l++;else if(v==='absent')a++;});
const n=p+l+a;
return {...m,p,l,a,n,rate:n?Math.round((p+l)/n*100):null};
});
}
const initials=n=>n.split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
function setView(v){view=v;render();}
function setQuery(v){query=v.toLowerCase();renderMembers();}
function setClassFilter(v){classFilter=v;renderMembers();}
function setSort(v){sortBy=v;renderMembers();}
function metric(label,value){return `<div class="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"><div class="text-sm text-slate-500">${label}</div><div class="text-3xl font-bold">${value}</div></div>`;}
function renderMetrics(rows){
const att=readAtt(),dates=Object.keys(att).sort(),last=dates[dates.length-1];
const present=last?Object.values(att[last]).filter(v=>v==='present'||v==='late').length:0;
const rated=rows.filter(r=>r.rate!==null),avg=rated.length?Math.round(rated.reduce((s,r)=>s+r.rate,0)/rated.length)+'%':'No data';
document.getElementById('metrics').innerHTML=metric('Members',rows.length)+metric('Sessions recorded',dates.length)+metric(last?'Attended on '+last:'Latest session',last?present+' of '+rows.length:'None yet')+metric('Average attendance',avg);
}
function renderMembers(){
const rows=stats();
const classes=[...new Set(rows.map(r=>r.cls))].sort();
const cf=document.getElementById('cf');
cf.innerHTML='<option value="">All classes</option>'+classes.map(c=>`<option ${c===classFilter?'selected':''}>${esc(c)}</option>`).join('');
let list=rows.filter(r=>(!classFilter||r.cls===classFilter)&&(r.name+r.id+r.email).toLowerCase().includes(query));
list.sort((a,b)=>sortBy==='rate'?(b.rate??-1)-(a.rate??-1):sortBy==='id'?a.id.localeCompare(b.id):a.name.localeCompare(b.name));
document.getElementById('members-body').innerHTML=list.map(r=>`<tr class="border-t border-slate-100 dark:border-slate-800"><td class="py-3 pr-4"><div class="flex items-center gap-3"><span class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">${esc(initials(r.name))}</span><div><div class="font-semibold">${esc(r.name)}</div><div class="text-xs text-slate-500">${esc(r.email)}</div></div></div></td><td class="py-3 pr-4 font-mono text-xs">${esc(r.id)}</td><td class="py-3 pr-4">${esc(r.cls)}</td><td class="py-3 pr-4">${r.rate===null?'<span class="text-xs text-slate-500">No records</span>':`<div class="flex items-center gap-2"><div class="h-1.5 w-24 rounded bg-slate-200 dark:bg-slate-800"><div class="h-1.5 rounded bg-brand dark:bg-brand-accent" style="width:${r.rate}%"></div></div><span class="text-xs font-semibold">${r.rate}%</span></div><div class="text-xs text-slate-500 mt-1">${r.p} present, ${r.l} late, ${r.a} absent</div>`}</td><td class="py-3 text-right"><button onclick="removeMember('${esc(r.id)}')" class="px-3 py-1.5 rounded text-xs font-semibold border border-rose-300 text-rose-600">Remove</button></td></tr>`).join('')||'<tr><td colspan="5" class="py-6 text-sm text-slate-500">No members match.</td></tr>';
}
async function addMember(e){
e.preventDefault();
const out=document.getElementById('add-msg'),email=val('m-email').toLowerCase(),apps=loadApps();
if(apps.some(a=>a.email===email))return say(out,'A member or applicant with this email already exists.');
const id=nextId(apps);
apps.push({name:val('m-name'),cls:val('m-cls'),email,hash:await hash(email,document.getElementById('m-pass').value),status:'approved',id});
saveApps(apps);
e.target.reset();
say(out,'Member added. Their student ID is '+id+'.',true);
render();
}
function removeMember(id){
if(!confirm('Remove this member? Their attendance records are deleted too.'))return;
saveApps(loadApps().filter(a=>a.id!==id));
const att=readAtt();
Object.keys(att).forEach(d=>{delete att[d][id];});
writeAtt(att);
render();
}
function loadDraft(){draft={...(readAtt()[document.getElementById('att-date').value]||{})};}
function changeDate(){loadDraft();renderAttendance();}
function setMark(id,v){draft[id]=v;renderAttendance();}
function markAll(v){roster().forEach(m=>{draft[m.id]=v;});renderAttendance();}
function saveAttendance(){
const d=document.getElementById('att-date').value;
if(!d)return;
const att=readAtt();
att[d]={};
roster().forEach(m=>{if(draft[m.id])att[d][m.id]=draft[m.id];});
writeAtt(att);
say(document.getElementById('att-msg'),'Attendance saved for '+d+'.',true);
render();
}
function renderAttendance(){
const mark=(m,v,label,on)=>`<button onclick="setMark('${esc(m.id)}','${v}')" class="px-3 py-1.5 rounded text-xs font-semibold ${draft[m.id]===v?on:LINE}">${label}</button>`;
document.getElementById('att-body').innerHTML=roster().map(m=>`<tr class="border-t border-slate-100 dark:border-slate-800"><td class="py-3 pr-4"><div class="font-semibold">${esc(m.name)}</div><div class="text-xs text-slate-500">${esc(m.id)}, ${esc(m.cls)}</div></td><td class="py-3"><div class="flex flex-wrap gap-2">${mark(m,'present','Present','bg-emerald-600 text-white')}${mark(m,'late','Late','bg-amber-500 text-white')}${mark(m,'absent','Absent','bg-rose-600 text-white')}</div></td></tr>`).join('')||'<tr><td class="py-6 text-sm text-slate-500">Add members first.</td></tr>';
const att=readAtt(),total=roster().length||1;
document.getElementById('sessions').innerHTML=Object.keys(att).sort().reverse().slice(0,8).map(d=>{const n=Object.values(att[d]).filter(v=>v==='present'||v==='late').length;return `<li class="flex items-center gap-3 text-sm"><span class="w-24 font-mono text-xs">${d}</span><div class="flex-grow h-2 rounded bg-slate-200 dark:bg-slate-800"><div class="h-2 rounded bg-brand dark:bg-brand-accent" style="width:${Math.round(n/total*100)}%"></div></div><span class="w-14 text-right text-xs font-semibold">${n} of ${roster().length}</span></li>`;}).join('')||'<li class="text-sm text-slate-500">No sessions recorded yet.</li>';
}
function render(){
renderMetrics(stats());
['members','attendance'].forEach(v=>{
document.getElementById(v+'-panel').classList.toggle('hidden',v!==view);
document.getElementById('v-'+v).className='px-4 py-2 rounded text-sm font-semibold '+(v===view?'bg-brand text-white':LINE);
});
renderMembers();
renderAttendance();
}
