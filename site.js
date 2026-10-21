tailwind.config={darkMode:'class',theme:{extend:{colors:{brand:{DEFAULT:'#0B2545',600:'#13427A',accent:'#F2A900'}}}}};
(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');})();
// NOTE: demo-only guard. Real access control must be enforced on a server.
if(location.pathname.endsWith('dashboard.html')&&localStorage.getItem('skhs_auth')!=='true')location.replace('signin.html');
const NAV=[['home','index.html','Home','home'],['about','about.html','About','info'],['projects','projects.html','Projects','memory'],['ctf','ctf.html','CTF Arena','terminal'],['join','join.html','Join','person_add']];
function toggleTheme(){const d=document.documentElement.classList.toggle('dark');localStorage.setItem('theme',d?'dark':'light');}
function toggleMenu(){document.getElementById('mobile-menu').classList.toggle('hidden');}
function signOut(){localStorage.removeItem('skhs_auth');location.href='signin.html';}
document.addEventListener('DOMContentLoaded',()=>{
const page=document.body.dataset.page,authed=localStorage.getItem('skhs_auth')==='true';
const idle='text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
const item=(id,href,label,icon,extra='')=>`<a href="${href}" ${id===page?'aria-current="page"':''} class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${id===page?'bg-brand text-white':idle}"><span class="material-symbols-outlined text-[20px]">${icon}</span><span>${label}</span>${extra}</a>`;
const lock=authed?'':'<span class="material-symbols-outlined text-[16px] ml-auto opacity-60">lock</span>';
const outBtn=`<button onclick="signOut()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${idle}"><span class="material-symbols-outlined text-[20px]">logout</span><span>Sign out</span></button>`;
const portal=item('dashboard','dashboard.html','Dashboard','dashboard',lock)+(authed?outBtn:item('signin','signin.html','Sign in','login'));
const links=NAV.map(n=>item(n[0],n[1],n[2],n[3])).join('');
const logo=`<a href="index.html" class="flex items-center gap-3"><span class="w-9 h-9 rounded-md bg-brand flex items-center justify-center text-brand-accent"><span class="material-symbols-outlined">shield</span></span><span class="leading-tight"><span class="block font-bold text-[15px]">St. Kizito Namugongo</span><span class="block text-xs text-slate-500 dark:text-slate-400">Cyber Team and Robotics</span></span></a>`;
const group=(t,h)=>`<div class="space-y-1"><p class="px-3 pb-1 text-xs font-semibold text-slate-500">${t}</p>${h}</div>`;
const side=`<aside class="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen self-start border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
<div class="h-16 px-5 flex items-center border-b border-slate-200 dark:border-slate-800">${logo}</div>
<nav class="flex-1 overflow-y-auto p-3 space-y-6" aria-label="Main">${group('Explore',links)}${group('Team portal',portal)}</nav>
<div class="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">Technology partner: <a class="font-semibold hover:underline" href="https://www.pearltechhub.com/" target="_blank" rel="noopener">Pearl Tech Hub</a></div></aside>`;
const header=`<header class="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
<div class="md:hidden">${logo}</div><span class="hidden md:block text-sm text-slate-500 dark:text-slate-400">St. Kizito High School Namugongo</span>
<div class="flex items-center gap-2">
<button onclick="toggleTheme()" aria-label="Toggle dark mode" class="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><span class="material-symbols-outlined dark:hidden">dark_mode</span><span class="material-symbols-outlined hidden dark:inline">light_mode</span></button>
<button onclick="toggleMenu()" aria-label="Open menu" class="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><span class="material-symbols-outlined">menu</span></button></div></header>
<div id="mobile-menu" class="hidden md:hidden border-b border-slate-200 dark:border-slate-800 p-3 space-y-1 bg-white dark:bg-slate-950">${links}${portal}</div>`;
const footer=`<footer class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-20">
<div class="px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-2 text-sm text-slate-600 dark:text-slate-400">
<div class="space-y-2"><div class="font-bold text-slate-900 dark:text-white">St. Kizito High School Namugongo</div><p>Practical skills in cybersecurity, ESP32 robotics, solar energy and multilingual AI.</p></div>
<div class="space-y-2"><div class="font-semibold text-slate-900 dark:text-white">Contact</div><p>Next to the Catholic Shrine in Namugongo, after Zia Angelina Health Center.</p><p>Tel: +256 706 602720 / +256 393 208617</p></div></div>
<div class="border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-500">&copy; 2026 St. Kizito High School Namugongo. All rights reserved.</div></footer>`;
document.body.insertAdjacentHTML('afterbegin','<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-white focus:p-3">Skip to content</a>');
const main=document.getElementById('main'),wrap=document.createElement('div'),col=document.createElement('div');
wrap.className='md:flex flex-grow';col.className='flex-1 min-w-0 flex flex-col';
main.parentNode.insertBefore(wrap,main);wrap.innerHTML=side;wrap.appendChild(col);
col.innerHTML=header;col.appendChild(main);col.insertAdjacentHTML('beforeend',footer);
});
