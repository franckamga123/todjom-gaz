// ============================================
// TODJOM GAZ - Application Express Principale
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/app');
const db = require('./models');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialiser l'application Express
const app = express();

// ============================================
// MIDDLEWARE GLOBAUX
// ============================================

// Sécurité
// app.use(helmet());

// CORS
app.use(cors(config.cors));


// Compression

app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.'
    }
});
app.use('/api/', limiter);

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================
// ROUTES
// ============================================

// Racine du serveur
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #fafafa; height: 100vh;">
            <h1 style="color: #ff8c00;">🔥 TODJOM GAZ API 🔥</h1>
            <p style="color: #666;">Le backend est opérationnel.</p>
            <div style="margin-top: 20px;">
                <a href="/api/health" style="color: #ff8c00; font-weight: bold; text-decoration: none;">Vérifier le statut →</a>
            </div>
        </div>
    `);
});

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'TODJOM GAZ API is running 🔥',
        version: '1.0.0',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

// Routes principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/products'));          // /api/suppliers, /api/products
app.use('/api/distributors', require('./routes/distributors'));
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/emergency', require('./routes/emergencyRoutes')); // Added
app.use('/api/payments', require('./routes/payment'));         // Added
app.use('/api/config', require('./routes/config'));           // Added
app.use('/api/brands', require('./routes/brands'));           // Added
app.use('/api/logs', require('./routes/logs'));               // Added
app.use('/api', require('./routes/misc'));              // /api/reviews, /api/notifications, /api/disputes

// ============================================
// GESTION D'ERREURS
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = config.port;

const startServer = async () => {
    try {
        // Tester la connexion à la base de données
        await db.sequelize.authenticate();
        console.log('✅ Connexion base de données établie avec succès');

        // Synchroniser les modèles (Toujours synchroniser au premier lancement en prod pour créer les tables)
        if (config.nodeEnv === 'development' || process.env.DB_SYNC === 'true') {
            await db.sequelize.sync({ alter: true });
            console.log('✅ Modèles synchronisés');
        }

        // Démarrer le serveur
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║     🔥 TODJOM GAZ API Server                ║
║                                              ║
║     Port:    ${PORT}                            ║
║     Env:     ${config.nodeEnv.padEnd(26)}║
║     DB:      ${config.nodeEnv === 'development' ? 'localhost/todjom_gaz' : 'production'}${' '.repeat(Math.max(0, 18 - (config.nodeEnv === 'development' ? 21 : 10)))}║
║                                              ║
║     API:     http://localhost:${PORT}/api       ║
║     Health:  http://localhost:${PORT}/api/health║
║                                              ║
╚══════════════════════════════════════════════╝
            `);
        });

    } catch (error) {
        console.error('❌ Impossible de démarrer le serveur:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
