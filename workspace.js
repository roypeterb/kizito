const PROJECTS_KEY='skhs_projects';
const SEED=[
{id:'p1',title:'Autonomous fire-fighting robot',desc:'4WD Arduino Uno robot with flame sensors, an MQ-2 gas and smoke sensor, L298N motor drivers and a water pump relay.',owner:'team',ownerName:'Cyber Team',status:'active',members:[],comments:[]},
{id:'p2',title:'Bluetooth robotic arm',desc:'Four-joint servo arm controlled from a phone to sort objects and simulate smart manufacturing.',owner:'team',ownerName:'Cyber Team',status:'active',members:[],comments:[]},
{id:'p3',title:'Mukwano multilingual assistant',desc:'Voice-activated browser assistant that understands English and Luganda.',owner:'team',ownerName:'Cyber Team',status:'active',members:[],comments:[]}];
const BTN='px-3 py-1.5 rounded text-xs font-semibold';
const LINE='border border-slate-300 dark:border-slate-700';
const STATUS={pending:'Pending approval',active:'In progress',completed:'Completed'};
let session,tab='pending';
const openIds=new Set();
const writeProjects=p=>localStorage.setItem(PROJECTS_KEY,JSON.stringify(p));
function readProjects(){
const raw=localStorage.getItem(PROJECTS_KEY);
if(raw)return JSON.parse(raw);
writeProjects(SEED);
return JSON.parse(JSON.stringify(SEED));
}
function initWorkspace(){
session=getSession();
if(!session){location.replace('signin.html');return;}
render();
}
function setTab(t){tab=t;render();}
function toggleForm(){document.getElementById('project-form').classList.toggle('hidden');}
function addProject(e){
e.preventDefault();
const ps=readProjects();
ps.unshift({id:'p'+Date.now(),title:val('p-title'),desc:val('p-desc'),owner:session.id,ownerName:session.name,status:'pending',members:[{id:session.id,name:session.name}],comments:[]});
writeProjects(ps);
e.target.reset();
toggleForm();
tab='pending';
render();
}
function update(id,fn){
const ps=readProjects(),i=ps.findIndex(p=>p.id===id);
if(i<0)return;
fn(ps,i);
writeProjects(ps);
render();
}
const toggleJoin=id=>update(id,(ps,i)=>{
const m=ps[i].members,k=m.findIndex(x=>x.id===session.id);
if(k>=0)m.splice(k,1);else m.push({id:session.id,name:session.name});
});
const setStatus=(id,status)=>update(id,(ps,i)=>{ps[i].status=status;});
const removeProject=id=>{if(confirm('Delete this project?'))update(id,(ps,i)=>{ps.splice(i,1);});};
function toggleOpen(id){openIds.has(id)?openIds.delete(id):openIds.add(id);render();}
function addComment(e,id){
e.preventDefault();
const text=val('c-'+id);
if(!text)return;
update(id,(ps,i)=>{ps[i].comments.push({name:session.name,text,date:new Date().toLocaleDateString()});});
}
function card(p){
const joined=p.members.some(m=>m.id===session.id),isPatron=session.role==='patron',open=openIds.has(p.id);
const b=(label,fn,style=LINE)=>`<button onclick="${fn}" class="${BTN} ${style}">${label}</button>`;
const actions=[
p.status!=='completed'?b(joined?'Leave project':'Join project',`toggleJoin('${p.id}')`,joined?LINE:'bg-brand text-white'):'',
b(`Discussion (${p.comments.length})`,`toggleOpen('${p.id}')`),
isPatron&&p.status==='pending'?b('Approve',`setStatus('${p.id}','active')`,'bg-brand text-white'):'',
isPatron&&p.status==='active'?b('Mark completed',`setStatus('${p.id}','completed')`):'',
isPatron?b('Delete',`removeProject('${p.id}')`,'border border-rose-300 text-rose-600'):''
].join('');
const messages=p.comments.map(c=>`<div class="text-sm"><span class="font-semibold">${esc(c.name)}</span> <span class="text-xs text-slate-500">${esc(c.date)}</span><p class="text-slate-600 dark:text-slate-300">${esc(c.text)}</p></div>`).join('')||'<p class="text-sm text-slate-500">No messages yet. Start the discussion.</p>';
const thread=open?`<div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">${messages}<form onsubmit="addComment(event,'${p.id}')" class="flex gap-2"><input id="c-${p.id}" required placeholder="Write a message" class="flex-grow px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"><button class="${BTN} bg-brand text-white">Send</button></form></div>`:'';
const team=p.members.length?p.members.map(m=>esc(m.name)).join(', '):'none yet';
return `<article class="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-bold">${esc(p.title)}</h3><p class="text-xs text-slate-500">Proposed by ${esc(p.ownerName)}</p></div><span class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold">${STATUS[p.status]}</span></div><p class="mt-3 text-sm text-slate-600 dark:text-slate-300">${esc(p.desc)}</p><p class="mt-3 text-xs text-slate-500">Collaborators: ${team}</p><div class="mt-4 flex flex-wrap gap-2">${actions}</div>${thread}</article>`;
}
function render(){
const ps=readProjects();
['pending','active','completed'].forEach(t=>{
document.getElementById('n-'+t).textContent=ps.filter(p=>p.status===t).length;
document.getElementById('tab-'+t).className='px-4 py-2 rounded text-sm font-semibold '+(t===tab?'bg-brand text-white':LINE);
});
document.getElementById('project-list').innerHTML=ps.filter(p=>p.status===tab).map(card).join('')||'<p class="text-sm text-slate-500">Nothing here yet.</p>';
}
