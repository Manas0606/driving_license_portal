import { randomBytes, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { SignJWT, importJWK, createRemoteJWKSet, jwtVerify, compactDecrypt } from 'jose';

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
  tokenIssuer: process.env.ESIGNET_TOKEN_ISSUER,
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
  if (!response.ok) throw new Error('Identity provider request failed');
  return response;
}
async function metadata() {
  if (cached && cached.until > Date.now()) return cached.data;
  const data = await (await request(config.discovery)).json();
  if (data.issuer !== config.issuer) throw new Error('Discovery issuer mismatch');
  for (const key of ['authorization_endpoint','token_endpoint','userinfo_endpoint','jwks_uri']) trustedUrl(data[key]);
  if (config.par) trustedUrl(data.pushed_authorization_request_endpoint);
  if (!jwks || cached?.data.jwks_uri !== data.jwks_uri) jwks = createRemoteJWKSet(new URL(data.jwks_uri), { timeoutDuration: 10000 });
  cached = { data, until: Date.now() + 5 * 60_000 };
  return data;
}
async function assertion(audience) {
  const jwk = JSON.parse(config.keyJson || await readFile(config.keyFile, 'utf8'));
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
  const result=await authenticatedForm(m.pushed_authorization_request_endpoint,form);
  if(typeof result.request_uri !== 'string') throw new Error('Invalid PAR response');
  return result.request_uri;
}
export async function complete(transaction, code) {
  const m = await metadata();
  const tokens = await authenticatedForm(m.token_endpoint,new URLSearchParams({grant_type:'authorization_code',code,
    redirect_uri:config.redirect,client_id:config.clientId,code_verifier:transaction.verifier}));
  if(typeof tokens.id_token!=='string'||typeof tokens.access_token!=='string') throw new Error('Incomplete token response');
  const issuer=config.tokenIssuer || m.issuer;
  const verification={issuer,audience:config.clientId,algorithms:['RS256','PS256'],clockTolerance:30};
  const {payload:id}=await jwtVerify(tokens.id_token,jwks,{...verification,requiredClaims:['exp','iat','sub','nonce']});
  if(!equal(id.nonce,transaction.nonce)||(Array.isArray(id.aud)&&id.aud.length>1&&id.azp!==config.clientId)||(id.azp&&id.azp!==config.clientId)) throw new Error('Invalid ID token');
  const response=await request(m.userinfo_endpoint,{headers:{Authorization:'Bearer '+tokens.access_token,Accept:'application/json, application/jwt'}});
  let body=(await response.text()).trim();
  if(body.split('.').length===5&&!body.startsWith('{')){
    if(!config.encryptionFile&&!config.encryptionJson) throw new Error('UserInfo encryption key required');
    const key=await importJWK(JSON.parse(config.encryptionJson || await readFile(config.encryptionFile,'utf8')),'RSA-OAEP-256');
    const decrypted=await compactDecrypt(body,key,{keyManagementAlgorithms:['RSA-OAEP-256'],contentEncryptionAlgorithms:['A256GCM','A128GCM','A256CBC-HS512']});
    body=new TextDecoder().decode(decrypted.plaintext);
    if(body.startsWith('{')) throw new Error('Encrypted UserInfo must contain a signed JWT');
  }
  const info=body.startsWith('{')?JSON.parse(body):(await jwtVerify(body,jwks,verification)).payload;
  validateSubject(id,info);
  // Return only a minimal profile to the reference UI; no tokens are exposed.
  return {
    name:typeof info.name==='string'?info.name:typeof info.given_name==='string'?info.given_name:'Resident',
    birthdate:typeof info.birthdate==='string'?info.birthdate:null};
}
