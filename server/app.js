import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { resolve } from 'node:path';
import { begin, complete, isConfigured, validateBrowserTransaction, pushedRequest, probeProvider } from './oidc.js';

const origin=new URL(process.env.APP_ORIGIN||(process.env.VERCEL==='1'?'https://driving-license-portal-wine.vercel.app':'http://localhost:8080')).origin;
const secure=origin.startsWith('https:');
const app=express();
app.disable('x-powered-by');
if(process.env.TRUST_PROXY==='1'||process.env.VERCEL==='1') app.set('trust proxy',1);
app.use(helmet({referrerPolicy:{policy:'strict-origin'},contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],formAction:["'self'","https://esignet.mosip-demo.mosip.net"],upgradeInsecureRequests:secure?[]:null}}}));
app.use(express.json({limit:'16kb'}));
app.use('/api',rateLimit({windowMs:60_000,limit:100,standardHeaders:'draft-8',legacyHeaders:false}));
app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.get('origin')!==origin)return res.status(403).json({error:'Invalid request origin'});next();});
app.get('/api/health',async(req,res)=>{
 if(req.query.probe!=='1')return res.json({status:'UP'});
 try{res.json({status:'UP',configured:isConfigured(),region:process.env.VERCEL_REGION||'local',provider:await probeProvider()});}catch{res.status(500).json({status:'UP',error:'Invalid provider endpoint configuration'});}
});
app.get('/api/auth/me',(req,res)=>res.json({configured:isConfigured(),profile:null}));
function transaction(req,res){
  try{return validateBrowserTransaction(req.body?.transaction);}
  catch{res.status(400).json({error:'Invalid or expired sign-in request'});return null;}
}
app.post('/api/auth/start',rateLimit({windowMs:60_000,limit:15}),async(req,res)=>{
  if(!isConfigured())return res.status(503).json({error:'Secure sign-in is not configured on the server.'});
  const tx=transaction(req,res);if(!tx)return;
  res.json(await begin(tx));
});
app.post('/api/auth/par',async(req,res)=>{
  if(!isConfigured())return res.status(503).json({error:'Secure sign-in is not configured on the server.'});
  const tx=transaction(req,res);if(!tx)return;
  res.json({request_uri:await pushedRequest(tx)});
});
// Keep the existing registered callback URI. Return to the UI for state validation.
app.get('/api/auth/callback',(req,res)=>{
  const query=new URLSearchParams();
  for(const key of ['code','state','error']){
    const value=req.query[key];if(typeof value==='string'&&value.length<=4096)query.set(key,value);
  }
  res.redirect(303,'/userprofile?'+query.toString());
});
// Same relying-party exchange pattern as MOSIP Health Services.
app.post('/api/fetchUserInfo',rateLimit({windowMs:60_000,limit:15}),async(req,res)=>{
  if(!isConfigured())return res.status(503).json({error:'Secure sign-in is not configured on the server.'});
  const tx=transaction(req,res);if(!tx)return;
  const code=req.body?.code;
  if(typeof code!=='string'||!code||code.length>4096)return res.status(400).json({error:'Invalid authorization code'});
  try {
    const identity=await complete(tx,code);
    res.json(identity);
  } catch(error) {
    console.error('eSignet exchange failed:',error.publicMessage||error.code||error.name);
    res.status(502).json({error:error.publicMessage||'Identity verification failed. Please sign in again.'});
  }
});
app.use('/api',(req,res)=>res.status(404).json({error:'Not found'}));
app.use(express.static(resolve('dist'),{index:'index.html'}));
app.get(['/', '/userprofile'],(req,res)=>res.sendFile(resolve('dist/index.html')));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);console.error('Request failed:',err.name);res.status(err.status===400?400:500).json({error:'Unable to complete the request. Please try again.'});});
export { app };
