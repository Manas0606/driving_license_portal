// Runtime configuration served by /env-config.js (same window._env_ convention as Health Services).
const env=window._env_||{};
export const clientId=env.CLIENT_ID;
export const authorizeUri=env.AUTHORIZE_URI;
export const scope=env.SCOPE_USER_PROFILE||'openid profile';
export const acr=env.ACRS;
export const usePar=env.USE_PAR===true;
export const redirectUri=env.REDIRECT_URI_USER_PROFILE;
export const requestedClaims=env.CLAIMS_USER_PROFILE;
export const profileConfiguration=env.PROFILE_FIELDS||[];
// Match Health Services clientDetails.js: UI locale is independent of claim locale.
export const claimsLocales='en';
export const display=env.DISPLAY||'page';
export const prompt=env.PROMPT||'consent';
export async function pkceChallenge(verifier){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
 return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
