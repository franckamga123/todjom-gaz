// ============================================
// TODJOM GAZ - Contrôleur Admin
// ============================================

const { User, Supplier, Distributor, Order, Payment, Review, Dispute, Notification, SystemLog, Setting, Product, Emergency, Vehicle, PromoCode, Banner, Withdrawal, SafetyCenter, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/logService');
const { sendSMS, sendWhatsApp } = require('../services/smsService');
const { Op, fn, col, literal } = require('sequelize');



/**
 * GET /api/admin/dashboard
 * KPIs et statistiques du tableau de bord
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Stats globales
        const [
            totalUsers,
            totalClients,
            totalSuppliers,
            totalDistributors,
            totalOrders,
            ordersToday,
            pendingSuppliers,
            openDisputes
        ] = await Promise.all([
            User.count({ where: { is_active: true } }),
            User.count({ where: { role: 'client', is_active: true } }),
            Supplier.count({ where: { is_validated: true } }),
            Distributor.count(),
            Order.count(),
            Order.count({ where: { created_at: { [Op.gte]: today } } }),
            Supplier.count({ where: { is_validated: false } }),
            Dispute.count({ where: { status: { [Op.in]: ['open', 'investigating'] } } })
        ]);

        // Chiffre d'affaires total
        const revenueResult = await Order.findOne({
            attributes: [
                [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_revenue'],
                [fn('COALESCE', fn('SUM', col('commission_amount')), 0), 'total_commission']
            ],
            where: { status: 'delivered' }
        });

        // Commandes par jour (30 derniers jours)
        const ordersPerDay = await Order.findAll({
            attributes: [
                [fn('DATE', col('created_at')), 'date'],
                [fn('COUNT', '*'), 'count']
            ],
            where: { created_at: { [Op.gte]: thirtyDaysAgo } },
            group: [fn('DATE', col('created_at'))],
            order: [[fn('DATE', col('created_at')), 'ASC']],
            raw: true
        });

        // Répartition par type de gaz
        const gasByType = await Order.findAll({
            attributes: [
                [fn('COUNT', '*'), 'count']
            ],
            include: [{
                model: Product, as: 'product',
                attributes: ['weight_kg']
            }],
            where: { status: { [Op.notIn]: ['cancelled', 'refunded'] } },
            group: ['product.weight_kg'],
            raw: true
        });

        // Délai moyen de livraison (minutes)
        const avgDeliveryTime = await Order.findOne({
            attributes: [
                [fn('AVG', fn('TIMESTAMPDIFF', literal('MINUTE'), col('created_at'), col('delivered_at'))), 'avg_minutes']
            ],
            where: { status: 'delivered', delivered_at: { [Op.ne]: null } },
            raw: true
        });

        // Taux de livraison dans les délais
        const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
        const onTimeOrders = await Order.count({
            where: {
                status: 'delivered',
                delivered_at: { [Op.ne]: null },
                estimated_delivery_at: { [Op.ne]: null },
                [Op.and]: [
                    sequelize.where(col('delivered_at'), Op.lte, col('estimated_delivery_at'))
                ]
            }
        });

        // Taux d'annulation
        const cancelledOrders = await Order.count({
            where: { status: { [Op.in]: ['cancelled', 'refunded'] } }
        });

        // CA par fournisseur (top 5)
        const revenueBySupplier = await Order.findAll({
            attributes: [
                [fn('SUM', col('Order.total_amount')), 'revenue'],
                [fn('COUNT', '*'), 'order_count']
            ],
            include: [{
                model: Supplier, as: 'supplier',
                attributes: ['company_name']
            }],
            where: { status: 'delivered' },
            group: ['supplier.id', 'supplier.company_name'],
            order: [[fn('SUM', col('Order.total_amount')), 'DESC']],
            limit: 5,
            raw: true
        });

        // Alertes d'urgence récentes
        const recentEmergencies = await Emergency.findAll({
            where: { status: 'NOUVEAU' },
            include: [{ model: User, as: 'client', attributes: ['full_name', 'phone'] }],
            order: [['created_at', 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });

        // Dernières commandes/transactions
        const recentOrders = await Order.findAll({
            limit: 5,
            include: [
                { model: User, as: 'client', attributes: ['full_name'] },
                { model: Supplier, as: 'supplier', attributes: ['company_name'] }
            ],
            order: [['created_at', 'DESC']],
            raw: true,
            nest: true
        });

        res.json({
            success: true,
            data: {
                overview: {
                    total_users: totalUsers,
                    total_clients: totalClients,
                    total_suppliers: totalSuppliers,
                    total_distributors: totalDistributors,
                    total_orders: totalOrders,
                    orders_today: ordersToday,
                    pending_suppliers: pendingSuppliers,
                    open_disputes: openDisputes,
                    emergency_alerts: recentEmergencies.length
                },
                financial: {
                    total_revenue: parseInt(revenueResult?.getDataValue('total_revenue') || 0),
                    total_commission: parseInt(revenueResult?.getDataValue('total_commission') || 0),
                    currency: 'CFA'
                },
                performance: {
                    avg_delivery_time_minutes: Math.round(avgDeliveryTime?.avg_minutes || 0),
                    on_time_rate: deliveredOrders > 0 ? Math.round(onTimeOrders / deliveredOrders * 100) : 0,
                    cancellation_rate: totalOrders > 0 ? Math.round(cancelledOrders / totalOrders * 100) : 0
                },
                charts: {
                    orders_per_day: ordersPerDay,
                    gas_by_type: gasByType,
                    revenue_by_supplier: revenueBySupplier
                },
                recent_emergencies: recentEmergencies,
                recent_orders: recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users
 * Liste des utilisateurs avec filtres
 */
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, search, is_active } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (role) where.role = role;
        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (search) {
            where[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                users: rows,
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
 * PUT /api/admin/users/:id/toggle
 * Activer/Désactiver un utilisateur
 */
exports.toggleUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new AppError('Utilisateur non trouvé', 404);
        if (user.role === 'admin') throw new AppError('Impossible de désactiver un admin', 400);

        const oldActive = user.is_active;
        user.is_active = !user.is_active;
        await user.save();

        await logAction(req.userId, user.is_active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            'user', user.id, { is_active: oldActive }, { is_active: user.is_active }, req);

        res.json({
            success: true,
            message: user.is_active ? 'Utilisateur activé' : 'Utilisateur désactivé',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id/approve
 * Approuver un utilisateur (Livreur/Fournisseur/Boutique)
 */
exports.approveUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new AppError('Utilisateur non trouvé', 404);

        user.approval_status = 'approved';
        user.is_active = true;
        user.is_verified = true;
        await user.save();

        // Créer une notification
        await Notification.create({
            user_id: user.id,
            title: '✅ Compte approuvé !',
            body: 'Votre contrat a été validé par TODJOM. Vous pouvez maintenant commencer votre activité.',
            channel: 'in_app',
            type: 'account_approved'
        });

        // SMS d'approbation
        if (user.phone) {
            await sendSMS(user.phone, `TODJOM GAZ: Votre compte a été approuvé ! Vous pouvez maintenant vous connecter et commencer à travailler. Bienvenue ! 🔥`);
        }

        await logAction(req.userId, 'APPROVE_USER', 'user', user.id, null, { approval_status: 'approved' }, req);

        res.json({
            success: true,
            message: 'Utilisateur approuvé avec succès',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id
 * Modifier un utilisateur
 */
exports.updateUser = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { full_name, phone, email, role, is_active, is_verified, ...extraData } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) throw new AppError('Utilisateur non trouvé', 404);

        // Mise à jour de base
        user.full_name = full_name || user.full_name;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.role = role || user.role;
        if (is_active !== undefined) user.is_active = is_active;
        if (is_verified !== undefined) user.is_verified = is_verified;

        await user.save({ transaction: t });

        // Mise à jour des profils liés
        if (user.role === 'supplier') {
            await Supplier.upsert({
                user_id: user.id,
                company_name: extraData.company_name || user.full_name,
                commission_rate: extraData.commission_rate || 5
            }, { transaction: t });
        } else if (user.role === 'distributor') {
            await Distributor.upsert({
                user_id: user.id,
                vehicle_type: extraData.vehicle_type || 'Moto',
                vehicle_plate: extraData.vehicle_plate || 'N/A'
            }, { transaction: t });
        }

        await t.commit();
        await logAction(req.userId, 'UPDATE_USER', 'user', user.id, null, req.body, req);

        res.json({ success: true, message: 'Utilisateur mis à jour', data: { user } });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * DELETE /api/admin/users/:id
 * Supprimer définitivement un utilisateur (Purge)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new AppError('Utilisateur non trouvé', 404);
        if (user.role === 'admin') throw new AppError('Impossible de supprimer un admin', 400);

        await user.destroy();
        await logAction(req.userId, 'DELETE_USER', 'user', req.params.id, user, null, req);

        res.json({ success: true, message: 'Utilisateur supprimé définitivement' });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users
 * Créer un utilisateur (Admin, Fournisseur, Distributeur, Client)
 */
exports.createUser = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { 
            full_name, phone, email, password, role,
            company_name, commission_rate,
            vehicle_type, vehicle_plate 
        } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ 
            where: { [Op.or]: [{ phone }, { email: email || null }] } 
        });
        if (existingUser) throw new AppError('Un utilisateur avec ce téléphone ou email existe déjà', 400);

        // Créer l'utilisateur
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password || 'Todjom123!', 10);

        const user = await User.create({
            full_name,
            phone,
            email,
            password: hashedPassword,
            role,
            is_active: true,
            is_verified: true
        }, { transaction: t });

        // Créer le profil spécifique
        if (role === 'supplier') {
            await Supplier.create({
                user_id: user.id,
                company_name: company_name || full_name,
                commission_rate: commission_rate || 5,
                is_validated: true,
                validated_at: new Date(),
                validated_by: req.userId
            }, { transaction: t });
        } else if (role === 'distributor') {
            await Distributor.create({
                user_id: user.id,
                vehicle_type: vehicle_type || 'Moto',
                vehicle_plate: vehicle_plate || 'N/A',
                status: 'available'
            }, { transaction: t });
        }

        await t.commit();

        await logAction(req.userId, 'CREATE_USER', 'user', user.id, null, { role, full_name }, req);

        res.status(201).json({
            success: true,
            message: `Utilisateur ${role} créé avec succès`,
            data: { user: { id: user.id, full_name, phone, role } }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * PUT /api/admin/suppliers/:id/validate
 * Valider un fournisseur
 */
exports.validateSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });
        if (!supplier) throw new AppError('Fournisseur non trouvé', 404);

        supplier.is_validated = true;
        supplier.validated_at = new Date();
        supplier.validated_by = req.userId;
        await supplier.save();

        // Notifier le fournisseur
        await Notification.create({
            user_id: supplier.user_id,
            title: '✅ Compte validé',
            body: 'Votre compte fournisseur a été validé. Vous pouvez maintenant recevoir des commandes.',
            channel: 'in_app',
            type: 'account_validated'
        });

        await logAction(req.userId, 'VALIDATE_SUPPLIER', 'supplier', supplier.id, null, null, req);

        res.json({
            success: true,
            message: 'Fournisseur validé avec succès',
            data: { supplier }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/settings
 * Modifier les paramètres système
 */
exports.updateSettings = async (req, res, next) => {
    try {
        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            await Setting.upsert({
                key,
                value: JSON.stringify(value),
                updated_by: req.userId
            });
        }

        await logAction(req.userId, 'UPDATE_SETTINGS', 'settings', null, null, updates, req);

        const settings = await Setting.findAll();
        res.json({
            success: true,
            message: 'Paramètres mis à jour',
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/settings
 */
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await Setting.findAll();
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });

        res.json({ success: true, data: { settings: settingsMap } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/logs
 * Logs système avec filtres
 */
exports.getLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, action, user_id, from, to } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (action) where.action = { [Op.like]: `%${action}%` };
        if (user_id) where.user_id = user_id;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at[Op.gte] = new Date(from);
            if (to) where.created_at[Op.lte] = new Date(to);
        }

        const { count, rows } = await SystemLog.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['full_name', 'role'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                logs: rows,
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
 * GET /api/admin/disputes
 * Litiges
 */
exports.getDisputes = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (status) where.status = status;

        const { count, rows } = await Dispute.findAndCountAll({
            where,
            include: [
                { model: Order, as: 'order', attributes: ['order_number', 'total_amount', 'status'] },
                { model: User, as: 'raisedByUser', attributes: ['full_name', 'phone'] },
                { model: User, as: 'resolvedByUser', attributes: ['full_name'], required: false }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });
        

        res.json({
            success: true,
            data: {
                disputes: rows,
                pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/disputes/:id/resolve
 * Résoudre un litige
 */
exports.resolveDispute = async (req, res, next) => {
    try {
        const dispute = await Dispute.findByPk(req.params.id);
        if (!dispute) throw new AppError('Litige non trouvé', 404);

        dispute.resolution = req.body.resolution;
        dispute.status = req.body.status || 'resolved';
        dispute.resolved_by = req.userId;
        dispute.resolved_at = new Date();
        await dispute.save();

        await logAction(req.userId, 'RESOLVE_DISPUTE', 'dispute', dispute.id, null, { resolution: dispute.resolution }, req);

        res.json({
            success: true,
            message: 'Litige résolu',
            data: { dispute }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users
 * Créer un utilisateur manuellement par l'admin
 */
exports.createUser = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { phone, email, password, full_name, role, is_active = true, is_verified = true, ...extraData } = req.body;

        if (!phone || !password || !full_name || !role) {
            throw new AppError('Données incomplètes (téléphone, mot de passe, nom et rôle requis)', 400);
        }

        // Vérifier doublon
        const existing = await User.findOne({
            where: {
                [Op.or]: [
                    { phone },
                    ...(email ? [{ email }] : [])
                ]
            }
        });
        if (existing) {
            throw new AppError('Un compte existe déjà avec ce numéro ou email', 409);
        }

        // Créer l'utilisateur
        const user = await User.create({
            phone,
            email,
            password_hash: password, // Sera haché par le hook beforeCreate du modèle User
            full_name,
            role,
            is_active,
            is_verified
        }, { transaction: t });

        // Créer le profil étendu selon le rôle
        if (role === 'supplier') {
            await Supplier.create({
                user_id: user.id,
                company_name: extraData.company_name || full_name,
                registration_number: extraData.registration_number || null,
                is_validated: true,
                commission_rate: extraData.commission_rate || 5
            }, { transaction: t });
        } else if (role === 'distributor') {
            await Distributor.create({
                user_id: user.id,
                vehicle_type: extraData.vehicle_type || 'Moto',
                vehicle_plate: extraData.vehicle_plate || null,
                is_available: true,
                is_validated: true
            }, { transaction: t });
        }

        await t.commit();

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: { user: user.toJSON() }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * GET /api/admin/emergencies
 * Liste de toutes les alertes d'urgence
 */
exports.getEmergencies = async (req, res, next) => {
    try {
        const emergencies = await Emergency.findAll({
            include: [{ model: User, as: 'client', attributes: ['full_name', 'phone'] }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: emergencies
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/emergencies/:id
 * Mettre à jour le statut d'une urgence
 */
exports.updateEmergencyStatus = async (req, res, next) => {
    try {
        const emergency = await Emergency.findByPk(req.params.id);
        if (!emergency) throw new AppError('Urgence non trouvée', 404);

        emergency.status = req.body.status;
        await emergency.save();
        res.json({
            success: true,
            message: 'Statut de l\'urgence mis à jour',
            data: emergency
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/banners
 */
exports.getBanners = async (req, res, next) => {
    try {
        const banners = await Banner.findAll({ order: [['position', 'ASC']] });
        res.json({ success: true, data: { banners } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/banners
 */
exports.createBanner = async (req, res, next) => {
    try {
        const { title, link_url, position, start_date, end_date } = req.body;
        const image_url = req.file ? `/uploads/banners/${req.file.filename}` : null;

        if (!image_url) throw new AppError('Image requise pour la bannière', 400);

        const banner = await Banner.create({
            title, image_url, link_url, position, start_date, end_date
        });

        await logAction(req.userId, 'CREATE_BANNER', 'banner', banner.id, null, banner, req);

        res.status(201).json({ success: true, message: 'Bannière créée', data: { banner } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/banners/:id
 */
exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        if (!banner) throw new AppError('Bannière non trouvée', 404);

        await banner.destroy();
        await logAction(req.userId, 'DELETE_BANNER', 'banner', req.params.id, banner, null, req);

        res.json({ success: true, message: 'Bannière supprimée' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/promo-codes
 */
exports.getPromoCodes = async (req, res, next) => {
    try {
        const promos = await PromoCode.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, data: promos });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/promo-codes
 */
exports.createPromoCode = async (req, res, next) => {
    try {
        const promo = await PromoCode.create(req.body);
        res.status(201).json({ success: true, data: promo });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/promo-codes/:id/toggle
 */
exports.togglePromoCode = async (req, res, next) => {
    try {
        const promo = await PromoCode.findByPk(req.params.id);
        if (!promo) throw new AppError('Code promo non trouvé', 404);
        promo.is_active = !promo.is_active;
        await promo.save();
        res.json({ success: true, data: promo });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/vehicles
 */
exports.getVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.findAll({
            include: [{
                model: Distributor, as: 'distributor',
                include: [{ model: User, as: 'user', attributes: ['full_name'] }]
            }],
            order: [['plate_number', 'ASC']]
        });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};
/**
 * GET /api/admin/withdrawals
 */
exports.getWithdrawals = async (req, res, next) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            include: [{
                model: Supplier, as: 'supplier',
                include: [{ model: User, as: 'user', attributes: ['full_name'] }]
            }],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: withdrawals });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/withdrawals/:id
 */
exports.updateWithdrawalStatus = async (req, res, next) => {
    try {
        const { status, admin_notes } = req.body;
        const withdrawal = await Withdrawal.findByPk(req.params.id);
        if (!withdrawal) throw new AppError('Retrait non trouvé', 404);

        withdrawal.status = status;
        withdrawal.admin_notes = admin_notes;
        if (status === 'COMPLETED') withdrawal.processed_at = new Date();
        
        await withdrawal.save();
        await logAction(req.userId, 'PROCESS_WITHDRAWAL', 'withdrawal', withdrawal.id, null, { status }, req);

        // Notification WhatsApp au partenaire
        try {
            const fullWithdrawal = await Withdrawal.findByPk(withdrawal.id, {
                include: [{
                    model: Supplier, as: 'supplier',
                    include: [{ model: User, as: 'user', attributes: ['phone'] }]
                }]
            });
            const phone = fullWithdrawal.supplier?.user?.phone;
            if (phone) {
                if (status === 'COMPLETED') {
                    await sendWhatsApp(phone, `✅ *Transfert Réussi*\n\nVotre demande de retrait de *${withdrawal.amount} F* a été traitée avec succès.\n\nMerci de votre partenariat avec *TODJOM GAZ*.`);
                } else if (status === 'REJECTED') {
                    await sendWhatsApp(phone, `❌ *Retrait Refusé*\n\nVotre demande de retrait de *${withdrawal.amount} F* a été rejetée.\n\n*Motif:* ${admin_notes || 'Non spécifié'}.\n\nVeuillez contacter l'administration pour plus d'informations.`);
                }
            }
        } catch (notifErr) {
            console.error('Erreur notification retrait:', notifErr);
        }

        res.json({ success: true, message: 'Retrait mis à jour', data: withdrawal });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/products
 * Liste de tous les produits pour l'admin
 */
exports.getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Supplier, as: 'supplier', attributes: ['company_name'] }],
            order: [['is_available', 'DESC'], ['gas_type', 'ASC']]
        });
        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/products/:id
 */
exports.updateAdminProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) throw new AppError('Produit non trouvé', 404);

        await product.update(req.body);
        await logAction(req.userId, 'UPDATE_PRODUCT_ADMIN', 'product', product.id, null, req.body, req);

        res.json({ success: true, message: 'Produit mis à jour', data: product });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/safety-centers
 */
exports.getSafetyCenters = async (req, res, next) => {
    try {
        const centers = await SafetyCenter.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, data: centers });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/safety-centers
 */
exports.createSafetyCenter = async (req, res, next) => {
    try {
        const center = await SafetyCenter.create({
            ...req.body,
            reported_by: req.userId
        });
        await logAction(req.userId, 'CREATE_SAFETY_CENTER', 'safety_center', center.id, null, center, req);
        res.status(201).json({ success: true, data: center });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/safety-centers/:id
 */
exports.deleteSafetyCenter = async (req, res, next) => {
    try {
        const center = await SafetyCenter.findByPk(req.params.id);
        if (!center) throw new AppError('Centre non trouvé', 404);
        await center.destroy();
        await logAction(req.userId, 'DELETE_SAFETY_CENTER', 'safety_center', req.params.id, null, null, req);
        res.json({ success: true, message: 'Alerte supprimée' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/reports/stats
 * Statistiques avancées pour les rapports
 */
exports.getReportStats = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const where = { status: 'delivered' };
        if (from && to) {
            where.created_at = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const [ordersByMonth, supplierPerf, productStats] = await Promise.all([
            // Ventes par mois
            Order.findAll({
                attributes: [
                    [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
                    [fn('COUNT', '*'), 'order_count'],
                    [fn('SUM', col('total_amount')), 'revenue']
                ],
                where,
                group: [fn('DATE_FORMAT', col('created_at'), '%Y-%m')],
                order: [[fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'ASC']],
                raw: true
            }),
            // Performance fournisseurs
            Order.findAll({
                attributes: [
                    [fn('COUNT', '*'), 'count'],
                    [fn('SUM', col('total_amount')), 'revenue'],
                    [fn('AVG', fn('TIMESTAMPDIFF', literal('MINUTE'), col('created_at'), col('delivered_at'))), 'avg_delivery_time']
                ],
                include: [{ model: Supplier, as: 'supplier', attributes: ['company_name'] }],
                where,
                group: ['supplier_id', 'supplier.company_name'],
                raw: true,
                nest: true
            }),
            // Stats produits
            Order.findAll({
                attributes: [
                    [fn('COUNT', '*'), 'sold_count'],
                    [fn('SUM', col('total_amount')), 'revenue']
                ],
                include: [{ model: Product, as: 'product', attributes: ['gas_type', 'weight_kg'] }],
                where,
                group: ['product_id', 'product.gas_type', 'product.weight_kg'],
                raw: true,
                nest: true
            })
        ]);

        res.json({
            success: true,
            data: {
                performance_by_month: ordersByMonth,
                supplier_performance: supplierPerf,
                product_distribution: productStats
            }
        });
    } catch (error) {
        next(error);
    }
};

