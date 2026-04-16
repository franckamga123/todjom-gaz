// ============================================
// TODJOM GAZ - Contrôleur Distributeur
// ============================================

const { Distributor, Order, User, Supplier, Product, Review, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * PUT /api/distributors/location
 * Mettre à jour la position GPS du distributeur
 */
exports.updateLocation = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;
        
        const distributor = await Distributor.findOne({ where: { user_id: req.userId } });
        if (!distributor) throw new AppError('Profil distributeur non trouvé', 404);

        distributor.current_latitude = latitude;
        distributor.current_longitude = longitude;
        distributor.last_location_update = new Date();
        await distributor.save();

        res.json({ success: true, message: 'Position mise à jour' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/distributors/availability
 * Basculer la disponibilité du distributeur
 */
exports.toggleAvailability = async (req, res, next) => {
    try {
        const distributor = await Distributor.findOne({ where: { user_id: req.userId } });
        if (!distributor) throw new AppError('Profil distributeur non trouvé', 404);

        distributor.is_available = !distributor.is_available;
        await distributor.save();

        res.json({
            success: true,
            message: distributor.is_available ? 'Vous êtes maintenant disponible' : 'Vous êtes hors ligne',
            data: { is_available: distributor.is_available }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/distributors/orders
 * Commandes assignées au distributeur
 */
exports.getMyDeliveries = async (req, res, next) => {
    try {
        const distributor = await Distributor.findOne({ where: { user_id: req.userId } });
        if (!distributor) throw new AppError('Profil distributeur non trouvé', 404);

        const { status } = req.query;
        const where = { distributor_id: distributor.id };

        if (status) {
            where.status = status;
        } else {
            // Par défaut : commandes actives
            where.status = { [Op.in]: ['assigned', 'picked_up', 'in_delivery'] };
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['full_name', 'phone', 'address', 'latitude', 'longitude'] },
                { model: Product, as: 'product', attributes: ['gas_type', 'weight_kg'] },
                { model: Supplier, as: 'supplier', include: [{ model: User, as: 'user', attributes: ['full_name', 'phone', 'address'] }] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, data: { orders } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/distributors/stats
 * Statistiques du distributeur
 */
exports.getMyStats = async (req, res, next) => {
    try {
        const distributor = await Distributor.findOne({ where: { user_id: req.userId } });
        if (!distributor) throw new AppError('Profil distributeur non trouvé', 404);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [deliveriesToday, earningsToday, avgRating] = await Promise.all([
            Order.count({ where: { distributor_id: distributor.id, status: 'delivered', delivered_at: { [Op.gte]: today } } }),
            Order.sum('delivery_fee', { where: { distributor_id: distributor.id, status: 'delivered', delivered_at: { [Op.gte]: today } } }),
            Review.findOne({
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
                where: { distributor_id: distributor.id },
                raw: true
            })
        ]);

        res.json({
            success: true,
            data: {
                total_deliveries: distributor.total_deliveries,
                total_earnings: distributor.total_earnings,
                deliveries_today: deliveriesToday,
                earnings_today: earningsToday || 0,
                avg_rating: Math.round((avgRating?.avg || 0) * 10) / 10,
                is_available: distributor.is_available
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/distributors/nearby
 * Trouver les distributeurs les plus proches (Système/Fournisseur)
 */
exports.getNearby = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query;
        if (!latitude || !longitude) throw new AppError('Coordonnées requises', 400);

        const distributors = await Distributor.findAll({
            where: {
                is_available: true,
                is_on_delivery: false,
                current_latitude: { [Op.ne]: null },
                current_longitude: { [Op.ne]: null }
            },
            include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }]
        });

        // Calculer les distances et filtrer par rayon
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const R = 6371;

        const nearby = distributors
            .map(d => {
                const dLat = (parseFloat(d.current_latitude) - lat) * Math.PI / 180;
                const dLon = (parseFloat(d.current_longitude) - lng) * Math.PI / 180;
                const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(lat * Math.PI / 180) * Math.cos(parseFloat(d.current_latitude) * Math.PI / 180) *
                    Math.sin(dLon / 2) ** 2;
                const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return { ...d.toJSON(), distance_km: Math.round(distance * 10) / 10 };
            })
            .filter(d => d.distance_km <= radius)
            .sort((a, b) => a.distance_km - b.distance_km);

        res.json({ success: true, data: { distributors: nearby } });
    } catch (error) {
        next(error);
    }
};
