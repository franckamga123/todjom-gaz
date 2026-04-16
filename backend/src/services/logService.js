// ============================================
// TODJOM GAZ - Service de Logging Système
// ============================================

const { SystemLog } = require('../models');

/**
 * Enregistre une action dans les logs système
 */
const logAction = async (userId, action, entityType = null, entityId = null, oldValue = null, newValue = null, req = null) => {
    try {
        await SystemLog.create({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_value: oldValue,
            new_value: newValue,
            ip_address: req ? (req.ip || req.connection?.remoteAddress) : null,
            user_agent: req ? req.headers['user-agent'] : null
        });
    } catch (error) {
        console.error('⚠️ Erreur de logging:', error.message);
    }
};

/**
 * Middleware de logging des actions sensibles
 */
const logMiddleware = (action, entityType = null) => {
    return (req, res, next) => {
        // Stocker l'action pour le logging post-réponse
        req._logAction = action;
        req._logEntityType = entityType;

        const originalJson = res.json.bind(res);
        res.json = function(data) {
            // Logger uniquement les succès
            if (data && data.success !== false && req.user) {
                logAction(
                    req.user.id,
                    req._logAction,
                    req._logEntityType,
                    req.params.id || null,
                    null,
                    null,
                    req
                ).catch(() => {});
            }
            return originalJson(data);
        };

        next();
    };
};

module.exports = { logAction, logMiddleware };
