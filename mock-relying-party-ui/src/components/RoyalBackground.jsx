import React,{useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import RoyalDrive from './RoyalDrive.jsx';

// The background is independent of layout content and never intercepts clicks.
export default function RoyalBackground({subdued=false}){
 const {t}=useTranslation();
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [hidden,setHidden]=useState(()=>document.hidden);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const changed=()=>setPaused(media.matches);
  const visibility=()=>setHidden(document.hidden);
  media.addEventListener('change',changed);
  document.addEventListener('visibilitychange',visibility);
  return()=>{media.removeEventListener('change',changed);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return <><div className={'royal-background'+(subdued?' royal-subdued':'')} data-paused={paused||hidden?'true':'false'} aria-hidden="true">
 <RoyalDrive/>
 <div className="royal-ambient royal-ambient-one"/><div className="royal-ambient royal-ambient-two"/>
 <div className="royal-grain"/><div className="royal-scrim"/>
 <div className="royal-particles">{Array.from({length:12},(_,i)=><i key={i} style={{left:(i*29%100)+'%',top:(i*17%100)+'%',animationDelay:(-i*.7)+'s'}}/>)}</div>
 </div><button className="royal-motion-control" type="button" aria-pressed={paused} aria-label={t(paused?'Play animation':'Pause animation')} title={t(paused?'Play animation':'Pause animation')} onClick={()=>setPaused(p=>!p)}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span><span>{t(paused?'Play animation':'Pause animation')}</span></button></>;
}
export function LicenceMotion(){
 return <div className="licence-motion" aria-hidden="true"><div className="licence-card-art"><div className="licence-art-title">DRIVENEXT <span>DL</span></div><div className="licence-art-body"><div className="licence-art-photo"><svg viewBox="0 0 40 44"><circle cx="20" cy="13" r="9" fill="currentColor"/><path d="M5 42Q5 25 20 25T35 42Z" fill="currentColor"/></svg></div><div className="licence-art-lines"><i/><i/><i/><i/></div><div className="licence-art-chip"/></div><div className="licence-art-scan"/></div><div className="licence-art-shield"><svg viewBox="0 0 32 36"><path d="M16 2L29 7V17Q29 27 16 34 3 27 3 17V7Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 17L14 22 23 12" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>;
}

export function IgnitionGauge(){
 return <svg className="ignition-gauge" viewBox="0 0 220 145" aria-hidden="true"><path d="M34 115A79 79 0 1 1 186 115" fill="none" stroke="#544733" strokeWidth="10" strokeLinecap="round"/><path d="M34 115A79 79 0 1 1 186 115" fill="none" stroke="#d3ad6d" strokeWidth="3" strokeDasharray="8 4"/><path d="M42 107L30 111M43 74L31 69M65 42L57 31M110 28V16M155 42L163 31M177 74L189 69M178 107L190 111" fill="none" stroke="#ab9163" strokeWidth="2.5"/><g className="ignition-needle"><path d="M107 108L110 36 113 108Z" fill="#f3d499"/><circle cx="110" cy="108" r="7" fill="#f3d499"/></g><text x="110" y="130" textAnchor="middle" fill="#dfc391" fontSize="10" letterSpacing="3">DRIVENEXT</text></svg>;
}
