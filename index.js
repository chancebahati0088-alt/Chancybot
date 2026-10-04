const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false,
        markOnlineOnConnect: false
    })
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (u) => {
        if(u.connection === 'open'){
            console.log("\n✅✅ CONNECTÉ SUR 243988309410 ✅✅\n")
        }
        if(u.connection === 'close'){
            console.log("Connexion fermée, je relance...")
            start()
        }
    })

    if(!state.creds.registered){
        console.log("Attends 20 secondes, je prépare le code...")
        await new Promise(r => setTimeout(r, 20000))
        try{
            const code = await sock.requestPairingCode("243988309410")
            console.log("\n==============================")
            console.log("  CODE: " + code)
            console.log("  Va vite dans WhatsApp >")
            console.log("  Appareils liés > Lier avec")
            console.log("  numéro de téléphone")
            console.log("==============================\n")
            console.log("Tu as 60 secondes pour taper le code !")
        }catch(e){
            console.log("Erreur, WhatsApp a bloqué. Attends 5 min et relance node index.js")
        }
    }
}
start()
