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
let _AC=null,_master=null;
function isMuted(){return localStorage.getItem('fp_mute')==='1'}
function toggleMute(){localStorage.setItem('fp_mute',isMuted()?'0':'1');updMuteBtn();if(!isMuted())sfx('click')}
function updMuteBtn(){const b=document.getElementById('muteBtn');if(b)b.textContent=isMuted()?'🔇':'🔊'}
function ac(){
 if(isMuted())return null;
 try{
  _AC=_AC||new (window.AudioContext||window.webkitAudioContext)();
  if(_AC.state==='suspended')_AC.resume();
  if(!_master){_master=_AC.createGain();_master.gain.value=0.5;_master.connect(_AC.destination)}
  return _AC;
 }catch(e){return null}
}
function tone(f0,f1,dur,type,vol,delay){
 const a=ac();if(!a)return;const t=a.currentTime+(delay||0);
 const o=a.createOscillator(),g=a.createGain();
 o.type=type||'sine';o.frequency.setValueAtTime(f0,t);
 if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.015);
 g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g);g.connect(_master);o.start(t);o.stop(t+dur+0.05);
}
function noiseHit(dur,vol,lp){
 const a=ac();if(!a)return;const t=a.currentTime;
 const len=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
 for(let k=0;k<len;k++)ch[k]=(Math.random()*2-1)*(1-k/len);
 const s=a.createBufferSource();s.buffer=buf;
 const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=lp||800;
 const g=a.createGain();g.gain.value=vol||0.3;
 s.connect(f);f.connect(g);g.connect(_master);s.start(t);
}
// Game voices: jump=whoosh, coin=ding, hit=thud, swipe, count, fanfare
function sfx(kind){
 if(isMuted())return;
 try{
  if(kind==='jump'){tone(280,720,0.22,'sine',0.22);noiseHit(0.15,0.08,2500)}
  else if(kind==='coin'){tone(1318,1318,0.09,'square',0.10);tone(1760,1760,0.16,'square',0.10,0.07)}
  else if(kind==='hit'){tone(160,55,0.3,'sawtooth',0.28);noiseHit(0.25,0.3,500)}
  else if(kind==='swipe'){tone(500,900,0.12,'triangle',0.15)}
  else if(kind==='count'){tone(880,880,0.08,'square',0.12)}
  else if(kind==='go'){tone(880,880,0.1,'square',0.14);tone(1320,1320,0.25,'square',0.14,0.1)}
  else if(kind==='click'){tone(700,700,0.06,'triangle',0.12)}
  else if(kind==='combo'){tone(660,660,0.08,'square',0.12);tone(880,880,0.08,'square',0.12,0.07);tone(1174,1174,0.14,'square',0.12,0.14)}
  else if(kind==='good'){tone(523,523,0.1,'triangle',0.18);tone(659,659,0.1,'triangle',0.18,0.09);tone(784,784,0.18,'triangle',0.18,0.18)}
  else if(kind==='bad'){tone(220,110,0.3,'sawtooth',0.2);noiseHit(0.2,0.15,600)}
  else{tone(523,523,0.12,'triangle',0.2);tone(659,659,0.12,'triangle',0.2,0.1);tone(784,784,0.12,'triangle',0.2,0.2);tone(1046,1046,0.3,'triangle',0.22,0.3);noiseHit(0.4,0.06,4000)}
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
function toggleMascot(){
 const hi=(typeof LANG==='function'&&LANG()==='hi');
 const tips=hi?HI_TIPS:['2026 List is IN FORCE since 1 Jan 2026 — check Live Centre!','NEW 2026: non-diagnostic carbon-monoxide use banned (M1.4)!','Strict liability: YOU are responsible for everything in your body!','Supplements? Only batch-tested (Informed-Sport) brands!','Need medicine? Check Global DRO + ask for TUE!','NADA helpline: report doping at speakup-nada@gov.in'];
 say(tips[Math.floor(Math.random()*tips.length)])}
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
 const c=document.getElementById('particles');if(!c)return;const x=c.getContext('2d');let W,H,P=[],run=true;
 const N=(innerWidth<768)?34:64; // fewer on mobile = 60fps
 function rs(){const d=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;c.style.width=W+'px';c.style.height=H+'px';x.setTransform(d,0,0,d,0,0)}
 rs();addEventListener('resize',rs);
 document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)requestAnimationFrame(loop)});
 for(let i=0;i<N;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+1,s:Math.random()*.6+.2,o:Math.random()*.6+.2});
 let last=0;
 function loop(t){if(!run)return;if(t-last<33){requestAnimationFrame(loop);return}last=t; // ~30fps cap, still silky
  x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.s;if(p.y<0)p.y=H;x.beginPath();x.arc(p.x,p.y,p.r,0,7);const gold=p.x%3<1;x.fillStyle=gold?`rgba(255,210,63,${p.o*.5})`:`rgba(0,230,118,${p.o*.45})`;x.fill()});requestAnimationFrame(loop)}
 requestAnimationFrame(loop);
})();
// ---- butter-smooth navigation: View Transitions + hover prefetch ----
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');
 if(!a||a.target==='_blank')return;
 const u=new URL(a.href,location.href);
 if(u.origin!==location.origin||u.pathname===location.pathname)return;
 e.preventDefault();
 const go=()=>{location.href=a.href};
 if(document.startViewTransition){document.startViewTransition(go)}else{go()}
});
(function prefetch(){
 const seen=new Set();
 document.addEventListener('pointerover',e=>{
  const a=e.target.closest('a[href]');if(!a)return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin||seen.has(u.pathname))return;
  seen.add(u.pathname);
  const l=document.createElement('link');l.rel='prefetch';l.href=u.pathname;document.head.appendChild(l);
 },{passive:true});
})();
// ---- scroll reveal ----
const _io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');_io.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -30px 0px'}):null;
function bindReveals(){document.querySelectorAll('.reveal:not(.in)').forEach(el=>{if(_io)_io.observe(el);else el.classList.add('in')})}
// ---- animated counters ----
function bindCounters(){
 document.querySelectorAll('[data-count]:not([data-done])').forEach(el=>{
  el.dataset.done='1';const end=parseFloat(el.dataset.count);const t0=performance.now(),D=1100;
  (function tick(t){const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);
   el.textContent=Math.round(end*e)+(el.dataset.suffix||'');
   if(p<1)requestAnimationFrame(tick)})(t0);
 });
}
window.addEventListener('load',()=>{
 setTimeout(()=>{const l=document.getElementById('loader');if(l)l.classList.add('hide')},350);
 bindReveals();bindCounters();
});
document.addEventListener('DOMContentLoaded',()=>{bindReveals();bindCounters()});
if('serviceWorker' in navigator){navigator.serviceWorker.register('/static/sw.js').catch(()=>{})}
renderXP();updMuteBtn();
