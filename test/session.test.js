import test from 'node:test';
import assert from 'node:assert/strict';
import {createCookieSession} from '../server/session.js';
test('encrypted cookies round trip and reject tampering',async()=>{
 const session=createCookieSession('a'.repeat(48),true);let token;
 await session.write({cookie(name,value,opts){assert.equal(opts.httpOnly,true);assert.equal(opts.secure,true);assert.equal(opts.sameSite,'lax');token=name+'='+value;}},'transaction',{state:'secret-state'},Date.now()+60000);
 assert.ok(!token.includes('secret-state'));
 assert.deepEqual(await session.read({headers:{cookie:token}},'transaction'),{state:'secret-state'});
 assert.equal(await session.read({headers:{cookie:token.slice(0,-10)+'AAAAAAAAAA'}},'transaction'),null);
 assert.equal(await session.read({headers:{cookie:token}},'profile'),null);
});
test('rejects weak secret',()=>assert.throws(()=>createCookieSession('short',true)));
