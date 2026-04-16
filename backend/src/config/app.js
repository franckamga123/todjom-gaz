// ============================================
// TODJOM GAZ - Configuration Application
// ============================================

require('dotenv').config();

module.exports = {
    // Serveur
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    adminPhone: process.env.ADMIN_PHONE || '+22790000000',

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_change_me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },

    // Commission
    defaultCommissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE) || 5,

    // Livraison
    maxDeliveryTime: parseInt(process.env.MAX_DELIVERY_TIME) || 180, // minutes
    reassignDelay: 60, // minutes avant réassignation
    clientWaitTime: 15, // minutes client injoignable

    // Upload
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5 MB
    },

    // Twilio
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        whatsappFrom: process.env.TWILIO_WHATSAPP_FROM // ex: +14155238886 (Twilio Sandbox)
    },

    // Firebase
    firebase: {
        serverKey: process.env.FCM_SERVER_KEY,
        projectId: process.env.FCM_PROJECT_ID
    },

    // Orange Money
    orangeMoney: {
        apiUrl: process.env.ORANGE_MONEY_API_URL,
        apiKey: process.env.ORANGE_MONEY_API_KEY,
        merchantId: process.env.ORANGE_MONEY_MERCHANT_ID
    },

    // Moov Money
    moovMoney: {
        apiUrl: process.env.MOOV_MONEY_API_URL,
        apiKey: process.env.MOOV_MONEY_API_KEY,
        merchantId: process.env.MOOV_MONEY_MERCHANT_ID
    },

    // Amana Transfert
    amana: {
        apiUrl: process.env.AMANA_API_URL || 'https://api.amanatransfert.net/v1',
        apiKey: process.env.AMANA_API_KEY,
        merchantId: process.env.AMANA_MERCHANT_ID
    },
    
    // My Nita
    myNita: {
        apiUrl: process.env.MY_NITA_API_URL || 'https://api.mynita.ne/v1',
        merchantId: process.env.MY_NITA_MERCHANT_ID,
        apiKey: process.env.MY_NITA_API_KEY,
        callbackUrl: process.env.MY_NITA_CALLBACK_URL || 'https://api.todjomgaz.com/api/payments/callback'
    },

    // Pagination par défaut
    pagination: {
        defaultPage: 1,
        defaultLimit: 20,
        maxLimit: 100
    },

    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10000 // requêtes par fenêtre (augmenté pour le développement)
    },

    // CORS
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://admin.todjomgaz.com', 'https://fournisseur.todjomgaz.com', 'https://app.todjomgaz.com', 'https://portal.todjomgaz.com']
            : [
                'http://localhost:5000', 'http://127.0.0.1:5000',
                'http://localhost:5100', 'http://localhost:5173', 'http://localhost:5300',
                'http://127.0.0.1:5100', 'http://127.0.0.1:5173', 'http://127.0.0.1:5300',
                'http://192.168.1.218:5100', 'http://192.168.1.218:5173', 'http://192.168.1.218:5300',
                'http://192.168.1.218:3000'
              ],
        credentials: true
    }
};
