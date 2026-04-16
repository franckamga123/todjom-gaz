const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { protect } = require('../middleware/auth');

/**
 * @route POST /api/payments/init
 * @desc Initialiser un paiement pour une commande
 */
router.post('/init', protect, async (req, res) => {
    const { amount, orderId, phone, method = 'mynita' } = req.body;
    
    if (!amount || !orderId) {
        return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    let result;
    if (method === 'amana') {
        result = await paymentService.initAmanaPayment(amount, orderId, phone);
    } else {
        result = await paymentService.initMyNitaPayment(amount, orderId, phone);
    }
    
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

/**
 * @route POST /api/payments/callback
 * @desc Webhook My Nita pour confirmation
 */
router.post('/callback', async (req, res) => {
    const { transaction_id, status } = req.body;
    
    const result = await paymentService.handleCallback(transaction_id, status);
    
    if (result.success) {
        res.status(200).json({ status: 'received' });
    } else {
        res.status(400).json(result);
    }
});

module.exports = router;
