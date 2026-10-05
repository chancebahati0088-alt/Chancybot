const http = require('http');
http.createServer((req,res)=>{res.end('CHANCY-BOT LIVE ✅')}).listen(process.env.PORT||10000,()=>console.log('KeepAlive OK'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const { File } = require('megajs');

async function loadMegaSession() {
  const sessionId = process.env.SESSION_ID;
  if (!sessionId) return console.log('Pas de SESSION_ID');
  if (fs.existsSync('./auth_info_baileys/creds.json')) return console.log('Session déjà là');
  try {
    console.log('🔄 Chargement MEGA...');
    const code = sessionId.replace('mega_','');
    const [fileId, key] = code.split('#');
    if(!fileId || !key) throw new Error('Format mega_ invalide');
    const file = File.fromURL(`https://mega.nz/file/${fileId}#${key}`);
    const buffer = await file.downloadBuffer();
    fs.mkdirSync('./auth_info_baileys', { recursive: true });
    fs.writeFileSync('./auth_info_baileys/creds.json', buffer);
    console.log('✅ Session MEGA OK');
  } catch(e){ console.log('❌ Erreur MEGA:', e.message); }
}

async function start() {
  await loadMegaSession();
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser: ["Ubuntu","Chrome","20.0"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    const { connection, lastDisconnect } = u;
    if(connection==='open') console.log('✅ CHANCY-BOT CONNECTÉ SUR WHATSAPP !');
    if(connection==='close'){
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if(reason !== DisconnectReason.loggedOut) start();
    }
  });
  sock.ev.on('messages.upsert', async ()=>{}); // tu ajouteras les commandes après
}
start();