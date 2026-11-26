import React from 'react';
// Resolution-independent, entirely local artwork. Motion is controlled by the parent.
export default function RoyalDrive(){
 return <svg className="royal-scene" viewBox="0 0 960 570" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id="sky" x2=".15" y2="1"><stop stopColor="#09090b"/><stop offset=".31" stopColor="#1e1a22"/><stop offset=".63" stopColor="#45372a"/><stop offset="1" stopColor="#695039"/></linearGradient>
  <radialGradient id="sunHalo"><stop stopColor="#f2d8a3"/><stop offset=".29" stopColor="#d7a65c"/><stop offset=".5" stopColor="#b69a60" stopOpacity=".5"/><stop offset="1" stopColor="#9c7446" stopOpacity="0"/></radialGradient>
  <linearGradient id="cliff" x1="0" x2=".45" y2="1"><stop stopColor="#ba6652"/><stop offset=".5" stopColor="#9b4b44"/><stop offset="1" stopColor="#553b4c"/></linearGradient>
  <linearGradient id="cliffLight" x2=".25" y2="1"><stop stopColor="#efae7c"/><stop offset=".5" stopColor="#c67858"/><stop offset="1" stopColor="#8f5046"/></linearGradient>
  <linearGradient id="ground" x2="0" y2="1"><stop stopColor="#40352c"/><stop offset="1" stopColor="#1e1b19"/></linearGradient>
  <linearGradient id="roadSurface" x2="0" y2="1"><stop stopColor="#3d3937"/><stop offset="1" stopColor="#111214"/></linearGradient>
  <linearGradient id="carPaint" x1=".15" y1="0" x2=".4" y2="1"><stop stopColor="#f8e4b7"/><stop offset=".12" stopColor="#b69a60"/><stop offset=".3" stopColor="#716041"/><stop offset=".45" stopColor="#b7a177"/><stop offset=".6" stopColor="#393129"/><stop offset=".85" stopColor="#8c7955"/><stop offset="1" stopColor="#211f1d"/></linearGradient>
  <linearGradient id="carGlass" x2=".4" y2="1"><stop stopColor="#c3c0b3"/><stop offset=".32" stopColor="#655e57"/><stop offset=".6" stopColor="#313337"/><stop offset="1" stopColor="#14181d"/></linearGradient>
  <linearGradient id="metal" x2=".8" y2="1"><stop stopColor="#fff1d4"/><stop offset=".42" stopColor="#6a6a71"/><stop offset=".62" stopColor="#e8cfb6"/><stop offset="1" stopColor="#292c36"/></linearGradient>
  <radialGradient id="rubber"><stop stopColor="#5b5357"/><stop offset=".7" stopColor="#252630"/><stop offset="1" stopColor="#111720"/></radialGradient>
  <linearGradient id="fire" x1="0" x2="1"><stop stopColor="#ff8b52" stopOpacity="0"/><stop offset=".36" stopColor="#ff572f"/><stop offset=".7" stopColor="#ffc762"/><stop offset="1" stopColor="#fffcde"/></linearGradient>
  <linearGradient id="jacket" x2=".8" y2="1"><stop stopColor="#51515d"/><stop offset="1" stopColor="#19202c"/></linearGradient>
  <linearGradient id="beam" x1="0" x2="1"><stop stopColor="#fff6d5" stopOpacity=".65"/><stop offset="1" stopColor="#fff6d5" stopOpacity="0"/></linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="flare"><feGaussianBlur stdDeviation="2"/></filter>
  <g id="alloy"><circle r="39" fill="url(#rubber)" stroke="#25242e" strokeWidth="4"/><circle r="30" fill="#242932" stroke="url(#metal)" strokeWidth="2.5"/><circle r="25" fill="#494653"/><circle r="19" fill="#262d35" stroke="#8b8488"/><g stroke="url(#metal)" strokeWidth="5" strokeLinecap="round"><path d="M0-28L4-8M24-14L9-3M24 14L5 6M0 28L-4 8M-24 14L-9 3M-24-14L-5-6"/></g><circle r="7" fill="#ddd0bb" stroke="#65594f" strokeWidth="2"/></g>
  <g id="canyonRidge"><path d="M0 360V177L40 159 58 112 101 109 118 127 176 129 199 91 265 83 289 108 343 110 365 143 402 145 440 183 485 180 505 208 544 219 583 260 624 282 710 320 960 331V360Z" fill="url(#cliff)"/><path d="M0 181L40 161 58 114 101 111 120 132 176 132 200 94 265 87 290 113 343 113 365 146 402 149 440 187 485 183 505 211 545 222" fill="none" stroke="#f0b78b" strokeWidth="5" opacity=".65"/><path d="M15 186L108 159 181 168 240 134 345 147 412 185 491 200M0 217L110 194 182 204 257 176 361 185 448 219 517 237M0 262L113 238 200 253 280 224 372 232 458 268 540 280M0 307L127 288 212 302 310 267 425 288 526 319" fill="none" stroke="#eeaa83" strokeWidth="5" opacity=".25"/><path d="M58 116L55 215 96 254 86 338M119 133L146 217 139 292 173 348M200 95L215 197 193 229 228 336M266 88L279 182 253 225 302 349M344 113L350 211 389 257 388 348M404 148L413 222 472 314" fill="none" stroke="#70404a" strokeWidth="12" opacity=".45"/></g>
 </defs>
 <path fill="url(#sky)" d="M0 0H960V570H0z"/>
 <g className="royal-sky-glow"><circle cx="755" cy="166" r="250" fill="url(#sunHalo)" opacity=".32"/><circle cx="755" cy="166" r="34" fill="#f6e4bc" opacity=".72"/></g>
 <g className="canyon-clouds" fill="#bba178" opacity=".08"><path d="M-180 88Q70 35 210 80T580 82 1030 45L1100 77Q780 111 610 105T-180 111Z"/><path d="M130 152Q310 97 488 143T980 111V142Q690 179 472 162T130 172Z"/></g>
 <g className="royal-distant-city" opacity=".85">
  {Array.from({length:28},(_,i)=>{const x=i*38-30,h=45+(i*37%112);return <g key={i} transform={`translate(${x} ${345-h})`}><rect width="30" height={h} fill={i%2?'#242329':'#302a2a'} stroke="#9c855322" strokeWidth=".7"/>{Array.from({length:Math.floor(h/13)},(_,j)=><g key={j} opacity={.26+(i+j)%4*.17}><rect x="6" y={7+j*13} width="4" height="3" fill="#f3d69a"/><rect x="18" y={7+j*13} width="4" height="3" fill="#bda77c"/></g>)}</g>})}
 </g>
 <g className="canyon-cliffs" fill="#141417" stroke="#b29a652b" strokeWidth="1">
  {Array.from({length:13},(_,i)=>{const x=i*85-90,h=75+(i*59%145);return <g key={i} transform={`translate(${x} ${356-h})`}><path d={`M0 0H60L67 10V${h}H0Z`}/><path d="M3 1H60" stroke="#ba995b" opacity=".65"/>{Array.from({length:Math.floor(h/20)},(_,j)=><g key={j}><path d={`M8 ${12+j*20}h15M36 ${12+j*20}h15`} stroke="#d9bd7d" strokeWidth="2" opacity={(i+j)%3===0?.65:.18}/></g>)}</g>})}
 </g>
 <g className="royal-lights" stroke="#f4d597" strokeLinecap="round"><path d="M660 346V242Q660 224 677 224H705" strokeWidth="2" fill="none" opacity=".7"/><path d="M690 225H714" strokeWidth="4"/><path d="M888 361V210Q888 192 905 192H928" strokeWidth="2" fill="none" opacity=".8"/><path d="M915 193H938" strokeWidth="5"/></g>
 <g fill="#e6c48b" opacity=".7"><circle cx="31" cy="44" r="1"/><circle cx="103" cy="83" r="1.5"/><circle cx="213" cy="42" r="1"/><circle cx="395" cy="82" r="1"/><circle cx="616" cy="55" r="1.5"/><circle cx="861" cy="86" r="1"/><circle cx="917" cy="45" r="1.1"/></g>
 <path d="M0 350Q270 321 447 350T960 327V570H0Z" fill="url(#ground)"/>
 <path d="M0 380Q222 351 514 370T960 356L960 570H0Z" fill="url(#roadSurface)"/>
 <path d="M0 380Q222 351 514 370T960 356M0 394Q222 366 514 385T960 370" fill="none" stroke="#ffe8bb" strokeWidth="3" opacity=".65"/>
 <path d="M0 530L960 499" stroke="#d9b16a" strokeWidth="5" opacity=".85"/>
 <path className="canyon-lanes" d="M-300 484L1260 448" stroke="#fff0cb" strokeWidth="5" strokeDasharray="94 64" opacity=".76"/>
 <g opacity=".25" stroke="#bd9e67" strokeWidth="2"><path d="M0 416L960 402M0 558L960 538"/></g>
 <g className="canyon-dust" fill="#bda277" filter="url(#soft)"><ellipse cx="225" cy="444" rx="160" ry="35" opacity=".64"/><ellipse cx="112" cy="418" rx="105" ry="22" opacity=".45"/></g>
 <g className="canyon-rival" transform="translate(650 330) scale(.40)" opacity=".88"><ellipse cx="230" cy="105" rx="190" ry="13" fill="#2c2834" opacity=".45"/><path d="M35 70L76 43 141 39 190 3 280 5 347 43 413 57 446 77 439 100H30Z" fill="#5f6873" stroke="#b8c2cf" strokeWidth="3"/><path d="M158 37L201 9H270L326 40Z" fill="#a6b9cf"/><circle cx="112" cy="96" r="27" fill="#222935"/><circle cx="365" cy="96" r="27" fill="#222935"/><circle cx="112" cy="96" r="16" fill="#b9b7bb"/><circle cx="365" cy="96" r="16" fill="#b9b7bb"/><path d="M37 67H68" stroke="#ff7570" strokeWidth="7"/><path d="M409 61L437 74" stroke="#fff6d7" strokeWidth="7"/></g>
 <g transform="translate(318 250) scale(.79)">
 <g className="canyon-car">
 <ellipse cx="420" cy="210" rx="320" ry="22" fill="#151a25" opacity=".5" filter="url(#soft)"/>
 <g className="canyon-flame"><path d="M146 177Q101 149 57 173L-8 188 62 190Q100 210 146 185Z" fill="url(#fire)"/><path d="M145 177L53 183 145 188Z" fill="#b2e9ff"/><path d="M145 180L99 183 145 185Z" fill="#fff8d0"/></g>
 <path d="M699 141L848 166 848 190 701 159Z" fill="url(#beam)" opacity=".6"/>
 <path d="M143 120Q175 98 245 96L318 38Q358 7 428 12L496 29 579 97Q648 98 688 119L718 148 711 184 676 194Q662 140 617 143 578 146 567 195H298Q287 143 241 143 196 145 185 194L138 183 120 153Z" fill="url(#carPaint)" stroke="#ddc18b" strokeWidth="2"/>
 <path d="M270 94L331 43Q367 17 423 21L488 38 551 94Z" fill="url(#carGlass)" stroke="#c6b28d" strokeWidth="2"/>
 <path d="M422 22L430 94" stroke="#3f3930" strokeWidth="10"/>
 <path d="M438 101L449 165 555 171 570 101" fill="none" stroke="#4b4032" strokeWidth="2"/>
 <path d="M148 123Q275 103 399 113T696 133" fill="none" stroke="#fff1c8" strokeWidth="2.5" opacity=".9"/>
 <path d="M300 188L568 190 554 202H306Z" fill="#302b36"/>
 <path d="M120 150L143 145 167 153 152 163 124 162Z" fill="#f84637" stroke="#ffb78e" strokeWidth="2"/><path d="M126 151L151 148" stroke="#ffe2ad" strokeWidth="2"/>
 <path d="M668 118L697 130 705 144 652 133Z" fill="#fff2cc" stroke="#fff" strokeWidth="2.5"/>
 <path d="M673 118L705 134" stroke="#fff6d6" strokeWidth="7" opacity=".65" filter="url(#flare)"/>
 <path d="M126 177H150" stroke="url(#metal)" strokeWidth="12" strokeLinecap="round"/><path d="M127 177H145" stroke="#241d25" strokeWidth="7"/>
 <path d="M489 108H514" stroke="#e9d0a1" strokeWidth="4" strokeLinecap="round"/>
 <path d="M573 107L596 104 602 116 578 119Z" fill="url(#metal)"/>
 <path d="M154 114L180 106 222 107 218 115Z" fill="#33302b"/><path d="M152 105V94H222V103" stroke="#292725" strokeWidth="5" fill="none"/>
 <path d="M701 160L715 158 708 184 687 187Z" fill="#362e38"/>
 <g transform="translate(241 185)"><g className="canyon-wheel"><use href="#alloy"/></g></g>
 <g transform="translate(617 185)"><g className="canyon-wheel"><use href="#alloy"/></g></g>
 <g className="canyon-door"><path d="M436 101L449 165 555 171 570 101Z" fill="url(#carPaint)" stroke="#514632" strokeWidth="2"/><path d="M489 108H514" stroke="#e9d0a1" strokeWidth="4" strokeLinecap="round"/></g>
 </g>
 <g className="canyon-driver" transform="translate(58 40)">
  <ellipse cx="0" cy="160" rx="24" ry="5" fill="#2b2832" opacity=".32"/>
  <g className="driver-leg-a"><path d="M-11 89L-17 121 -24 155" fill="none" stroke="#2b2d3a" strokeWidth="13" strokeLinecap="round"/><path d="M-27 155H-11" stroke="#20232c" strokeWidth="7" strokeLinecap="round"/></g>
  <g className="driver-leg-b"><path d="M10 89L16 121 24 155" fill="none" stroke="#363541" strokeWidth="13" strokeLinecap="round"/><path d="M19 155H35" stroke="#25262e" strokeWidth="7" strokeLinecap="round"/></g>
  <path d="M-12 30L-26 41 -20 92 17 96 25 39 12 29Z" fill="url(#jacket)" stroke="#b58b85" strokeWidth="1"/>
  <path d="M0 34L3 87" stroke="#d1b1a2" strokeWidth="2"/><path d="M-25 43L-34 72 -25 94M24 42L34 70 26 90" fill="none" stroke="#31323e" strokeWidth="10" strokeLinecap="round"/>
  <path d="M-27 92L-24 101M27 90L28 99" stroke="#d69b79" strokeWidth="6" strokeLinecap="round"/>
  <path d="M-8 23V34H9V22" fill="#bc7e62"/><ellipse cy="11" rx="14" ry="18" fill="#e0a27d"/><path d="M-14 7Q-17-10 0-10T15 6L4 1 -8 4Z" fill="#2e2630"/><path d="M-11 9H-1M3 9H12M-1 9H3" stroke="#302d38" strokeWidth="3"/><path d="M-23 41L-19 57M24 41L20 57" stroke="#e2b69f" strokeWidth="3"/>
 </g>
 </g>
 <g className="royal-trails" stroke="#e9c58a" fill="none" opacity=".4"><path d="M-250 392H-40M100 413H360M500 485H810M900 420H1100" strokeWidth="2"/><path d="M-150 445H20M250 470H430M620 504H960" strokeWidth=".9"/></g><g className="canyon-sparkles" fill="#ffdfaa"><circle cx="201" cy="417" r="2"/><circle cx="110" cy="395" r="1.5"/><circle cx="279" cy="447" r="2"/><circle cx="790" cy="307" r="1.4"/><circle cx="832" cy="356" r="1.7"/></g>
 </svg>;
}
