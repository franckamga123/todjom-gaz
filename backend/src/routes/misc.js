// ============================================
// TODJOM GAZ - Routes Reviews & Notifications
// ============================================

const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const miscController = require('../controllers/miscController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, reviewValidation, disputeValidation } = require('../middleware/validation');

// Routes Publiques
router.get('/banners', miscController.getPublicBanners);
router.get('/settings/public', miscController.getPublicSettings);
router.get('/safety-centers/public', miscController.getPublicSafetyCenters);

router.use(authenticate);

// Reviews
router.post('/reviews', authorize('client'), reviewValidation.create, validate, reviewController.createReview);
router.get('/reviews/distributor/:distributorId', reviewController.getDistributorReviews);

// Notifications
router.get('/notifications', reviewController.getNotifications);
router.put('/notifications/:id/read', reviewController.markAsRead);
router.put('/notifications/read-all', reviewController.markAllAsRead);

// Disputes (client)
router.post('/disputes', authorize('client'), disputeValidation.create, validate, reviewController.createDispute);

module.exports = router;
