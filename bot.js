const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestWaWebVersion
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");

async function demarrer() {

    const { state, saveCreds } =
        await useMultiFileAuthState("auth_info");

    const { version } =
        await fetchLatestWaWebVersion();

    console.log(
        "🌐 WhatsApp Web :",
        version.join(".")
    );

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {

        const {
            connection,
            lastDisconnect,
            qr
        } = update;

        if (qr) {

            console.log("");
            console.log(
                "📱 SCANNE LE QR CODE AVEC LE DEUXIÈME TÉLÉPHONE"
            );
            console.log("");

            qrcode.generate(qr, {
                small: true
            });
        }

        if (connection === "open") {

            console.log("");
            console.log(
                "✅ CHANCY EST CONNECTÉ À WHATSAPP !"
            );
            console.log("");
        }

        if (connection === "close") {

            console.log("");
            console.log(
                "❌ Connexion fermée."
            );

            if (lastDisconnect) {

                console.log(
                    "Détail :",
                    lastDisconnect.error?.message ||
                    "inconnu"
                );
            }
        }
    });
}

demarrer().catch((erreur) => {

    console.error(
        "❌ Erreur :",
        erreur.message
    );
});
