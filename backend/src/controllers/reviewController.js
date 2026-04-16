// ============================================
// TODJOM GAZ - Contrôleur Reviews & Notifications
// ============================================

const { Review, Order, Distributor, Notification, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// ==================== REVIEWS ====================

/**
 * POST /api/reviews
 * Évaluer un livreur après livraison
 */
exports.createReview = async (req, res, next) => {
    try {
        const { order_id, rating, comment } = req.body;

        const order = await Order.findByPk(order_id);
        if (!order) throw new AppError('Commande non trouvée', 404);
        if (order.client_id !== req.userId) throw new AppError('Non autorisé', 403);
        if (order.status !== 'delivered') throw new AppError('Vous ne pouvez évaluer qu\'une commande livrée', 400);
        if (!order.distributor_id) throw new AppError('Aucun distributeur assigné à cette commande', 400);

        // Vérifier doublon
        const existing = await Review.findOne({ where: { order_id } });
        if (existing) throw new AppError('Vous avez déjà évalué cette commande', 409);

        const review = await Review.create({
            order_id,
            client_id: req.userId,
            distributor_id: order.distributor_id,
            rating,
            comment
        });

        // Recalculer la note moyenne du distributeur
        const avgResult = await Review.findOne({
            attributes: [[require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avg_rating']],
            where: { distributor_id: order.distributor_id },
            raw: true
        });

        await Distributor.update(
            { avg_rating: Math.round((avgResult.avg_rating || 0) * 100) / 100 },
            { where: { id: order.distributor_id } }
        );

        res.status(201).json({
            success: true,
            message: 'Merci pour votre évaluation !',
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reviews/distributor/:distributorId
 * Évaluations d'un distributeur
 */
exports.getDistributorReviews = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: { distributor_id: req.params.distributorId },
            include: [
                { model: User, as: 'client', attributes: ['full_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: { reviews } });
    } catch (error) {
        next(error);
    }
};

// ==================== NOTIFICATIONS ====================

/**
 * GET /api/notifications
 * Notifications de l'utilisateur connecté
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 30, unread_only } = req.query;
        const offset = (page - 1) * limit;
        const where = { user_id: req.userId };

        if (unread_only === 'true') where.is_read = false;

        const { count, rows } = await Notification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const unreadCount = await Notification.count({
            where: { user_id: req.userId, is_read: false }
        });

        res.json({
            success: true,
            data: {
                notifications: rows,
                unread_count: unreadCount,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notifications/:id/read
 * Marquer une notification comme lue
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const notif = await Notification.findOne({
            where: { id: req.params.id, user_id: req.userId }
        });
        if (!notif) throw new AppError('Notification non trouvée', 404);

        notif.is_read = true;
        notif.read_at = new Date();
        await notif.save();

        res.json({ success: true, message: 'Notification lue' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notifications/read-all
 * Marquer toutes les notifications comme lues
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.update(
            { is_read: true, read_at: new Date() },
            { where: { user_id: req.userId, is_read: false } }
        );

        res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
    } catch (error) {
        next(error);
    }
};

// ==================== DISPUTES ====================

/**
 * POST /api/disputes
 * Créer un litige (Client)
 */
exports.createDispute = async (req, res, next) => {
    try {
        const { order_id, type, description } = req.body;

        const order = await Order.findByPk(order_id);
        if (!order) throw new AppError('Commande non trouvée', 404);
        if (order.client_id !== req.userId) throw new AppError('Non autorisé', 403);

        const dispute = await require('../models').Dispute.create({
            order_id,
            raised_by: req.userId,
            type,
            description,
            proof_photo_url: req.body.proof_photo_url || null
        });

        // Notifier les admins
        const admins = await User.findAll({ where: { role: 'admin', is_active: true } });
        for (const admin of admins) {
            await Notification.create({
                user_id: admin.id,
                title: '⚠️ Nouveau litige',
                body: `Litige sur la commande #${order.order_number} - ${type}`,
                channel: 'in_app',
                type: 'new_dispute',
                data: { dispute_id: dispute.id, order_id }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Litige signalé. L\'équipe Todjom va examiner votre demande.',
            data: { dispute }
        });
    } catch (error) {
        next(error);
    }
};
