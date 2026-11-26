import React,{useEffect,useState} from 'react';
import RoyalDrive from './RoyalDrive.jsx';

// The background is independent of layout content and never intercepts clicks.
export default function RoyalBackground({subdued=false}){
 const [reducedMotion,setReducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [hidden,setHidden]=useState(()=>document.hidden);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const changed=()=>setReducedMotion(media.matches);
  const visibility=()=>setHidden(document.hidden);
  media.addEventListener('change',changed);
  document.addEventListener('visibilitychange',visibility);
  return()=>{media.removeEventListener('change',changed);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return <div className={'royal-background'+(subdued?' royal-subdued':'')} data-paused={reducedMotion||hidden?'true':'false'} aria-hidden="true">
 <RoyalDrive/>
 <div className="royal-ambient royal-ambient-one"/><div className="royal-ambient royal-ambient-two"/>
 <div className="royal-grain"/><div className="royal-scrim"/>
 <div className="royal-particles">{Array.from({length:12},(_,i)=><i key={i} style={{left:(i*29%100)+'%',top:(i*17%100)+'%',animationDelay:(-i*.7)+'s'}}/>)}</div>
 </div>;
}
export function LicenceMotion(){
 return <div className="licence-motion" aria-hidden="true"><div className="licence-card-art"><div className="licence-art-title">DRIVING LICENCE</div><small>DRIVENEXT · DIGITAL IDENTITY</small><div className="licence-art-body"><div className="licence-art-photo"><svg viewBox="0 0 40 48"><circle cx="20" cy="14" r="9" fill="currentColor"/><path d="M5 42Q5 25 20 25T35 42" fill="currentColor"/></svg></div><div className="licence-art-lines"><i/><i/><i/><i/></div><div className="licence-art-chip"/></div><div className="licence-art-scan"/></div><div className="licence-art-shield">✓</div></div>;
}
export function IgnitionGauge(){
 return <svg className="ignition-gauge" viewBox="0 0 240 205" aria-hidden="true"><defs><linearGradient id="gaugegold"><stop stopColor="#78613c"/><stop offset=".5" stopColor="#f9da96"/><stop offset="1" stopColor="#b78b47"/></linearGradient></defs><path d="M45 161A85 85 0 1 1 195 161" fill="none" stroke="#312b20" strokeWidth="11" strokeLinecap="round"/><path className="royal-gauge-glow" d="M45 161A85 85 0 1 1 195 161" fill="none" stroke="url(#gaugegold)" strokeWidth="3" strokeLinecap="round"/><g stroke="#c8ad74" strokeWidth="2"><path d="M50 151L42 157M44 116L32 114M58 80L48 73M85 56L79 44M120 49V36M155 56L161 44M182 80L192 73M196 116L208 114M190 151L198 157"/></g><g fill="#b9a989" fontSize="10" textAnchor="middle"><text x="58" y="143">0</text><text x="73" y="82">60</text><text x="120" y="68">120</text><text x="169" y="82">180</text><text x="184" y="143">240</text></g><g className="ignition-needle"><path d="M117 128L120 53 123 128Z" fill="#f7d58d"/><circle cx="120" cy="126" r="7" fill="#f1d196"/></g><text x="120" y="158" fill="#f4e2be" textAnchor="middle" fontSize="12" letterSpacing="2">DRIVENEXT</text><text x="120" y="176" fill="#a58e66" textAnchor="middle" fontSize="8" letterSpacing="3">MOBILITY</text></svg>;
}
export function JourneyMotion(){
 return <svg className="royal-route" viewBox="0 0 240 190" aria-hidden="true"><g stroke="#b49c6925" strokeWidth="1" fill="none"><path d="M10 20L230 140M10 65L230 185M55 0V190M112 0V190M171 0V190M10 150L230 20M0 190L240 55"/></g><path d="M30 150C45 105 106 146 112 92S171 31 210 51" fill="none" stroke="#b89b5c33" strokeWidth="12"/><path d="M30 150C45 105 106 146 112 92S171 31 210 51" fill="none" stroke="#caaa6f" strokeWidth="2"/><path className="royal-route-line" d="M30 150C45 105 106 146 112 92S171 31 210 51" fill="none" stroke="#ffedbc" strokeWidth="3"/><circle cx="30" cy="150" r="6" fill="#d0b17b" stroke="#fff1c9"/><g className="royal-route-pin"><path d="M210 56S198 40 198 34a12 12 0 1 1 24 0C222 40 210 56 210 56Z" fill="#d1ad68"/><circle cx="210" cy="34" r="4" fill="#1c1810"/></g><g className="royal-route-car"><rect x="-11" y="-5" width="22" height="10" rx="3" fill="#f2d597" stroke="#fff0be"/><rect x="-4" y="-4" width="8" height="8" rx="1" fill="#302719"/><path d="M-10-3H-7M-10 3H-7" stroke="#ff795e" strokeWidth="2"/><path d="M7-3H11M7 3H11" stroke="#fff" strokeWidth="2"/></g></svg>;
}
export function VerificationMotion(){
 return <div className="royal-verification" aria-hidden="true"><div className="royal-ring"/><div className="royal-ring royal-ring-outer"/><svg viewBox="0 0 80 94"><defs><linearGradient id="shieldgold"><stop stopColor="#edd39b"/><stop offset=".5" stopColor="#a37d3e"/><stop offset="1" stopColor="#e9ca85"/></linearGradient></defs><path d="M40 5L72 18V45Q72 73 40 88Q8 73 8 45V18Z" fill="#b9975d18" stroke="url(#shieldgold)" strokeWidth="2.5"/><path d="M40 12L65 23V45Q65 68 40 80Q15 68 15 45V23Z" fill="none" stroke="#b89d6c44"/><path d="M26 46L36 56 56 34" fill="none" stroke="#f2d296" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>;
}
