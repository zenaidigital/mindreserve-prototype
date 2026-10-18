import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { seed, demand } from './domain.mjs';

export async function repository() {
  if(process.env.STORE_MODE==='firestore') {
    const {Firestore}=await import('@google-cloud/firestore');
    const db=new Firestore(); const ref=db.collection('mindreserve_prototype').doc('workspace');
    await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)tx.set(ref,{state:seed()});});
    return {mode:'Firestore',read:async()=>{const s=await ref.get();return s.data().state;},update:async fn=>db.runTransaction(async tx=>{const snap=await tx.get(ref);const state=snap.data().state;const result=await fn(state);demand(Buffer.byteLength(JSON.stringify(state))<850000,'This shared Firestore prototype has reached its storage limit. Export records and migrate to separate collections.',413);tx.set(ref,{state});return result;})};
  }
  const dir=path.resolve(process.env.DATA_DIR||'data'); const file=path.join(dir,'workspace.json');
  await mkdir(dir,{recursive:true});
  let state;
  try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state=seed();await writeFile(file,JSON.stringify(state,null,2));}
  let queue=Promise.resolve();
  return {mode:'Local file',read:async()=>{await queue;return structuredClone(state);},update:fn=>{
    const task=queue.then(async()=>{const next=structuredClone(state);const result=await fn(next);await writeFile(file+'.tmp',JSON.stringify(next,null,2));await rename(file+'.tmp',file);state=next;return result;});
    queue=task.catch(()=>{}); return task;
  }};
}
