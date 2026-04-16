// ============================================
// TODJOM GAZ - Routes Produits & Fournisseurs
// ============================================

const router = require('express').Router();
const productController = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, productValidation, uuidParam } = require('../middleware/validation');

const upload = require('../middleware/upload');

// Routes publiques / semi-publiques
router.get('/products/public', optionalAuth, productController.getAllPublicProducts);
router.get('/suppliers', optionalAuth, productController.getSuppliers);
router.get('/suppliers/:supplierId/products', productController.getSupplierProducts);

// Routes protégées (fournisseur)
router.get('/products', authenticate, authorize('supplier'), productController.getMyProducts);
router.post('/products', authenticate, authorize('supplier'),
    upload.single('image'),
    productValidation.create, validate, productController.createProduct);
router.put('/products/:id', authenticate, authorize('supplier'),
    uuidParam, upload.single('image'), 
    productValidation.update, validate, productController.updateProduct);
router.delete('/products/:id', authenticate, authorize('supplier'),
    uuidParam, validate, productController.deleteProduct);

module.exports = router;
