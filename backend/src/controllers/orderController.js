// ============================================
// TODJOM GAZ - Contrôleur Commandes
// ============================================

const { Order, Product, Supplier, Distributor, User, Payment, OrderStatusHistory, Notification, Brand, sequelize, Stock } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/logService');
const { sendOrderNotification } = require('../services/smsService');
const whatsappService = require('../services/whatsappService');
const paymentService = require('../services/paymentService');
const { calculateDistance, calculateDeliveryPrice, calculateEarningsSplit } = require('../services/deliveryService');
const { Op } = require('sequelize');
const config = require('../config/app');

/**
 * POST /api/orders/initiate-search
 * Frais de 500 CFA pour chercher un distributeur
 */
exports.initiateSearch = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { brand_id, weight_kg, delivery_latitude, delivery_longitude, payment_method = 'mynita' } = req.body;

        const brand = await Brand.findByPk(brand_id);
        if (!brand) throw new AppError('Marque non trouvée', 404);

        // Déterminer le prix selon le poids
        let unit_price = 0;
        if (weight_kg === 3) unit_price = brand.price_3kg;
        else if (weight_kg === 6) unit_price = brand.price_6kg;
        else if (weight_kg === 12) unit_price = brand.price_12kg;
        else throw new AppError('Poids de gaz non supporté', 400);

        const order = await Order.create({
            client_id: req.userId,
            brand_id,
            weight_kg,
            search_fee: 500,
            unit_price,
            total_amount: 500, // Paiement initial pour l'orientation
            delivery_latitude,
            delivery_longitude,
            status: 'pending_payment'
        }, { transaction: t });

        // Initiation du paiement réel (My Nita ou Amana)
        let paymentRes;
        if (payment_method === 'amana') {
            paymentRes = await paymentService.initAmanaPayment(500, order.id, req.user.phone);
        } else {
            paymentRes = await paymentService.initMyNitaPayment(500, order.id, req.user.phone);
        }

        await OrderStatusHistory.create({
            order_id: order.id,
            new_status: 'pending_payment',
            changed_by: req.userId,
            note: 'Initialisation recherche (500 CFA)'
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            data: { 
                order, 
                payment_url: paymentRes.payment_url || null,
                transaction_id: paymentRes.transaction_id
            }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * POST /api/orders/:id/search-distributor
 * Deuxième étape: Une fois les 300 CFA payés, on cherche le distributeur
 */
exports.searchDistributor = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: Brand, as: 'brand' }]
        });
        if (!order) throw new AppError('Commande non trouvée', 404);
        
        // 1. Chercher les produits correspondant à la marque et au poids
        const products = await Product.findAll({
            where: {
                brand_id: order.brand_id,
                weight_kg: order.weight_kg,
                stock_quantity: { [Op.gt]: 0 },
                is_available: true
            }
        });

        if (products.length === 0) {
            throw new AppError('Désolé, aucune bouteille n\'est disponible pour cette marque et ce poids actuellement.', 404);
        }

        const productIds = products.map(p => p.id);

        // 2. Chercher les distributeurs qui ont ces produits en stock
        const stocks = await Stock.findAll({
            where: {
                product_id: { [Op.in]: productIds },
                quantity: { [Op.gt]: 0 }
            },
            include: [{
                model: Distributor,
                as: 'distributor',
                where: { is_active: true }
            }]
        });

        if (stocks.length === 0) {
            throw new AppError('Désolé, aucun distributeur n\'a ce gaz en stock proche de vous.', 404);
        }

        // 3. Calculer les distances et trouver le plus proche
        let nearest = { distributor: null, distance: Infinity };

        for (const item of stocks) {
            const dist = item.distributor;
            const distance = calculateDistance(
                order.delivery_latitude, 
                order.delivery_longitude,
                dist.latitude,
                dist.longitude
            );

            if (distance < nearest.distance) {
                nearest = { distributor: dist, distance: distance };
            }
        }

        if (!nearest.distributor) throw new AppError('Aucun distributeur trouvé à proximité.', 404);

        // Mettre à jour la commande
        await order.update({
            distributor_id: nearest.distributor.id,
            status: 'distributor_found'
        });

        // --- NOTIFICATION WHATSAPP RÉELLE ---
        const client = await User.findByPk(order.client_id);
        const distUser = await User.findByPk(nearest.distributor.user_id);
        
        const msg = whatsappService.templates.orderFound(
            client.full_name,
            order.brand.name,
            order.weight_kg,
            nearest.distributor.shop_name,
            distUser.phone
        );
        
        await whatsappService.sendWhatsApp(client.phone, msg);

        res.status(200).json({
            success: true,
            data: { 
                distributor: nearest.distributor, 
                distance_km: nearest.distance.toFixed(2),
                whatsapp_sent: true
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/orders/:id/finalize-delivery
 * Troisième étape: Choix de livraison et paiement final
 */
exports.finalizeDelivery = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { delivery_type } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: Distributor, as: 'distributor' }],
            transaction: t
        });
        
        if (!order) throw new AppError('Commande non trouvée', 404);

        if (delivery_type === 'delivery') {
            // Calculer la distance réelle
            const distance = calculateDistance(
                order.delivery_latitude,
                order.delivery_longitude,
                order.distributor.latitude,
                order.distributor.longitude
            );

            const deliveryPrice = calculateDeliveryPrice(distance);
            const split = calculateEarningsSplit(deliveryPrice);

            order.delivery_fee = deliveryPrice;
            order.delivery_commission_todjom = split.todjom;
            order.delivery_commission_livreur = split.delivery;
            order.total_amount = parseFloat(order.search_fee) + parseFloat(deliveryPrice) + parseFloat(order.unit_price);
        } else {
            // Se déplacer : Paye juste le gaz + service
            order.delivery_fee = 0;
            order.total_amount = parseFloat(order.search_fee) + parseFloat(order.unit_price);
        }

        order.status = 'paid';
        await order.save({ transaction: t });

        await t.commit();
        res.json({ success: true, data: { order } });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * POST /api/orders/:id/pay (Callback de paiement simulé)
 * Simuler un paiement réussi (dev / sandbox)
 */
exports.confirmPayment = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction: t });
        if (!order) throw new AppError('Commande non trouvée', 404);
        if (order.status !== 'pending_payment') throw new AppError('Cette commande n\'est plus en attente de paiement', 400);

        // Mettre à jour le paiement
        const payment = await Payment.findOne({ where: { order_id: order.id, status: 'pending' }, transaction: t });
        if (payment) {
            payment.status = 'completed';
            payment.provider_transaction_id = `SIM-${Date.now()}`;
            payment.provider_response = { simulated: true, timestamp: new Date().toISOString() };
            await payment.save({ transaction: t });
        }

        // Mettre à jour la commande
        const oldStatus = order.status;
        order.status = 'paid';
        await order.save({ transaction: t });

        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: oldStatus,
            new_status: 'paid',
            changed_by: req.userId || null,
            note: 'Paiement confirmé'
        }, { transaction: t });

        // Notifier le fournisseur
        const supplier = await Supplier.findByPk(order.supplier_id, { transaction: t });
        if (supplier) {
            await Notification.create({
                user_id: supplier.user_id,
                title: '🔔 Nouvelle commande',
                body: `Commande #${order.order_number} - ${order.total_amount} CFA. Accepter ou refuser.`,
                channel: 'in_app',
                type: 'new_order',
                data: { order_id: order.id, order_number: order.order_number }
            }, { transaction: t });
        }

        // SMS de confirmation au client
        const client = await User.findByPk(order.client_id, { transaction: t });
        if (client && client.phone) {
            await sendOrderNotification(client.phone, 'paid', order.order_number);
        }

        await t.commit();

        res.json({
            success: true,
            message: 'Paiement confirmé. Le fournisseur a été notifié.',
            data: { order }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * PUT /api/orders/:id/status
 * Changer le statut d'une commande (Fournisseur/Distributeur/Admin)
 */
exports.updateStatus = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { status, note, refuse_reason, distributor_id } = req.body;

        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'client' },
                { model: Supplier, as: 'supplier' },
                { model: Distributor, as: 'distributor' }
            ],
            transaction: t
        });

        if (!order) throw new AppError('Commande non trouvée', 404);

        // Vérifier la transition
        if (!order.canTransitionTo(status)) {
            throw new AppError(`Transition de "${order.status}" vers "${status}" non autorisée`, 400);
        }

        // Vérifications spécifiques
        const oldStatus = order.status;

        switch (status) {
            case 'accepted':
                order.accepted_at = new Date();
                // Calculer l'heure de livraison estimée
                order.estimated_delivery_at = new Date(Date.now() + config.maxDeliveryTime * 60 * 1000);
                break;

            case 'refused':
                if (!refuse_reason) throw new AppError('Motif de refus requis', 400);
                order.refuse_reason = refuse_reason;
                // Remettre le stock
                const product = await Product.findByPk(order.product_id, { transaction: t });
                if (product) {
                    product.stock_quantity += order.quantity;
                    product.is_available = true;
                    await product.save({ transaction: t });
                }
                break;

            case 'assigned':
                if (distributor_id) {
                    order.distributor_id = distributor_id;
                }
                order.assigned_at = new Date();
                break;

            case 'picked_up':
                order.picked_up_at = new Date();
                // Marquer le distributeur en livraison
                if (order.distributor_id) {
                    await Distributor.update(
                        { is_on_delivery: true },
                        { where: { id: order.distributor_id }, transaction: t }
                    );
                }
                break;

            case 'in_delivery':
                break;

            case 'delivered':
                order.delivered_at = new Date();
                order.delivery_photo_url = req.body.delivery_photo_url || null;
                // Libérer le distributeur
                if (order.distributor_id) {
                    const dist = await Distributor.findByPk(order.distributor_id, { transaction: t });
                    if (dist) {
                        dist.is_on_delivery = false;
                        dist.total_deliveries += 1;
                        await dist.save({ transaction: t });
                    }
                }
                // Incrémenter les commandes du fournisseur
                await Supplier.increment('total_orders', { where: { id: order.supplier_id }, transaction: t });
                break;

            case 'cancelled':
                order.cancelled_at = new Date();
                order.cancel_reason = req.body.cancel_reason || note || 'Annulée';
                // Remettre le stock
                const prod = await Product.findByPk(order.product_id, { transaction: t });
                if (prod) {
                    prod.stock_quantity += order.quantity;
                    prod.is_available = true;
                    await prod.save({ transaction: t });
                }
                break;

            case 'failed':
                // Remettre le stock
                const failedProd = await Product.findByPk(order.product_id, { transaction: t });
                if (failedProd) {
                    failedProd.stock_quantity += order.quantity;
                    failedProd.is_available = true;
                    await failedProd.save({ transaction: t });
                }
                break;
        }

        order.status = status;
        await order.save({ transaction: t });

        // Historique
        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: oldStatus,
            new_status: status,
            changed_by: req.userId,
            note: note || null
        }, { transaction: t });

        // Notification au client
        const statusMessages = {
            'accepted': '✅ Votre commande a été acceptée par le fournisseur',
            'refused': '❌ Votre commande a été refusée',
            'assigned': '🚚 Un livreur a été assigné à votre commande',
            'picked_up': '📦 Votre gaz a été récupéré par le livreur',
            'in_delivery': '🏍️ Votre commande est en cours de livraison',
            'delivered': '🎉 Votre commande a été livrée !',
            'cancelled': '⚠️ Votre commande a été annulée',
            'failed': '❌ Échec de la livraison'
        };

        if (statusMessages[status]) {
            await Notification.create({
                user_id: order.client_id,
                title: `Commande #${order.order_number}`,
                body: statusMessages[status],
                channel: 'all',
                type: 'order_status',
                data: { order_id: order.id, status }
            }, { transaction: t });

            // Notification WhatsApp/SMS
            if (order.client && order.client.phone) {
                await sendOrderNotification(order.client.phone, status, order.order_number);
            }
        }

        await t.commit();
        await logAction(req.userId, 'UPDATE_ORDER_STATUS', 'order', order.id, { status: oldStatus }, { status }, req);

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}`,
            data: { order }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * GET /api/orders
 * Lister les commandes (filtré par rôle)
 */
exports.getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, from, to } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        // Filtrer selon le rôle
        if (req.user.role === 'client') {
            where.client_id = req.userId;
        } else if (req.user.role === 'supplier') {
            const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
            if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);
            where.supplier_id = supplier.id;
        } else if (req.user.role === 'distributor') {
            const distributor = await Distributor.findOne({ where: { user_id: req.userId } });
            if (!distributor) throw new AppError('Profil distributeur non trouvé', 404);
            where.distributor_id = distributor.id;
        }
        // Admin voit tout

        if (status) where.status = status;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at[Op.gte] = new Date(from);
            if (to) where.created_at[Op.lte] = new Date(to);
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['id', 'full_name', 'phone'] },
                { model: Product, as: 'product', attributes: ['id', 'gas_type', 'weight_kg', 'price_cfa'] },
                { model: Supplier, as: 'supplier', include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
                { model: Distributor, as: 'distributor', include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                orders: rows,
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
 * GET /api/orders/:id
 * Détail d'une commande
 */
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'client', attributes: ['id', 'full_name', 'phone', 'email'] },
                { model: Product, as: 'product' },
                { model: Supplier, as: 'supplier', include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }] },
                { model: Distributor, as: 'distributor', include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }] },
                { model: Payment, as: 'payments' },
                { model: OrderStatusHistory, as: 'statusHistory', order: [['changed_at', 'ASC']] }
            ]
        });

        if (!order) throw new AppError('Commande non trouvée', 404);

        // Vérifier l'accès
        if (req.user.role === 'client' && order.client_id !== req.userId) {
            throw new AppError('Accès non autorisé', 403);
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/orders/:id/cancel
 * Annuler une commande (Client/Admin)
 */
exports.cancelOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction: t });
        if (!order) throw new AppError('Commande non trouvée', 404);

        // Vérifier le droit d'annulation
        if (req.user.role === 'client' && order.client_id !== req.userId) {
            throw new AppError('Accès non autorisé', 403);
        }

        if (!order.isCancellable()) {
            throw new AppError('Cette commande ne peut plus être annulée (déjà prise en charge)', 400);
        }

        const oldStatus = order.status;
        order.status = 'cancelled';
        order.cancelled_at = new Date();
        order.cancel_reason = req.body.reason || 'Annulée par le client';
        await order.save({ transaction: t });

        // Remettre le stock
        const product = await Product.findByPk(order.product_id, { transaction: t });
        if (product) {
            product.stock_quantity += order.quantity;
            product.is_available = true;
            await product.save({ transaction: t });
        }

        // Historique
        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: oldStatus,
            new_status: 'cancelled',
            changed_by: req.userId,
            note: order.cancel_reason
        }, { transaction: t });

        // Remboursement automatique si déjà payé
        if (['paid', 'accepted', 'assigned'].includes(oldStatus)) {
            const payment = await Payment.findOne({
                where: { order_id: order.id, status: 'completed' },
                transaction: t
            });
            if (payment) {
                payment.status = 'refunded';
                payment.refund_amount = payment.amount;
                payment.refund_reason = 'Annulation client';
                payment.refunded_at = new Date();
                await payment.save({ transaction: t });

                order.status = 'refunded';
                await order.save({ transaction: t });
            }
        }

        await t.commit();

        res.json({
            success: true,
            message: 'Commande annulée avec succès',
            data: { order }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};
