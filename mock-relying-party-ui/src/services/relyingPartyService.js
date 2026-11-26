import axios from 'axios';
import clientDetails from '../constants/clientDetails.js';
const baseUrl=window._env_?.MOCK_RELYING_PARTY_SERVER_URL||'';
const fetchUserInfoEndPoint='/fetchUserInfo';
async function post(path,request){
 try{const response=await axios.post(baseUrl+path,request,{headers:{'Content-Type':'application/json'},timeout:45000});return response.data;}
 catch(error){throw new Error(error.response?.data?.error||error.message);}
}
export function post_fetchUserInfo(code,transaction){
 return post(fetchUserInfoEndPoint,{code,client_id:clientDetails.clientId,redirect_uri:clientDetails.redirect_uri_userprofile,grant_type:clientDetails.grant_type,state:transaction.state,code_verifier:transaction.verifier,transaction});
}
export function post_pushedAuthorizationRequest(transaction,ui_locales){return post('/api/auth/par',{transaction,ui_locales});}
export default {post_fetchUserInfo,post_pushedAuthorizationRequest};
