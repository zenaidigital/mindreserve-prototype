import {assessmentGuidance} from './assessmentGuidance.mjs';
import { randomUUID, createHash } from 'node:crypto';

export function demand(condition, message, status = 400) {
  if (!condition) throw Object.assign(new Error(message), { status });
}
export function clean(value, max = 12000) { return String(value ?? '').trim().slice(0, max); }
export const stamp = () => new Date().toISOString();
export const uid = () => randomUUID();
export const digest = value => createHash('sha256').update(value).digest('hex');
export function audit(state, type, subject, detail) {
  state.events.push({ id: uid(), at: stamp(), type, subject, detail: clean(detail, 600) });
}
export function documentRecord(input) {
  const title = clean(input.title, 160), text = clean(input.text, 40000);
  demand(title && text.length >= 30, 'Add a title and at least 30 characters of source text.');
  return { id: uid(), title, text, version: '1', owner: clean(input.owner, 120) || 'Workspace owner', classification: 'Prototype workspace', at: stamp(), hash: digest(text) };
}
export function seed() {
  const docs = [
    ['Pilot governance policy', 'A customer onboarding pilot must retain human approval for eligibility decisions. The pilot must define its scope, accountable owner, escalation path, success criteria and rollback conditions before launch. Customer information must be minimised and access restricted to authorised reviewers. A pilot result does not establish organisation-wide capability maturity.'],
    ['Onboarding baseline — fictional example', 'The fictional Harbour organisation currently requires 40 minutes per onboarding case, based on a sample of 20 cases. The sample is illustrative and is not verified enterprise data. No measured AI-assisted result is available yet. A pilot must collect completion time, quality, exception rates and reviewer effort before estimating savings.'],
    ['Decision review checklist', 'A decision brief must identify the business objective, affected capability, requirement, evidence source, alternatives, risks and decision owner. Claims about savings require a measured baseline and comparable results. Source excerpts support traceability but are not automatic proof that a claim is correct. All consequential actions require explicit human approval.']
  ].map(([title,text])=>documentRecord({title,text,owner:'Fictional Harbour organisation'}));
  return { version: 1, documents: docs, decisions: [], meetings: [], assessments: [], events: [] };
}
export const assessmentQuestions = [
  {id:'frame',category:'Problem framing',skill:'Problem framing',prompt:'Before asking AI for an answer, what should you define first?',options:['The objective, constraints and success measure','The longest possible prompt','The answer you hope to receive','The model temperature'],correct:0},
  {id:'scope',category:'Problem framing',skill:'Scope control',prompt:'A useful first step when an AI idea is too broad is to:',options:['Launch it everywhere','Define a bounded use case and decision owner','Remove all human review','Ask the model to decide the scope'],correct:1},
  {id:'measure',category:'Problem framing',skill:'Outcome measures',prompt:'A credible productivity claim needs:',options:['A baseline, comparable observation and quality measure','A confident executive sponsor only','A larger language model','A higher token limit'],correct:0},
  {id:'stakeholder',category:'Problem framing',skill:'Stakeholder awareness',prompt:'Who should be involved before a consequential AI workflow changes?',options:['Only the model vendor','Users, process owner, risk owner and approving authority','Nobody until launch','Only the fastest user'],correct:1},
  {id:'question',category:'Question formulation',skill:'Question formulation',prompt:'Which question is most useful for a high-risk decision?',options:['Give me the answer quickly','What assumptions, evidence and alternatives should we test before deciding?','Write something persuasive','Tell me what other people usually do'],correct:1},
  {id:'context',category:'Question formulation',skill:'Context selection',prompt:'A strong AI prompt should include:',options:['Relevant context, constraints, desired output and uncertainty','Every document in the company','Only the desired conclusion','No information so the model stays creative'],correct:0},
  {id:'counter',category:'Question formulation',skill:'Counter-argument',prompt:'Why ask AI for a counter-argument?',options:['To replace accountability','To expose weak assumptions and alternatives','To make the answer longer','To avoid consulting evidence'],correct:1},
  {id:'clarify',category:'Question formulation',skill:'Clarification',prompt:'When an AI answer is vague, the best next move is to:',options:['Ask a more precise question and state what evidence is needed','Accept it as strategic','Hide the uncertainty','Repeat the same prompt indefinitely'],correct:0},
  {id:'verify',category:'Evidence evaluation',skill:'AI-output verification',prompt:'AI provides an unsupported 40% savings claim. What should you do?',options:['Publish it because it sounds plausible','Ask AI to repeat it','Trace the source and test the claim against a measured baseline','Ignore the claim and proceed'],correct:2},
  {id:'source',category:'Evidence evaluation',skill:'Source traceability',prompt:'A citation is useful only when you also check:',options:['Whether the source actually supports the claim and applies to the context','Whether it has a recent-looking title','Whether AI generated it quickly','Whether it agrees with your preferred answer'],correct:0},
  {id:'quality',category:'Evidence evaluation',skill:'Quality criteria',prompt:'When measuring AI productivity, quality should be:',options:['Defined before the pilot and checked alongside speed','Ignored if cycle time improves','Assumed from user satisfaction alone','Measured only after public launch'],correct:0},
  {id:'uncertainty',category:'Evidence evaluation',skill:'Uncertainty handling',prompt:'If evidence is incomplete, the recommendation should:',options:['State the uncertainty and propose a safe test','Present the claim as fact','Remove the limitation from the report','Let the model choose the risk appetite'],correct:0},
  {id:'account',category:'Accountability',skill:'Human accountability',prompt:'Who owns a consequential AI-assisted decision?',options:['The AI vendor','The model','The person or authority approving the decision','Nobody if AI generated the recommendation'],correct:2},
  {id:'approval',category:'Accountability',skill:'Approval gates',prompt:'An approval gate should record:',options:['Decision owner, rationale, conditions and evidence reviewed','Only a thumbs-up','The model temperature','A secret score'],correct:0},
  {id:'escalate',category:'Accountability',skill:'Escalation',prompt:'When an AI output conflicts with policy, you should:',options:['Escalate to the accountable owner and preserve the evidence trail','Use the output because it is faster','Delete the conflicting policy','Ask the model to hide the conflict'],correct:0},
  {id:'privacy',category:'Accountability',skill:'Data responsibility',prompt:'Before entering sensitive company information into an AI tool, check:',options:['Authorisation, purpose, retention and approved handling','Only whether the interface is attractive','Whether colleagues are also using it','Whether the answer is fluent'],correct:0},
  {id:'systems',category:'Systems thinking',skill:'Systems thinking',prompt:'A change to one process may affect other teams because:',options:['Processes, data, incentives and controls are connected','AI always creates isolated benefits','Only technology matters','Downstream effects cannot be measured'],correct:0},
  {id:'tradeoff',category:'Systems thinking',skill:'Trade-off analysis',prompt:'A good option comparison makes explicit:',options:['Benefits, costs, risks, reversibility and who is affected','Only the largest benefit','Only the implementation date','The model’s preferred option'],correct:0},
  {id:'transfer',category:'Systems thinking',skill:'Transfer',prompt:'To reuse a successful AI pattern safely, first confirm:',options:['The context, constraints and evidence are comparable','The same prompt works everywhere','The vendor recommends it','The output sounds similar'],correct:0},
  {id:'feedback',category:'Systems thinking',skill:'Feedback loops',prompt:'A post-launch review should look for:',options:['New risks, unintended behaviour, quality drift and user feedback','Only usage volume','Only model latency','No changes after approval'],correct:0},
  {id:'metacog',category:'Learning agility',skill:'Metacognition',prompt:'Metacognition in AI-assisted work means:',options:['Noticing how you reason, where you may be wrong and what to verify','Thinking less because AI is available','Avoiding difficult tasks','Trusting your first answer'],correct:0},
  {id:'practice',category:'Learning agility',skill:'Deliberate practice',prompt:'The most useful practice task is:',options:['A short, realistic scenario with feedback and a chance to retry','A long survey with no feedback','A generic trivia quiz','A task unrelated to your work'],correct:0},
  {id:'communicate',category:'Collaboration',skill:'Communication',prompt:'A decision record should help another person understand:',options:['The objective, evidence, reasoning, owner, conditions and next step','Only the final answer','Only who used AI','Only the date'],correct:0},
  {id:'challenge',category:'Collaboration',skill:'Constructive challenge',prompt:'A healthy challenge to an AI recommendation should be:',options:['Specific, evidence-based and focused on improving the decision','Personal and adversarial','Avoided to preserve speed','Delegated entirely to AI'],correct:0},
  {id:'cognitive-empathy',category:'Empathy & human-centred collaboration',skill:'Cognitive empathy',prompt:'A colleague is frustrated by a new AI workflow. What demonstrates cognitive empathy?',options:['Explain that you understand their perspective and the process impact they are experiencing','Tell them the change is necessary and move on','Assume they are resisting technology','Ask AI to decide whether their concern is reasonable'],correct:0},
  {id:'emotional-empathy',category:'Empathy & human-centred collaboration',skill:'Emotional empathy',prompt:'A team member sounds anxious about an AI-assisted decision. What is the most appropriate response?',options:['Acknowledge the emotion, listen without judgement and avoid escalating the anxiety','Ignore the emotion and discuss only the task metrics','Tell them to calm down before continuing','Ask the model to interpret their feelings'],correct:0},
  {id:'compassionate-empathy',category:'Empathy & human-centred collaboration',skill:'Compassionate empathy',prompt:'After understanding a colleague’s concern about AI workload, what should you do?',options:['Work with them to identify a practical support or workload adjustment and follow up','Express sympathy but leave the issue for them to solve alone','Promise that the tool will fix the problem automatically','Escalate immediately without first understanding what help is needed'],correct:0},
  {id:'health',category:'Wellbeing safety',skill:'Workload awareness',prompt:'If AI-assisted work is increasing overload or distress, the appropriate response is:',options:['Pause, use available human support and review workload with the responsible manager','Ask AI for a diagnosis','Hide the issue from the team','Treat it as a performance score'],correct:0}
];const balancedOptions={
frame:['Define the objective, constraints and success measure','Start with the desired answer and ask AI to justify it','Describe the tool features before defining the business need','Ask for several ideas without setting a success measure'],
scope:['Launch a small, bounded use case with a named decision owner','Start broadly and narrow the scope after users complain','Let the model decide which parts of the process it should own','Remove human review so the pilot can move more quickly'],
measure:['Use a baseline, comparable observation and a quality measure','Use the number of prompts as the main productivity measure','Use user enthusiasm as evidence that the claim is true','Compare the new tool with an unrelated process'],
stakeholder:['Involve users, process, risk and approving owners early','Ask the vendor to approve the change on behalf of users','Wait until launch and invite affected teams to comment','Let the most experienced user decide for everyone'],
question:['Ask what assumptions, evidence and alternatives should be tested','Ask the model to provide the fastest possible answer','Ask for a persuasive response supporting the preferred option','Ask what other organisations do without sharing the context'],
context:['Provide relevant context, constraints, output format and uncertainty','Provide every available document and let the model select context','Provide only the conclusion so the model stays decisive','Provide no context and rely on the model to infer the situation'],
counter:['Use a counter-argument to expose weak assumptions and alternatives','Use a counter-argument to replace the accountable decision owner','Use a counter-argument to make the response appear more rigorous','Use a counter-argument instead of checking the available evidence'],
clarify:['Ask a precise follow-up and state what evidence is needed','Accept the vague answer because further questions add delay','Hide the uncertainty by asking for a more confident tone','Repeat the same prompt until the wording sounds convincing'],
verify:['Trace the source and test the claim against a measured baseline','Publish the claim if it is consistent with a plausible business case','Ask the model to repeat the claim with more supporting language','Proceed with the claim and check the numbers after the launch'],
source:['Check that the source supports the claim and fits the context','Trust the citation if its title looks recent and authoritative','Use the citation if another generated answer repeats it','Select the source that agrees most closely with the proposal'],
quality:['Define quality before the pilot and check it alongside speed','Ignore quality if the measured cycle time appears to improve','Treat positive user sentiment as sufficient evidence of quality','Measure quality only after the workflow is fully deployed'],
uncertainty:['State the uncertainty and propose a safe, measurable test','Present the recommendation as fact so stakeholders can act quickly','Remove limitations from the executive summary to avoid confusion','Let the model choose the organisation’s acceptable level of risk'],
account:['The person or authority approving the consequential decision','The vendor whose model produced the recommendation','The model because it generated the final wording','Nobody when the recommendation was generated automatically'],
approval:['Record the owner, rationale, conditions and evidence reviewed','Record only that someone clicked an approval button','Record the model version without recording the decision owner','Record the target date and leave the reasoning for later'],
escalate:['Escalate to the accountable owner and preserve the evidence trail','Use the output if it is faster than following the policy','Delete the conflicting policy so the workflow can continue','Ask the model to rewrite the conflict in less noticeable language'],
privacy:['Check authorisation, purpose, retention and approved handling','Assume the tool is approved because it is widely available','Share the minimum context only after the answer is generated','Use sensitive data if the model promises not to remember it'],
systems:['Consider how processes, data, incentives and controls connect','Treat the change as isolated because only one team uses it','Measure the tool response and ignore downstream process effects','Assume downstream teams will adapt without a transition plan'],
tradeoff:['Compare benefits, costs, risks, reversibility and affected groups','Choose the option with the largest stated benefit','Choose the option that can be deployed before the others','Follow the model preference when the alternatives seem similar'],
transfer:['Confirm that context, constraints and evidence are comparable','Reuse the prompt unchanged because the workflow looks similar','Copy the result whenever another team requests the same outcome','Transfer the pattern after checking only the model configuration'],
feedback:['Look for new risks, unintended behaviour, drift and user feedback','Track usage volume as the only indicator after deployment','Track latency and assume quality remains stable','Freeze the workflow after approval so later changes are avoided'],
metacog:['Notice how you reason, where you may be wrong and what to verify','Reduce your own analysis because the tool has already proposed an answer','Avoid difficult tasks until the model has learned from easier work','Trust the first fluent answer unless someone explicitly objects'],
practice:['Use a short realistic scenario with feedback and a retry','Use a long questionnaire that reports a score without practice','Use generic trivia because it avoids bias from work context','Use a task unrelated to the role so everyone receives the same test'],
communicate:['Explain the objective, evidence, reasoning, owner, conditions and next step','Share only the final answer so the record stays concise','Share only which AI tool was used and when it was used','Share the date and ask the next team to reconstruct the reasoning'],
challenge:['Make the challenge specific, evidence-based and decision-focused','Make the challenge personal so the proposer understands the concern','Avoid challenging the recommendation when delivery speed matters','Delegate the challenge entirely to the AI tool that made the proposal'],
health:['Pause, use human support and review workload with the responsible manager','Ask the AI tool to diagnose the cause of the distress','Hide the issue until performance metrics show a measurable decline','Treat the wellbeing concern as another individual performance score']
};
balancedOptions['cognitive-empathy']=assessmentQuestions.find(q=>q.id==='cognitive-empathy').options;
balancedOptions['emotional-empathy']=assessmentQuestions.find(q=>q.id==='emotional-empathy').options;
balancedOptions['compassionate-empathy']=assessmentQuestions.find(q=>q.id==='compassionate-empathy').options;
balancedOptions['cognitive-empathy']=['Acknowledge their perspective and the process impact','Tell them the change is necessary and move on','Assume they are resisting technology','Ask AI whether their concern is reasonable'];
balancedOptions['emotional-empathy']=['Acknowledge the emotion and listen without judgement','Discuss only task metrics and ignore emotion','Tell them to calm down before continuing','Ask the model to interpret their feelings'];
balancedOptions['compassionate-empathy']=['Agree a practical support or workload change and follow up','Express sympathy but leave them to solve it','Promise the tool will fix the problem automatically','Escalate without first understanding the help needed'];
for(const q of assessmentQuestions){if(balancedOptions[q.id])q.options=balancedOptions[q.id];q.correct=0;if(!q.options[0])throw new Error(`Assessment option missing for ${q.skill}`);}
export function createAssessment(input){
  const name=clean(input.name,120),persona=clean(input.persona,80); demand(name.length>=2,'Enter your name.'); demand(['CEO','CIO','CTO','Enterprise architect','Project manager','Team leader','Knowledge worker','Researcher','Other'].includes(persona),'Select a valid persona.');
  const answers=Array.isArray(input.answers)?input.answers:[]; demand(answers.length===assessmentQuestions.length,'Complete all questions.');
  demand(answers.every(a=>Number.isInteger(Number(a))&&Number(a)>=0&&Number(a)<4),'Each answer must be one of the four presented options.');
  const score=assessmentQuestions.reduce((n,q,i)=>n+(Number(answers[i])===q.correct?1:0),0); const percentage=score/assessmentQuestions.length; const level=percentage>=0.8?3:percentage>=0.65?2:percentage>=0.5?1:0;
  const extra={'Cognitive empathy':'Understand the person’s perspective and the effect of the process on their work.','Emotional empathy':'Acknowledge emotion, listen without judgement and avoid dismissing or amplifying anxiety.','Compassionate empathy':'Turn understanding into proportionate practical support and follow-up.'};
  return {id:uid(),userId:input.userId||null,userEmail:input.userEmail||null,name,persona,score,total:assessmentQuestions.length,level,skills:assessmentQuestions.map((q,i)=>({skill:q.skill,category:q.category,correct:Number(answers[i])===q.correct,explanation:assessmentGuidance[q.skill]?.explanation||extra[q.skill]||'Review the evidence, owner and next verification step before acting.'})),at:stamp()};
}export function createDecision(input) {
  const d = { id: uid(), title: clean(input.title,160), objective: clean(input.objective,1000), capability: clean(input.capability,200), requirement: clean(input.requirement,1200), owner: clean(input.owner,120), recommendation: clean(input.recommendation,6000), at: stamp(), updated: stamp(), revision: 1, status: 'Draft', review: null, reflection: null, approval: null, action: null, outcome: null };
  for (const key of ['title','objective','capability','requirement','owner','recommendation']) demand(d[key], `Provide ${key}.`);
  return d;
}
export function reviseDecision(d,input) {
  demand(!d.action, 'A decision with an action must be preserved. Create a new decision to supersede it.',409);
  const updated = createDecision({...d,...input});
  for(const key of ['title','objective','capability','requirement','owner','recommendation']) d[key]=updated[key];
  d.revision++; d.review=null; d.reflection=null; d.approval=null; d.status='Draft'; d.updated=stamp();
}
const tokens = s => [...new Set(s.toLowerCase().match(/[a-z]{4,}/g) || [])];
export function searchDocuments(docs, query) {
  const words = tokens(query);
  return docs.map(doc=>({doc,score:words.reduce((n,w)=>n+(doc.text.toLowerCase().includes(w)?1:0)+(doc.title.toLowerCase().includes(w)?2:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.doc);
}
export function demoReview(d, docs) {
  const numeric = /\d+\s*(%|percent|minutes|hours|million|days)/i.test(d.recommendation);
  return { summary: 'Review the proposal against the supplied evidence before committing to a pilot.', assumptions: [numeric ? 'The proposed time or savings claim has not been established by a comparable measured pilot.' : 'The recommendation assumes the proposed approach improves the stated business outcome.', 'The team has the capacity, information quality and authority to operate the pilot.'], alternatives: ['Run a limited pilot with human approval and explicit rollback conditions.', 'Improve the existing process before introducing AI automation.'], risks: ['Incorrect or unsupported outputs could affect customer decisions.', 'Extra review effort may offset time saved.'], questions: ['What would a sceptical business owner challenge in this recommendation?', 'Which assumption is weakest, and how could you test it?', 'What is the strongest alternative and why would you reject it?', 'Which source supports your revised decision, and what remains unverified?'], evidence: docs.slice(0,3).map(doc=>({documentId:doc.id,quote:doc.text.split(/(?<=\.)\s/)[0],reason:'Relevant source for your review; assess applicability yourself.'})), source: 'Rule-based demo', model: null, at: stamp(), revision: d.revision };
}
export function validateReview(raw, docs, revision) {
  demand(raw && typeof raw.summary === 'string', 'The AI returned an invalid review.',502);
  const bounded = (v,n) => Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,n).map(x=>clean(x,1400)):[];
  const evidence = (Array.isArray(raw.evidence)?raw.evidence:[]).slice(0,8).filter(e=> {
    const doc=docs.find(d=>d.id===e.documentId);
    return doc && typeof e.quote==='string' && e.quote.trim().length>=15 && doc.text.includes(e.quote.trim());
  }).map(e=>({documentId:e.documentId,quote:clean(e.quote,3000),reason:clean(e.reason,1000)}));
  return {summary:clean(raw.summary,2000), assumptions:bounded(raw.assumptions,6), alternatives:bounded(raw.alternatives,4), risks:bounded(raw.risks,6), questions:bounded(raw.questions,4), evidence, revision, at:stamp()};
}
export function reflect(d, input, docs) {
  demand(d.review && d.review.revision===d.revision,'Run a review of the current recommendation first.',409);
  demand(!d.approval,'Revise the decision before changing approved reasoning.',409);
  const answers=(input.answers||[]).slice(0,4).map(a=>clean(a,3000));
  demand(answers.length===4 && answers.every(a=>a.length>=20),'Answer all four review questions with at least 20 characters each.');
  const evidenceIds=[...new Set(input.evidenceIds||[])];
  demand(evidenceIds.length>0 && evidenceIds.every(id=>docs.some(doc=>doc.id===id)),'Select at least one existing source.');
  const revisedRecommendation=clean(input.revisedRecommendation,6000);
  demand(revisedRecommendation.length>=30,'Provide a revised recommendation of at least 30 characters.');
  d.reflection={answers,evidenceIds,revisedRecommendation,at:stamp(),revision:d.revision};
  d.status='Ready for approval'; d.updated=stamp();
}
export function approve(d,input) {
  demand(d.reflection && d.reflection.revision===d.revision,'Complete the evidence and reasoning review before approval.',409);
  demand(!d.approval,'A decision disposition is already recorded.',409);
  demand(input.confirmed===true,'Confirm you are recording the decision owner’s disposition.');
  demand(['Approved','Rejected'].includes(input.disposition),'Select approve or reject.');
  const rationale=clean(input.rationale,3000);
  demand(rationale.length>=20,'Provide a rationale of at least 20 characters.');
  d.approval={by:d.owner,disposition:input.disposition,rationale,at:stamp(),revision:d.revision,identity:'Self-attested prototype; not authenticated enterprise approval'};
  d.status=input.disposition; d.updated=stamp();
}
export function createAction(d,input) {
  demand(d.approval?.disposition==='Approved' && d.approval.revision===d.revision,'Only the current approved decision can create an action.',409);
  demand(!d.action,'This decision already has an action.',409);
  const title=clean(input.title,300), owner=clean(input.owner,120);
  demand(title && owner,'Provide an action and accountable owner.');
  d.action={id:uid(),title,owner,status:'Open',at:stamp(),kind:'Internal prototype task — no external system action'}; d.updated=stamp();
}
export function recordOutcome(d,input) {
  demand(d.action,'Create an approved action before recording its outcome.',409);
  const {baselineMinutes,observedMinutes,sampleSize}=input;
  demand([baselineMinutes,observedMinutes,sampleSize].every(v=>typeof v==='number' && Number.isFinite(v)),'Enter finite numeric measurements.');
  demand(baselineMinutes>0 && observedMinutes>=0 && sampleSize>=1 && Number.isInteger(sampleSize),'Use a positive baseline, non-negative observation and integer sample size.');
  const note=clean(input.note,2000); demand(note.length>=15,'Describe the measurement source and limitations.');
  demand(!d.outcome,'An outcome is already recorded. Add a new measurement revision with an explicit reason.');
  d.outcome={baselineMinutes,observedMinutes,sampleSize,note,quality:clean(input.quality,1000),confidence:sampleSize<20?'Indicative only — sample below 20 cases':'Pilot sample reported',at:stamp(),reported:true}; d.action.status='Completed';
}
export function meetingDraft(transcript) {
  const lines=transcript.split(/\n/).map(s=>s.trim()).filter(Boolean);
  return {summary:'Draft extracted from transcript markers. Confirm the wording and authority with participants.',decisions:lines.filter(l=>/\b(decision|agreed|approved)\b/i.test(l)).slice(0,10),actions:lines.filter(l=>/\b(action|will|by friday)\b/i.test(l)).slice(0,10),openQuestions:lines.filter(l=>/\?|\b(unresolved|unclear|need to check)\b/i.test(l)).slice(0,10),source:'Rule-based demo'};
}

// Original, research-informed reserve profile. It is not the CRIq instrument.
export const reserveQuestions = [
 ['Education & learning','How many years of formal education have you completed after primary school?', ['0–6 years','7–10 years','11–13 years','14–16 years','17+ years']],
 ['Education & learning','How much structured education or professional training have you completed beyond compulsory schooling?', ['None','One short course','Several short courses','Certificate or diploma','Degree or longer programme']],
 ['Education & learning','How often do you read or study material beyond what your current role requires?'],
 ['Education & learning','How often do you practise a skill until you can apply it without assistance?'],
 ['Education & learning','How often do you explain a complex idea to test your own understanding?'],
 ['Education & learning','How often do you rely on familiar methods without checking whether credible new evidence changes the situation?'],
 ['Occupational complexity','Which description best matches the complexity of your main work?', ['Routine tasks','Skilled procedures','Professional analysis','Multi-disciplinary coordination','Strategic direction and accountability']],
 ['Occupational complexity','How often do you make decisions with incomplete information?'],
 ['Occupational complexity','How often do you coordinate people, dependencies or competing priorities?'],
 ['Occupational complexity','How often do you design or improve a process rather than follow one?'],
 ['Occupational complexity','How often do you judge trade-offs between cost, quality, risk and time?'],
 ['Occupational complexity','How often do you work across different disciplines or functions?'],
 ['Occupational complexity','How often do you take responsibility for outcomes beyond your individual task?'],
 ['Occupational complexity','How often do you mentor, coach or develop another person?'],
 ['Creative & intellectual activity','How often do you write, design, build or create something original?'],
 ['Creative & intellectual activity','How often do you engage in a demanding leisure activity such as music, language learning, strategy games, making or creative practice?', ['Never','Yearly','Monthly','Weekly','Daily or almost daily']],
 ['Creative & intellectual activity','How often do you engage with challenging books, lectures or long-form analysis?'],
 ['Creative & intellectual activity','How often do you compare several explanations before choosing one?'],
 ['Creative & intellectual activity','How often do you work on a personal project requiring sustained concentration?'],
 ['Creative & intellectual activity','How often do you use reflection or journaling to improve your decisions?'],
 ['Social & civic engagement','How often do you have substantive conversations with people who think differently?'],
 ['Social & civic engagement','How often do you participate in a professional, community or civic group?', ['Never','Yearly','Monthly','Weekly','Daily or almost daily']],
 ['Social & civic engagement','How often do you collaborate on a shared goal with others?'],
 ['Social & civic engagement','How often do you volunteer, teach or contribute to a community?', ['Never','Yearly','Monthly','Weekly','Daily or almost daily']],
 ['Social & civic engagement','How often do you avoid constructive feedback when it may challenge your current approach?'],
 ['Social & civic engagement','How often do you maintain relationships that provide mutual intellectual support?'],
 ['Foundation & wellbeing context','How often do you obtain sleep sufficient for your normal functioning?'],
 ['Foundation & wellbeing context','How often do you take physical activity that supports your health?'],
 ['Foundation & wellbeing context','How often do you take breaks during prolonged cognitive work?'],
 ['Foundation & wellbeing context','How often do you notice stress or fatigue and adjust your workload?'],
 ['Foundation & wellbeing context','How often do you have access to a supportive environment for learning and recovery? This is optional context, not a capability judgement.'],
 ['Foundation & wellbeing context','How often do you have uninterrupted time for focused work or learning?']
];
export function createReserveProfile(input){
 const name=clean(input.name,160); demand(name.length>=2,'Enter your name.'); demand(['CEO','CIO','CTO','Enterprise architect','Project manager','Team leader','Knowledge worker','Researcher','Other'].includes(input.persona),'Select a valid persona.');
 demand(Array.isArray(input.responses)&&input.responses.length===reserveQuestions.length,'Complete all reserve profile questions.');
 demand(input.responses.every((v,i)=>(v===null && reserveQuestions[i][0]==='Foundation & wellbeing context') || (Number.isInteger(v)&&v>=0&&v<=4)),'Each response must be between 0 and 4.');
 const reverse=new Set([5,24]); const adjusted=input.responses.map((v,i)=>v===null||!reverse.has(i)?v:4-v);
 const groups=[...new Set(reserveQuestions.map(q=>q[0]))]; const scores=Object.fromEntries(groups.filter(g=>g!=='Foundation & wellbeing context').map(g=>{const vals=adjusted.filter((v,i)=>reserveQuestions[i][0]===g&&v!==null);return [g,Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*25)];}));
 const overall=Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.keys(scores).length);
 return {id:uid(),name,persona:input.persona,scores,overall,responses:input.responses,at:stamp(),basis:'Original MindReserve research-informed profile; not the official CRIq, CRS or CRASH.'};
}







