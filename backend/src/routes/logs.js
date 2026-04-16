// ============================================
// TODJOM GAZ - Routes Historique (Logs)
// ============================================

const router = require('express').Router();
const { SystemLog } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/logs/me
 * Voir son propre historique d'actions (Immuable)
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const logs = await SystemLog.findAll({
            where: { user_id: req.userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
