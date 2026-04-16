// ============================================
// TODJOM GAZ - Routes Admin
// ============================================

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { logMiddleware } = require('../services/logService');
const upload = require('../middleware/upload');

// Toutes les routes admin nécessitent auth + rôle admin
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Gestion utilisateurs
router.get('/users', adminController.getUsers);
router.post('/users', logMiddleware('CREATE_USER', 'user'), adminController.createUser);
router.put('/users/:id', logMiddleware('UPDATE_USER', 'user'), adminController.updateUser);
router.put('/users/:id/toggle', logMiddleware('TOGGLE_USER', 'user'), adminController.toggleUser);
router.put('/users/:id/approve', logMiddleware('APPROVE_USER', 'user'), adminController.approveUser);
router.delete('/users/:id', logMiddleware('DELETE_USER', 'user'), adminController.deleteUser);

// Validation fournisseurs
router.put('/suppliers/:id/validate', logMiddleware('VALIDATE_SUPPLIER', 'supplier'), adminController.validateSupplier);

// Catalogue & Produits
router.get('/products', adminController.getAdminProducts);
router.put('/products/:id', logMiddleware('UPDATE_PRODUCT', 'product'), adminController.updateAdminProduct);


// Paramètres système
router.get('/settings', adminController.getSettings);
router.put('/settings', logMiddleware('UPDATE_SETTINGS', 'settings'), adminController.updateSettings);

// Litiges
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id/resolve', logMiddleware('RESOLVE_DISPUTE', 'dispute'), adminController.resolveDispute);

// Logs
router.get('/logs', adminController.getLogs);

// Urgences
router.get('/emergencies', adminController.getEmergencies);
router.put('/emergencies/:id', logMiddleware('RESPOND_EMERGENCY', 'emergency'), adminController.updateEmergencyStatus);

// Codes Promo
router.get('/promo-codes', adminController.getPromoCodes);
router.post('/promo-codes', logMiddleware('CREATE_PROMO', 'promo_code'), adminController.createPromoCode);
router.put('/promo-codes/:id/toggle', logMiddleware('TOGGLE_PROMO', 'promo_code'), adminController.togglePromoCode);

// Véhicules
router.get('/vehicles', adminController.getVehicles);

// Bannières
router.get('/banners', adminController.getBanners);
router.post('/banners', upload.single('image'), logMiddleware('CREATE_BANNER', 'banner'), adminController.createBanner);
router.delete('/banners/:id', logMiddleware('DELETE_BANNER', 'banner'), adminController.deleteBanner);

// Retraits
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:id', logMiddleware('PROCESS_WITHDRAWAL', 'withdrawal'), adminController.updateWithdrawalStatus);

// Sécurité (Centres)
router.get('/safety-centers', adminController.getSafetyCenters);
router.post('/safety-centers', logMiddleware('CREATE_SAFETY', 'safety_center'), adminController.createSafetyCenter);
router.delete('/safety-centers/:id', logMiddleware('DELETE_SAFETY', 'safety_center'), adminController.deleteSafetyCenter);

// Rapports
router.get('/reports/stats', adminController.getReportStats);

module.exports = router;

