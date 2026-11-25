import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { begin, complete, isConfigured, newTransaction, validateTransaction, pushedRequest } from './oidc.js';
import { validateApplication } from './domain.js';

const {Pool}=pg;
const origin=new URL(process.env.APP_ORIGIN||'http://localhost:8080').origin;
const secret=process.env.SESSION_SECRET;
if(!secret||secret.length<32||!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL and a SESSION_SECRET of at least 32 characters');
const secure=origin.startsWith('https:');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
await pool.query(`CREATE TABLE IF NOT EXISTS licence_application (
 id uuid PRIMARY KEY, account varchar(64) NOT NULL, service varchar(16) NOT NULL,
 category varchar(32) NOT NULL, appointment date NOT NULL, licence_reference varchar(32),
 status varchar(24) NOT NULL DEFAULT 'SUBMITTED', created_at timestamptz NOT NULL DEFAULT now()
); CREATE INDEX IF NOT EXISTS licence_application_account_idx ON licence_application(account,created_at DESC)`);
const app=express();
app.disable('x-powered-by');
if(process.env.TRUST_PROXY==='1') app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],formAction:["'self'","https://esignet.mosip-demo.mosip.net"],upgradeInsecureRequests:secure?[]:null}}}));
app.use(express.json({limit:'16kb'}));
app.use('/api',rateLimit({windowMs:60_000,limit:100,standardHeaders:'draft-8',legacyHeaders:false}));
app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.get('origin')!==origin)return res.status(403).json({error:'Invalid request origin'});next();});
const PgStore=connectPgSimple(session);
app.use('/api',session({name:'drivenext.sid',store:new PgStore({pool,createTableIfMissing:true}),secret,resave:false,saveUninitialized:false,cookie:{httpOnly:true,secure,sameSite:'lax',maxAge:30*60_000}}));
const save=req=>new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));
const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
const signedIn=(req,res,next)=>req.session.profile?next():res.status(401).json({error:'Sign in with eSignet first'});
app.get('/api/health',async(req,res)=>{await pool.query('SELECT 1');res.json({status:'UP'});});
app.get('/api/auth/me',(req,res)=>res.json({configured:isConfigured(),profile:req.session.profile?{name:req.session.profile.name,birthdate:req.session.profile.birthdate}:null}));
app.post('/api/auth/start',rateLimit({windowMs:60_000,limit:15}),async(req,res)=>{
  if(!isConfigured())return res.status(503).json({error:'eSignet client onboarding is not configured.'});
  const tx=newTransaction();const config=await begin(tx);req.session.transaction=tx;await save(req);res.json(config);
});
app.post('/api/auth/par',async(req,res)=>{
  validateTransaction(req.session.transaction,req.body?.state);res.json({request_uri:await pushedRequest(req.session.transaction)});
});
app.get('/api/auth/callback',async(req,res)=>{
  try{
    const tx=req.session.transaction;
    validateTransaction(tx,req.query.state);
    delete req.session.transaction;await save(req);
    if(req.query.error||typeof req.query.code!=='string'||!req.query.code)throw new Error('Authorization not completed');
    const profile=await complete(tx,req.query.code);
    await regenerate(req);req.session.profile=profile;await save(req);
    res.redirect(303,'/');
  }catch{res.redirect(303,'/?auth=failed');}
});
app.post('/api/auth/logout',(req,res,next)=>req.session.destroy(err=>{if(err)return next(err);res.clearCookie('drivenext.sid',{httpOnly:true,secure,sameSite:'lax'});res.status(204).end();}));
app.get('/api/applications',signedIn,async(req,res)=>{
  const {rows}=await pool.query('SELECT id,service,category,appointment::text,status,created_at FROM licence_application WHERE account=$1 ORDER BY created_at DESC LIMIT 100',[req.session.profile.account]);res.json(rows);
});
app.post('/api/applications',signedIn,async(req,res)=>{
  let data;try{data=validateApplication(req.body);}catch(e){return res.status(400).json({error:e.message});}
  const {rows}=await pool.query('INSERT INTO licence_application(id,account,service,category,appointment,licence_reference) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,service,category,appointment::text,status,created_at',
    [randomUUID(),req.session.profile.account,data.service,data.category,data.appointment,data.licenceReference]);res.status(201).json(rows[0]);
});
app.use('/api',(req,res)=>res.status(404).json({error:'Not found'}));
app.use(express.static(resolve('dist'),{index:'index.html'}));
app.get('/',(req,res)=>res.sendFile(resolve('dist/index.html')));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);console.error('Request failed:',err.name);res.status(err.status===400?400:500).json({error:'Unable to complete the request. Please try again.'});});
const server=app.listen(Number(process.env.PORT||8080),()=>console.log('DriveNext listening'));
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>server.close(()=>pool.end().finally(()=>process.exit(0))));
