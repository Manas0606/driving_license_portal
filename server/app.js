import express from 'express';
import { createCookieSession } from './session.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { begin, complete, isConfigured, newTransaction, validateTransaction, pushedRequest } from './oidc.js';
import { validateApplication } from './domain.js';

const origin=new URL(process.env.APP_ORIGIN||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'http://localhost:8080')).origin;
const secret=process.env.SESSION_SECRET;
const secure=origin.startsWith('https:');
const cookies=secret?createCookieSession(secret,secure):null;
const app=express();
app.disable('x-powered-by');
if(process.env.TRUST_PROXY==='1'||process.env.VERCEL==='1') app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],formAction:["'self'","https://esignet.mosip-demo.mosip.net"],upgradeInsecureRequests:secure?[]:null}}}));
app.use(express.json({limit:'16kb'}));
app.use('/api',rateLimit({windowMs:60_000,limit:100,standardHeaders:'draft-8',legacyHeaders:false}));
app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.get('origin')!==origin)return res.status(403).json({error:'Invalid request origin'});next();});
const ready=()=>Boolean(cookies&&isConfigured());
const signedIn=async(req,res,next)=>{
  const session=cookies&&await cookies.read(req,'profile');
  if(!session?.profile||Date.now()>=session.expiresAt)return res.status(401).json({error:'Sign in with eSignet first'});
  req.demoSession=session;next();
};
app.get('/api/health',(req,res)=>res.json({status:'UP'}));
app.get('/api/auth/me',async(req,res)=>{
  const session=cookies&&await cookies.read(req,'profile');
  res.json({configured:ready(),profile:session?.profile?{name:session.profile.name,birthdate:session.profile.birthdate}:null});
});
app.post('/api/auth/start',rateLimit({windowMs:60_000,limit:15}),async(req,res)=>{
  if(!ready())return res.status(503).json({error:'eSignet client onboarding is not configured.'});
  const tx=newTransaction();const config=await begin(tx);
  await cookies.write(res,'transaction',tx,tx.expiresAt);res.json(config);
});
app.post('/api/auth/par',async(req,res)=>{
  if(!ready())return res.status(503).json({error:'eSignet client onboarding is not configured.'});
  const tx=await cookies.read(req,'transaction');validateTransaction(tx,req.body?.state);res.json({request_uri:await pushedRequest(tx)});
});
app.get('/api/auth/callback',async(req,res)=>{
  try{
    if(!ready())throw new Error('RP not configured');
    const tx=await cookies.read(req,'transaction');
    cookies.clear(res,'transaction');validateTransaction(tx,req.query.state);
    if(req.query.error||typeof req.query.code!=='string'||!req.query.code)throw new Error('Authorization not completed');
    const identity=await complete(tx,req.query.code);
    const expiresAt=Date.now()+30*60_000;
    const profile={name:identity.name.slice(0,160),birthdate:identity.birthdate?.slice(0,10)||null};
    await cookies.write(res,'profile',{profile,applications:[],expiresAt},expiresAt);
    res.redirect(303,'/');
  }catch{res.redirect(303,'/?auth=failed');}
});
app.post('/api/auth/logout',(req,res)=>{if(cookies){cookies.clear(res,'profile');cookies.clear(res,'transaction');}res.status(204).end();});
app.get('/api/applications',signedIn,(req,res)=>res.json(req.demoSession.applications));
app.post('/api/applications',signedIn,async(req,res)=>{
  let data;try{data=validateApplication(req.body);}catch(e){return res.status(400).json({error:e.message});}
  if(req.demoSession.applications.length>=5)return res.status(400).json({error:'This demo supports up to five requests per sign-in.'});
  const row={id:randomUUID(),service:data.service,category:data.category,appointment:data.appointment,status:'DEMO',created_at:new Date().toISOString()};
  req.demoSession.applications.unshift(row);
  await cookies.write(res,'profile',req.demoSession,req.demoSession.expiresAt);res.status(201).json(row);
});
app.use('/api',(req,res)=>res.status(404).json({error:'Not found'}));
app.use(express.static(resolve('dist'),{index:'index.html'}));
app.get('/',(req,res)=>res.sendFile(resolve('dist/index.html')));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);console.error('Request failed:',err.name);res.status(err.status===400?400:500).json({error:'Unable to complete the request. Please try again.'});});
export { app };
