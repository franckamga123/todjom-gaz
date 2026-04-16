const twilio = require('twilio');

// Ces variables devront être renseignées dans le fichier .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Numéro Twilio Sandbox par défaut

const client = twilio(accountSid, authToken);

/**
 * Envoie un message WhatsApp
 * @param {string} to - Numéro de téléphone (format international : +227XXXXXXXX)
 * @param {string} message - Contenu du message
 */
exports.sendWhatsApp = async (to, message) => {
    try {
        // S'assurer que le numéro commence par whatsapp:
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        
        const response = await client.messages.create({
            body: message,
            from: fromWhatsApp,
            to: formattedTo
        });
        
        console.log(`✅ WhatsApp envoyé à ${to} [SID: ${response.sid}]`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error(`❌ Erreur WhatsApp vers ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Templates de messages TODJOM
 */
exports.templates = {
    orderFound: (clientName, brand, weight, distName, phone) => 
        `🔥 *TODJOM GAZ - Distributeur Trouvé !*\n\nBonjour ${clientName},\n\nBonne nouvelle ! Votre gaz *${brand} (${weight}kg)* est disponible chez :\n\n📍 *${distName}*\n📞 Tél: ${phone}\n\nVous pouvez vous y rendre ou demander une livraison depuis l'app.`,
    
    newOrderAlert: (distName, weight) => 
        `🔔 *TODJOM ALERT - NOUVEAU CLIENT*\n\nBonjour ${distName},\n\nUn client à proximité cherche une bouteille de *${weight}kg*. \n\nOuvrez votre terminal TODJOM pour valider la requête !`,
        
    deliveryAssigned: (orderId, address) => 
        `🚚 *TODJOM - Mission de Livraison*\n\nMission #${orderId.split('-')[0]}\nDestination: ${address}\n\nPrêt pour la course ? Validez dans l'app !`
};
