/**
 * TODJOM GAZ - Test de Notification WhatsApp
 * Envoie un message de test au numéro configuré dans .env ou passé en argument.
 */

const { sendWhatsApp } = require('../src/services/smsService');
require('dotenv').config();

const main = async () => {
    const testPhone = process.argv[2] || process.env.ADMIN_PHONE;
    
    if (!testPhone) {
        console.error('❌ Veuillez fournir un numéro de téléphone (ex: node test_whatsapp.js +227XXXXXXXX)');
        return;
    }

    console.log(`🚀 Tentative d'envoi WhatsApp vers : ${testPhone}...`);
    
    try {
        const result = await sendWhatsApp(testPhone, '🚀 Hello from *TODJOM GAZ*!\n\nCeci est un message de test pour valider la configuration de votre sandbox Twilio.\n\n✅ Si vous recevez ce message, l\'intégration est opérationnelle.');
        console.log('✅ Message envoyé avec succès !');
        console.log('ID Message:', result.sid);
    } catch (error) {
        console.error('❌ Échec de l\'envoi :', error.message);
        if (error.code === 21608) {
            console.warn('\n💡 Rappel : Votre sandbox Twilio nécessite que le destinataire envoie d\'abord "join [votre-code]" au numéro Twilio.');
        }
    }
};

main();
