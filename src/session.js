const TX='drivenext.oidc.transaction';
const PROFILE='drivenext.demo.profile';
const APPLICATIONS='drivenext.demo.applications';
const get=(key)=>{try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}};
const set=(key,value)=>sessionStorage.setItem(key,JSON.stringify(value));
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export function startTransaction(){
  const tx={state:random(),nonce:random(),verifier:random(),expiresAt:Date.now()+600000};
  set(TX,tx);return tx;
}
export function consumeTransaction(state){
  const tx=get(TX);sessionStorage.removeItem(TX);
  if(!tx||tx.state!==state||Date.now()>=tx.expiresAt)throw new Error('Invalid or expired sign-in request. Please sign in again.');
  return tx;
}
export function clearSession(){memoryProfile=null;for(const key of [TX,PROFILE,APPLICATIONS])sessionStorage.removeItem(key);}
let memoryProfile=null;
export function storeProfile(profile){clearSession();const item={profile,expiresAt:Date.now()+1800000};memoryProfile=item;try{set(PROFILE,item);}catch{/* Large photos can exceed browser storage quota; keep the current profile in memory. */}}
export function getProfile(){
  const item=memoryProfile||get(PROFILE);if(!item)return null;
  if(Date.now()>=item.expiresAt){clearSession();return null;}return item.profile;
}
export function getApplications(){if(!getProfile())return [];return get(APPLICATIONS)||[];}
export function addApplication(data){
  if(!getProfile())throw new Error('Your demo session has expired. Sign in again.');
  const rows=getApplications();if(rows.length>=5)throw new Error('This demo supports up to five requests per sign-in.');
  const row={id:crypto.randomUUID(),service:data.service,category:data.category,appointment:data.appointment,status:'DEMO',created_at:new Date().toISOString()};
  set(APPLICATIONS,[row,...rows]);return row;
}
