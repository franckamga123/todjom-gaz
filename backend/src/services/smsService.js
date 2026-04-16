// ============================================
// TODJOM GAZ - Service SMS (Twilio)
// ============================================

const twilio = require('twilio');
const config = require('../config/app');

let client = null;

// Initialiser le client Twilio si les identifiants sont présents
if (config.twilio.accountSid && config.twilio.authToken) {
    client = twilio(config.twilio.accountSid, config.twilio.authToken);
}

/**
 * Envoyer un SMS via Twilio
 * @param {string} to - Numéro de téléphone du destinataire (format international)
 * @param {string} message - Contenu du message
 */
exports.sendSMS = async (to, message) => {
    try {
        if (!client) {
            console.log(`[SIMULATION SMS] Vers ${to}: ${message}`);
            return { success: true, simulated: true };
        }

        // Assurer le format international (+227 pour le Niger par défaut si manquant)
        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) {
            formattedTo = `+227${formattedTo}`;
        }

        const response = await client.messages.create({
            body: message,
            from: config.twilio.phoneNumber,
            to: formattedTo
        });

        console.log(`[SMS TWILIO] Envoyé à ${formattedTo}: ${response.sid}`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('[SMS TWILIO ERROR]', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Envoyer un message WhatsApp via Twilio
 * @param {string} to - Numéro de téléphone (ex: 227XXXXXXXX)
 * @param {string} message - Contenu
 */
exports.sendWhatsApp = async (to, message) => {
    try {
        if (!client) {
            console.log(`[SIMULATION WHATSAPP] Vers ${to}: ${message}`);
            return { success: true, simulated: true };
        }

        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) formattedTo = `+227${formattedTo}`;

        const response = await client.messages.create({
            body: message,
            from: `whatsapp:${config.twilio.whatsappFrom || config.twilio.phoneNumber}`,
            to: `whatsapp:${formattedTo}`
        });

        console.log(`[WHATSAPP TWILIO] Envoyé à ${formattedTo}: ${response.sid}`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('[WHATSAPP TWILIO ERROR]', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Message type pour les étapes de la commande (SMS + WhatsApp)
 */
exports.sendOrderNotification = async (phone, status, orderNumber, useWhatsApp = true) => {
    const messages = {
        'paid': `🔥 *TODJOM GAZ*\n\nFrais de 300F reçus pour la commande #${orderNumber}.\n\nNous recherchons actuellement le distributeur le plus proche de vous. Merci de patienter.`,
        'accepted': `✅ *TODJOM GAZ*\n\nVotre commande #${orderNumber} a été acceptée par le distributeur.\n\nUn livreur va être assigné pour votre livraison.`,
        'assigned': `🚚 *TODJOM GAZ*\n\nLe livreur est assigné à votre commande #${orderNumber}.\n\nIl arrive bientôt ! Assurez-vous d'être disponible au numéro ${phone}.`,
        'picked_up': `📦 *TODJOM GAZ*\n\nVotre bouteille est en route !\n\nLe livreur a récupéré votre commande au dépôt.`,
        'delivered': `🎉 *TODJOM GAZ*\n\nLivraison terminée pour la commande #${orderNumber}.\n\nMerci de votre confiance et à bientôt sur TODJOM GAZ ! 🔥`,
        'cancelled': `❌ *TODJOM GAZ*\n\nVotre commande #${orderNumber} a malheureusement été annulée.`
    };

    if (messages[status] && phone) {
        // Envoyer par SMS
        await this.sendSMS(phone, messages[status].replace(/\*/g, '')); // Enlever le gras markdown pour le SMS
        
        // Envoyer par WhatsApp si demandé
        if (useWhatsApp) {
            await this.sendWhatsApp(phone, messages[status]);
        }
        return { success: true };
    }
};
