const KEYS={apps:'skhs_apps',session:'skhs_session'};
const PATRON={id:'SKHSN2026P01',hash:'ea1048e4ae7bd7038161d8bf5abfd6f8c38a6b93e97a357c7e749b69cc5872bc'};
const loadApps=()=>JSON.parse(localStorage.getItem(KEYS.apps)||'[]');
const saveApps=a=>localStorage.setItem(KEYS.apps,JSON.stringify(a));
const getSession=()=>JSON.parse(localStorage.getItem(KEYS.session)||'null');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function hash(salt,pw){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function say(el,msg,ok){el.className='text-sm font-medium '+(ok?'text-emerald-600':'text-rose-600');el.textContent=msg;}
const val=id=>document.getElementById(id).value.trim();
async function submitApplication(e){
e.preventDefault();
const out=document.getElementById('join-msg'),email=val('email').toLowerCase(),apps=loadApps();
if(apps.some(a=>a.email===email))return say(out,'An application with this email already exists.');
const id=nextId(apps);
apps.push({name:val('fullname'),cls:val('cls'),email,hash:await hash(email,document.getElementById('password').value),status:'pending',id});
saveApps(apps);
e.target.reset();
say(out,'Application received. Your student ID is '+id+'. Keep it safe: you can sign in with it once the patron approves your application.',true);
}
function startSession(s){
localStorage.setItem(KEYS.session,JSON.stringify(s));
localStorage.setItem('skhs_auth','true');
location.href='dashboard.html';
}
async function signIn(e){
e.preventDefault();
const out=document.getElementById('si-msg'),id=val('uid').toUpperCase(),pw=document.getElementById('pw').value;
if(id===PATRON.id){
if(await hash(id,pw)===PATRON.hash)return startSession({role:'patron',id,name:'Patron'});
return say(out,'Incorrect ID or password.');
}
const a=loadApps().find(x=>x.id===id);
if(a&&await hash(a.email,pw)===a.hash){
if(a.status!=='approved')return say(out,'Your application is still waiting for the patron\'s approval.');
return startSession({role:'student',id,name:a.name,cls:a.cls,email:a.email});
}
say(out,'Incorrect ID or password.');
}
function nextId(apps){
const n=apps.filter(a=>a.id).map(a=>parseInt(a.id.slice(-3),10)).reduce((m,x)=>Math.max(m,x),0)+1;
return 'SKHSN2026S'+String(n).padStart(3,'0');
}
function decide(i,approve){
const apps=loadApps();
if(approve)apps[i].status='approved';else apps.splice(i,1);
saveApps(apps);
renderApplications();
}
function renderApplications(){
const apps=loadApps(),btn='px-3 py-1.5 rounded text-xs font-semibold';
const row='flex flex-wrap items-center justify-between gap-3 py-3 border-t border-slate-100 dark:border-slate-800';
const pending=apps.map((a,i)=>a.status==='pending'?`<li class="${row}"><div><div class="font-semibold">${esc(a.name)}</div><div class="text-xs text-slate-500">${esc(a.cls)}, ${esc(a.email)}, ${esc(a.id)}</div></div><div class="flex gap-2"><button onclick="decide(${i},true)" class="${btn} bg-brand text-white">Approve</button><button onclick="decide(${i},false)" class="${btn} border border-slate-300 dark:border-slate-700">Reject</button></div></li>`:'').join('');
const members=apps.filter(a=>a.status==='approved').map(a=>`<li class="${row}"><div><div class="font-semibold">${esc(a.name)}</div><div class="text-xs text-slate-500">${esc(a.cls)}, ${esc(a.email)}</div></div><span class="font-mono text-sm font-semibold">${esc(a.id)}</span></li>`).join('');
document.getElementById('pending').innerHTML=pending||'<li class="text-sm text-slate-500">No pending applications.</li>';
document.getElementById('members').innerHTML=members||'<li class="text-sm text-slate-500">No approved members yet.</li>';
}
function initDashboard(){
const s=getSession();
if(!s){location.replace('signin.html');return;}
document.getElementById('who').textContent=s.name+', '+s.id;
renderNews(s);
renderStats(s);
if(s.role==='patron'){document.getElementById('patron-panel').classList.remove('hidden');renderApplications();}
else{
document.getElementById('student-panel').classList.remove('hidden');
document.getElementById('s-id').textContent=s.id;
document.getElementById('s-class').textContent=s.cls;
document.getElementById('s-email').textContent=s.email;
}
}
const NEWS_KEY='skhs_news';
const loadNews=()=>JSON.parse(localStorage.getItem(NEWS_KEY)||'[]');
function renderNews(s){
if(s.role==='patron')document.getElementById('news-form').classList.remove('hidden');
const items=loadNews().map(n=>`<li class="py-3 border-t border-slate-100 dark:border-slate-800"><p class="text-sm">${esc(n.text)}</p><p class="text-xs text-slate-500 mt-1">${esc(n.date)}</p></li>`).join('');
document.getElementById('news').innerHTML=items||'<li class="text-sm text-slate-500">No announcements yet.</li>';
}
function postAnnouncement(e){
e.preventDefault();
const text=val('news-text');
if(!text)return;
const n=loadNews();
n.unshift({text,date:new Date().toLocaleDateString()});
localStorage.setItem(NEWS_KEY,JSON.stringify(n));
e.target.reset();
renderNews(getSession());
}
const setText=(id,v)=>{document.getElementById(id).textContent=v;};
const readList=(key,fallback)=>JSON.parse(localStorage.getItem(key)||'null')||fallback;
function renderStats(s){
const projects=readList('skhs_projects',[{status:'active'},{status:'active'},{status:'active'}]);
setText('st-members',loadApps().filter(a=>a.status==='approved').length);
setText('st-active',projects.filter(p=>p.status==='active').length);
setText('st-pending',projects.filter(p=>p.status==='pending').length);
setText('st-threads',readList('skhs_threads',[1]).length);
if(s.role==='patron')document.getElementById('card-members').setAttribute('href','members.html');
}
