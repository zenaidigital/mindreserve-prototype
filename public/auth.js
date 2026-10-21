const apiKey='AIzaSyBwlxtdNDd8tYjXqTUFO5Dmj-Ex6nomQ4A';
export function token(){return sessionStorage.getItem('firebase-id-token')||'';}
export function logout(){sessionStorage.removeItem('firebase-id-token');sessionStorage.removeItem('firebase-email');location.reload();}
export async function signIn(email,password){
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
  const b=await r.json();if(!r.ok)throw new Error('Email or password was not accepted.');
  sessionStorage.setItem('firebase-id-token',b.idToken);sessionStorage.setItem('firebase-email',b.email||email);return b;
}
export async function createAccount(email,password){
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
  const b=await r.json();
  if(!r.ok){
    const message=b?.error?.message||'';
    if(message.includes('EMAIL_EXISTS'))throw new Error('An account with this email already exists. Sign in instead.');
    if(message.includes('WEAK_PASSWORD'))throw new Error('Choose a password with at least six characters.');
    throw new Error('We could not create the account. Check the email and try again.');
  }
  sessionStorage.setItem('firebase-id-token',b.idToken);sessionStorage.setItem('firebase-email',b.email||email);return b;
}
