let instance;
export default async function handler(req,res) {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    res.setHeader('Cache-Control','no-store');
    if(req.method==='GET' && new URL(req.url,'http://localhost').pathname==='/api/auth/me') return res.status(200).json({configured:false,profile:null});
    return res.status(503).json({error:'Portal database and session configuration are required.'});
  }
  try {
    instance ||= import('../server/app.js').then(module=>module.app);
    const app=await instance;
    return app(req,res);
  } catch(error) {
    instance=undefined;
    console.error('API initialization failed:',error.name);
    return res.status(503).json({error:'Portal API is temporarily unavailable.'});
  }
}
