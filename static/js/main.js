// Global XP + mascot + PWA + CHARACTERS + FX
const AVATARS=['🏃','🏋️','🏊','🚴','🤼','🏸','⚽','🏹'];
function getAvatar(){return localStorage.getItem('fp_avatar')||'🏃'}
function setAvatar(a){localStorage.setItem('fp_avatar',a);renderXP()}
function getXP(){return parseInt(localStorage.getItem('fp_xp')||'0')}
function getName(){return localStorage.getItem('fp_name')||'Guest'}
function setXP(v){const before=getXP();localStorage.setItem('fp_xp',v);renderXP();checkLevelUp(before,v)}
function addXP(n){if(n>0)fxXP(n);setXP(getXP()+n);checkBadges();bumpStreak()}
const LVLS=[['LVL 1 • ROOKIE',0],['LVL 2 • TRAINEE',50],['LVL 3 • CHALLENGER',120],['LVL 4 • PRO',250],['LVL 5 • LEGEND',400]];
function levelFor(xp){if(xp>=400)return['LVL 5 • LEGEND',100];if(xp>=250)return['LVL 4 • PRO', (xp-250)/150*100];if(xp>=120)return['LVL 3 • CHALLENGER',(xp-120)/130*100];if(xp>=50)return['LVL 2 • TRAINEE',(xp-50)/70*100];return['LVL 1 • ROOKIE',xp/50*100]}
function lvlIndex(xp){let k=0;LVLS.forEach((L,i)=>{if(xp>=L[1])k=i});return k}
function renderXP(){
 const xp=getXP();const[lvl,pct]=levelFor(xp);
 const a=document.getElementById('lvlLabel'),b=document.getElementById('xpLabel'),c=document.getElementById('xpFill');
 if(a)a.textContent=lvl; if(b)b.textContent=xp+' XP'; if(c)c.style.width=Math.max(5,Math.min(100,pct))+'%';
 const chip=document.getElementById('playerChip'); if(chip)chip.textContent=getAvatar()+' '+getName()+' • '+xp+' XP';
 const st=document.getElementById('streakChip'); if(st)st.textContent='🔥 '+getStreak()+'d';
}
function checkLevelUp(before,after){
 if(lvlIndex(after)>lvlIndex(before)){
  confetti(140);sfx('level');
  const m=document.getElementById('lvlModal'),t=document.getElementById('lvlText');
  if(m){t.textContent=LVLS[lvlIndex(after)][0]+' — '+getAvatar();m.classList.remove('hidden');say('LEVEL UP! '+LVLS[lvlIndex(after)][0]);}
 }
}
// ---- daily streak ----
function getStreak(){return parseInt(localStorage.getItem('fp_streak')||'0')}
function bumpStreak(){
 const today=new Date().toDateString();const last=localStorage.getItem('fp_last');
 if(last===today)return;
 const y=new Date(Date.now()-864e5).toDateString();
 let s=getStreak();
 s=(last===y)?s+1:1;
 localStorage.setItem('fp_streak',s);localStorage.setItem('fp_last',today);
 if(s>=2)say(s+'-day streak! 🔥 Tu rukne wala nahi!');
 renderXP();
}
// ---- FX: confetti / sounds / floating XP ----
function confetti(n){
 n=n||80;const c=document.getElementById('fx');if(!c)return;const x=c.getContext('2d');
 c.width=innerWidth;c.height=innerHeight;
 const cols=['#ffd23f','#ff7a1a','#00e676','#38bdf8','#ff2e7e','#fff'];
 const ps=[];for(let i=0;i<n;i++)ps.push({x:innerWidth/2+(Math.random()-.5)*220,y:innerHeight*0.35,vx:(Math.random()-.5)*11,vy:Math.random()*-9-3,g:.32,s:Math.random()*7+4,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,col:cols[i%cols.length],l:90+Math.random()*50});
 let f=0;(function loop(){x.clearRect(0,0,c.width,c.height);f++;
  ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.col;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});
  if(f<110)requestAnimationFrame(loop);else x.clearRect(0,0,c.width,c.height)})();
}
function fxXP(n){
 const d=document.createElement('div');d.className='xp-float';d.textContent='+'+n+' XP';
 d.style.left=(30+Math.random()*40)+'vw';document.body.appendChild(d);setTimeout(()=>d.remove(),1400);
}
let _AC=null;
function sfx(kind){
 try{
  _AC=_AC||new (window.AudioContext||window.webkitAudioContext)();
  const o=_AC.createOscillator(),g=_AC.createGain();o.connect(g);g.connect(_AC.destination);
  const now=_AC.currentTime;
  if(kind==='good'){o.frequency.setValueAtTime(660,now);o.frequency.setValueAtTime(880,now+.09);o.frequency.setValueAtTime(1320,now+.18);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.4);o.start(now);o.stop(now+.42)}
  else if(kind==='bad'){o.type='sawtooth';o.frequency.setValueAtTime(220,now);o.frequency.linearRampToValueAtTime(110,now+.3);g.gain.setValueAtTime(.1,now);g.gain.exponentialRampToValueAtTime(.001,now+.32);o.start(now);o.stop(now+.34)}
  else{o.frequency.setValueAtTime(523,now);o.frequency.setValueAtTime(659,now+.1);o.frequency.setValueAtTime(784,now+.2);o.frequency.setValueAtTime(1046,now+.3);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.6);o.start(now);o.stop(now+.62)}
 }catch(e){}
}
function openAvatar(){
 const m=document.getElementById('avatarModal');if(!m)return;
 document.getElementById('avatarGrid').innerHTML=AVATARS.map(a=>`<button onclick="pickAvatar('${a}')" class="text-4xl p-3 rounded-2xl ${a===getAvatar()?'bg-amber-400/30 border border-amber-400':'glass'} hover:scale-110 transition">${a}</button>`).join('');
 m.classList.remove('hidden');
}
function pickAvatar(a){setAvatar(a);document.getElementById('avatarModal').classList.add('hidden');sfx('good');confetti(50);say('New look! '+a+' — ab villain Dopu ki khair nahi!')}
function askName(){
 const n=prompt('Enter your athlete name for leaderboard + certificate:',getName());
 if(n&&n.trim()){localStorage.setItem('fp_name',n.trim().slice(0,30));renderXP();say('Nice! I saved your name as '+n.trim());}
}
function say(t){const b=document.getElementById('mascotBox'),x=document.getElementById('mascotText');if(!b)return;b.classList.remove('hidden');x.textContent=t;clearTimeout(window._mt);window._mt=setTimeout(()=>b.classList.add('hidden'),4500)}
function toggleMascot(){const tips=['2026 List is IN FORCE since 1 Jan 2026 — check Live Centre!','NEW 2026: non-diagnostic carbon-monoxide use banned (M1.4)!','Strict liability: YOU are responsible for everything in your body!','Supplements? Only batch-tested (Informed-Sport) brands!','Need medicine? Check Global DRO + ask for TUE!','NADA helpline: report doping at speakup-nada@gov.in'];say(tips[Math.floor(Math.random()*tips.length)])}
const BADGES=[{id:'first',xp:20,t:'🎯 First Steps'},{id:'half',xp:120,t:'⚡ Challenger'},{id:'pro',xp:250,t:'🔥 Pro Athlete'},{id:'legend',xp:400,t:'🏆 Clean Legend'}];
function checkBadges(){
 const xp=getXP();let ub=JSON.parse(localStorage.getItem('fp_badges')||'[]');
 BADGES.forEach(b=>{if(xp>=b.xp&&!ub.includes(b.id)){ub.push(b.id);say('Badge unlocked: '+b.t+'! Congrats champ!');}});
 localStorage.setItem('fp_badges',JSON.stringify(ub));
}
async function pushScore(game,xp){
 try{await fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:getName(),game,xp})})}catch(e){}
}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
function installPWA(){
 if(deferredPrompt){deferredPrompt.prompt()}
 else alert('📲 To make APK-like app:\n1. Chrome menu → Add to Home Screen / Install\n2. For real APK: upload this site link on PWABuilder.com → Android APK download!\nThis works like a mobile app.');
}
(function particles(){
 const c=document.getElementById('particles');if(!c)return;const x=c.getContext('2d');let W,H,P=[];
 function rs(){W=c.width=innerWidth;H=c.height=innerHeight}
 rs();addEventListener('resize',rs);
 for(let i=0;i<70;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+1,s:Math.random()*.6+.2,o:Math.random()*.6+.2});
 (function loop(){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.s;if(p.y<0)p.y=H;x.beginPath();x.arc(p.x,p.y,p.r,0,7);const gold=p.x%3<1;x.fillStyle=gold?`rgba(255,210,63,${p.o*.5})`:`rgba(0,230,118,${p.o*.45})`;x.fill()});requestAnimationFrame(loop)})();
})();
if('serviceWorker' in navigator){navigator.serviceWorker.register('/static/sw.js').catch(()=>{})}
renderXP();
