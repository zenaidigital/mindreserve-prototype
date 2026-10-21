import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let verifier;
function getVerifier(){
  if(!verifier){
    if(!getApps().length) initializeApp();
    verifier=getAuth();
  }
  return verifier;
}
export async function verifyBearer(req, checkRevoked=false){
  const value=String(req.headers.authorization||'');
  if(!value.startsWith('Bearer ')) return null;
  try{return await getVerifier().verifyIdToken(value.slice(7), checkRevoked);}
  catch{return null;}
}

