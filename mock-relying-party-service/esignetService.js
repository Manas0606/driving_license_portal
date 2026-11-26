import { randomBytes, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import axios from 'axios';
import { SignJWT, importJWK, createRemoteJWKSet, jwtVerify, compactDecrypt, flattenedDecrypt, generalDecrypt, decodeJwt } from 'jose';

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
import {config,readProfileConfig,buildClaims,validClaim} from './config.js';
export const isConfigured = () => Boolean(config.clientId && (config.keyFile || config.keyJson));
let jwks;
function trustedUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.origin !== new URL(config.service).origin) throw new Error('Untrusted OIDC endpoint');
  return url.href;
}
export function providerEndpoints(){
  const base=config.service.replace(/\/+$/,'');
  const m={
    issuer:config.issuer,
    authorization_endpoint:config.authorize,
    token_endpoint:config.tokenEndpoint||base+'/oauth/v2/token',
    userinfo_endpoint:config.userinfoEndpoint||base+'/oidc/userinfo',
    jwks_uri:config.jwksEndpoint,
    pushed_authorization_request_endpoint:config.parEndpoint||base+'/oauth/par'
  };
  for(const k of ['authorization_endpoint','token_endpoint','userinfo_endpoint','jwks_uri','pushed_authorization_request_endpoint'])m[k]=trustedUrl(m[k]);
  return m;
}
function safeErrorCode(error){
  const code=error?.cause?.code||error?.code||error?.name||'ERROR';
  return /^[A-Za-z0-9_]{1,80}$/.test(code)?code:'ERROR';
}
async function request(url, options = {}) {
  const response = await axios.request({url:trustedUrl(url),method:options.method||'GET',data:options.body?.toString(),headers:{...(options.body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...options.headers},timeout:12000,maxRedirects:0,proxy:false,responseType:'text',transformResponse:[value=>value],validateStatus:()=>true});
  if(response.status<200||response.status>=300){const error=new Error('Identity provider HTTP '+response.status);error.code='IDP_HTTP_'+response.status;throw error;}
  return {text:async()=>response.data,json:async()=>JSON.parse(response.data)};
}
function metadata(){
  const m=providerEndpoints();
  if(!jwks)jwks=createRemoteJWKSet(new URL(m.jwks_uri),{timeoutDuration:10000});
  return m;
}
// Non-authenticated connectivity check: no codes, assertions, tokens or credentials sent.
export async function probeProvider(){
  const m=providerEndpoints();
  const targets={token:m.token_endpoint,userinfo:m.userinfo_endpoint,jwks:m.jwks_uri};
  return Object.fromEntries(await Promise.all(Object.entries(targets).map(async ([name,url])=>{
    try{
      const response=await fetch(url,{method:name==='jwks'?'GET':'HEAD',redirect:'manual',signal:AbortSignal.timeout(8000)});
      return [name,{reachable:true,httpStatus:response.status}];
    }catch(error){return [name,{reachable:false,error:safeErrorCode(error)}];}
  })));
}
export async function generateSignedJwt(audience) {
  const raw=config.keyJson || await readFile(config.keyFile, 'utf8');
  const parsed=JSON.parse(raw.trim().startsWith('{')?raw:Buffer.from(raw,'base64').toString('utf8'));
  const jwk=parsed.keys?.[0]||parsed;
  if (jwk.kty !== 'RSA' || !jwk.d || !jwk.kid) throw new Error('Invalid RP signing key');
  const key = await importJWK(jwk, 'RS256');
  return new SignJWT({}).setProtectedHeader({ alg:'RS256', kid:jwk.kid })
    .setIssuer(config.clientId).setSubject(config.clientId).setAudience(audience)
    .setIssuedAt().setExpirationTime('2m').setJti(randomUUID()).sign(key);
}
async function authenticatedForm(endpoint, form, audience=endpoint) {
  form.set('client_assertion_type',config.assertionType);
  form.set('client_assertion',await generateSignedJwt(audience));
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
export async function pushedRequest(transaction,uiLocale='en') {
  const m = await metadata();
  if (!config.par) throw new Error('PAR disabled');
  const form = new URLSearchParams({response_type:'code',client_id:config.clientId,redirect_uri:config.redirect,scope:config.scope,
    state:transaction.state,nonce:transaction.nonce,code_challenge:challenge(transaction.verifier),code_challenge_method:'S256'});
  if(config.acr) form.set('acr_values',config.acr);
  form.set('claims',JSON.stringify(buildClaims()));
  form.set('claims_locales','en');
  form.set('ui_locales',uiLocale);
  if(config.maxAge!==undefined)form.set('max_age',config.maxAge);
  const result=await authenticatedForm(m.pushed_authorization_request_endpoint,form,config.parAudience||m.pushed_authorization_request_endpoint);
  if(typeof result.request_uri !== 'string') throw new Error('Invalid PAR response');
  return result.request_uri;
}
export async function post_GetToken(transaction,code,m=metadata()) {
  try{return await authenticatedForm(m.token_endpoint,new URLSearchParams({grant_type:'authorization_code',code,
    redirect_uri:config.redirect,client_id:config.clientId,code_verifier:transaction.verifier}),config.tokenAudience||m.token_endpoint);}catch(error){throw stageError('Token exchange',error);}
}
// Same decode/decrypt entry point as the Health Services relying party.
export async function decodeUserInfoResponse(userInfoResponse){
 let body=typeof userInfoResponse==='string'?userInfoResponse.trim():userInfoResponse;
 let parsed=body;
 if(typeof body==='string'&&body.startsWith('{'))parsed=JSON.parse(body);
 const compact=typeof body==='string'&&body.split('.').length===5;
 const serialized=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&typeof parsed.ciphertext==='string'&&(Array.isArray(parsed.recipients)||typeof parsed.encrypted_key==='string'||typeof parsed.protected==='string');
 if(config.userinfoResponseType==='jwe'||compact||serialized){
  if(!config.encryptionFile&&!config.encryptionJson)throw new Error('UserInfo encryption key required');
  const raw=config.encryptionJson||await readFile(config.encryptionFile,'utf8');
  const jwk=JSON.parse(raw.trim().startsWith('{')?raw:Buffer.from(raw,'base64').toString('utf8'));
  const key=await importJWK(jwk.keys?.[0]||jwk,'RSA-OAEP-256');
  const options={keyManagementAlgorithms:['RSA-OAEP-256'],contentEncryptionAlgorithms:['A256GCM','A128GCM','A256CBC-HS512']};
  const decrypted=compact?await compactDecrypt(body,key,options):Array.isArray(parsed?.recipients)?await generalDecrypt(parsed,key,options):await flattenedDecrypt(parsed,key,options);
  body=new TextDecoder().decode(decrypted.plaintext);
  if(body.startsWith('{'))throw new Error('Encrypted UserInfo must contain a signed JWT');
  return decodeJwt(body);
 }
 return typeof parsed==='string'?decodeJwt(parsed):parsed;
}
export async function get_GetUserInfo(accessToken,m=metadata()){
 let response;try{response=await request(m.userinfo_endpoint,{headers:{Authorization:'Bearer '+accessToken,Accept:'application/json, application/jwt'}});}catch(error){throw stageError('UserInfo retrieval',error);}
 try{return await decodeUserInfoResponse(await response.text());}catch(error){throw stageError('UserInfo decoding',error);}
}
export async function complete(transaction, code) {
  let m;try{m=await metadata();}catch(error){throw stageError('Provider configuration',error);}
  const tokens=await post_GetToken(transaction,code,m);
  if(typeof tokens.id_token!=='string'||typeof tokens.access_token!=='string') throw new Error('Incomplete token response');
  const issuer=config.tokenIssuer || m.issuer;
  const verification={issuer,audience:config.clientId,algorithms:['RS256','PS256'],clockTolerance:30};
  let id;try{({payload:id}=await jwtVerify(tokens.id_token,jwks,{...verification,requiredClaims:['exp','iat','sub','nonce']}));}catch(error){throw stageError('ID token validation',error);}
  if(!equal(id.nonce,transaction.nonce)||(Array.isArray(id.aud)&&id.aud.length>1&&id.azp!==config.clientId)||(id.azp&&id.azp!==config.clientId)) throw new Error('Invalid ID token');
  const info=await get_GetUserInfo(tokens.access_token,m);
  validateSubject(id,info);
  // Same UserInfo mapping as Health Services; return consented attributes, never tokens.
  return selectProfile(info);
}
function stageError(stage,error){const safe=safeErrorCode(error);const wrapped=new Error(stage+' failed ('+safe+').');wrapped.code=safe;wrapped.publicMessage=wrapped.message;return wrapped;}
export function selectProfile(info,profile=readProfileConfig()){
 // Verified claims take precedence, just as in the Health Services profile view.
 const values={...info};
 for(const entry of Array.isArray(info.verified_claims)?info.verified_claims:[]){
  for(const [key,value] of Object.entries(entry?.claims||{}))if(validClaim(key)&&value!=null)values[key]=value;
 }
 const result={};
 const addressKeys=['formatted','street_address','addressLine1','addressLine2','addressLine3','locality','city','province','region','postalCode','postal_code','country'];
 for(const field of profile.fields){
  for(const key of [field.claim,...(field.aliases||[])]){
   if(!validClaim(key)||!Object.hasOwn(values,key))continue;
   const value=values[key];
   if(field.type==='address'&&value&&typeof value==='object'&&!Array.isArray(value)){
    result[key]=Object.fromEntries(addressKeys.filter(k=>typeof value[k]==='string'&&value[k].length<=4096).map(k=>[k,value[k]]));
   }else if(typeof value==='string'&&value.length<=(field.type==='picture'?3500000:field.type==='address'?8192:4096))result[key]=value;
   else if(field.type!=='picture'&&field.type!=='address'&& !key.endsWith('_verified') &&(typeof value==='number'||typeof value==='boolean'))result[key]=value;
   else if(field.type!=='picture'&&field.type!=='address'&&Array.isArray(value)&&value.length<=50&&value.every(v=>typeof v==='string'&&v.length<=4096))result[key]=value;
  }
 }
 return result;
}
