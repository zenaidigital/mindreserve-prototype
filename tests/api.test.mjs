import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {once} from 'node:events';

test('HTTP end-to-end: evidence, decision, approval gating, export data, meeting and persistence',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'mindreserve-test-'));
  const port=18000+Math.floor(Math.random()*10000);
  const child=spawn(process.execPath,['server.mjs'],{cwd:path.resolve('.'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',AI_MODE:'demo',STORE_MODE:'local',DATA_DIR:dir,APP_ACCESS_KEY:'test-private-workspace'}});
  const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server did not start')),8000);child.stdout.on('data',s=>{if(s.toString().includes('MindReserve AI:')){clearTimeout(timer);resolve();}});child.on('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited ${code}`));});});
  const request=async(url,method='GET',data,key=true,origin)=>{const r=await fetch(`http://127.0.0.1:${port}/api${url}`,{method,headers:{'Content-Type':'application/json',...(key?{'X-Workspace-Key':'test-private-workspace'}:{}),...(origin?{Origin:origin}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json()};};
  try{
    await ready;
    assert.equal((await request('/bootstrap','GET',null,false)).status,401);
    assert.equal((await request('/documents','POST',{title:'Blocked',text:'A source text with enough characters for validation.'},true,'https://other.example')).status,403);
    const start=(await request('/bootstrap')).data;assert.equal(start.runtime.mode,'demo');
    const input={title:'Onboarding pilot',objective:'Improve customer onboarding',capability:'Customer onboarding',requirement:'Human approval and rollback conditions',owner:'Accountable owner',recommendation:'Reduce onboarding time by 40% with an AI pilot.'};
    const d=(await request('/decisions','POST',input)).data;
    assert.equal((await request(`/decisions/${d.id}/action`,'POST',{title:'Skip review',owner:'Owner'})).status,409);
    const reviewed=(await request(`/decisions/${d.id}/review`,'POST',{})).data;assert.ok(reviewed.review.evidence.length);
    assert.equal((await request(`/decisions/${d.id}/reflection`,'POST',{answers:Array(4).fill('A substantive answer that explains evidence and uncertainty.'),evidenceIds:[start.documents[0].id],revisedRecommendation:'Run a limited pilot with human approval and measured evidence.'})).status,200);
    assert.equal((await request(`/decisions/${d.id}/approval`,'POST',{disposition:'Approved',confirmed:true,rationale:'Approve a bounded pilot retaining human approval throughout.'})).status,200);
    assert.equal((await request(`/decisions/${d.id}/action`,'POST',{title:'Run the limited pilot',owner:'Pilot lead'})).status,200);
    assert.equal((await request(`/decisions/${d.id}/action`,'POST',{title:'Duplicate task',owner:'Lead'})).status,409);
    assert.equal((await request(`/decisions/${d.id}/outcome`,'POST',{baselineMinutes:40,observedMinutes:32,sampleSize:20,note:'Simulated pilot measurements for demonstration only.',quality:'No real quality assessment performed.'})).status,200);
    const meeting=await request('/meetings','POST',{title:'Pilot meeting',transcript:'Owner: Decision: approved a limited pilot.\nLead: Action: I will define the baseline.\nReviewer: What are the rollback conditions?'});assert.equal(meeting.status,201);assert.equal(meeting.data.draft.decisions.length,1);
    const end=(await request('/bootstrap')).data;assert.equal(end.decisions.length,1);assert.equal(end.decisions[0].action.status,'Completed');assert.ok(end.events.length>=7);assert.equal(end.meetings.length,1);
    const source=(await request('/documents','POST',{title:'New evidence',text:'A newly supplied text source containing pilot requirements.'}));assert.equal(source.status,201);
    const exported=(await request(`/decisions/${d.id}`)).data;assert.equal(exported.decision.approval.identity,'Self-attested prototype; not authenticated enterprise approval');
    const {readFile}=await import('node:fs/promises');const persisted=JSON.parse(await readFile(path.join(dir,'workspace.json'),'utf8'));assert.equal(persisted.decisions[0].id,d.id);
  }finally{child.kill();await once(child,'exit').catch(()=>{});await rm(dir,{recursive:true,force:true});}
});
