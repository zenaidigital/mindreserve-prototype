import {createAccount,token} from './auth.js';

const form=document.querySelector('#assessment-form');
const questionsEl=document.querySelector('#questions');
const progress=document.querySelector('#progress');
const next=document.querySelector('#next');
const back=document.querySelector('#back');
const submit=document.querySelector('#submit');
const notice=document.querySelector('#assessment-notice');
let questions=[],current=-1,answers=[],sessionId='';
const bearer=()=>token();
const authHeaders=()=>bearer()?{Authorization:`Bearer ${bearer()}`}:{};

const showNotice=(text)=>{
  const target=current>=0?document.querySelector('#navigation-notice'):notice;
  target.textContent=text;target.hidden=false;
  setTimeout(()=>target.hidden=true,5000);
};

function render(){
  if(current<0){
    questionsEl.innerHTML='<div class="empty"><strong>28 scenarios · about 10 minutes</strong><p>Start with the first scenario. You can move back before submitting.</p></div>';
    progress.innerHTML='<span class="current">Ready</span>';next.textContent='Start assessment →';back.disabled=true;return;
  }
  const q=questions[current];
  questionsEl.innerHTML=`<fieldset class="panel question-card"><legend>Scenario ${current+1}</legend><p>${escapeHtml(q.prompt)}</p>${q.options.map(o=>`<label class="option"><input type="radio" name="currentAnswer" value="${o.id}" ${answers[current]===o.id?'checked':''}> <span>${escapeHtml(o.label)}</span></label>`).join('')}</fieldset>`;
  progress.innerHTML=`<span class="current">Scenario ${current+1} of ${questions.length}</span><span>Capability check</span>`;
  back.disabled=current===0;next.hidden=current===questions.length-1;submit.hidden=current!==questions.length-1;next.textContent='Next scenario →';
}

function saveCurrent(){
  const picked=form.querySelector('input[name="currentAnswer"]:checked');
  if(!picked){showNotice('Choose an answer before continuing.');return false;}
  answers[current]=picked.value;return true;
}

next.addEventListener('click',async()=>{
  if(!questions.length){
    try{const r=await fetch('/api/assessment-schema');const b=await r.json();if(!r.ok)throw new Error(b.error||'Unable to load assessment questions.');sessionId=b.sessionId;questions=b.questions;}
    catch(e){showNotice(e.message);return;}
  }
  if(current<0){
    const name=String(form.querySelector('[name="name"]').value||'').trim();
    if(name.length<2||!form.querySelector('[name="persona"]').value){showNotice('Enter a name with at least 2 characters and select a role before starting.');form.querySelector('[name="name"]').focus();return;}
    form.querySelector('[name="name"]').value=name;
  }else if(!saveCurrent())return;
  if(current<questions.length-1)current++;render();window.scrollTo({top:document.querySelector('.question-card')?.offsetTop-20||0,behavior:'smooth'});
});

back.addEventListener('click',()=>{
  if(current>0){const picked=form.querySelector('input[name="currentAnswer"]:checked');if(picked)answers[current]=picked.value;current--;render();window.scrollTo({top:document.querySelector('.question-card')?.offsetTop-20||0,behavior:'smooth'});}
});

function renderResult(b){
  const o=document.querySelector('#result');
  const labels=['Foundation practice','Level 1 — Safe user','Level 2 — Independent practitioner','Level 3 — Advanced practitioner'];
  const weak=(b.skills||[]).filter(x=>!x.correct).map(x=>x.skill);
  const tracking=b.claimToken?`<div id="tracking-panel" class="panel"><h3>Track your progress</h3><p>Your result is ready. Would you like to create an account so you can view this result and future assessments?</p><form id="tracking-form"><div class="form-grid"><label>Email <input name="trackEmail" type="email" required autocomplete="email"></label><label>Password <input name="trackPassword" type="password" minlength="6" required autocomplete="new-password"></label></div><div id="tracking-notice" class="field-help" role="alert" aria-live="polite"></div><button class="btn" type="submit">Create account and track progress</button></form><p class="muted">You can also continue without an account; your result is already displayed.</p></div>`:'<div class="panel"><h3>Result saved</h3><p>This result is linked to your signed-in account. Sign in on the user portal to view your assessment history.</p></div>';
  o.hidden=false;
  o.innerHTML=`<h2>Baseline complete</h2><p><strong>${escapeHtml(b.name)}</strong>, your current starting level is <strong>${labels[b.level]}</strong> (${b.score}/${b.total}).</p><p>Priority practice areas: <strong>${escapeHtml(weak.slice(0,5).join(', ')||'No immediate gaps identified')}</strong>.</p><h3>Feedback and next actions</h3><ul>${(b.skills||[]).filter(x=>!x.correct).slice(0,5).map(x=>`<li><strong>${escapeHtml(x.skill)}</strong>: ${escapeHtml(x.explanation)}</li>`).join('')||'<li>Retest with a new scenario set to confirm the baseline.</li>'}</ul><p>This is a capability baseline, not a clinical, intelligence or employment score. Your result is saved for authorised administrator reporting.</p>${tracking}<p><a href="/reserve.html">Review your Cognitive Reserve Profile →</a></p><a class="btn" href="/role-pathway.html?persona=${encodeURIComponent(b.persona)}&level=${b.level}&assessment=${b.id}">Continue to role pathway →</a>`;
  const trackingForm=document.querySelector('#tracking-form');
  if(trackingForm)trackingForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const trackingNotice=document.querySelector('#tracking-notice');
    const email=String(trackingForm.trackEmail.value||'').trim();const password=String(trackingForm.trackPassword.value||'');
    try{
      trackingNotice.textContent='Creating your account…';
      await createAccount(email,password);
      const r=await fetch(`/api/assessments/${encodeURIComponent(b.id)}/claim`,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders(),'X-Claim-Token':b.claimToken},body:'{}'});
      const claimed=await r.json();if(!r.ok)throw new Error(claimed.error||'The account was created, but the result could not be linked.');
      delete b.claimToken;sessionStorage.setItem('mindreserve-assessment-'+b.id,JSON.stringify(b));
      document.querySelector('#tracking-panel').innerHTML='<h3>Progress tracking enabled</h3><p>Your account is created and this assessment is now linked to it. Future results will appear in your history when you are signed in.</p>';
    }catch(err){trackingNotice.textContent=err.message;}
  });
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  const nameField=form.querySelector('[name="name"]'),roleField=form.querySelector('[name="persona"]');
  const trimmed=String(nameField.value||'').trim();nameField.value=trimmed;
  if(trimmed.length<2){showNotice('Enter a name with at least 2 characters.');nameField.focus();return;}
  if(!roleField.value){showNotice('Select a role before submitting.');roleField.focus();return;}
  if(!form.reportValidity()||!saveCurrent())return;
  const f=new FormData(form);
  try{
    const r=await fetch('/api/assessments',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({sessionId,name:String(f.get('name')||'').trim(),persona:f.get('persona'),answers})});
    const b=await r.json();if(!r.ok)throw new Error(b.error||'Unable to save assessment.');
    sessionStorage.setItem('mindreserve-assessment-'+b.id,JSON.stringify(b));renderResult(b);form.hidden=true;window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
  }catch(err){showNotice(err.message);}
});

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

(async()=>{
  try{
    const prior=bearer()?await fetch('/api/my-assessments',{headers:authHeaders()}):null;
    if(prior?.ok){const data=await prior.json();if(data.assessments?.length){const box=document.createElement('section');box.className='panel';box.innerHTML='<h2>My previous results</h2>';for(const a of data.assessments.slice().reverse()){const row=document.createElement('p');row.className='note';row.textContent=`${a.name} · ${a.persona} · ${a.score}/${a.total} · ${new Date(a.at).toLocaleString()}`;box.append(row);}form.parentElement.prepend(box);}}
    const r=await fetch('/api/assessment-schema');const b=await r.json();if(!r.ok)throw new Error(b.error);sessionId=b.sessionId;questions=b.questions;render();
  }catch(e){showNotice('Unable to load assessment questions. Refresh the page.');}
})();
