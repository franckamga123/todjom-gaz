// ============================================
// TODJOM GAZ - Routes Utilisateurs (Frontend API)
// /api/users
// ============================================

const router = require('express').Router();
const { Op } = require('sequelize');
const { User, DeliveryProfile, Distributor, Supplier, Brand, Order, Notification } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Helper: user to frontend format
function userToFrontend(user, includeProfile = false) {
  const data = {
    id: user.id,
    phone: user.phone,
    email: user.email || '',
    firstName: user.first_name || '',
    lastName: user.full_name || '',
    fullName: user.full_name || `${user.first_name || ''} ${user.full_name || ''}`.trim(),
    role: (user.role || 'client').toUpperCase(),
    neighborhood: user.neighborhood || '',
    address: user.address || '',
    city: user.neighborhood ? 'Niamey' : '',
    isActive: user.is_active,
    isVerified: user.is_verified,
    approvalStatus: (user.appro_status || user.approval_status || 'pending').toUpperCase(),
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLoginAt: user.last_login_at,
  };

  if (includeProfile) {
    data.driverStatus = (user.approval_status || user.approval_status || 'pending').toUpperCase();
    data.distributorStatus = (user.approval_status || user.approval_status || 'pending').toUpperCase();
    data.supplierStatus = (user.approval_status || user.approval_status || 'pending').toUpperCase();
  }

  return data;
}

// GET /api/users - List users
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};

    if (role && role !== 'TOUS') {
      where.role = role.toLowerCase();
    }

    if (search) {
      const s = search.toLowerCase();
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${s}%` } },
        { full_name: { [Op.iLike]: `%${s}%` } },
        { phone: { [Op.iLike]: `%${s}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'otp_code', 'otp_expires_at', 'refresh_token'] },
    });

    const data = users.map(u => userToFrontend(u, true));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'otp_code', 'otp_expires_at', 'refresh_token'] },
    });
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    res.json({ success: true, data: userToFrontend(user, true) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    const { firstName, lastName, neighborhood, address, mynitaNumber, amanaNumber, full_name } = req.body;

    if (firstName !== undefined) user.first_name = firstName;
    if (lastName !== undefined) user.full_name = lastName;
    if (full_name !== undefined) user.full_name = full_name;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (address !== undefined) user.address = address;

    await user.save();
    res.json({ success: true, data: userToFrontend(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/users/profile - Update own profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    const { neighborhood, address, firstName, lastName } = req.body;
    if (neighborhood) user.neighborhood = neighborhood;
    if (address) user.address = address;
    if (firstName) user.first_name = firstName;
    if (lastName) user.full_name = lastName;

    await user.save();
    res.json({ success: true, data: userToFrontend(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:id/approve - Approve or reject user
router.post('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    if (action === 'APPROVE') {
      user.approval_status = 'approved';
      user.is_active = true;
    } else if (action === 'REJECT') {
      user.approval_status = 'rejected';
      user.is_active = false;
    } else {
      return res.status(400).json({ success: false, error: 'Action invalide' });
    }

    await user.save();

    // Notify user
    await Notification.create({
      user_id: user.id,
      title: action === 'APPROVE' ? 'Compte approuvé' : 'Compte rejeté',
      content: action === 'APPROVE'
        ? 'Votre compte a été approuvé. Vous pouvez maintenant utiliser la plateforme.'
        : 'Votre demande a été rejetée. Contactez le support pour plus d\'informations.',
      type: 'system',
    });

    res.json({ success: true, data: userToFrontend(user, true) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:id/delete - Delete user
router.post('/:id/delete', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    // Don't allow deleting self
    if (user.id === req.userId) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/toggle-online - Toggle user online status
router.put('/:id/toggle-online', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find delivery profile
    const profile = await DeliveryProfile.findOne({ where: { user_id: userId } });
    if (profile) {
      const newStatus = profile.status === 'online' ? 'offline' : 'online';
      profile.status = newStatus;
      profile.is_available = newStatus === 'online';
      await profile.save();
      res.json({ success: true, data: { isOnline: newStatus === 'online' } });
    } else {
      // Create delivery profile if it doesn't exist
      await DeliveryProfile.create({
        user_id: userId,
        status: 'online',
        is_available: true,
      });
      res.json({ success: true, data: { isOnline: true } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
