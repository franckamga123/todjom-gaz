const router = require('express').Router();
const { User, Supplier } = require('../models');
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

// Middleware commun
router.use(authenticate, authorize('supplier'));

/**
 * GET /api/supplier/stats
 */
router.get('/stats', supplierController.getStats);

/**
 * GET /api/supplier/withdrawals
 */
router.get('/withdrawals', supplierController.getMyWithdrawals);

/**
 * POST /api/supplier/withdrawals
 */
router.post('/withdrawals', supplierController.requestWithdrawal);

/**
 * GET /api/supplier/distributors
 */
router.get('/distributors', supplierController.getAffiliatedDistributors);

/**
 * GET /api/supplier/sales-metrics
 */
router.get('/sales-metrics', supplierController.getSalesMetrics);

/**
 * PUT /api/supplier/profile
 * Mettre à jour le profil fournisseur (Logo)
 */
router.put('/profile', upload.single('logo'), async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil non trouvé', 404);

        if (req.file) {
            supplier.logo_url = `/uploads/${req.file.filename}`;
        }

        // On peut ajouter d'autres champs ici (company_name, registration_number, etc.) if allowed
        // if (req.body.company_name) supplier.company_name = req.body.company_name;

        await supplier.save();

        res.json({
            success: true,
            message: 'Profil mis à jour',
            data: supplier
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
