import { createHash } from 'node:crypto';
import { EncryptJWT, jwtDecrypt } from 'jose';

export function createCookieSession(secret, secure) {
  if(typeof secret!=='string'||secret.length<32) throw new Error('SESSION_SECRET must be at least 32 characters');
  const key=createHash('sha256').update(secret).digest();
  const cookieOptions={httpOnly:true,secure,sameSite:'lax',path:'/'};
  const names={transaction:secure?'__Host-drivenext-tx':'drivenext-tx',profile:secure?'__Host-drivenext-session':'drivenext-session'};
  async function read(req,kind) {
    const prefix=names[kind]+'=';
    const raw=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(prefix))?.slice(prefix.length);
    if(!raw||raw.length>3900)return null;
    try {
      const {payload}=await jwtDecrypt(raw,key,{issuer:'drivenext',audience:kind,keyManagementAlgorithms:['dir'],contentEncryptionAlgorithms:['A256GCM'],requiredClaims:['exp']});
      return payload.data;
    } catch { return null; }
  }
  async function write(res,kind,data,expiresAt) {
    const seconds=Math.floor((expiresAt-Date.now())/1000);
    if(seconds<=0)throw new Error('Session expired');
    const token=await new EncryptJWT({data}).setProtectedHeader({alg:'dir',enc:'A256GCM'}).setIssuer('drivenext').setAudience(kind).setIssuedAt().setExpirationTime(Math.floor(expiresAt/1000)).encrypt(key);
    if(token.length>3600)throw new Error('Demo session storage limit reached');
    res.cookie(names[kind],token,{...cookieOptions,maxAge:seconds*1000});
  }
  function clear(res,kind){res.clearCookie(names[kind],cookieOptions);}
  return {read,write,clear};
}
