import {signIn, token} from '/auth.js';
const labels=['Foundation practice','Level 1 — Safe user','Level 2 — Independent practitioner','Level 3 — Advanced practitioner'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const summary=document.querySelector('#summary'), rows=document.querySelector('#rows'), reserve=document.querySelector('#reserve-summary');
const login=document.createElement('section');
login.className='panel';
login.innerHTML='<h2>Administrator sign-in</h2><p>Use your authorised administrator email and password.</p><form id="admin-login"><label for="admin-email">Email</label><input id="admin-email" type="email" autocomplete="username" required><label for="admin-password">Password</label><input id="admin-password" type="password" autocomplete="current-password" required><button class="btn" type="submit">Sign in</button></form><p id="admin-status" role="status" aria-live="polite"></p><button id="admin-signout" class="btn secondary" type="button" hidden>Sign out</button>';
summary.before(login);
const form=login.querySelector('form'), input=login.querySelector('#admin-password'), email=login.querySelector('#admin-email'), button=form.querySelector('button'), status=login.querySelector('#admin-status'), signout=login.querySelector('#admin-signout');
let generation=0;
function clearResults(){summary.replaceChildren();rows.innerHTML='<tr><td colspan="6">Sign in as an administrator to view results.</td></tr>';if(reserve)reserve.textContent='Sign in to view reserve summaries.';}
function reset(message=''){generation++;sessionStorage.removeItem('admin-key');input.value='';form.hidden=false;signout.hidden=true;button.disabled=false;status.textContent=message;clearResults();}
async function readResults(url,key){
 const r=await fetch(url,{headers:{Authorization:'Bearer '+key},cache:'no-store'});
 let data;try{data=await r.json();}catch{throw new Error('The server returned an unexpected response. Please try again.');}
 if(!r.ok){const e=new Error(r.status===401?'Your sign-in has expired. Please sign in again.':r.status===403?'This account does not have administrator access.':r.status===503?'Administrator access is not configured on the server.':data.error||'Unable to load results. Please try again.');e.status=r.status;throw e;}
 return data;
}
async function authenticate(key){
 const request=++generation;clearResults();button.disabled=true;status.textContent='Signing in…';
 try{
  const x=await readResults('/api/assessments',key);if(request!==generation)return;
  input.value='';form.hidden=true;signout.hidden=false;status.textContent='Signed in as administrator.';
  const a=x.assessments||[],avg=a.length?(a.reduce((n,v)=>n+v.score,0)/a.length).toFixed(1):'—';
  summary.innerHTML=[['Assessed users',a.length,'Self-registered'],['Average score',avg,'Across completed assessments'],['Level 3+',a.filter(v=>v.level>=3).length,'Advanced practice'],['Practice required',a.filter(v=>v.level===0).length,'Targeted support']].map(v=>`<article class="stat"><div class="label">${esc(v[0])}</div><div class="value">${esc(v[1])}</div><div class="foot">${esc(v[2])}</div></article>`).join('');
  rows.innerHTML=a.length?a.map(v=>`<tr><td><strong>${esc(v.name)}</strong></td><td>${esc(v.persona)}</td><td>${esc(v.score)}/${esc(v.total)}</td><td>${esc(labels[v.level]||v.level)}</td><td>${(v.skills||[]).filter(s=>!s.correct).slice(0,4).map(s=>esc(s.skill)).join(', ')||'None recorded'}</td><td>${esc(new Date(v.at).toLocaleString())}</td></tr>`).join(''):'<tr><td colspan="6">No assessments yet.</td></tr>';
  if(reserve){
   reserve.textContent='Loading reserve summaries…';
   try{
    const result=await readResults('/api/reserve-profiles',key);if(request!==generation)return;
    const groups=new Map();for(const p of result.profiles||[]){const role=String(p.persona||'Unspecified');const v=groups.get(role)||{n:0,total:0};v.n++;v.total+=Number(p.overall)||0;groups.set(role,v);}
    reserve.innerHTML=groups.size?'<table><thead><tr><th>Role</th><th>Profiles</th><th>Average overall</th></tr></thead><tbody>'+[...groups].map(([role,v])=>`<tr><td>${esc(role)}</td><td>${v.n}</td><td>${Math.round(v.total/v.n)}/100</td></tr>`).join('')+'</tbody></table>':'<p>No reserve profiles recorded.</p>';
   }catch(e){if(request!==generation)return;if(e.status===401||e.status===403){reset(e.message);return;}reserve.textContent='Reserve summaries could not be loaded. Sign out and retry.';}
  }
 }catch(e){if(request===generation)reset(e.message||'Unable to connect. Please try again.');}
 finally{if(request===generation)button.disabled=false;}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();button.disabled=true;status.textContent='Signing in…';
 try{const result=await signIn(email.value.trim(),input.value);input.value='';await authenticate(result.idToken);}
 catch(error){reset(error.message||'Unable to sign in. Please try again.');}
 finally{button.disabled=false;}
});
signout.addEventListener('click',()=>{
 sessionStorage.removeItem('firebase-id-token');sessionStorage.removeItem('firebase-email');reset('Signed out.');
});
sessionStorage.removeItem('admin-key');clearResults();if(token())authenticate(token());
