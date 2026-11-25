import { app } from './app.js';
const server=app.listen(Number(process.env.PORT||8080),()=>console.log('DriveNext listening'));
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>server.close(()=>process.exit(0)));
