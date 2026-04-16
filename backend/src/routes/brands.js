// ============================================
// TODJOM GAZ - Routes Marques de Gaz
// ============================================

const router = require('express').Router();
const brandController = require('../controllers/brandController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', brandController.getAllBrands);

// Admin Only
router.post('/', authenticate, authorize('admin', 'super_admin'), brandController.createBrand);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), brandController.updateBrand);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), brandController.deleteBrand);

module.exports = router;
