const apiKey='AIzaSyBwlxtdNDd8tYjXqTUFO5Dmj-Ex6nomQ4A';
export function token(){return sessionStorage.getItem('firebase-id-token')||'';}
export function logout(){sessionStorage.removeItem('firebase-id-token');sessionStorage.removeItem('firebase-email');location.reload();}
export async function signIn(email,password){
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
  const b=await r.json();if(!r.ok)throw new Error('Email or password was not accepted.');
  sessionStorage.setItem('firebase-id-token',b.idToken);sessionStorage.setItem('firebase-email',b.email||email);return b;
}
