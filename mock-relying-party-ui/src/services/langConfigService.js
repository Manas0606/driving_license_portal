import axios from 'axios';
export async function getLocaleConfiguration(){const {data}=await axios.get('/locales/default.json');return data;}
export default {getLocaleConfiguration};
