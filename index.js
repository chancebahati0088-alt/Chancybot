const http = require('http');
http.createServer((req,res)=> res.end('CHANCY-BOT LIVE ✅')).listen(process.env.PORT || 10000, ()=> console.log('KeepAlive OK'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const P = require('pino');
const axios = require('axios');
const mega = require('mega');

// Fonction pour charger la session MEGA
async function loadSession() {
  if (!fs.existsSync('./auth_info_baileys/creds.json')) {
    const sessionId = process.env.SESSION_ID;
    if (sessionId && sessionId.startsWith('mega_')) {
      console.log('🔄 Chargement de la session MEGA...');
      // Le décodage mega se fait ici, garde ton code mega_ tel quel
      const File = require('./mega.js'); // si ton repo a mega.js
      try { await File(sessionId); } catch(e){ console.log('Utilisation directe SESSION_ID'); }
    }
  }
}

async function startBot() {
  await loadSession();
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ["Ubuntu", "Chrome", "20.0"],
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('✅ CHANCY-BOT CONNECTÉ !');
      // charge tes commandes ici
      try { require('./bot')(sock); } catch(e){ try{ require('./handler')(sock); } catch{} }
    }
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('Reconnexion...');
        startBot();
      } else {
        console.log('Déconnecté, supprime auth et recommence');
      }
    }
  });
}

startBot();