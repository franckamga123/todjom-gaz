// ============================================
// TODJOM GAZ - Contrôleur Authentification
// ============================================

const jwt = require('jsonwebtoken');
const { User, Supplier, Distributor, DeliveryProfile, sequelize } = require('../models');
const { jwt: jwtConfig } = require('../config/app');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/logService');
const { sendSMS } = require('../services/smsService');
const { Op } = require('sequelize');

/**
 * Générer un couple access + refresh token
 */
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiresIn }
    );
    return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { 
            phone, email, password, full_name, first_name,
            neighborhood,
            role = 'client', 
            company_name, 
            shop_name, latitude, longitude,
            vehicle_type, license_number,
            photo_url, id_card_url, license_url,
            has_accepted_contract = false
        } = req.body;

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
            password_hash: password,
            full_name,
            first_name,
            neighborhood,
            role,
            is_active: role === 'client' ? true : false, // Seul le client est actif tout de suite
            has_accepted_contract: has_accepted_contract,
            contract_accepted_at: has_accepted_contract ? new Date() : null,
            approval_status: role === 'client' ? 'approved' : 'pending'
        }, { transaction: t });

        // Créer le profil étendu selon le rôle
        if (role === 'supplier') {
            if (!company_name) {
                throw new AppError('Le nom de l\'entreprise est requis pour un fournisseur', 400);
            }
            await Supplier.create({
                user_id: user.id,
                company_name,
                is_validated: false
            }, { transaction: t });
        } else if (role === 'distributor') {
            if (!shop_name) throw new AppError('Le nom du point de vente est requis', 400);
            await Distributor.create({
                user_id: user.id,
                shop_name,
                latitude: latitude || 0,
                longitude: longitude || 0,
                is_active: false // Attente validation admin
            }, { transaction: t });
        } else if (role === 'delivery') {
            await DeliveryProfile.create({
                user_id: user.id,
                vehicle_type: vehicle_type || 'moto',
                license_number,
                photo_url,
                id_card_url,
                license_url,
                has_accepted_contract: has_accepted_contract,
                is_available: false
            }, { transaction: t });
        }

        // Générer OTP pour vérification SMS
        const otp = user.generateOTP();
        await user.save({ transaction: t });

        await t.commit();

        // Envoyer le code OTP par SMS via Twilio
        await sendSMS(phone, `Votre code de vérification TODJOM GAZ est : ${otp}. Ne le partagez à personne.`);
        console.log(`📱 OTP pour ${phone}: ${otp}`);

        // Générer les tokens
        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        await user.save();

        await logAction(user.id, 'REGISTER', 'user', user.id, null, { role }, req);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre téléphone.',
            data: {
                user: user.toJSON(),
                tokens
            }
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Connexion par email/téléphone + mot de passe
 */
exports.login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        // Chercher par email ou téléphone
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: login },
                    { phone: login }
                ]
            },
            include: [
                { model: Supplier, as: 'supplierProfile' },
                { model: Distributor, as: 'distributorProfile' },
                { model: DeliveryProfile, as: 'deliveryProfile' }
            ]
        });

        if (!user) {
            throw new AppError('Identifiants incorrects', 401);
        }

        if (!user.is_active) {
            if (user.approval_status === 'pending') {
                throw new AppError('Votre compte est en cours de revue par TODJOM. Vous recevrez une notification dès validation.', 403);
            } else if (user.approval_status === 'rejected') {
                throw new AppError('Votre dossier d\'inscription a été refusé.', 403);
            }
            throw new AppError('Votre compte est désactivé. Contactez l\'administrateur.', 403);
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            throw new AppError('Identifiants incorrects', 401);
        }

        // Vérifier validation fournisseur
        if (user.role === 'supplier' && user.supplierProfile && !user.supplierProfile.is_validated) {
            throw new AppError('Votre compte fournisseur est en attente de validation', 403);
        }

        // Générer tokens
        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        user.last_login_at = new Date();
        await user.save();

        await logAction(user.id, 'LOGIN', 'user', user.id, null, null, req);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: user.toJSON(),
                tokens
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/verify-otp
 * Vérification du code OTP (SMS)
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { phone, code } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        if (!user.verifyOTP(code)) {
            throw new AppError('Code OTP invalide ou expiré', 400);
        }

        user.is_verified = true;
        user.otp_code = null;
        user.otp_expires_at = null;
        await user.save();

        res.json({
            success: true,
            message: 'Téléphone vérifié avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/resend-otp
 * Renvoyer le code OTP
 */
exports.resendOTP = async (req, res, next) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        const otp = user.generateOTP();
        await user.save();

        // Envoyer par SMS
        await sendSMS(phone, `Votre nouveau code de vérification TODJOM GAZ est : ${otp}`);
        console.log(`📱 OTP renvoyé pour ${phone}: ${otp}`);

        res.json({
            success: true,
            message: 'Code OTP renvoyé par SMS'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation du mot de passe
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { login } = req.body;

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: login },
                    { phone: login }
                ]
            }
        });

        if (!user) {
            // Ne pas révéler si l'utilisateur existe
            return res.json({
                success: true,
                message: 'Si un compte existe, un code de réinitialisation a été envoyé.'
            });
        }

        const otp = user.generateOTP();
        await user.save();

        // Envoyer par SMS
        await sendSMS(user.phone, `Votre code de réinitialisation TODJOM GAZ est : ${otp}`);
        console.log(`🔑 Code réinitialisation pour ${login}: ${otp}`);

        res.json({
            success: true,
            message: 'Si un compte existe, un code de réinitialisation a été envoyé.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec OTP
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { phone, code, password } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user || !user.verifyOTP(code)) {
            throw new AppError('Code invalide ou expiré', 400);
        }

        user.password_hash = password; // Le hook beforeUpdate hashera
        user.otp_code = null;
        user.otp_expires_at = null;
        await user.save();

        await logAction(user.id, 'RESET_PASSWORD', 'user', user.id, null, null, req);

        res.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh-token
 * Renouveler le token d'accès
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError('Refresh token requis', 400);
        }

        const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
        const user = await User.findByPk(decoded.id);

        if (!user || user.refresh_token !== refreshToken) {
            throw new AppError('Refresh token invalide', 401);
        }

        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        await user.save();

        res.json({
            success: true,
            data: { tokens }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 * Profil de l'utilisateur connecté
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [
                { model: Supplier, as: 'supplierProfile' },
                { model: Distributor, as: 'distributorProfile' },
                { model: DeliveryProfile, as: 'deliveryProfile' }
            ]
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/me
 * Modifier le profil
 */
exports.updateMe = async (req, res, next) => {
    try {
        const allowedFields = ['full_name', 'email', 'address', 'latitude', 'longitude', 'avatar_url', 'fcm_token'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        await User.update(updates, { where: { id: req.userId } });
        const user = await User.findByPk(req.userId);

        res.json({
            success: true,
            message: 'Profil mis à jour',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};
