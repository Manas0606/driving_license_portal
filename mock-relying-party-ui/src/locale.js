export let languages={en:'English'};
let rtlLanguages=[],dictionary=new Map();
export let locale='en';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function json(path){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error('Unable to load '+path);return response.json();}
export async function loadLocales(){
 const config=await json('/locales/default.json');
 languages=Object.fromEntries(Object.entries(config.languages||{}).filter(([code,label])=>/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(code)&&typeof label==='string'));
 if(!Object.keys(languages).length)throw new Error('No portal languages configured');
 rtlLanguages=Array.isArray(config.rtlLanguages)?config.rtlLanguages:[];
 let saved;try{saved=localStorage.getItem('drivenext.language');}catch{}
 const selected=Object.hasOwn(languages,saved)?saved:Object.hasOwn(languages,'en')?'en':Object.keys(languages)[0];
 await setLocale(selected);
}
export async function setLocale(value){
 if(!Object.hasOwn(languages,value))return;
 const messages=await json('/locales/'+value+'.json');
 dictionary=new Map(Object.entries(messages).filter(([,v])=>typeof v==='string').map(([k,v])=>[k.toLowerCase(),v]));
 locale=value;try{localStorage.setItem('drivenext.language',value);}catch{}
}
export function t(value){return dictionary.get(String(value).toLowerCase())||value;}
export function localize(root){
 document.documentElement.lang=locale;document.documentElement.dir=rtlLanguages.includes(locale)?'rtl':'ltr';
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
  if(node.parentElement.closest('[data-untranslated],#sign-in-with-esignet,script,style,select,option'))continue;
  const raw=node.nodeValue,trim=raw.trim();if(trim)node.nodeValue=raw.replace(trim,t(trim));
 }
}
export function languageSelect(){return '<select id="language" aria-label="Language" class="language-select">'+Object.entries(languages).map(([code,label])=>'<option value="'+escape(code)+'"'+(code===locale?' selected':'')+'>'+escape(label)+'</option>').join('')+'</select>';}
