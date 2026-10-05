const { File } = require('megajs');
const fs = require('fs');

module.exports = async (code) => {
  try {
    const [fileId, key] = code.replace('mega_', '').split('#');
    const file = File.fromURL(`https://mega.nz/file/${fileId}#${key}`);
    const data = await file.downloadBuffer();
    fs.mkdirSync('./auth_info_baileys', { recursive: true });
    fs.writeFileSync('./auth_info_baileys/creds.json', data);
    console.log('✅ Session MEGA restaurée !');
  } catch(e){
    console.log('❌ Erreur MEGA:', e.message);
  }
}