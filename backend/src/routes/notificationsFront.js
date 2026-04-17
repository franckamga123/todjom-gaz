// ============================================
// TODJOM GAZ - Routes Notifications (Frontend API)
// /api/notifications
// ============================================

const router = require('express').Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications/:userId - Get user notifications
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.content,
          isRead: n.is_read,
          type: n.type,
          createdAt: n.created_at,
        })),
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/notifications/:userId - Mark all as read
router.put('/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    res.json({ success: true, message: 'Notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
