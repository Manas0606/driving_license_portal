import test from 'node:test';
import assert from 'node:assert/strict';
import {providerEndpoints,probeProvider,decodeUserInfoResponse} from '../mock-relying-party-service/esignetService.js';
test('direct provider URLs match Health Services demo configuration',()=>{
 const m=providerEndpoints();
 assert.equal(m.token_endpoint,'https://esignet.mosip-demo.mosip.net/v1/esignet/oauth/v2/token');
 assert.equal(m.userinfo_endpoint,'https://esignet.mosip-demo.mosip.net/v1/esignet/oidc/userinfo');
 assert.equal(m.jwks_uri,'https://esignet.mosip-demo.mosip.net/.well-known/jwks.json');
});
test('connectivity probe uses no authorization and reports underlying network error',async()=>{
 const original=globalThis.fetch;
 try{
 globalThis.fetch=async(url,opts)=>{assert.equal(opts.headers,undefined);if(url.endsWith('/userinfo'))throw new TypeError('fetch failed',{cause:{code:'ENOTFOUND'}});return {status:opts.method==='HEAD'?405:200};};
 const result=await probeProvider();
 assert.deepEqual(result.token,{reachable:true,httpStatus:405});
 assert.deepEqual(result.userinfo,{reachable:false,error:'ENOTFOUND'});
 assert.deepEqual(result.jwks,{reachable:true,httpStatus:200});
 }finally{globalThis.fetch=original;}
});

test('JSON UserInfo with punctuation is not mistaken for encrypted JWE',async()=>{
 const info={sub:'test',name:'A. B. C. D. E.'};
 assert.deepEqual(await decodeUserInfoResponse(JSON.stringify(info)),info);
});
test('JWT UserInfo preserves original claim values',async()=>{
 const header=Buffer.from(JSON.stringify({alg:'RS256'})).toString('base64url');
 const info={sub:'test',name:'Test Resident',address:{city:'Test City'}};
 const payload=Buffer.from(JSON.stringify(info)).toString('base64url');
 assert.deepEqual(await decodeUserInfoResponse(header+'.'+payload+'.c2ln'),info);
});
