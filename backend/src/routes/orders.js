// ============================================
// TODJOM GAZ - Routes Commandes
// ============================================

const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, orderValidation, uuidParam } = require('../middleware/validation');

// Toutes les routes nécessitent une authentification
router.use(authenticate);


// Client : flux de commande multi-étapes (Nouveau)
router.post('/initiate-search', authorize('client'), orderController.initiateSearch);
router.post('/:id/search-distributor', authorize('client'), uuidParam, validate, orderController.searchDistributor);
router.post('/:id/finalize-delivery', authorize('client'), uuidParam, validate, orderController.finalizeDelivery);

// Simuler paiement (dev)
router.post('/:id/pay', uuidParam, validate, orderController.confirmPayment);

// Lister commandes (filtré par rôle automatiquement)
router.get('/', orderController.getOrders);

// Détail commande
router.get('/:id', uuidParam, validate, orderController.getOrder);

// Changer statut (fournisseur / distributeur / admin)
router.put('/:id/status', authorize('supplier', 'distributor', 'admin'),
    uuidParam, orderValidation.updateStatus, validate, orderController.updateStatus);

// Annuler commande (client / admin)
router.post('/:id/cancel', authorize('client', 'admin'),
    uuidParam, validate, orderController.cancelOrder);

module.exports = router;
