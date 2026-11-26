import React,{useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {icon} from './icons.js';
import Login from './components/Login.jsx';
import clientDetails,{requestedClaims} from './constants/clientDetails.js';
import relyingPartyService from './services/relyingPartyService.js';
import {languages} from './i18n.js';
import {consumeTransaction,clearSession,storeProfile,getProfile,getApplications,addApplication} from './session.js';
import {pictureSource,profileFields} from './profile.js';
import {validateApplication} from '../../mock-relying-party-service/domain.js';
import './styles.css';
import './coral.css';
import CinematicHero,{LicenceMotion,IgnitionGauge} from './components/CinematicHero.jsx';
const services=[
 {id:'NEW',title:'New licence',desc:'Start your journey with a first driving licence application.',icon:'card',color:'cyan'},
 {id:'RENEWAL',title:'Renew licence',desc:'Keep your driving privileges up to date.',icon:'refresh',color:'violet'},
 {id:'REPLACEMENT',title:'Replace licence',desc:'Request a replacement for a lost or damaged licence.',icon:'copy',color:'rose'},
 {id:'LEARNER',title:'Learner permit',desc:'Take the first step towards the open road.',icon:'book',color:'amber'}
];
function Icon({name,cls=''}){return <span className="inline-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:icon(name,cls)}}/>;}
function Layout({children,logged=false}){
 const {t,i18n}=useTranslation();
 return <><header><a className="brand" href="/" aria-label="DriveNext home"><span className="brand-icon"><img src="/logo.png" alt="" width="46" height="46"/></span><span>drive<span className="gradient-text">next.</span><small>DIGITAL MOBILITY</small></span></a><nav aria-label={t('Main navigation')}><a href="#services">{t('Services')}</a><a href="#how">{t('How it works')}</a><select className="language-select" aria-label={t('Language')} value={i18n.language} onChange={e=>i18n.changeLanguage(e.target.value)}>{Object.entries(languages).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select>{logged&&<button className="text-button" onClick={()=>{clearSession();location.assign('/');}}>{t('Sign out')}</button>}</nav></header><main>{children}</main><footer><span>{t('DriveNext · A digital identity demonstration')}</span><span><Icon name="shield"/>{t('Secure digital access')}</span><span>{t('Not an official licensing authority')}</span></footer></>;
}
function ServiceCards({onSelect}){
 const {t}=useTranslation();
 return <div className="services-grid">{services.map(s=><button key={s.id} className={'service-card '+s.color} onClick={()=>onSelect(s)}><span className="service-icon"><Icon name={s.icon}/></span><span className="service-title">{t(s.title)}</span><span className="service-desc">{t(s.desc)}</span><span className="service-link">{t('Get started')} <Icon name="arrow"/></span></button>)}</div>;
}
function Landing(){
 const {t}=useTranslation();
 return <Layout><section className="hero"><div className="ambient a1"/><div className="ambient a2"/><div className="hero-copy"><div className="eyebrow"><span/>{t('THE FUTURE OF DIGITAL MOBILITY')}</div><h1>{t('Chase the')}<br/><span className="gradient-text">{t('horizon.')}</span></h1><p>{t('Apply, renew and manage your driving licence through one beautifully simple, identity-powered experience.')}</p><div className="hero-actions"><a className="primary" href="#signin">{t('Get on the road')} <Icon name="arrow"/></a><a className="secondary" href="#services">{t('Explore services')}</a></div><div className="trustline"><Icon name="shield"/>{t('Verified identity')} <b>·</b><Icon name="lock"/>{t('Secure consent')}</div></div><div className="hero-art"><CinematicHero/></div></section>
 <section className="signin-panel" id="signin"><div><div className="eyebrow">{t('SECURE ACCESS')}</div><h2>{t('Your identity is your key.')}</h2><p>{t('Use your national digital identity to access licensing services. Your credentials stay with your identity provider.')}</p></div><LicenceMotion/><div className="signin-action"><Login/><small><Icon name="lock"/>{t('Consent-based authentication · No portal password')}</small></div></section>
 <section id="services" className="section"><div className="section-head"><div><div className="eyebrow">{t('Services').toUpperCase()}</div><h2>{t('Where are you headed?')}</h2></div><p>{t('Everything you need for your next step.')}</p></div><ServiceCards onSelect={()=>document.getElementById('signin').scrollIntoView({behavior:'smooth'})}/></section>
 <section id="how" className="section how"><div className="eyebrow">{t('SIMPLE BY DESIGN')}</div><h2>{t('Three steps. A new direction.')}</h2><div className="steps">{[['shield','Verify your identity','Sign in and provide your consent.'],['card','Choose a service','Submit the relevant application and preferred date.'],['clock','Track your request','View temporary demonstration requests during your sign-in session.']].map(([name,title,desc],idx)=><div key={name}><span>0{idx+1} / <Icon name={name}/></span><h3>{t(title)}</h3><p>{t(desc)}</p></div>)}</div></section></Layout>;
}
function UserProfile({profile}){
 const {t}=useTranslation();
 const photoField=clientDetails.profileFields.find(f=>f.type==='picture');
 const picture=pictureSource(photoField?profile[photoField.claim]:null);
 return <section className="identity-card" aria-label={t('Consented identity details')}><div className="identity-photo">{picture?<img src={picture} alt={t('Your profile photo')}/>:<div className="photo-placeholder"><Icon name="card"/><small>{t('No photo shared')}</small></div>}<span className="identity-pill"><Icon name="shield"/>{t('Identity profile')}</span></div><div className="identity-content"><div className="eyebrow">{t('YOUR PERSONAL INFORMATION')}</div><h2>{t('Driver profile')}</h2><p>{t('Details shared with your consent.')}</p><dl className="profile-fields">{profileFields(profile,clientDetails.profileFields).map(([label,value],index)=><div key={index}><dt>{t(label)}</dt><dd>{value||t('Not shared')}</dd></div>)}</dl></div></section>;
}
function Dashboard({profile}){
 const {t}=useTranslation();
 const [applications,setApplications]=useState(()=>getApplications());
 const [selected,setSelected]=useState(null);
 const [error,setError]=useState('');
 const dialog=useRef(null),form=useRef(null);
 const required=selected&&['RENEWAL','REPLACEMENT'].includes(selected.id);
 function open(service){setError('');setSelected(service);}
 useEffect(()=>{if(selected){form.current.reset();if(!dialog.current.open)dialog.current.showModal();}},[selected]);
 function close(){dialog.current.close();setSelected(null);}
 function submit(event){event.preventDefault();const data=new FormData(event.currentTarget);try{addApplication(validateApplication({service:selected.id,category:data.get('category'),appointment:data.get('appointment'),licenceReference:data.get('licenceReference'),declaration:data.get('declaration')==='on'}));setApplications(getApplications());close();}catch(e){setError(e.message);}}
 const now=new Date(),today=now.toISOString().slice(0,10);now.setUTCDate(now.getUTCDate()+90);const max=now.toISOString().slice(0,10);
 return <Layout logged><section className="dashboard-top"><div className="eyebrow"><span/>{t('YOUR DRIVER WORKSPACE')}</div><h1>{t('Hello,')} <span className="gradient-text">{profile.given_name||profile.name||t('Resident')}.</span></h1><p>{t('Manage your journey, one step at a time.')}</p><span className="identity-pill"><Icon name="shield"/>{t('Digital identity profile')}</span></section><UserProfile profile={profile}/><section id="services" className="section"><div className="section-head"><div><div className="eyebrow">{t('AVAILABLE SERVICES')}</div><h2>{t('Start an application')}</h2></div></div><ServiceCards onSelect={open}/></section><section id="how" className="section"><div className="section-head"><div><div className="eyebrow">{t('YOUR ACTIVITY')}</div><h2>{t('Application tracker')}</h2></div><button className="secondary" onClick={()=>setApplications(getApplications())}><Icon name="refresh"/>{t('Refresh')}</button></div><div className="tracker">{applications.length?applications.map(a=><article className="application-row" key={a.id}><span className="service-icon"><Icon name="card"/></span><div><strong>{t(services.find(s=>s.id===a.service)?.title||a.service)}</strong><small>{t(a.category)} · Ref {a.id}</small></div><div><small>{t('Preferred date')}</small><strong>{a.appointment}</strong></div><span className="status">{t(a.status)}</span></article>):<div className="empty"><Icon name="card"/><h3>{t('No applications yet')}</h3><p>{t('Choose a service above to begin. Demo requests are cleared when your session ends.')}</p></div>}</div></section>
 <dialog ref={dialog} onClose={()=>setSelected(null)}><form ref={form} onSubmit={submit}><div className="dialog-head"><div><div className="eyebrow">{t('NEW REQUEST')}</div><h2>{selected?t(selected.title):''}</h2></div><button type="button" className="text-button" aria-label={t('Close form')} onClick={close}>✕</button></div><p>{t('Demo only. Requests disappear on logout or session expiry; no real licence or appointment is issued.')}</p><label>{t('Vehicle category')}<select name="category" required defaultValue=""><option value="">{t('Select category')}</option>{['Motorcycle','Passenger car','Commercial vehicle'].map(c=><option key={c} value={c}>{t(c)}</option>)}</select></label><label hidden={!required}>{t('Existing licence reference')}<input name="licenceReference" maxLength={32} pattern="[A-Za-z0-9-]{4,32}" required={!!required}/></label><label>{t('Preferred appointment date')}<input type="date" name="appointment" min={today} max={max} required/></label><label className="check-label"><input name="declaration" type="checkbox" required/>{t('I understand this is a temporary demonstration request.')}</label><p role="alert" id="form-error">{error}</p><button className="primary" type="submit">{t('Submit request')} <Icon name="arrow"/></button></form></dialog></Layout>;
}
export default function App(){
 const {t}=useTranslation();
 const [view,setView]=useState(()=>{const query=new URLSearchParams(location.search);return query.has('code')||query.has('error')?{kind:'loading',query}:getProfile()?{kind:'profile',profile:getProfile()}:{kind:'landing'};});
 useEffect(()=>{
  if(view.kind!=='loading'){if(view.kind==='landing'&&location.pathname!=='/')history.replaceState(null,'','/');return;}
  const query=view.query;history.replaceState(null,'','/userprofile');
  async function fetchUserInfo(){
   try{
    if(query.has('error')||!query.get('code'))throw new Error('Identity provider: '+(query.get('error')||'authorization code missing'));
    const transaction=consumeTransaction(query.get('state'));
    const profile=await relyingPartyService.post_fetchUserInfo(query.get('code'),transaction);
    storeProfile(profile);setView({kind:'profile',profile});
   }catch(error){clearSession();history.replaceState(null,'','/');setView({kind:'error',message:error.message});}
  }
  fetchUserInfo();
 },[]);
 if(!clientDetails.clientId||!clientDetails.authorizeUri||!clientDetails.redirect_uri_userprofile||!requestedClaims()||new URL(clientDetails.redirect_uri_userprofile).origin!==location.origin)return <Layout><section className="auth-progress">{t('Check the runtime client configuration and registered portal origin.')}</section></Layout>;
 if(view.kind==='loading')return <Layout><section className="auth-progress"><IgnitionGauge/><h2>{t('Completing secure sign-in…')}</h2><p role="status">{t('Please keep this page open.')}</p></section></Layout>;
 if(view.kind==='error')return <Layout><section className="auth-progress"><h2>{t('Sign-in could not be completed')}</h2><p role="alert">{view.message}</p><button className="primary" onClick={()=>location.assign('/')}>{t('Return to sign-in')}</button></section></Layout>;
 if(view.kind==='profile')return <Dashboard profile={view.profile}/>;
 return <Landing/>;
}
