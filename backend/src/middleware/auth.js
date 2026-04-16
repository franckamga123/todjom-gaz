// ============================================
// TODJOM GAZ - Middleware d'Authentification
// ============================================

const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/app');
const { User } = require('../models');

/**
 * Vérifie le token JWT et attache l'utilisateur à req.user
 */
const authenticate = async (req, res, next) => {
    const fs = require('fs');
    const log = (msg) => fs.appendFileSync('debug.log', `[${new Date().toISOString()}] AUTH: ${msg}\n`);
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            log('Missing token');
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtConfig.secret);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            log(`User ID ${decoded.id} not found in DB`);
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé. Contactez l\'administrateur.'
            });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré. Veuillez vous reconnecter.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        next(error);
    }
};

/**
 * Vérifie que l'utilisateur a un des rôles requis
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const fs = require('fs');
        const log = (msg) => fs.appendFileSync('debug.log', `[${new Date().toISOString()}] AUTH: ${msg}\n`);
        if (!req.user) {
            log('User not found on request');
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé pour votre rôle'
            });
        }

        next();
    };
};

/**
 * Authentification optionnelle (n'échoue pas si pas de token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, jwtConfig.secret);
            const user = await User.findByPk(decoded.id);
            if (user && user.is_active) {
                req.user = user;
                req.userId = user.id;
            }
        }
    } catch (e) {
        // Silently ignore - optional auth
    }
    next();
};

module.exports = { authenticate, protect: authenticate, authorize, optionalAuth };
