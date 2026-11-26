import React,{useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import CanyonDrive from './CanyonDrive.jsx';

export default function CinematicHero(){
 const {t}=useTranslation();
 const stage=useRef(null),video=useRef(null);
 const [visible,setVisible]=useState(true);
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [film,setFilm]=useState(false);
 const [hasFilm,setHasFilm]=useState(true);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const changed=()=>setPaused(media.matches);
  media.addEventListener('change',changed);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.08});
  observer.observe(stage.current);
  return()=>{observer.disconnect();media.removeEventListener('change',changed);};
 },[]);
 useEffect(()=>{
  const player=video.current;if(!player||!film)return;
  if(paused||!visible)player.pause();
  else player.play().catch(()=>setPaused(true));
 },[paused,visible,film]);
 return <div className="cinematic-stage" ref={stage} data-paused={paused||!visible?'true':'false'} data-film={film?'true':'false'}>
  <CanyonDrive/>
  {hasFilm&&<video ref={video} className={'cinematic-film '+(film?'ready':'')} src="/cinematic/coral-grand-tour.mp4" muted loop playsInline preload="metadata" aria-hidden="true" onLoadedData={()=>setFilm(true)} onCanPlay={()=>setFilm(true)} onError={()=>{setHasFilm(false);setFilm(false);}}/>}
  <div className="cinematic-vignette"/>
  <div className="cinematic-top"><span className="cinematic-dot"/><span>{t('CORAL GRAND TOUR')}</span><span className="cinematic-live">{t('CINEMATIC EXPERIENCE')}</span></div>
  <div className="cinematic-bottom"><div><small>{t('THE JOURNEY BEGINS')}</small><strong>{t('Chase the horizon.')}</strong></div><button className="motion-control" type="button" aria-pressed={paused} aria-label={t(paused?'Play animation':'Pause animation')} onClick={()=>setPaused(p=>!p)}>{paused?'▶':'Ⅱ'}</button></div>
  <div className="cinematic-timeline" aria-hidden="true"><span/></div>
 </div>;
}

export function LicenceMotion(){
 return <div className="licence-motion" aria-hidden="true"><div className="licence-card-art"><div className="licence-art-title">DRIVENEXT <span>DL</span></div><div className="licence-art-body"><div className="licence-art-photo"><svg viewBox="0 0 40 44"><circle cx="20" cy="13" r="9" fill="currentColor"/><path d="M5 42Q5 25 20 25T35 42Z" fill="currentColor"/></svg></div><div className="licence-art-lines"><i/><i/><i/><i/></div><div className="licence-art-chip"/></div><div className="licence-art-scan"/></div><div className="licence-art-shield"><svg viewBox="0 0 32 36"><path d="M16 2L29 7V17Q29 27 16 34 3 27 3 17V7Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 17L14 22 23 12" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>;
}

export function IgnitionGauge(){
 return <svg className="ignition-gauge" viewBox="0 0 220 145" aria-hidden="true"><path d="M34 115A79 79 0 1 1 186 115" fill="none" stroke="#eddbce" strokeWidth="10" strokeLinecap="round"/><path d="M34 115A79 79 0 1 1 186 115" fill="none" stroke="#df8054" strokeWidth="3" strokeDasharray="8 4"/><path d="M42 107L30 111M43 74L31 69M65 42L57 31M110 28V16M155 42L163 31M177 74L189 69M178 107L190 111" fill="none" stroke="#ae705d" strokeWidth="2.5"/><g className="ignition-needle"><path d="M107 108L110 36 113 108Z" fill="#d4592c"/><circle cx="110" cy="108" r="7" fill="#d4592c"/></g><text x="110" y="130" textAnchor="middle" fill="#99523a" fontSize="10" letterSpacing="3">DRIVENEXT</text></svg>;
}
