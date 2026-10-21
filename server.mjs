import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual, randomUUID} from 'node:crypto';
import {repository} from './src/store.mjs';
import {demand,clean,stamp,uid,digest,audit,documentRecord,createDecision,reviseDecision,searchDocuments,reflect,approve,createAction,recordOutcome,createAssessment,assessmentQuestions,createReserveProfile,reserveQuestions} from './src/domain.mjs';
import {aiStatus,review,summariseMeeting} from './src/ai.mjs';
import {verifyBearer} from './src/auth.mjs';
import {requireAdministrator} from './src/adminAuth.mjs';
const repo=await repository();
const assessmentSessions=new Map(); const reserveSessions=new Map(); const personas=['CEO','CIO','CTO','Enterprise architect','Project manager','Team leader','Knowledge worker','Researcher','Other'];

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
async function body(req){let chunks=[],size=0;for await(const c of req){size+=c.length;demand(size<=160000,'Request is too large.',413);chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{throw Object.assign(new Error('Invalid JSON.'),{status:400});}}
async function adminAccess(req){await requireAdministrator(req);}
async function access(req){if(['/api/assessment-schema','/api/assessments','/api/reserve-schema','/api/reserve-profiles'].includes(new URL(req.url,'http://localhost').pathname))return;const user=await verifyBearer(req);if(user){req.user=user;return;}const key=process.env.APP_ACCESS_KEY;demand(key,'Workspace authentication is not configured.',503);const supplied=String(req.headers['x-workspace-key']||'');const a=Buffer.from(supplied),b=Buffer.from(key);demand(a.length===b.length && timingSafeEqual(a,b),'That workspace key is not valid.',401);}
const getDecision=(state,id)=>{const d=state.decisions.find(d=>d.id===id);demand(d,'Decision not found.',404);return d;};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://identitytoolkit.googleapis.com; frame-ancestors 'none'; base-uri 'self'");
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/health')return send(res,200,{ok:true});
    if(url.pathname.startsWith('/api/')){
      await access(req);
      if(!['GET','HEAD'].includes(req.method)){
        const origin=req.headers.origin;
        demand(!origin||new URL(origin).host===req.headers.host,'Cross-origin changes are not allowed.',403);
        demand(String(req.headers['content-type']||'').startsWith('application/json'),'Use JSON requests.',415);
      }
      if(req.method==='GET'&&url.pathname==='/api/bootstrap'){const s=await repo.read();const {assessments,reserveProfiles,...safe}=s;return send(res,200,{...safe,runtime:{...aiStatus(),storage:repo.mode,approvalIdentity:'Self-attested prototype',externalActions:false}});}
      if(req.method==='GET'&&url.pathname==='/api/search'){const s=await repo.read();return send(res,200,{documents:searchDocuments(s.documents,url.searchParams.get('q')||'')});}
      if(req.method==='POST'&&url.pathname==='/api/assessments'){const user=await verifyBearer(req);const input=await body(req);const session=assessmentSessions.get(String(input.sessionId||''));demand(session&&session.expires>Date.now()&&!session.used,'Assessment session expired. Refresh and start again.',400);demand(String(input.name||'').trim().length>=2,'Enter your name.');demand(personas.includes(String(input.persona||'')),'Select a valid persona.');input.name=String(input.name).trim();demand(Array.isArray(input.answers),'Complete all questions.');input.answers=input.answers.map(a=>session.mapping[String(a)]);demand(input.answers.every(a=>Number.isInteger(a)),'Invalid assessment option.');return send(res,201,await repo.update(s=>{const result=createAssessment({...input,userId:user?.uid||null,userEmail:user?.email||null,claimToken:user?null:uid()});session.used=true;assessmentSessions.set(String(input.sessionId),session);s.assessments??=[];s.assessments.push(result);audit(s,'Assessment completed',result.id,`${result.name} — ${result.persona}`);return result;}));}
      if(req.method==='POST'&&url.pathname.match(/^\/api\/assessments\/[^/]+\/claim$/)){const user=await verifyBearer(req);demand(user,'Create an account to track your progress.',401);const id=url.pathname.split('/')[3];return send(res,200,await repo.update(s=>{const result=(s.assessments||[]).find(a=>a.id===id);demand(result,'Assessment not found.',404);demand(!result.userId&&result.claimToken,'This assessment is already linked or cannot be claimed.',409);demand(result.claimToken===String((req.headers['x-claim-token']||'')),'Claim token is not valid.',403);result.userId=user.uid;result.userEmail=user.email||null;delete result.claimToken;audit(s,'Assessment linked to user account',result.id,`${result.name} — ${result.persona}`);return {id:result.id};}));}
      if(req.method==='GET'&&url.pathname==='/api/my-assessments'){const user=await verifyBearer(req);demand(user,'Sign in to view your results.',401);const s=await repo.read();return send(res,200,{assessments:(s.assessments||[]).filter(a=>a.userId===user.uid).map(({answers,claimToken,...r})=>r)});}
      if(req.method==='GET'&&url.pathname==='/api/reserve-schema'){const sessionId=randomUUID();reserveSessions.set(sessionId,{expires:Date.now()+30*60*1000,used:false});return send(res,200,{sessionId,questions:reserveQuestions.map(([category,prompt,options],i)=>({id:i+1,category,prompt,options:options||null,optional:category==='Foundation & wellbeing context',reverse:[5,24].includes(i)}))});}
      if(req.method==='POST'&&url.pathname==='/api/reserve-profiles'){const input=await body(req);const session=reserveSessions.get(String(input.sessionId||''));demand(session&&session.expires>Date.now()&&!session.used,'Reserve profile session expired. Refresh and try again.',400);const result=createReserveProfile(input);session.used=true;reserveSessions.set(String(input.sessionId),session);return send(res,201,await repo.update(s=>{s.reserveProfiles??=[];s.reserveProfiles.push(result);audit(s,'Cognitive reserve profile completed',result.id,`${result.name} — ${result.persona}`);return result;}));}
      if(req.method==='GET'&&url.pathname==='/api/reserve-profiles'){await adminAccess(req);const s=await repo.read();return send(res,200,{profiles:(s.reserveProfiles||[]).map(({responses,...p})=>p)});}
      if(req.method==='GET'&&url.pathname==='/api/assessment-schema'){const sessionId=randomUUID();const mapping={};const shuffled=assessmentQuestions.map(q=>{const order=[0,1,2,3].sort(()=>Math.random()-.5);const options=order.map(original=>{const id=randomUUID();mapping[id]=original;const suffixes=[' Review the situation and constraints before acting.',' Check the available evidence and accountable owner.',' State the scope and expected outcome clearly.',' Consider the risks and reversibility first.'];const label=q.options[original];return {id,label};});return {id:q.id,category:q.category,skill:q.skill,prompt:q.prompt,options};});assessmentSessions.set(sessionId,{mapping,expires:Date.now()+30*60*1000});return send(res,200,{sessionId,questions:shuffled});} if(req.method==='GET'&&url.pathname==='/api/assessments'){await adminAccess(req);const s=await repo.read();return send(res,200,{assessments:(s.assessments||[]).map(({answers,claimToken,...r})=>r)});}
      if(req.method==='POST'&&url.pathname==='/api/documents'){const input=await body(req);return send(res,201,await repo.update(s=>{const doc=documentRecord(input);demand(s.documents.length<80,'This prototype supports up to 80 source documents.');s.documents.push(doc);audit(s,'Evidence added',doc.id,doc.title);return doc;}));}
      if(req.method==='POST'&&url.pathname==='/api/decisions'){const input=await body(req);return send(res,201,await repo.update(s=>{demand(s.decisions.length<200,'This prototype supports up to 200 decisions.');const d=createDecision(input);s.decisions.push(d);audit(s,'Decision drafted',d.id,d.title);return d;}));}
      const match=url.pathname.match(/^\/api\/decisions\/([^/]+)(?:\/(review|reflection|approval|action|outcome))?$/);
      if(match){
        const [,id,op]=match;
        if(req.method==='GET'&&!op){const s=await repo.read();return send(res,200,{decision:getDecision(s,id),documents:s.documents,events:s.events.filter(e=>e.subject===id)});}
        const input=await body(req);
        if(req.method==='PATCH'&&!op)return send(res,200,await repo.update(s=>{const d=getDecision(s,id);reviseDecision(d,input);audit(s,'Decision revised',id,`Revision ${d.revision}; prior review and approval invalidated`);return d;}));
        if(req.method==='POST'&&op==='review'){
          const s=await repo.read();const d=getDecision(s,id);demand(!d.approval,'Revise the decision before running another review.',409);
          const docs=searchDocuments(s.documents,[d.title,d.objective,d.capability,d.requirement,d.recommendation].join(' '));
          const result=await review(d,docs);
          return send(res,200,await repo.update(next=>{const current=getDecision(next,id);demand(current.revision===d.revision&&!current.approval,'The decision changed while reviewing. Run the review again.',409);current.review=result;current.reflection=null;current.status='In review';audit(next,'Review generated',id,result.source);return current;}));
        }
        if(req.method==='POST'&&op)return send(res,200,await repo.update(s=>{const d=getDecision(s,id);if(op==='reflection')reflect(d,input,s.documents);else if(op==='approval')approve(d,input);else if(op==='action')createAction(d,input);else if(op==='outcome')recordOutcome(d,input);audit(s,{reflection:'Reasoning saved',approval:'Disposition recorded',action:'Internal task created',outcome:'Reported outcome recorded'}[op],id,op==='approval'?d.approval.disposition:d.title);return d;}));
      }
      if(req.method==='POST'&&url.pathname==='/api/meetings'){
        const input=await body(req);const transcript=clean(input.transcript,20000);demand(transcript.length>=40,'Provide a transcript of at least 40 characters.');
        const draft=await summariseMeeting(transcript);const meeting={id:uid(),title:clean(input.title,160)||'Review meeting',transcript,draft,at:stamp(),status:'Draft — participant confirmation needed',hash:digest(transcript)};
        await repo.update(s=>{demand(s.meetings.length<30,'This prototype supports up to 30 transcripts.');s.meetings.push(meeting);audit(s,'Meeting draft created',meeting.id,meeting.title);});return send(res,201,meeting);
      }
      return send(res,404,{error:'Endpoint not found.'});
    }
    demand(req.method==='GET'||req.method==='HEAD','Method not allowed.',405);
    const files={'/':'index.html','/app.js':'app.js','/auth.js':'auth.js','/style.css':'style.css','/logo.png':'logo.png','/assessment.html':'assessment.html','/assessment.js':'assessment.js','/reserve.html':'reserve.html','/reserve.js':'reserve.js','/admin.html':'admin.html','/admin.js':'admin.js','/role-pathway.html':'role-pathway.html','/role-pathway.js':'role-pathway.js'};
    demand(files[url.pathname],'Page not found.',404);
    const content=await readFile(path.join(root,files[url.pathname]));
    res.writeHead(200,{'Content-Type':{'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8','png':'image/png'}[files[url.pathname].split('.').pop()]});res.end(req.method==='HEAD'?undefined:content);
  }catch(e){send(res,e.status||500,{error:e.status?e.message:'The request could not be completed. Check the local server configuration.'});}
});
server.listen(Number(process.env.PORT)||8080,process.env.HOST||'127.0.0.1',()=>console.log(`MindReserve AI: http://${process.env.HOST||'127.0.0.1'}:${Number(process.env.PORT)||8080} (${aiStatus().label}; ${repo.mode})`));


















