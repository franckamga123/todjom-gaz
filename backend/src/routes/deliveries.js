// ============================================
// TODJOM GAZ - Routes Livraisons (Frontend API)
// /api/deliveries
// ============================================

const router = require('express').Router();
const { Op } = require('sequelize');
const { Order, DeliveryProfile, User, Brand, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

// Helper: order to frontend delivery format
function orderToDelivery(order) {
  return {
    id: order.id,
    status: mapStatus(order.status),
    orderId: order.id,
    livreurId: order.delivery_id,
    distributorId: order.distributor_id,
    clientId: order.client_id,
    brandId: order.brand_id,
    weightKg: order.weight_kg,
    deliveryFee: Number(order.delivery_fee) || 0,
    livreurCommission: Number(order.delivery_commission_livreur) || 0,
    tomtomCommission: Number(order.delivery_commission_todjom) || 0,
    clientAddress: order.delivery_address,
    clientLatitude: order.delivery_latitude ? Number(order.delivery_latitude) : null,
    clientLongitude: order.delivery_longitude ? Number(order.delivery_longitude) : null,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    // Include related data if available
    order: order.dataValues.order || {
      id: order.id,
      gasBrand: order.brand ? { id: order.brand.id, name: order.brand.name } : null,
      distributor: order.distributor_user || order.distributor ? {
        id: order.distributor_id,
        firstName: order.distributor_user?.first_name || '',
        lastName: order.distributor_user?.full_name || '',
        businessName: order.distributor?.shop_name || '',
        businessAddress: order.distributor?.address || '',
        businessLatitude: order.distributor?.latitude ? Number(order.distributor.latitude) : null,
        businessLongitude: order.distributor?.longitude ? Number(order.distributor.longitude) : null,
        phone: order.distributor_user?.phone || '',
      } : null,
      client: order.client_user ? {
        id: order.client_id,
        firstName: order.client_user.first_name || '',
        lastName: order.client_user.full_name || '',
        phone: order.client_user.phone || '',
        latitude: order.client_user.latitude ? Number(order.client_user.latitude) : null,
        longitude: order.client_user.longitude ? Number(order.client_user.longitude) : null,
      } : null,
      clientAddress: order.delivery_address,
      volume: `${order.weight_kg}kg`,
      status: mapStatus(order.status),
    },
  };
}

// Map backend status to frontend status
function mapStatus(status) {
  const map = {
    'pending_payment': 'PENDING',
    'paid': 'SERVICE_FEE_PAID',
    'accepted': 'ACCEPTED',
    'refused': 'REJECTED',
    'assigned': 'ACCEPTED',
    'picked_up': 'PICKED_UP',
    'in_delivery': 'IN_TRANSIT',
    'delivered': 'DELIVERED',
    'cancelled': 'CANCELLED',
    'failed': 'CANCELLED',
    'refunded': 'CANCELLED',
    'completed': 'RETURNED',
  };
  return map[status] || status;
}

// Map frontend status to backend status
function mapToBackendStatus(status) {
  const map = {
    'PENDING': 'pending_payment',
    'SERVICE_FEE_PAID': 'paid',
    'ACCEPTED': 'accepted',
    'PICKED_UP': 'picked_up',
    'IN_TRANSIT': 'in_delivery',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'RETURNED': 'delivered',
    'AVAILABLE': 'paid',
  };
  return map[status] || status;
}

// GET /api/deliveries - List deliveries
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, livreurId } = req.query;
    const where = {};

    if (status) {
      where.status = mapToBackendStatus(status);
    }

    // If looking for available deliveries
    if (status === 'AVAILABLE') {
      where.status = 'paid'; // Orders that are paid but not yet assigned a livreur
      where.delivery_id = null;
    }

    if (livreurId) {
      where.delivery_id = livreurId;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'phone', 'first_name', 'full_name', 'latitude', 'longitude'] },
        { model: User, as: 'distributor_user', attributes: ['id', 'phone', 'first_name', 'full_name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const deliveries = orders.map(orderToDelivery);
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/deliveries/:id - Get single delivery
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'phone', 'first_name', 'full_name', 'latitude', 'longitude'] },
        { model: User, as: 'distributor_user', attributes: ['id', 'phone', 'first_name', 'full_name'] },
        { model: DeliveryProfile, as: 'deliverer', attributes: ['id', 'vehicle_type', 'total_earnings', 'delivery_count'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, error: 'Livraison non trouvée' });
    res.json({ success: true, data: orderToDelivery(order) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deliveries/:id/accept - Livreur accepts a delivery
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const { livreurId } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    if (order.delivery_id) return res.status(400).json({ success: false, error: 'Cette commande a déjà un livreur' });

    // Verify livreur profile exists
    const livreur = await DeliveryProfile.findOne({ where: { user_id: livreurId } });
    if (!livreur) return res.status(400).json({ success: false, error: 'Profil livreur non trouvé' });

    order.delivery_id = livreur.id;
    order.status = 'assigned';
    order.assigned_at = new Date();
    await order.save();

    // Notify client
    await Notification.create({
      user_id: order.client_id,
      title: 'Livreur assigné',
      content: 'Un livreur a été assigné à votre commande de gaz.',
      type: 'order_update',
    });

    const updated = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client' },
        { model: Brand, as: 'brand' },
      ],
    });

    res.json({ success: true, data: orderToDelivery(updated), message: 'Livraison acceptée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deliveries/:id/pickup - Livreur picks up gas from distributor
router.put('/:id/pickup', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    if (!['assigned', 'accepted'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'La commande doit être assignée d\'abord' });
    }

    order.status = 'picked_up';
    order.picked_up_at = new Date();
    await order.save();

    // Notify client
    await Notification.create({
      user_id: order.client_id,
      title: 'Gaz récupéré',
      content: 'Le livreur a récupéré le gaz. Il est en route vers vous.',
      type: 'order_update',
    });

    const updated = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client' },
        { model: Brand, as: 'brand' },
      ],
    });

    res.json({ success: true, data: orderToDelivery(updated), message: 'Gaz récupéré' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deliveries/:id/complete - Livreur completes delivery
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    if (!['picked_up', 'in_delivery'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Le gaz doit être récupéré d\'abord' });
    }

    order.status = 'delivered';
    order.delivered_at = new Date();
    await order.save();

    // Update livreur stats
    if (order.delivery_id) {
      await DeliveryProfile.increment({
        delivery_count: 1,
        total_earnings: Number(order.delivery_commission_livreur) || 0,
      }, { where: { id: order.delivery_id } });
    }

    // Notify client
    await Notification.create({
      user_id: order.client_id,
      title: 'Livraison effectuée',
      content: 'Votre gaz a été livré. Veuillez confirmer la réception.',
      type: 'order_update',
    });

    const updated = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client' },
        { model: Brand, as: 'brand' },
      ],
    });

    res.json({ success: true, data: orderToDelivery(updated), message: 'Livraison effectuée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deliveries/:id/return - Livreur returns empty bottle
router.put('/:id/return', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, error: 'La livraison doit être effectuée d\'abord' });
    }

    // Mark as completed (returned)
    order.status = 'completed';
    await order.save();

    const updated = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client' },
        { model: Brand, as: 'brand' },
      ],
    });

    res.json({ success: true, data: orderToDelivery(updated), message: 'Bouteille retournée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
