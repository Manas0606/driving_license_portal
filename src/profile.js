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
export function profileFields(info){
 return [['Full name',textValue(info.given_name)||textValue(info.name)],['Date of birth',textValue(info.birthdate)],['Gender',textValue(info.gender)],['Email address',textValue(info.email_verified)||textValue(info.email)],['Phone number',textValue(info.phone_number_verified)||textValue(info.phone)||textValue(info.phone_number)],['Address',formatAddress(info.address)]];
}
