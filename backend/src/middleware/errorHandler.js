// ============================================
// TODJOM GAZ - Middleware de Gestion d'Erreurs
// ============================================

/**
 * Gestionnaire d'erreurs global
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Erreur Sequelize - Validation
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors
        });
    }

    // Erreur Sequelize - Contrainte unique
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'champ';
        return res.status(409).json({
            success: false,
            message: `Ce ${field} est déjà utilisé`
        });
    }

    // Erreur Sequelize - FK
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Référence invalide vers une ressource inexistante'
        });
    }

    // Erreur personnalisée avec statusCode
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Erreur serveur par défaut
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Erreur interne du serveur'
            : err.message || 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Route non trouvée
 */
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Classe d'erreur personnalisée
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

module.exports = { errorHandler, notFound, AppError };
