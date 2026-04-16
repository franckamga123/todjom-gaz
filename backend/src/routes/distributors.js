// ============================================
// TODJOM GAZ - Routes Distributeurs
// ============================================

const router = require('express').Router();
const distributorController = require('../controllers/distributorController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes protégées (distributeur)
router.use(authenticate);

router.put('/location', authorize('distributor'), distributorController.updateLocation);
router.put('/availability', authorize('distributor'), distributorController.toggleAvailability);
router.get('/orders', authorize('distributor'), distributorController.getMyDeliveries);
router.get('/stats', authorize('distributor'), distributorController.getMyStats);

// Route système : trouver des distributeurs proches
router.get('/nearby', authorize('supplier', 'admin'), distributorController.getNearby);

module.exports = router;
