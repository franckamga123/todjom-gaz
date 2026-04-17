// ============================================
// TODJOM GAZ - Routes Commandes Frontend (endpoints manquants)
// Ces routes sont enregistrées AVANT les routes existantes
// ============================================

const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { Order, Brand, User, Distributor, DeliveryProfile, Notification, Payment } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Helper: map frontend status to backend
function mapToBackend(status) {
  const map = {
    'PENDING': 'pending_payment',
    'SERVICE_FEE_PAID': 'paid',
    'SEARCHING': 'paid',
    'FOUND': 'accepted',
    'ACCEPTED': 'accepted',
    'PICKED_UP': 'picked_up',
    'IN_TRANSIT': 'in_delivery',
    'DELIVERING': 'in_delivery',
    'DELIVERED': 'delivered',
    'COMPLETED': 'delivered',
    'CANCELLED': 'cancelled',
    'RETURNED': 'delivered',
  };
  return map[status] || status;
}

// Helper: map backend status to frontend
function mapToFrontend(status) {
  const map = {
    'pending_payment': 'PENDING',
    'paid': 'SERVICE_FEE_PAID',
    'accepted': 'FOUND',
    'refused': 'CANCELLED',
    'assigned': 'ACCEPTED',
    'picked_up': 'PICKED_UP',
    'in_delivery': 'DELIVERING',
    'delivered': 'DELIVERED',
    'cancelled': 'CANCELLED',
    'failed': 'CANCELLED',
    'refunded': 'CANCELLED',
    'completed': 'COMPLETED',
  };
  return map[status] || status.toUpperCase();
}

// Helper: order to frontend format
function orderToFrontend(order, includes) {
  const data = {
    id: order.id,
    orderNumber: order.order_number,
    status: mapToFrontend(order.status),
    clientId: order.client_id,
    distributorId: order.distributor_id,
    supplierId: order.supplier_id,
    brandId: order.brand_id,
    livreurId: order.delivery_id,
    volume: order.weight_kg ? `${order.weight_kg}kg` : '6kg',
    gasPrice: Number(order.unit_price || 0),
    serviceFee: Number(order.search_fee || 500),
    deliveryFee: Number(order.delivery_fee || 0),
    totalAmount: Number(order.total_amount || 0),
    quantity: order.quantity || 1,
    clientAddress: order.delivery_address,
    clientLatitude: order.delivery_latitude ? Number(order.delivery_latitude) : null,
    clientLongitude: order.delivery_longitude ? Number(order.delivery_longitude) : null,
    paymentMethod: order.payment_method || 'MYNITA',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    delivery: order.deliverer ? {
      id: order.deliverer.id,
      status: mapToFrontend(order.status),
      livreurId: order.deliverer.user_id,
      vehicleType: order.deliverer.vehicle_type,
    } : null,
    gasBrand: order.brand ? {
      id: order.brand.id,
      name: order.brand.name,
      logoUrl: order.brand.logo_url,
      price3kg: Number(order.brand.price_3kg || 0),
      price6kg: Number(order.brand.price_6kg || 0),
      price12_5kg: Number(order.brand.price_12kg || 0),
    } : null,
  };

  if (order.client) {
    data.client = {
      id: order.client.id,
      firstName: order.client.first_name || '',
      lastName: order.client.full_name || '',
      phone: order.client.phone,
    };
  }

  if (order.distributor) {
    data.distributor = {
      id: order.distributor.id,
      shopName: order.distributor.shop_name,
      address: order.distributor.address,
    };
  }

  return data;
}

// POST /api/orders - Create order (frontend style)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      clientId, gasBrandId, volume, clientAddress,
      clientLatitude, clientLongitude, serviceFee, gasPrice, paymentMethod,
    } = req.body;

    if (!clientId || !gasBrandId) {
      return res.status(400).json({ success: false, error: 'clientId et gasBrandId requis' });
    }

    // Parse volume (e.g., "6kg" → 6)
    const weightKg = parseInt(volume) || 6;

    const order = await Order.create({
      client_id: clientId,
      brand_id: gasBrandId,
      weight_kg: weightKg,
      quantity: 1,
      unit_price: gasPrice || 0,
      total_amount: (gasPrice || 0) + (serviceFee || 500),
      commission_rate: 15,
      commission_amount: Math.round((gasPrice || 0) * 0.15),
      supplier_amount: Math.round((gasPrice || 0) * 0.85),
      search_fee: serviceFee || 500,
      delivery_fee: 0,
      delivery_commission_livreur: 0,
      delivery_commission_todjom: 0,
      status: 'pending_payment',
      delivery_address: clientAddress || '',
      delivery_latitude: clientLatitude || null,
      delivery_longitude: clientLongitude || null,
    });

    const created = await Order.findByPk(order.id, {
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url', 'price_3kg', 'price_6kg', 'price_12kg'] },
      ],
    });

    res.status(201).json({ success: true, data: orderToFrontend(created) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders - List orders (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { clientId, distributorId, status } = req.query;
    const where = {};

    if (clientId) where.client_id = clientId;
    if (distributorId) where.distributor_id = distributorId;
    if (status) where.status = mapToBackend(status);

    const orders = await Order.findAll({
      where,
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url', 'price_3kg', 'price_6kg', 'price_12kg'] },
        { model: User, as: 'client', attributes: ['id', 'phone', 'first_name', 'full_name'] },
        { model: DeliveryProfile, as: 'deliverer', attributes: ['id', 'user_id', 'vehicle_type'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const data = orders.map(o => orderToFrontend(o));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/:id - Get order detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url', 'price_3kg', 'price_6kg', 'price_12kg'] },
        { model: User, as: 'client', attributes: ['id', 'phone', 'first_name', 'full_name', 'latitude', 'longitude'] },
        { model: User, as: 'distributor_user', attributes: ['id', 'phone', 'first_name', 'full_name'] },
        { model: DeliveryProfile, as: 'deliverer', attributes: ['id', 'user_id', 'vehicle_type', 'total_earnings', 'delivery_count'] },
        { model: Distributor, as: 'distributor', attributes: ['id', 'shop_name', 'address', 'latitude', 'longitude'] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    res.json({ success: true, data: orderToFrontend(order) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/pay-service-fee - Pay service fee
router.put('/:id/pay-service-fee', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    order.status = 'paid';
    await order.save();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Frais de service payés' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/choose-delivery - Choose delivery type
router.put('/:id/choose-delivery', authenticate, async (req, res) => {
  try {
    const { deliveryType } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    if (deliveryType === 'DELIVERY') {
      // Calculate delivery fee based on distance
      const distance = req.body.distance || 3;
      const deliveryFee = Math.ceil(distance / 2) * 500;
      order.delivery_fee = deliveryFee;
      order.delivery_commission_livreur = Math.round(deliveryFee * 0.65);
      order.delivery_commission_todjom = Math.round(deliveryFee * 0.35);
    }

    order.status = 'accepted';
    order.accepted_at = new Date();
    await order.save();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: { ...orderToFrontend(updated), deliveryDistance: req.body.distance || 3 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/pay-gas - Pay gas and delivery fee
router.put('/:id/pay-gas', authenticate, async (req, res) => {
  try {
    const { deliveryFee, gasPaymentMethod, deliveryFeeMethod } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    if (deliveryFee) {
      order.delivery_fee = deliveryFee;
      order.delivery_commission_livreur = Math.round(deliveryFee * 0.65);
      order.delivery_commission_todjom = Math.round(deliveryFee * 0.35);
    }

    order.total_amount = Number(order.unit_price || 0) + Number(order.search_fee || 500) + Number(order.delivery_fee || 0);
    order.status = 'assigned';
    order.assigned_at = new Date();
    await order.save();

    // Create payment record
    await Payment.create({
      order_id: order.id,
      amount: order.total_amount,
      method: (gasPaymentMethod || deliveryFeeMethod || 'my_nita').toLowerCase().replace(' ', '_'),
      status: 'completed',
      transaction_ref: `TDG-${Date.now()}`,
    });

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Paiement confirmé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/validate-receipt - Client validates receipt
router.put('/:id/validate-receipt', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    order.status = 'completed';
    await order.save();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Réception validée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/accept-distributor - Distributor accepts order
router.put('/:id/accept-distributor', authenticate, async (req, res) => {
  try {
    const { distributorId } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    order.distributor_id = distributorId;
    order.status = 'accepted';
    order.accepted_at = new Date();
    await order.save();

    // Notify client
    await Notification.create({
      user_id: order.client_id,
      title: 'Distributeur trouvé',
      content: 'Un distributeur a accepté votre commande. Choisissez votre mode de livraison.',
      type: 'order_update',
    });

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Commande acceptée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/reject-distributor - Distributor rejects order
router.put('/:id/reject-distributor', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    // Keep status as paid so the system can find another distributor
    order.distributor_id = null;
    // status stays 'paid' (SERVICE_FEE_PAID)
    await order.save();

    res.json({ success: true, message: 'Commande rejetée, recherche en cours...' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/validate-pickup - Distributor validates gas pickup by livreur
router.put('/:id/validate-pickup', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    order.status = 'picked_up';
    order.picked_up_at = new Date();
    await order.save();

    // Notify client
    await Notification.create({
      user_id: order.client_id,
      title: 'Gaz en route',
      content: 'Le livreur a récupéré le gaz. Il est en route vers vous.',
      type: 'order_update',
    });

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Gaz remis au livreur' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id/validate-return - Distributor validates bottle return
router.put('/:id/validate-return', authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    order.status = 'completed';
    await order.save();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: Brand, as: 'brand' }],
    });

    res.json({ success: true, data: orderToFrontend(updated), message: 'Bouteille retournée, commande terminée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
