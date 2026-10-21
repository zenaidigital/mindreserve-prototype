import { timingSafeEqual } from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { verifyBearer } from './auth.mjs';

export async function requireAdministrator(req, {
  env=process.env,
  verify=async r=>verifyBearer(r, true),
  lookup=uid=>getAuth().getUser(uid)
}={}) {
  const reject=(status,message)=>{throw Object.assign(new Error(message),{status});};
  if(req.headers.authorization){
    const user=await verify(req);
    if(!user)reject(401,'Your sign-in has expired. Please sign in again.');
    const allowed=String(env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
    if(!allowed.length)reject(503,'Administrator email access is not configured.');
    let account;
    try{account=await lookup(user.uid);}catch{reject(503,'Unable to verify administrator access. Please try again.');}
    // Use the current trusted account record, not a client-submitted email or stale token email.
    if(account.disabled||account.uid!==user.uid||!allowed.includes(String(account.email||'').toLowerCase()))reject(403,'This account does not have administrator access.');
    return;
  }
  // Existing access keys remain available for older clients during rollout.
  const key=env.ADMIN_ACCESS_KEY;
  if(!key)reject(401,'Sign in with an administrator account.');
  const a=Buffer.from(String(req.headers['x-admin-key']||'')),b=Buffer.from(key);
  if(a.length!==b.length||!timingSafeEqual(a,b))reject(401,'Administrator authentication required.');
}
