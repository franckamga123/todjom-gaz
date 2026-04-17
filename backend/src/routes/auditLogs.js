// ============================================
// TODJOM GAZ - Routes Audit Logs (Frontend API)
// /api/audit-logs
// ============================================

const router = require('express').Router();
const { SystemLog, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/audit-logs - List audit logs
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId, action, date, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (userId) where.user_id = userId;
    if (action) where.action = action;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.created_at = { [require('sequelize').Op.between]: [start, end] };
    }

    const { count, rows } = await SystemLog.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'phone', 'first_name', 'full_name', 'role'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const data = rows.map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action || 'UNKNOWN',
      details: log.details || {},
      user: log.User ? {
        id: log.User.id,
        firstName: log.User.first_name || '',
        lastName: log.User.full_name || '',
        phone: log.User.phone,
        role: (log.User.role || '').toUpperCase(),
      } : null,
      createdAt: log.created_at,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + data.length < count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
