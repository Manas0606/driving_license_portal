import { randomBytes, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { SignJWT, importJWK, createRemoteJWKSet, jwtVerify, compactDecrypt, decodeJwt } from 'jose';

export const random = () => randomBytes(32).toString('base64url');
export const challenge = verifier => createHash('sha256').update(verifier).digest('base64url');
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function newTransaction() {
  const verifier = random();
  return { state: random(), nonce: random(), verifier, expiresAt: Date.now() + 10 * 60_000 };
}
export function validateTransaction(transaction, state) {
  if (!transaction || Date.now() >= transaction.expiresAt || !equal(transaction.state, state)) {
    throw new Error('Invalid or expired authorization transaction');
  }
}
export function validateBrowserTransaction(tx) {
  if(!tx||!['state','nonce','verifier'].every(k=>typeof tx[k]==='string'&&/^[A-Za-z0-9_-]{43,128}$/.test(tx[k]))||!Number.isSafeInteger(tx.expiresAt)||tx.expiresAt<=Date.now()||tx.expiresAt>Date.now()+600000)throw new Error('Invalid transaction');
  return {state:tx.state,nonce:tx.nonce,verifier:tx.verifier,expiresAt:tx.expiresAt};
}
export function validateSubject(id, info) {
  if (typeof id.sub !== 'string' || !id.sub || id.sub !== info.sub) throw new Error('UserInfo subject mismatch');
}
const config = {
  discovery: process.env.ESIGNET_DISCOVERY_URL || 'https://esignet.mosip-demo.mosip.net/.well-known/openid-configuration',
  issuer: process.env.ESIGNET_EXPECTED_ISSUER || 'https://esignet.mosip-demo.mosip.net',
  tokenIssuer: process.env.ESIGNET_TOKEN_ISSUER || 'https://esignet.mosip-demo.mosip.net/v1/esignet',
  clientId: process.env.ESIGNET_CLIENT_ID || '1IQWpkTghWJkAMXnwX3AYiUmFYA20wdw-CnRICPW1uI',
  keyFile: process.env.ESIGNET_PRIVATE_JWK_FILE,
  keyJson: process.env.ESIGNET_PRIVATE_JWK,
  encryptionFile: process.env.ESIGNET_USERINFO_JWK_FILE,
  encryptionJson: process.env.ESIGNET_USERINFO_JWK,
  redirect: new URL('/api/auth/callback', process.env.APP_ORIGIN || (process.env.VERCEL==='1'?'https://driving-license-portal-wine.vercel.app':'http://localhost:8080')).href,
  scope: process.env.ESIGNET_SCOPE || 'openid profile',
  acr: process.env.ESIGNET_ACR || 'mosip:idp:acr:linked-wallet mosip:idp:acr:biometrics mosip:idp:acr:generated-code',
  par: process.env.ESIGNET_USE_PAR === 'true'
};
export const isConfigured = () => Boolean(config.clientId && (config.keyFile || config.keyJson));
let cached, jwks;
function trustedUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.origin !== new URL(config.discovery).origin) throw new Error('Untrusted OIDC endpoint');
  return url.href;
}
async function request(url, options = {}) {
  const response = await fetch(trustedUrl(url), { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) });
  if (!response.ok) { const error=new Error('Identity provider HTTP '+response.status);error.code='IDP_HTTP_'+response.status;throw error; }
  return response;
}
async function metadata() {
  if (cached && cached.until > Date.now()) return cached.data;
  let data;
  try{data=await (await request(config.discovery)).json();}catch(error){
    // IIITB 1.4.1 exposes the discovery controller directly here.
    const fallback=new URL('/v1/esignet/oidc/.well-known/openid-configuration',config.discovery).href;
    if(fallback===config.discovery)throw error;
    data=await (await request(fallback)).json();
  }
  if (data.issuer !== config.issuer) throw new Error('Discovery issuer mismatch');
  for (const key of ['authorization_endpoint','token_endpoint','userinfo_endpoint','jwks_uri']) trustedUrl(data[key]);
  if (config.par) trustedUrl(data.pushed_authorization_request_endpoint);
  if (!jwks || cached?.data.jwks_uri !== data.jwks_uri) jwks = createRemoteJWKSet(new URL(data.jwks_uri), { timeoutDuration: 10000 });
  cached = { data, until: Date.now() + 5 * 60_000 };
  return data;
}
async function assertion(audience) {
  const raw=config.keyJson || await readFile(config.keyFile, 'utf8');
  const parsed=JSON.parse(raw.trim().startsWith('{')?raw:Buffer.from(raw,'base64').toString('utf8'));
  const jwk=parsed.keys?.[0]||parsed;
  if (jwk.kty !== 'RSA' || !jwk.d || !jwk.kid) throw new Error('Invalid RP signing key');
  const key = await importJWK(jwk, 'RS256');
  return new SignJWT({}).setProtectedHeader({ alg:'RS256', kid:jwk.kid })
    .setIssuer(config.clientId).setSubject(config.clientId).setAudience(audience)
    .setIssuedAt().setExpirationTime('2m').setJti(randomUUID()).sign(key);
}
async function authenticatedForm(endpoint, form) {
  form.set('client_assertion_type','urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
  form.set('client_assertion',await assertion(endpoint));
  return (await request(endpoint,{method:'POST',body:form})).json();
}
export async function begin(transaction) {
  if (!isConfigured()) throw new Error('RP onboarding is required');
  const m = await metadata();
  return {
    authorizeUri:m.authorization_endpoint, redirect_uri:config.redirect, client_id:config.clientId,
    scope:config.scope, state:transaction.state, nonce:transaction.nonce,
    ...(config.acr ? {acr_values:config.acr} : {}), usePar:config.par,
    challenge:challenge(transaction.verifier)
  };
}
export async function pushedRequest(transaction) {
  const m = await metadata();
  if (!config.par) throw new Error('PAR disabled');
  const form = new URLSearchParams({response_type:'code',client_id:config.clientId,redirect_uri:config.redirect,scope:config.scope,
    state:transaction.state,nonce:transaction.nonce,code_challenge:challenge(transaction.verifier),code_challenge_method:'S256'});
  if(config.acr) form.set('acr_values',config.acr);
  form.set('claims',JSON.stringify({userinfo:{name:{essential:true},picture:{essential:false},birthdate:{essential:false},gender:{essential:false},email:{essential:false},phone_number:{essential:false},address:{essential:false}},id_token:{}}));
  const result=await authenticatedForm(m.pushed_authorization_request_endpoint,form);
  if(typeof result.request_uri !== 'string') throw new Error('Invalid PAR response');
  return result.request_uri;
}
export async function complete(transaction, code) {
  let m;try{m=await metadata();}catch(error){throw stageError('Discovery',error);}
  let tokens;try{tokens = await authenticatedForm(m.token_endpoint,new URLSearchParams({grant_type:'authorization_code',code,
    redirect_uri:config.redirect,client_id:config.clientId,code_verifier:transaction.verifier}));}catch(error){throw stageError('Token exchange',error);}
  if(typeof tokens.id_token!=='string'||typeof tokens.access_token!=='string') throw new Error('Incomplete token response');
  const issuer=config.tokenIssuer || m.issuer;
  const verification={issuer,audience:config.clientId,algorithms:['RS256','PS256'],clockTolerance:30};
  let id;try{({payload:id}=await jwtVerify(tokens.id_token,jwks,{...verification,requiredClaims:['exp','iat','sub','nonce']}));}catch(error){throw stageError('ID token validation',error);}
  if(!equal(id.nonce,transaction.nonce)||(Array.isArray(id.aud)&&id.aud.length>1&&id.azp!==config.clientId)||(id.azp&&id.azp!==config.clientId)) throw new Error('Invalid ID token');
  let response;try{response=await request(m.userinfo_endpoint,{headers:{Authorization:'Bearer '+tokens.access_token,Accept:'application/json, application/jwt'}});}catch(error){throw stageError('UserInfo retrieval',error);}
  let body=(await response.text()).trim();
  if(body.split('.').length===5&&!body.startsWith('{')){
    if(!config.encryptionFile&&!config.encryptionJson) throw new Error('UserInfo encryption key required');
    const key=await importJWK(JSON.parse(config.encryptionJson || await readFile(config.encryptionFile,'utf8')),'RSA-OAEP-256');
    const decrypted=await compactDecrypt(body,key,{keyManagementAlgorithms:['RSA-OAEP-256'],contentEncryptionAlgorithms:['A256GCM','A128GCM','A256CBC-HS512']});
    body=new TextDecoder().decode(decrypted.plaintext);
    if(body.startsWith('{')) throw new Error('Encrypted UserInfo must contain a signed JWT');
  }
  // Like Health Services, decode the UserInfo returned directly by the trusted HTTPS endpoint.
  // This is not a browser-provided token. ID token signature, nonce and matching subject remain mandatory.
  let info;try{info=body.startsWith('{')?JSON.parse(body):decodeJwt(body);}catch(error){throw stageError('UserInfo decoding',error);}
  validateSubject(id,info);
  // Same UserInfo mapping as Health Services; return consented attributes, never tokens.
  return selectProfile(info);
}
function stageError(stage,error){const code=error.code||error.name||'ERROR';const safe=/^[A-Za-z0-9_]{1,80}$/.test(code)?code:'ERROR';const wrapped=new Error(stage+' failed ('+safe+').');wrapped.code=safe;wrapped.publicMessage=wrapped.message;return wrapped;}
export function selectProfile(info){
 // The reference Sidenav reads verified_claims before ordinary claims.
 const values={...info};for(const entry of Array.isArray(info.verified_claims)?info.verified_claims:[]){for(const [key,value] of Object.entries(entry?.claims||{}))if(value!=null)values[key]=value;}
 info=values;
 const result={};
 for(const key of ['name','given_name','birthdate','gender','email','email_verified','phone','phone_number','phone_number_verified','picture']){
  const value=info[key];if(typeof value==='string'&&value.length<=(key==='picture'?3500000:4096))result[key]=value;
 }
 if(typeof info.address==='string'&&info.address.length<=8192)result.address=info.address;
 else if(info.address&&typeof info.address==='object'&&!Array.isArray(info.address)){
  result.address={};for(const key of ['formatted','street_address','addressLine1','addressLine2','addressLine3','locality','city','province','region','postalCode','postal_code','country']){
   if(typeof info.address[key]==='string'&&info.address[key].length<=4096)result.address[key]=info.address[key];
  }
 }
 return result;
}
