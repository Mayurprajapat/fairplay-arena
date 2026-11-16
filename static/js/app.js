const $=s=>document.querySelector(s);
const PROFILES_KEY='fairplay-arena-profiles-v1';
const ACTIVE_KEY='fairplay-arena-active-player-v1';
function loadProfiles(){
 try{const value=JSON.parse(localStorage.getItem(PROFILES_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
 catch(error){console.error('Could not read saved athlete progress.',error);return {};}
}
let profiles=loadProfiles();
function activeName(){return ($('#username')?.value.trim()||localStorage.getItem(ACTIVE_KEY)||'').slice(0,24);}
function currentProfile(){
 const name=activeName(),key=name.toLowerCase(),profile=profiles[key];
 return profile&&typeof profile==='object'?profile:{username:name,xp:0,level:1,badges:[]};
}
function refreshProfile(){
 const p=currentProfile();
 if($('#navXp'))$('#navXp').textContent=p.xp+' XP';
 if($('#profileXp')){$('#profileXp').textContent=p.xp;$('#profileLevel').textContent=p.level;$('#profileBadges').textContent=p.badges.length;}
}
function refreshBoard(){
 const el=$('#leaderRows');if(!el)return;
 const rows=Object.values(profiles).sort((a,b)=>b.xp-a.xp).slice(0,10);
 el.innerHTML=rows.length?rows.map((r,i)=>`<div class="boardrow"><span>${['🥇','🥈','🥉'][i]||'#'+(i+1)} &nbsp; ${escapeHtml(r.username)}</span><span>Level ${r.level}</span><b>${r.xp} XP</b></div>`).join(''):'<div class="empty">Play a game to claim your place on this device.</div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function saveProfiles(){
 try{localStorage.setItem(PROFILES_KEY,JSON.stringify(profiles));}
 catch(error){console.error('Could not save athlete progress.',error);alert('Progress could not be saved in this browser. Check your browser storage settings.');}
}
function award(xp){
 const name=($('#username')?.value.trim()||'Athlete').slice(0,24),key=name.toLowerCase();
 const previous=profiles[key]||{username:name,xp:0,level:1,badges:[]};
 const total=previous.xp+Math.max(0,Math.min(Number(xp)||0,500));
 const badges=new Set(previous.badges);
 if(total>=100)badges.add('First Steps');
 if(total>=500)badges.add('Clean Sport Champion');
 if(total>=1000)badges.add('Fair Play Legend');
 profiles[key]={username:name,xp:total,level:Math.floor(total/250)+1,badges:[...badges]};
 try{localStorage.setItem(ACTIVE_KEY,name);}catch(error){console.error('Could not save the active athlete name.',error);}
 saveProfiles();refreshProfile();refreshBoard();return profiles[key];
}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.open).classList.add('open')));
document.querySelectorAll('.modal .x').forEach(b=>b.addEventListener('click',()=>b.closest('.modal').classList.remove('open')));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
$('#hamb')?.addEventListener('click',()=>$('#mobileLinks').classList.toggle('show'));
$('#coachClose')?.addEventListener('click',()=>$('#coach').remove());
$('#username')?.addEventListener('input',()=>{try{localStorage.setItem(ACTIVE_KEY,$('#username').value.trim());}catch(error){console.error('Could not save the active athlete name.',error);}refreshProfile();});
$('#checkerForm')?.addEventListener('submit',async e=>{e.preventDefault();const substance=$('#substanceInput').value;const r=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({substance})}).then(x=>x.json());const box=$('#checkerResult');box.classList.remove('hidden');box.innerHTML=`<b>${escapeHtml(r.status)}</b> · ${escapeHtml(r.category)}<br>${escapeHtml(r.detail)}`;});
if($('#username'))$('#username').value=localStorage.getItem(ACTIVE_KEY)||'';
refreshProfile();refreshBoard();
if($('#certificate')){
 const profile=currentProfile(),locked=$('#certificateLocked'),certificate=$('#certificate');
 if(profile.xp>=100){locked.classList.add('hidden');certificate.classList.remove('hidden');$('#certificateName').textContent=profile.username;$('#certificateXp').textContent=profile.xp+' XP';}
}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/static/sw.js').catch(()=>{}));
