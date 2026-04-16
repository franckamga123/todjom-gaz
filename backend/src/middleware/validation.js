// ============================================
// TODJOM GAZ - Middleware de Validation
// ============================================

const { validationResult, body, param, query } = require('express-validator');

/**
 * Exécute les résultats de validation et renvoie les erreurs
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg
            }))
        });
    }
    next();
};

// ============================================
// Règles de validation par module
// ============================================

const authValidation = {
    register: [
        body('phone').notEmpty().withMessage('Numéro de téléphone requis')
            .matches(/^\+?[0-9]{8,15}$/).withMessage('Format de téléphone invalide'),
        body('email').optional().isEmail().withMessage('Email invalide'),
        body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
        body('full_name').notEmpty().withMessage('Nom complet requis')
            .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères'),
        body('role').optional().isIn(['client', 'supplier', 'distributor'])
            .withMessage('Rôle invalide')
    ],
    login: [
        body('login').notEmpty().withMessage('Email ou téléphone requis'),
        body('password').notEmpty().withMessage('Mot de passe requis')
    ],
    verifyOTP: [
        body('phone').notEmpty().withMessage('Numéro de téléphone requis'),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Code OTP invalide (6 chiffres)')
    ],
    forgotPassword: [
        body('login').notEmpty().withMessage('Email ou téléphone requis')
    ],
    resetPassword: [
        body('token').notEmpty().withMessage('Token requis'),
        body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    ]
};

const productValidation = {
    create: [
        body('gas_type').notEmpty().withMessage('Type de gaz requis'),
        body('weight_kg').isIn([6, 12, 15]).withMessage('Poids invalide (6, 12 ou 15 kg)'),
        body('price_cfa').isFloat({ min: 0 }).withMessage('Prix invalide'),
        body('stock_quantity').isInt({ min: 0 }).withMessage('Stock invalide')
    ],
    update: [
        body('gas_type').optional().notEmpty().withMessage('Type de gaz requis'),
        body('weight_kg').optional().isIn([6, 12, 15]).withMessage('Poids invalide'),
        body('price_cfa').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
        body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock invalide')
    ]
};

const orderValidation = {
    create: [
        body('product_id').isUUID().withMessage('ID produit invalide'),
        body('supplier_id').isUUID().withMessage('ID fournisseur invalide'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('Quantité invalide'),
        body('delivery_latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
        body('delivery_longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
        body('delivery_address').notEmpty().withMessage('Adresse de livraison requise'),
        body('payment_method').isIn(['orange_money', 'moov_money', 'my_nita', 'amana_bank', 'card'])
            .withMessage('Méthode de paiement invalide')
    ],
    updateStatus: [
        body('status').isIn([
            'accepted', 'refused', 'assigned', 'picked_up',
            'in_delivery', 'delivered', 'cancelled', 'failed'
        ]).withMessage('Statut invalide'),
        body('note').optional().isString(),
        body('refuse_reason').optional().isString()
    ]
};

const reviewValidation = {
    create: [
        body('order_id').isUUID().withMessage('ID commande invalide'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5 requise'),
        body('comment').optional().isString().isLength({ max: 500 })
    ]
};

const disputeValidation = {
    create: [
        body('order_id').isUUID().withMessage('ID commande invalide'),
        body('type').isIn(['quantity', 'quality', 'delay', 'non_delivery', 'other'])
            .withMessage('Type de litige invalide'),
        body('description').notEmpty().withMessage('Description requise')
    ],
    resolve: [
        body('resolution').notEmpty().withMessage('Résolution requise'),
        body('status').isIn(['resolved', 'closed']).withMessage('Statut invalide')
    ]
};

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide')
];

const uuidParam = [
    param('id').isUUID().withMessage('ID invalide')
];

module.exports = {
    validate,
    authValidation,
    productValidation,
    orderValidation,
    reviewValidation,
    disputeValidation,
    paginationValidation,
    uuidParam
};
