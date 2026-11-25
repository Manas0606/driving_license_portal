import test from 'node:test';
import assert from 'node:assert/strict';
import {selectProfile} from '../server/oidc.js';
import {formatAddress,pictureSource,profileFields} from '../src/profile.js';
test('consented photo and demographics returned without token or unrelated claims',()=>{
 const info={name:'Test Resident',gender:'Female',picture:'data:image/png;base64,iVBORw0KGgo=',email:'test@example.invalid',address:{city:'Test City',country:'Test Country',extra:'ignored'},access_token:'secret'};
 assert.deepEqual(selectProfile(info),{name:info.name,gender:info.gender,picture:info.picture,email:info.email,address:{city:'Test City',country:'Test Country'}});
 assert.equal(formatAddress(info.address),'Test City, Test Country');
 assert.equal(pictureSource(info.picture),info.picture);
 assert.equal(pictureSource('javascript:alert(1)'),'');
 assert.equal(profileFields({email_verified:true,email:info.email})[3][1],info.email);
});
