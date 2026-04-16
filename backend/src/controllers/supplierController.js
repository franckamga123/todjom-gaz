const { User, Supplier, Withdrawal, Order, GasStock, Product, Distributor, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/logService');
const { Op } = require('sequelize');

/**
 * GET /api/supplier/withdrawals
 */
exports.getMyWithdrawals = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const withdrawals = await Withdrawal.findAll({
            where: { supplier_id: supplier.id },
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, data: withdrawals });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/supplier/withdrawals
 */
exports.requestWithdrawal = async (req, res, next) => {
    try {
        const { amount, payment_method, payment_details } = req.body;
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        if (amount < 5000) throw new AppError('Le montant minimum de retrait est de 5000 FCFA', 400);

        // Validation du solde (Théorique ici, on pourrait calculer via les commandes COMPLETED)
        const withdrawal = await Withdrawal.create({
            supplier_id: supplier.id,
            amount,
            payment_method,
            payment_details,
            status: 'PENDING'
        });

        await logAction(req.userId, 'REQUEST_WITHDRAWAL', 'withdrawal', withdrawal.id, null, withdrawal, req);

        res.status(201).json({ success: true, message: 'Demande de retrait envoyée', data: withdrawal });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/supplier/stats
 */
exports.getStats = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const totalOrders = await Order.count({ where: { supplier_id: supplier.id } });
        const completedOrders = await Order.findAll({ 
            where: { supplier_id: supplier.id, status: 'COMPLETED' } 
        });

        const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
        
        // Commission
        const siteEarnings = totalRevenue * (supplier.commission_rate / 100);
        const myRevenue = totalRevenue - siteEarnings;

        res.json({
            success: true,
            data: {
                totalOrders,
                completedOrders: completedOrders.length,
                totalRevenue,
                myRevenue,
                commission: supplier.commission_rate
            }
        });
    } catch (error) {
        next(error);
    }
};
/**
 * GET /api/supplier/distributors
 * Liste des distributeurs affiliés avec leurs niveaux de stocks
 */
exports.getAffiliatedDistributors = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const distributors = await Distributor.findAll({
            include: [
                {
                    model: User, as: 'user',
                    attributes: ['id', 'full_name', 'phone', 'address', 'latitude', 'longitude']
                },
                {
                    model: GasStock, as: 'inventory',
                    include: [{
                        model: Product, as: 'product',
                        where: { supplier_id: supplier.id } // Uniquement les produits de ce fournisseur
                    }]
                }
            ]
        });

        res.json({ success: true, data: distributors });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/supplier/sales-metrics
 * Statistiques détaillées des ventes (sorties) par produit et par zone
 */
exports.getSalesMetrics = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        // Ventes par type de produit
        const salesByProduct = await Order.findAll({
            where: { supplier_id: supplier.id, status: 'delivered' },
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
            ],
            include: [{ model: Product, as: 'product', attributes: ['gas_type', 'weight_kg'] }],
            group: ['product_id', 'product.id']
        });

        res.json({ success: true, data: { salesByProduct } });
    } catch (error) {
        next(error);
    }
};
