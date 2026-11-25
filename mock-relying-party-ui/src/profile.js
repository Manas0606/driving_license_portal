// Render only the identity attributes actually returned after consent.
const textValue=v=>typeof v==='string'&&v.trim()?v.trim():'';
export function formatAddress(value){
 if(typeof value==='string')return value;
 if(!value||typeof value!=='object')return '';
 if(textValue(value.formatted))return value.formatted;
 return [...new Set(['street_address','addressLine1','addressLine2','addressLine3','locality','city','province','region','postalCode','postal_code','country'].map(k=>textValue(value[k])).filter(Boolean))].join(', ');
}
export function pictureSource(value){
 if(typeof value!=='string')return '';
 if(/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/i.test(value))return value;
 // Health Services receives a data URI; accept a bare base64 JPEG or PNG too.
 if(/^\/9j\/[A-Za-z0-9+/=]+$/.test(value))return 'data:image/jpeg;base64,'+value;
 if(/^iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(value))return 'data:image/png;base64,'+value;
 return '';
}
function displayValue(value){
 if(typeof value==='string')return value.trim();
 if(typeof value==='number'||typeof value==='boolean')return String(value);
 if(Array.isArray(value))return value.map(displayValue).filter(Boolean).join(', ');
 return '';
}
export function profileFields(info,fields){
 return fields.filter(field=>field.type!=='picture').map(field=>{
  const keys=[...(field.aliases||[]),field.claim];
  const value=keys.map(key=>{
   if(key.endsWith('_verified')&&typeof info[key]!=='string')return '';
   return field.type==='address'?formatAddress(info[key]):displayValue(info[key]);
  }).find(Boolean)||'';
  return [field.label,value];
 });
}
