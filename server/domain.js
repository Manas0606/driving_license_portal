export const services = Object.freeze({
  NEW: 'New driving licence', RENEWAL: 'Renew a licence', REPLACEMENT: 'Replace a licence', LEARNER: 'Learner permit'
});
export const categories = Object.freeze(['Motorcycle','Passenger car','Commercial vehicle']);
export function validateApplication(body, today = new Date().toISOString().slice(0,10)) {
  const {service, category, appointment, licenceReference, declaration} = body || {};
  if(!Object.hasOwn(services,service)||!categories.includes(category)||declaration!==true) throw new Error('Select a service and vehicle category and accept the declaration.');
  if(typeof appointment!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(appointment)||!Number.isFinite(Date.parse(appointment))||new Date(appointment).toISOString().slice(0,10)!==appointment||appointment<today) throw new Error('Select a valid future appointment date.');
  const max=new Date(today+'T00:00:00Z');max.setUTCDate(max.getUTCDate()+90);
  if(appointment>max.toISOString().slice(0,10)) throw new Error('Choose an appointment within 90 days.');
  const requiresReference=['RENEWAL','REPLACEMENT'].includes(service);
  if(requiresReference&&(typeof licenceReference!=='string'||! /^[A-Za-z0-9-]{4,32}$/.test(licenceReference.trim()))) throw new Error('Enter a valid existing licence reference.');
  return {service,category,appointment,licenceReference:requiresReference?licenceReference.trim():null};
}
