// Public relying-party configuration, following Health Services clientDetails.js.
// The client identifier and redirect URI are public OIDC metadata, not credentials.
export const portalOrigin=import.meta.env.VITE_APP_ORIGIN || 'https://driving-license-portal-wine.vercel.app';
export const clientId=import.meta.env.VITE_ESIGNET_CLIENT_ID || '1IQWpkTghWJkAMXnwX3AYiUmFYA20wdw-CnRICPW1uI';
export const authorizeUri=import.meta.env.VITE_ESIGNET_AUTHORIZE_URI || 'https://esignet.mosip-demo.mosip.net/authorize';
export const scope=import.meta.env.VITE_ESIGNET_SCOPE || 'openid profile';
export const acr=import.meta.env.VITE_ESIGNET_ACR || 'mosip:idp:acr:linked-wallet mosip:idp:acr:biometrics mosip:idp:acr:generated-code';
export const usePar=import.meta.env.VITE_ESIGNET_USE_PAR==='true';
export const redirectUri=new URL('/api/auth/callback',portalOrigin).href;
export async function pkceChallenge(verifier){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
 return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
