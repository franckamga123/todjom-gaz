// ============================================
// TODJOM GAZ - Routes Dashboards (Frontend API)
// /api/dashboard
// ============================================

const router = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');
const { Order, User, DeliveryProfile, Payment, Brand, Distributor, Supplier, Notification } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Helper: get today's date range
function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { [Op.gte]: start, [Op.lte]: end };
}

function weekRange() {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { [Op.gte]: start, [Op.lte]: end };
}

// GET /api/dashboard/admin - Admin dashboard stats
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    // User counts by role
    const totalClients = await User.count({ where: { role: 'client' } });
    const totalLivreurs = await User.count({ where: { role: 'delivery' } });
    const totalDistributeurs = await User.count({ where: { role: 'distributor' } });
    const totalFournisseurs = await User.count({ where: { role: 'supplier' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });

    // Pending validations
    const pendingDrivers = await User.count({ where: { role: 'delivery', approval_status: 'pending' } });
    const pendingDistributeurs = await User.count({ where: { role: 'distributor', approval_status: 'pending' } });
    const pendingFournisseurs = await User.count({ where: { role: 'supplier', approval_status: 'pending' } });

    // Order stats
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: { [Op.in]: ['pending_payment', 'paid'] } } });
    const deliveringOrders = await Order.count({ where: { status: { [Op.in]: ['assigned', 'picked_up', 'in_delivery'] } } });
    const completedOrders = await Order.count({ where: { status: 'delivered' } });
    const todayOrders = await Order.count({ where: { created_at: todayRange() } });

    // Revenue
    const allOrders = await Order.findAll({
      attributes: [
        [fn('COALESCE', fn('SUM', col('search_fee')), 0), 'totalSearchFee'],
        [fn('COALESCE', fn('SUM', col('delivery_commission_todjom')), 0), 'totalTodtomFees'],
        [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'totalGasRevenue'],
      ],
      raw: true,
    });

    const todayRevenue = await Order.findAll({
      where: { created_at: todayRange() },
      attributes: [
        [fn('COALESCE', fn('SUM', col('search_fee')), 0), 'todayFees'],
      ],
      raw: true,
    });

    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayRevenue = await Order.findAll({
      where: { created_at: { [Op.gte]: yesterdayStart, [Op.lte]: yesterdayEnd } },
      attributes: [
        [fn('COALESCE', fn('SUM', col('search_fee')), 0), 'yesterdayFees'],
      ],
      raw: true,
    });

    // Online drivers
    const onlineDrivers = await DeliveryProfile.count({ where: { is_available: true, status: 'online' } });

    // Active distributeurs
    const activeDistributeurs = await Distributor.count({ where: { is_active: true } });

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'client', attributes: ['id', 'phone', 'first_name', 'full_name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
      ],
    });

    const stats = {
      users: {
        total: totalClients + totalLivreurs + totalDistributeurs + totalFournisseurs + totalAdmins,
        clients: totalClients,
        livreurs: totalLivreurs,
        distributeurs: totalDistributeurs,
        fournisseurs: totalFournisseurs,
        admins: totalAdmins,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivering: deliveringOrders,
        completed: completedOrders,
        today: todayOrders,
        yesterday: 0,
      },
      revenue: {
        totalTomtomFees: Number(allOrders[0]?.totalTodtomFees || allOrders[0]?.totalSearchFee || 0),
        totalGasRevenue: Number(allOrders[0]?.totalGasRevenue || 0),
        totalAllRevenue: Number(allOrders[0]?.totalSearchFee || 0) + Number(allOrders[0]?.totalGasRevenue || 0),
        today: Number(todayRevenue[0]?.todayFees || 0),
        yesterday: Number(yesterdayRevenue[0]?.yesterdayFees || 0),
      },
      pendingValidations: {
        drivers: pendingDrivers,
        distributors: pendingDistributeurs,
        fournisseurs: pendingFournisseurs,
        total: pendingDrivers + pendingDistributeurs + pendingFournisseurs,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total_amount: Number(o.total_amount),
        search_fee: Number(o.search_fee),
        delivery_fee: Number(o.delivery_fee),
        created_at: o.created_at,
        client: o.client ? {
          id: o.client.id,
          firstName: o.client.first_name || '',
          phone: o.client.phone,
        } : null,
        gasBrand: o.brand ? { id: o.brand.id, name: o.brand.name } : null,
      })),
      onlineDrivers,
      activeDistributeurs,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/dashboard/livreur/:id - Livreur dashboard stats
router.get('/livreur/:id', authenticate, async (req, res) => {
  try {
    const livreurId = req.params.id;

    const profile = await DeliveryProfile.findOne({ where: { user_id: livreurId } });

    const myDeliveries = await Order.findAll({
      where: { delivery_id: profile?.id || livreurId },
    });

    const totalDeliveries = myDeliveries.length;
    const completedDeliveries = myDeliveries.filter(o => ['delivered', 'completed'].includes(o.status)).length;
    
    const todayDeliveries = myDeliveries.filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString() && ['delivered', 'completed'].includes(o.status);
    });

    const weekDeliveries = myDeliveries.filter(o => {
      const d = new Date(o.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && ['delivered', 'completed'].includes(o.status);
    });

    const todayEarnings = todayDeliveries.reduce((sum, o) => sum + Number(o.delivery_commission_livreur || 0), 0);
    const weekEarnings = weekDeliveries.reduce((sum, o) => sum + Number(o.delivery_commission_livreur || 0), 0);
    const totalEarnings = completedDeliveries > 0
      ? myDeliveries.filter(o => ['delivered', 'completed'].includes(o.status)).reduce((sum, o) => sum + Number(o.delivery_commission_livreur || 0), 0)
      : Number(profile?.total_earnings || 0);

    res.json({
      success: true,
      data: {
        deliveries: { total: totalDeliveries, completed: completedDeliveries },
        earnings: { today: todayEarnings, week: weekEarnings, total: totalEarnings },
        livreur: {
          rating: 5.0,
          totalKm: 0,
          vehicleType: profile?.vehicle_type || 'moto',
          status: profile?.status || 'offline',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/dashboard/supplier/:id - Supplier dashboard stats
router.get('/supplier/:id', authenticate, async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findOne({ where: { user_id: supplierId } });

    const allOrders = await Order.findAll({
      where: { supplier_id: supplier?.id || supplierId },
      include: [{ model: Brand, as: 'brand' }],
    });

    const completedOrders = allOrders.filter(o => ['delivered', 'completed'].includes(o.status));
    const pendingOrders = allOrders.filter(o => ['pending_payment', 'paid'].includes(o.status));

    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    // Get affiliated distributors
    const distributors = supplier
      ? await Distributor.findAll({
          include: [{ model: Supplier, where: { id: supplier.id }, through: { attributes: [] } }],
        })
      : [];

    // Low stock alerts (simplified)
    const lowStockAlerts = [];

    // Map supplier orders for the dashboard
    const supplierOrders = allOrders.map(o => ({
      id: o.id,
      distributorId: o.distributor_id,
      supplierId: o.supplier_id,
      status: o.status === 'delivered' ? 'DELIVERED' : o.status === 'paid' ? 'PENDING' : o.status.toUpperCase(),
      totalAmount: Number(o.total_amount || 0),
      items: [{
        id: o.id,
        brandId: o.brand_id,
        volume: `${o.weight_kg}kg`,
        quantity: o.quantity,
        unitPrice: Number(o.unit_price || 0),
        brand: o.brand ? { id: o.brand.id, name: o.brand.name } : null,
      }],
      createdAt: o.created_at,
    }));

    res.json({
      success: true,
      data: {
        revenue: { total: totalRevenue, today: 0, week: 0 },
        orders: { total: allOrders.length, pending: pendingOrders.length, completed: completedOrders.length },
        lowStockAlerts,
        supplierOrders: supplierOrders.slice(0, 20),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/dashboard/distributor/:id - Distributor dashboard stats
router.get('/distributor/:id', authenticate, async (req, res) => {
  try {
    const distributorId = req.params.id;
    const distributor = await Distributor.findOne({ where: { user_id: distributorId } });

    const myOrders = await Order.findAll({
      where: { distributor_id: distributor?.id || distributorId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = myOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= today && d <= endOfDay;
    });

    const completedOrders = myOrders.filter(o => ['delivered', 'completed'].includes(o.status));
    const pendingOrders = myOrders.filter(o => ['pending_payment', 'paid', 'accepted', 'assigned'].includes(o.status));

    const monthRevenue = completedOrders.reduce((sum, o) => sum + Number(o.commission_amount || 0), 0);

    // Stock levels - simplified
    const stockLevels = [];

    res.json({
      success: true,
      data: {
        orders: {
          today: todayOrders.length,
          total: myOrders.length,
          pending: pendingOrders.length,
          completed: completedOrders.length,
        },
        revenue: { total: monthRevenue, month: monthRevenue, today: 0 },
        stockLevels,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
