// ============================================
// TODJOM GAZ - Routes Authentification
// ============================================

const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, authValidation } = require('../middleware/validation');

// Routes publiques
router.post('/register', authValidation.register, validate, authController.register);
router.post('/login', authValidation.login, validate, authController.login);
router.post('/verify-otp', authValidation.verifyOTP, validate, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authValidation.forgotPassword, validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Routes protégées
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

module.exports = router;
