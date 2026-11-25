import {generateKeyPair,exportJWK} from 'jose';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
await mkdir('secrets',{recursive:true,mode:0o700});
const {privateKey,publicKey}=await generateKeyPair('RS256',{modulusLength:2048,extractable:true});
const kid=randomUUID();
for(const [name,key] of [['client.jwk',privateKey],['client-public.jwk',publicKey]]){
 const jwk={...await exportJWK(key),kid,alg:'RS256',use:'sig'};
 await writeFile('secrets/'+name,JSON.stringify(jwk,null,2),{mode:0o600,flag:'wx'});
}
console.log('Key pair generated. Share only secrets/client-public.jwk with the eSignet operator.');
