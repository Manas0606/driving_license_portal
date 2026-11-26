import React from 'react';
// The original Design 07 gold sports-car illustration, scaled to the viewport.
export default function RoyalDrive(){
 return <svg className="royal-scene" viewBox="0 0 960 570" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
 <defs>
 <linearGradient id="royalSky" x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#080808"/><stop offset="1" stopColor="#17130e"/></linearGradient>
 <radialGradient id="royalHalo"><stop stopColor="#806038" stopOpacity=".4"/><stop offset="1" stopColor="#806038" stopOpacity="0"/></radialGradient>
 <linearGradient id="royalRoad" x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#413326" stopOpacity=".24"/><stop offset="1" stopColor="#0c0b09"/></linearGradient>
 <linearGradient id="streakGold"><stop stopColor="#c9a366" stopOpacity="0"/><stop offset="1" stopColor="#e6c890" stopOpacity=".9"/></linearGradient>
 <linearGradient id="bodyMetal" x1="0%" y1="0%" x2="12%" y2="100%"><stop stopColor="#f1dba2"/><stop offset=".18" stopColor="#b18b4e"/><stop offset=".39" stopColor="#4d422d"/><stop offset=".55" stopColor="#bba374"/><stop offset=".72" stopColor="#5b472a"/><stop offset="1" stopColor="#161410"/></linearGradient>
 <linearGradient id="glassMetal" x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#77736b"/><stop offset=".25" stopColor="#282c2c"/><stop offset="1" stopColor="#090c0f"/></linearGradient>
 <linearGradient id="fire"><stop stopColor="#ff4f12" stopOpacity=".1"/><stop offset=".45" stopColor="#ff6a16"/><stop offset=".8" stopColor="#ffe69c"/><stop offset="1" stopColor="#fff"/></linearGradient>
 <linearGradient id="beam"><stop stopColor="#fff3ba" stopOpacity=".5"/><stop offset="1" stopColor="#fff3ba" stopOpacity="0"/></linearGradient>
 <linearGradient id="jacket" x2="80%" y2="100%"><stop stopColor="#51515d"/><stop offset="1" stopColor="#19202c"/></linearGradient>
 <radialGradient id="tire"><stop stopColor="#76654d"/><stop offset=".6" stopColor="#302e2a"/><stop offset=".78" stopColor="#121212"/><stop offset="1" stopColor="#030303"/></radialGradient>
 <filter id="carShadow"><feGaussianBlur stdDeviation="5"/></filter>
 <g id="rim"><circle r="28" fill="url(#tire)" stroke="#25231d" strokeWidth="3"/><circle r="20" fill="#171614" stroke="#b99c65" strokeWidth="2"/><g stroke="#c1ac85" strokeWidth="4"><path d="M0-19V19M-19 0H19M-13-13L13 13M13-13L-13 13"/></g><circle r="6" fill="#c3aa77" stroke="#332c23" strokeWidth="2"/></g>
 </defs>
 <path d="M0 0H960V570H0Z" fill="url(#royalSky)"/>
 <ellipse className="royal-sky-glow" cx="655" cy="340" rx="520" ry="320" fill="url(#royalHalo)"/>
 <g className="royal-city" fill="#15130f" stroke="#b69a6620" strokeWidth=".8">{Array.from({length:22},(_,i)=>{const h=20+i*39%87;return <g key={i} transform={`translate(${i*49-20} ${402-h})`}><rect width="37" height={h}/>{Array.from({length:Math.floor(h/12)},(_,j)=><path key={j} d={`M8 ${7+j*12}h4m10 0h4`} stroke="#b8a06d" opacity={(i+j)%4===0?.5:.12}/>)}</g>})}</g>
 <path d="M0 402H960V570H0Z" fill="url(#royalRoad)" stroke="#d2b47944"/>
 <path d="M0 390Q180 330 460 392T960 378" fill="none" stroke="#af8c5c" strokeOpacity=".14"/>
 <g className="royal-streaks" stroke="url(#streakGold)" opacity=".38"><path d="M-960 343H-660M-480 362H-160M40 343H340M500 362H820M1040 343H1340M1500 362H1820" strokeWidth="2"/><path d="M-800 305H-530M-380 325H-80M160 305H430M580 325H880M1120 305H1390M1540 325H1840" strokeWidth=".8"/></g>
 <path className="royal-road-lanes" d="M-500 497H1460" stroke="#b49b65aa" strokeWidth="3" strokeDasharray="75 80"/>
 <g transform="translate(343 300) scale(1.02)">
 <g className="royal-car">
 <ellipse cx="303" cy="152" rx="213" ry="13" fill="#000" filter="url(#carShadow)"/>
 <g className="royal-boost"><g className="royal-flame"><path d="M118 127Q70 98 34 126L5 136 46 140Q88 155 118 136Z" fill="url(#fire)"/><path d="M118 129L52 135 118 137Z" fill="#bce9ff"/><path d="M116 130L83 134 116 136Z" fill="#fff5db"/></g></g>
 <path d="M463 103L537 122 537 145 464 122Z" fill="url(#beam)"/>
 <path d="M116 103Q124 79 175 72L230 38Q272 17 320 33L389 72Q449 76 474 99L489 119 481 138 453 142Q441 102 408 105Q376 106 367 144H234Q226 103 191 105Q154 106 147 143L110 135 100 120Z" fill="url(#bodyMetal)" stroke="#d1b680" strokeWidth="1.3"/>
 <path d="M192 72L239 43Q275 29 314 40L366 72Z" fill="url(#glassMetal)" stroke="#ad9a74"/>
 <path d="M286 36L291 73" stroke="#b49b6c" strokeWidth="5"/>
 <path d="M292 76L302 118 358 121 367 79" fill="none" stroke="#3f3424" strokeWidth="1.3"/>
 <path d="M123 101Q270 78 462 101" fill="none" stroke="#f4dfac" strokeWidth="1.2"/>
 <path d="M233 141L369 141" stroke="#d8b97d" strokeWidth="3"/>
 <path d="M115 93L146 88 139 99 112 104" fill="#ff4545" stroke="#ff9b73" strokeWidth="1.5"/>
 <path d="M437 87L466 99 469 106 432 99Z" fill="#ffefc1" stroke="#fff7d8" strokeWidth="2"/>
 <path d="M112 127H128" stroke="#b9b2a1" strokeWidth="6" strokeLinecap="round"/><path d="M114 127H124" stroke="#1f1f1f" strokeWidth="3"/>
 <path d="M332 85H350" stroke="#e3ca9c" strokeWidth="3" strokeLinecap="round"/>
 <path d="M378 82L394 80 399 88 382 91Z" fill="#877447" stroke="#d5bb83"/>
 <g transform="translate(191 137)"><g className="royal-wheel"><use href="#rim"/></g></g>
 <g transform="translate(408 137)"><g className="royal-wheel"><use href="#rim"/></g></g>
 <g className="royal-door"><path d="M292 76L302 118 358 121 367 79Z" fill="url(#bodyMetal)" stroke="#3f3424" strokeWidth="1.3"/><path d="M332 85H350" stroke="#e3ca9c" strokeWidth="3" strokeLinecap="round"/></g>
 </g>
 <g transform="scale(.84)">
  <g className="royal-driver" transform="translate(58 40)">
  <ellipse cx="0" cy="160" rx="24" ry="5" fill="#2b2832" opacity=".32"/>
  <g className="driver-leg-a"><path d="M-11 89L-17 121 -24 155" fill="none" stroke="#2b2d3a" strokeWidth="13" strokeLinecap="round"/><path d="M-27 155H-11" stroke="#20232c" strokeWidth="7" strokeLinecap="round"/></g>
  <g className="driver-leg-b"><path d="M10 89L16 121 24 155" fill="none" stroke="#363541" strokeWidth="13" strokeLinecap="round"/><path d="M19 155H35" stroke="#25262e" strokeWidth="7" strokeLinecap="round"/></g>
  <path d="M-12 30L-26 41 -20 92 17 96 25 39 12 29Z" fill="url(#jacket)" stroke="#b58b85" strokeWidth="1"/>
  <path d="M0 34L3 87" stroke="#d1b1a2" strokeWidth="2"/><path d="M-25 43L-34 72 -25 94M24 42L34 70 26 90" fill="none" stroke="#31323e" strokeWidth="10" strokeLinecap="round"/>
  <path d="M-27 92L-24 101M27 90L28 99" stroke="#d69b79" strokeWidth="6" strokeLinecap="round"/>
  <path d="M-8 23V34H9V22" fill="#bc7e62"/><ellipse cy="11" rx="14" ry="18" fill="#e0a27d"/><path d="M-14 7Q-17-10 0-10T15 6L4 1 -8 4Z" fill="#2e2630"/><path d="M-11 9H-1M3 9H12M-1 9H3" stroke="#302d38" strokeWidth="3"/><path d="M-23 41L-19 57M24 41L20 57" stroke="#e2b69f" strokeWidth="3"/>
 </g>
 </g>
 </g>
 </svg>;
}
