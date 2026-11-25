import test from 'node:test';
import assert from 'node:assert/strict';
import {selectProfile} from '../mock-relying-party-service/esignetService.js';
import {readProfileConfig,buildClaims,publicClientConfig} from '../mock-relying-party-service/config.js';
import {formatAddress,pictureSource,profileFields} from '../mock-relying-party-ui/src/profile.js';
test('existing photo and demographics returned without unrelated claims',()=>{
 const info={name:'Test Resident',gender:'Female',picture:'data:image/png;base64,iVBORw0KGgo=',email:'test@example.invalid',address:{city:'Test City',country:'Test Country',extra:'ignored'},access_token:'secret'};
 assert.deepEqual(selectProfile(info),{name:info.name,gender:info.gender,picture:info.picture,email:info.email,address:{city:'Test City',country:'Test Country'}});
 assert.equal(formatAddress(info.address),'Test City, Test Country');assert.equal(pictureSource(info.picture),info.picture);assert.equal(pictureSource('javascript:alert(1)'),'');assert.equal(profileFields({email_verified:true,email:info.email},readProfileConfig().fields)[3][1],info.email);
});
test('new approved fields follow profile configuration end to end',()=>{
 const profile={fields:[...readProfileConfig().fields,{claim:'nationality',label:'Nationality',essential:false}]};
 assert.deepEqual(buildClaims(profile).userinfo.nationality,{essential:false});
 const result=selectProfile({nationality:'Original',verified_claims:[{claims:{nationality:'Updated'}}],access_token:'secret'},profile);
 assert.deepEqual(result,{nationality:'Updated'});assert.deepEqual(profileFields(result,profile.fields).at(-1),['Nationality','Updated']);
 const publicConfig=publicClientConfig(profile);assert.equal(publicConfig.PROFILE_FIELDS.at(-1).claim,'nationality');assert.equal(Object.hasOwn(publicConfig,'keyJson'),false);
});
