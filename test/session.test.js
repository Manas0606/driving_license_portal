import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBrowserTransaction} from '../mock-relying-party-service/esignetService.js';
import {startTransaction,consumeTransaction,clearSession,storeProfile,getProfile,addApplication,getApplications} from '../mock-relying-party-ui/src/session.js';
const storage=new Map();
Object.defineProperty(globalThis,'sessionStorage',{value:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},configurable:true});
test('browser transaction is random, consumed and validated',()=>{
 const tx=startTransaction();assert.deepEqual(validateBrowserTransaction(tx),tx);
 assert.throws(()=>validateBrowserTransaction({...tx,verifier:'short'}));
 assert.throws(()=>validateBrowserTransaction({...tx,expiresAt:0}));
 assert.deepEqual(consumeTransaction(tx.state),tx);assert.throws(()=>consumeTransaction(tx.state));
 const other=startTransaction();assert.notEqual(other.state,tx.state);assert.throws(()=>consumeTransaction('wrong'));
});
test('demo data is cleared on sign out',()=>{
 storeProfile({name:'Test Resident'});assert.equal(getProfile().name,'Test Resident');
 addApplication({service:'NEW',category:'Passenger car',appointment:'2026-12-01'});
 assert.equal(getApplications().length,1);clearSession();assert.equal(getProfile(),null);assert.equal(getApplications().length,0);
});
