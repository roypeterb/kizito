const THREADS_KEY='skhs_threads';
const BTN='px-3 py-1.5 rounded text-xs font-semibold';
const LINE='border border-slate-300 dark:border-slate-700';
const FIELD='px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm';
const openThreads=new Set();
let session;
const writeThreads=t=>localStorage.setItem(THREADS_KEY,JSON.stringify(t));
function readThreads(){
const raw=localStorage.getItem(THREADS_KEY);
if(raw)return JSON.parse(raw);
const seed=[{id:'t1',title:'Welcome to the team',body:'Introduce yourself and tell us what you want to build this term.',author:'patron',authorName:'Patron',date:new Date().toLocaleDateString(),pinned:true,replies:[]}];
writeThreads(seed);
return seed;
}
function initDiscussions(){
session=getSession();
if(!session){location.replace('signin.html');return;}
render();
}
function toggleNew(){document.getElementById('thread-form').classList.toggle('hidden');}
function update(id,fn){
const ts=readThreads(),i=ts.findIndex(t=>t.id===id);
if(i<0)return;
fn(ts,i);
writeThreads(ts);
render();
}
function addThread(e){
e.preventDefault();
const ts=readThreads();
ts.unshift({id:'t'+Date.now(),title:val('t-title'),body:val('t-body'),author:session.id,authorName:session.name,date:new Date().toLocaleDateString(),pinned:false,replies:[]});
writeThreads(ts);
e.target.reset();
toggleNew();
render();
}
function addReply(e,id){
e.preventDefault();
const text=val('r-'+id);
if(!text)return;
update(id,(ts,i)=>{ts[i].replies.push({name:session.name,text,date:new Date().toLocaleDateString()});});
}
const togglePin=id=>update(id,(ts,i)=>{ts[i].pinned=!ts[i].pinned;});
const removeThread=id=>{if(confirm('Delete this discussion?'))update(id,(ts,i)=>{ts.splice(i,1);});};
function toggleOpen(id){openThreads.has(id)?openThreads.delete(id):openThreads.add(id);render();}
function card(t){
const isPatron=session.role==='patron',open=openThreads.has(t.id),canDelete=isPatron||t.author===session.id;
const b=(label,fn,style=LINE)=>`<button onclick="${fn}" class="${BTN} ${style}">${label}</button>`;
const replies=t.replies.map(r=>`<div class="text-sm"><span class="font-semibold">${esc(r.name)}</span> <span class="text-xs text-slate-500">${esc(r.date)}</span><p class="text-slate-600 dark:text-slate-300">${esc(r.text)}</p></div>`).join('')||'<p class="text-sm text-slate-500">No replies yet. Be the first.</p>';
const thread=open?`<div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">${replies}<form onsubmit="addReply(event,'${t.id}')" class="flex gap-2"><input id="r-${t.id}" required placeholder="Write a reply" class="flex-grow ${FIELD}"><button class="${BTN} bg-brand text-white">Reply</button></form></div>`:'';
return `<article class="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"><div class="flex flex-wrap items-start justify-between gap-3"><div><h2 class="font-bold">${esc(t.title)}</h2><p class="text-xs text-slate-500">${esc(t.authorName)}, ${esc(t.date)}</p></div>${t.pinned?'<span class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold">Pinned</span>':''}</div><p class="mt-3 text-sm text-slate-600 dark:text-slate-300">${esc(t.body)}</p><div class="mt-4 flex flex-wrap gap-2">${b(`Replies (${t.replies.length})`,`toggleOpen('${t.id}')`)}${isPatron?b(t.pinned?'Unpin':'Pin',`togglePin('${t.id}')`):''}${canDelete?b('Delete',`removeThread('${t.id}')`,'border border-rose-300 text-rose-600'):''}</div>${thread}</article>`;
}
function render(){
const ts=readThreads().sort((a,b)=>Number(b.pinned)-Number(a.pinned));
document.getElementById('thread-list').innerHTML=ts.map(card).join('')||'<p class="text-sm text-slate-500">No discussions yet. Start one.</p>';
}
