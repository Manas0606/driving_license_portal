import {readFileSync} from 'node:fs';
export const config = {
  service: process.env.ESIGNET_SERVICE_URL || 'https://esignet.mosip-demo.mosip.net/v1/esignet',
  authorize: process.env.ESIGNET_AUTHORIZE_URI || 'https://esignet.mosip-demo.mosip.net/authorize',
  tokenEndpoint: process.env.ESIGNET_TOKEN_ENDPOINT,
  userinfoEndpoint: process.env.ESIGNET_USERINFO_ENDPOINT,
  jwksEndpoint: process.env.ESIGNET_JWKS_URL || 'https://esignet.mosip-demo.mosip.net/.well-known/jwks.json',
  parEndpoint: process.env.ESIGNET_PAR_ENDPOINT,
  tokenAudience: process.env.ESIGNET_AUD_URL,
  parAudience: process.env.ESIGNET_PAR_AUD_URL,
  issuer: process.env.ESIGNET_EXPECTED_ISSUER || 'https://esignet.mosip-demo.mosip.net',
  tokenIssuer: process.env.ESIGNET_TOKEN_ISSUER || 'https://esignet.mosip-demo.mosip.net/v1/esignet',
  clientId: process.env.ESIGNET_CLIENT_ID || '1IQWpkTghWJkAMXnwX3AYiUmFYA20wdw-CnRICPW1uI',
  keyFile: process.env.ESIGNET_PRIVATE_JWK_FILE,
  keyJson: process.env.ESIGNET_PRIVATE_JWK || process.env.CLIENT_PRIVATE_KEY,
  encryptionFile: process.env.ESIGNET_USERINFO_JWK_FILE,
  encryptionJson: process.env.ESIGNET_USERINFO_JWK,
  redirect: new URL('/api/auth/callback', process.env.APP_ORIGIN || 'http://localhost:8080').href,
  scope: process.env.ESIGNET_SCOPE || 'openid profile',
  acr: process.env.ESIGNET_ACR || 'mosip:idp:acr:linked-wallet mosip:idp:acr:biometrics mosip:idp:acr:generated-code',
  par: process.env.ESIGNET_USE_PAR === 'true'
};
export const origin = new URL(process.env.APP_ORIGIN || 'http://localhost:8080').origin;
const profilePath=new URL('../mock-relying-party-ui/public/profile-config.json',import.meta.url);
const blocked=new Set(['__proto__','constructor','prototype','access_token','id_token','refresh_token','client_assertion','code','state','nonce','sub','iss','aud','exp','iat','nbf','jti','sid','at_hash','c_hash','verified_claims']);
export function validClaim(key){return typeof key==='string'&&/^[A-Za-z][A-Za-z0-9_.:#-]{0,100}$/.test(key)&&!blocked.has(key);}
export function readProfileConfig(){
 const value=JSON.parse(readFileSync(profilePath,'utf8'));
 if(!Array.isArray(value.fields)||value.fields.length>80)throw new Error('Invalid profile-config.json fields');
 const seen=new Set();
 for(const f of value.fields){
  if(!validClaim(f.claim)||typeof f.label!=='string'||!f.label.trim()||f.label.length>160||seen.has(f.claim)|| (f.aliases!==undefined&&(!Array.isArray(f.aliases)||!f.aliases.every(validClaim))) || (f.type!==undefined&&!['text','picture','address'].includes(f.type)))throw new Error('Invalid profile field configuration');
  seen.add(f.claim);
 }
 return value;
}
export function buildClaims(profile=readProfileConfig()){
 return {userinfo:Object.fromEntries(profile.fields.filter(f=>f.request!==false).map(f=>[f.claim,{essential:f.essential===true}])),id_token:{}};
}
// Only public client metadata. Signing and decryption keys remain server-side.
export function publicClientConfig(profile=readProfileConfig()){
 return {CLIENT_ID:config.clientId,ESIGNET_UI_BASE_URL:new URL(config.authorize).origin,AUTHORIZE_URI:config.authorize,REDIRECT_URI_USER_PROFILE:config.redirect,SCOPE_USER_PROFILE:config.scope,ACRS:config.acr,DISPLAY:'page',PROMPT:'consent',GRANT_TYPE:'authorization_code',USE_PAR:config.par,CLAIMS_USER_PROFILE:buildClaims(profile),PROFILE_FIELDS:profile.fields};
}
