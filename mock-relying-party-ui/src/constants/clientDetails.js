// Health Services clientDetails.js runtime convention. No private credentials here.
const env=window._env_||{};
export const clientDetails={
 clientId:env.CLIENT_ID,
 uibaseUrl:env.ESIGNET_UI_BASE_URL,
 authorizeEndpoint:'/authorize',
 authorizeUri:env.AUTHORIZE_URI||env.ESIGNET_UI_BASE_URL+'/authorize',
 scopeUserProfile:env.SCOPE_USER_PROFILE||'openid profile',
 redirect_uri_userprofile:env.REDIRECT_URI_USER_PROFILE||env.REDIRECT_URI,
 response_type:'code',
 grant_type:env.GRANT_TYPE||'authorization_code',
 display:env.DISPLAY||'page',
 prompt:env.PROMPT||'consent',
 acr_values:env.ACRS,
 claims_locales:'en',
 max_age:env.MAX_AGE===undefined?undefined:Number(env.MAX_AGE),
 userProfileClaims:env.CLAIMS_USER_PROFILE,
 usePar:env.USE_PAR===true,
 profileFields:env.PROFILE_FIELDS||[]
};
export function requestedClaims(){return typeof clientDetails.userProfileClaims==='string'?JSON.parse(decodeURIComponent(clientDetails.userProfileClaims)):clientDetails.userProfileClaims;}
export async function pkceChallenge(verifier){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
 return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export default clientDetails;
