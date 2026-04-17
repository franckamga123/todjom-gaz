// ============================================
// TODJOM GAZ - Routes Distributeurs (complément - liste)
// /api/distributors (GET list)
// ============================================

const router = require('express').Router();
const { Distributor, User, Brand, SupplierDistributor } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/distributors-list - List all distributors (public)
router.get('/', authenticate, async (req, res) => {
  try {
    const distributors = await Distributor.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'phone', 'first_name', 'full_name', 'neighborhood'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const data = distributors.map(d => ({
      id: d.user_id, // Use user_id as the ID for frontend compatibility
      firstName: d.user?.first_name || '',
      lastName: d.user?.full_name || '',
      phone: d.user?.phone || '',
      neighborhood: d.user?.neighborhood || '',
      city: 'Niamey',
      businessName: d.shop_name || '',
      businessAddress: d.address || '',
      businessLatitude: d.latitude ? Number(d.latitude) : null,
      businessLongitude: d.longitude ? Number(d.longitude) : null,
      isActive: d.is_active,
      avgRating: Number(d.avg_rating || 0),
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
