import React,{useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {init} from '@mosip/sign-in-with-esignet';
import clientDetails,{pkceChallenge,requestedClaims} from '../constants/clientDetails.js';
import {startTransaction} from '../session.js';
import relyingPartyService from '../services/relyingPartyService.js';
export default function Login(){
 const {t,i18n}=useTranslation();
 const mount=useRef(null);
 const [error,setError]=useState('');
 const [attempt,retry]=useState(0);
 useEffect(()=>{
  let active=true;const element=mount.current;
  element.textContent=t('Preparing secure sign-in…');
  setError('');
  async function renderSignInButton(){
   const transaction=startTransaction();
   const challenge=await pkceChallenge(transaction.verifier);
   if(!active)return;
   const oidcConfig={
    authorizeUri:clientDetails.authorizeUri,redirect_uri:clientDetails.redirect_uri_userprofile,client_id:clientDetails.clientId,
    scope:clientDetails.scopeUserProfile,nonce:transaction.nonce,state:transaction.state,acr_values:clientDetails.acr_values,
    claims_locales:clientDetails.claims_locales,display:clientDetails.display,prompt:clientDetails.prompt,
    ...(Number.isFinite(clientDetails.max_age)?{max_age:clientDetails.max_age}:{}),
    ui_locales:i18n.language,claims:requestedClaims(),
    code_challenge:async()=>({code_challenge:challenge,code_challenge_method:'S256'}),
    ...(clientDetails.usePar?{par_callback:async()=>(await relyingPartyService.post_pushedAuthorizationRequest(transaction,i18n.language)).request_uri,par_callback_timeout:12000}:{})
   };
   element.textContent='';
   init({oidcConfig,buttonConfig:{shape:'soft_edges',labelText:t('Sign in with eSignet'),logoPath:'/esignet-logo.png',width:'100%'},signInElement:element});
  }
  renderSignInButton().catch(e=>{if(active){element.textContent='';setError(e.message);}});
  return()=>{active=false;element.textContent='';};
 },[i18n.language,attempt]);
 return <><div id="sign-in-with-esignet" ref={mount} aria-label={t('Secure sign-in')}/>{error&&<><p id="notice" role="alert">{error}</p><button className="primary" onClick={()=>retry(n=>n+1)}>{t('Retry secure sign-in')}</button></>}</>;
}
