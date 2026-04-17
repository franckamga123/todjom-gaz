// ============================================
// TODJOM GAZ - Routes Paiements (complément)
// Ajoute GET /api/payments pour lister les paiements
// ============================================

const router = require('express').Router();
const { Payment, Order } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/payments - List all payments
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          attributes: ['id', 'order_number', 'status'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    const data = payments.map(p => ({
      id: p.id,
      orderId: p.order_id,
      orderNumber: p.order?.order_number,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      transactionRef: p.transaction_ref,
      createdAt: p.created_at,
      type: p.method.includes('delivery') || p.method.includes('livraison') ? 'DELIVERY_FEE'
        : p.method.includes('service') ? 'SERVICE_FEE'
        : 'GAS_FEE',
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
