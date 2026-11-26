import { init } from '@mosip/sign-in-with-esignet';
import { icon } from './icons.js';
import {startTransaction,consumeTransaction,clearSession,storeProfile,getProfile,getApplications,addApplication} from './session.js';
import {validateApplication} from '../../mock-relying-party-service/domain.js';
import {clientId,authorizeUri,scope,acr,usePar,redirectUri,pkceChallenge,requestedClaims,profileConfiguration,display,prompt,claimsLocales} from './identity-config.js';
import {pictureSource,profileFields} from './profile.js';
import {locale,t,setLocale,loadLocales,localize,languageSelect} from './locale.js';
import './styles.css';

const root=document.querySelector('#app');
const serviceList=[
 {id:'NEW',title:'New licence',desc:'Start your journey with a first driving licence application.',icon:'card',color:'cyan'},
 {id:'RENEWAL',title:'Renew licence',desc:'Keep your driving privileges up to date.',icon:'refresh',color:'violet'},
 {id:'REPLACEMENT',title:'Replace licence',desc:'Request a replacement for a lost or damaged licence.',icon:'copy',color:'rose'},
 {id:'LEARNER',title:'Learner permit',desc:'Take the first step towards the open road.',icon:'book',color:'amber'}
];
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=async(path,method='GET',body)=>{const res=await fetch(path==='/fetchUserInfo'?path:'/api'+path,{method,referrerPolicy:'strict-origin',signal:AbortSignal.timeout(45000),credentials:'same-origin',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(res.status===204)return;const result=await res.json().catch(()=>null);if(!res.ok||!result)throw new Error(result?.error||'Portal API returned HTTP '+res.status+'.');return result;};
const logo=()=>'<a class="brand" href="/" aria-label="DriveNext home"><span class="brand-icon">'+'<img src="/logo.png" alt="" width="46" height="46">'+'</span><span>drive<span class="gradient-text">next.</span><small>DIGITAL MOBILITY</small></span></a>';
const footer=()=>'<footer><span>DriveNext · A digital identity demonstration</span><span>'+icon('shield')+' Secure digital access</span><span>Not an official licensing authority</span></footer>';
const layout=(content,logged=false)=>'<header>'+logo()+'<nav aria-label="Main navigation"><a href="#services">Services</a><a href="#how">How it works</a>'+languageSelect()+(logged?'<button class="text-button" id="logout">Sign out</button>':'')+'</nav></header><main>'+content+'</main>'+footer();
const cards=()=>serviceList.map(s=>'<button class="service-card '+s.color+'" data-service="'+s.id+'"><span class="service-icon">'+icon(s.icon)+'</span><span class="service-title">'+s.title+'</span><span class="service-desc">'+s.desc+'</span><span class="service-link">Get started '+icon('arrow')+'</span></button>').join('');
function notify(message){const el=document.querySelector('#notice');if(el){el.textContent=message;el.hidden=false;}}
function bindLanguage(render){localize(root);const selector=document.querySelector('#language');if(selector)selector.onchange=async()=>{try{await setLocale(selector.value);render();}catch(error){selector.value=locale;alert(error.message);}};}
function landing(){
 root.innerHTML=layout(`<section class="hero"><div class="ambient a1"></div><div class="ambient a2"></div><div class="hero-copy"><div class="eyebrow"><span></span> THE FUTURE OF DIGITAL MOBILITY</div><h1>Every journey<br>begins with <span class="gradient-text">you.</span></h1><p>Apply, renew and manage your driving licence through one beautifully simple, identity-powered experience.</p><div class="hero-actions"><a class="primary" href="#signin">Get on the road ${icon('arrow')}</a><a class="secondary" href="#services">Explore services</a></div><div class="trustline">${icon('shield')} Verified identity <b>·</b> ${icon('lock')} Secure consent</div></div><div class="hero-art"><img src="/mobility.svg" alt="Illustration of a futuristic vehicle travelling on an illuminated road"><span class="art-label"><i></i> DIGITAL FIRST · IDENTITY ENABLED</span><div class="floating-card"><span>${icon('card')}</span><div><b>One digital identity</b><small>One seamless journey</small></div>${icon('check','verified')}</div></div></section>
 <section class="signin-panel" id="signin"><div><div class="eyebrow">SECURE ACCESS</div><h2>Your identity is your key.</h2><p>Use your national digital identity to access licensing services. Your credentials stay with your identity provider.</p></div><div class="signin-action"><div id="sign-in-with-esignet" aria-label="Secure sign-in"></div><p id="notice" role="status" hidden></p><small>${icon('lock')} Consent-based authentication · No portal password</small></div></section>
 <section id="services" class="section"><div class="section-head"><div><div class="eyebrow">SERVICES</div><h2>Where are you headed?</h2></div><p>Everything you need for your next step.</p></div><div class="services-grid">${cards()}</div></section>
 <section id="how" class="section how"><div class="eyebrow">SIMPLE BY DESIGN</div><h2>Three steps. A new direction.</h2><div class="steps"><div><span>01 / ${icon('shield')}</span><h3>Verify your identity</h3><p>Sign in and provide your consent.</p></div><div><span>02 / ${icon('card')}</span><h3>Choose a service</h3><p>Submit the relevant application and preferred date.</p></div><div><span>03 / ${icon('clock')}</span><h3>Track your request</h3><p>View temporary demonstration requests during your sign-in session.</p></div></div></section>`);
 document.querySelectorAll('[data-service]').forEach(el=>el.addEventListener('click',()=>document.querySelector('#signin').scrollIntoView({behavior:'smooth'})));
 bindLanguage(landing);
 const mount=document.querySelector('#sign-in-with-esignet');
 mount.textContent=t('Preparing secure sign-in…');
 setupButton(mount).catch(e=>{mount.textContent='';notify(e.message);const retry=document.createElement('button');retry.className='primary';retry.textContent=t('Retry secure sign-in');retry.onclick=()=>landing();mount.append(retry);});
}
async function setupButton(mount){
 const transaction=startTransaction();
 const challenge=await pkceChallenge(transaction.verifier);
 // The official plugin renders immediately from public config, just as Health Services does.
 mount.textContent='';
 init({oidcConfig:{authorizeUri,redirect_uri:redirectUri,client_id:clientId,scope,
  state:transaction.state,nonce:transaction.nonce,acr_values:acr,display,prompt,ui_locales:locale,claims_locales:claimsLocales,
  claims:requestedClaims,
  code_challenge:async()=>({code_challenge:challenge,code_challenge_method:'S256'}),
  ...(usePar?{par_callback:async()=> (await api('/auth/par','POST',{transaction})).request_uri,par_callback_timeout:12000}:{})},
  buttonConfig:{shape:'soft_edges',labelText:t('Sign in with eSignet'),logoPath:'/esignet-logo.png',width:'100%'},signInElement:mount});
}
function identityCard(profile){
 const photoField=profileConfiguration.find(field=>field.type==='picture');
 const picture=pictureSource(photoField?profile[photoField.claim]:null);
 return `<section class="identity-card" aria-label="Consented identity details"><div class="identity-photo">${picture?`<img src="${escape(picture)}" alt="Your profile photo">`:`<div class="photo-placeholder">${icon('card')}<small>No photo shared</small></div>`}<span class="identity-pill">${icon('shield')} Identity profile</span></div><div class="identity-content"><div class="eyebrow">YOUR PERSONAL INFORMATION</div><h2>Driver profile</h2><p>Details shared with your consent.</p><dl class="profile-fields">${profileFields(profile,profileConfiguration).map(([label,value])=>`<div><dt>${escape(label)}</dt><dd data-untranslated>${escape(value||t('Not shared'))}</dd></div>`).join('')}</dl></div></section>`;
}
function dashboard(profile){
 root.innerHTML=layout(`<section class="dashboard-top"><div class="eyebrow"><span></span> YOUR DRIVER WORKSPACE</div><h1>Hello, <span class="gradient-text" data-untranslated>${escape(profile.given_name||profile.name||'Resident')}.</span></h1><p>Manage your journey, one step at a time.</p><span class="identity-pill">${icon('shield')} Digital identity profile</span></section>${identityCard(profile)}<section id="services" class="section"><div class="section-head"><div><div class="eyebrow">AVAILABLE SERVICES</div><h2>Start an application</h2></div></div><div class="services-grid">${cards()}</div></section><section id="how" class="section"><div class="section-head"><div><div class="eyebrow">YOUR ACTIVITY</div><h2>Application tracker</h2></div><button class="secondary" id="reload">${icon('refresh')} Refresh</button></div><p id="notice" role="status" hidden></p><div id="applications" class="tracker">Loading applications…</div></section><dialog id="application-dialog"><form id="application-form"><div class="dialog-head"><div><div class="eyebrow">NEW REQUEST</div><h2 id="form-title"></h2></div><button type="button" id="close-dialog" class="text-button" aria-label="Close form">✕</button></div><p>Demo only. Requests disappear on logout or session expiry; no real licence or appointment is issued.</p><label>Vehicle category<select name="category" required><option value="">Select category</option><option>Motorcycle</option><option>Passenger car</option><option>Commercial vehicle</option></select></label><label id="reference-label" hidden>Existing licence reference<input name="licenceReference" maxlength="32" pattern="[A-Za-z0-9-]{4,32}"></label><label>Preferred appointment date<input type="date" name="appointment" required></label><label class="check-label"><input name="declaration" type="checkbox" required> I understand this is a temporary demonstration request.</label><p role="alert" id="form-error"></p><button class="primary" type="submit">Submit request ${icon('arrow')}</button></form></dialog>`,true);
 bindLanguage(()=>dashboard(profile));
 document.querySelector('#logout').onclick=()=>{clearSession();location.assign('/');};
 document.querySelector('#reload').onclick=loadApplications;
 const dialog=document.querySelector('#application-dialog'),form=document.querySelector('#application-form');
 let selected;
 document.querySelectorAll('[data-service]').forEach(el=>el.onclick=()=>{selected=el.dataset.service;form.reset();document.querySelector('#form-title').textContent=t(serviceList.find(s=>s.id===selected).title);const required=['RENEWAL','REPLACEMENT'].includes(selected);document.querySelector('#reference-label').hidden=!required;form.licenceReference.required=required;const today=new Date();form.appointment.min=today.toISOString().slice(0,10);today.setUTCDate(today.getUTCDate()+90);form.appointment.max=today.toISOString().slice(0,10);document.querySelector('#form-error').textContent='';dialog.showModal();});
 document.querySelector('#close-dialog').onclick=()=>dialog.close();
 form.onsubmit=async event=>{event.preventDefault();const data=new FormData(form),button=form.querySelector('[type=submit]');button.disabled=true;try{addApplication(validateApplication({service:selected,category:data.get('category'),appointment:data.get('appointment'),licenceReference:data.get('licenceReference'),declaration:data.get('declaration')==='on'}));dialog.close();await loadApplications();}catch(e){document.querySelector('#form-error').textContent=e.message;}finally{button.disabled=false;}};
 loadApplications();
}
async function loadApplications(){const el=document.querySelector('#applications');try{const data=getApplications();el.innerHTML=data.length?data.map(a=>'<article class="application-row"><span class="service-icon">'+icon('card')+'</span><div><strong>'+escape(t(serviceList.find(s=>s.id===a.service)?.title||a.service))+'</strong><small>'+escape(a.category)+' · Ref '+escape(a.id)+'</small></div><div><small>Preferred date</small><strong>'+escape(a.appointment)+'</strong></div><span class="status">'+escape(a.status)+'</span></article>').join(''):'<div class="empty">'+icon('card')+'<h3>No applications yet</h3><p>Choose a service above to begin. Demo requests are cleared when your session ends.</p></div>';localize(el);}catch(e){el.textContent=e.message;}}
async function boot(){
 const query=new URLSearchParams(location.search);
 if(query.has('code')||query.has('error')){
  history.replaceState(null,'','/userprofile');
  root.innerHTML=layout(`<section class="auth-progress"><h2>${t('Completing secure sign-in…')}</h2><p role="status">Please keep this page open.</p></section>`);
  try{
   if(query.has('error')||!query.get('code'))throw new Error('Identity provider: '+(query.get('error')||'authorization code missing'));
   const transaction=consumeTransaction(query.get('state'));
   const profile=await api('/fetchUserInfo','POST',{transaction,code:query.get('code')});
   storeProfile(profile);dashboard(profile);return;
  }catch(error){clearSession();history.replaceState(null,'','/');root.innerHTML=layout(`<section class="auth-progress"><h2>${t('Sign-in could not be completed')}</h2><p role="alert">${escape(error.message)}</p><button class="primary" id="retry-auth">${t('Return to sign-in')}</button></section>`);document.querySelector('#retry-auth').onclick=()=>location.assign('/');bindLanguage(()=>location.assign('/'));return;}
 }
 const profile=getProfile();if(profile){dashboard(profile);return;}
 if(location.pathname==='/userprofile'||location.pathname==='/api/auth/callback')history.replaceState(null,'','/');
 landing();
}
async function start(){
 await loadLocales();
 if(!clientId||!authorizeUri||!redirectUri||!requestedClaims||new URL(redirectUri).origin!==location.origin)throw new Error('Check the runtime client configuration and registered portal origin.');
 await boot();
}
start().catch(error=>{root.textContent='Portal configuration error: '+error.message;});
