import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import Backend from 'i18next-http-backend';
import {getLocaleConfiguration} from './services/langConfigService.js';
export let languages={en:'English'};
let rtlLanguages=[];
export function applyDirection(){document.documentElement.lang=i18n.language;document.documentElement.dir=rtlLanguages.includes(i18n.language)?'rtl':'ltr';}
export async function loadLocales(){
 const cfg=await getLocaleConfiguration();
 languages=Object.fromEntries(Object.entries(cfg.languages||{}).filter(([code,label])=>/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(code)&&typeof label==='string'));
 if(!Object.keys(languages).length)throw new Error('No portal languages configured');
 rtlLanguages=Array.isArray(cfg.rtlLanguages)?cfg.rtlLanguages:[];
 let saved;try{saved=localStorage.getItem('drivenext.language');}catch{}
 const fallback=Object.hasOwn(languages,'en')?'en':Object.keys(languages)[0];
 const preferred=Object.hasOwn(languages,saved)?saved:Object.hasOwn(languages,window._env_?.DEFAULT_LANG)?window._env_.DEFAULT_LANG:fallback;
 await i18n.use(Backend).use(initReactI18next).init({lng:preferred,fallbackLng:fallback,supportedLngs:Object.keys(languages),load:'currentOnly',debug:false,keySeparator:false,nsSeparator:false,interpolation:{escapeValue:false},backend:{loadPath:'/locales/{{lng}}.json'},react:{useSuspense:false}});
 applyDirection();
 i18n.on('languageChanged',()=>{applyDirection();try{localStorage.setItem('drivenext.language',i18n.language);}catch{}});
}
export default i18n;
