import test from 'node:test';
import assert from 'node:assert/strict';
import {providerEndpoints,probeProvider} from '../mock-relying-party-service/esignetService.js';
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
