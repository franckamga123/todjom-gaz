// ============================================
// TODJOM GAZ - Contrôleur Produits
// ============================================

const { Product, Supplier, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/logService');

/**
 * GET /api/products/public
 * Liste de tous les produits disponibles (Client)
 */
exports.getAllPublicProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: { is_available: true },
            include: [
                {
                    model: Supplier, as: 'supplier',
                    include: [{ model: User, as: 'user', attributes: ['full_name', 'latitude', 'longitude'] }]
                }
            ]
        });

        // Format to match old client structure if needed, but client just mapping products.data
        const formattedProducts = products.map(p => ({
            id: p.id,
            supplier_id: p.supplier_id,
            type: p.gas_type + ' ' + p.weight_kg + 'kg',
            price: p.price_cfa,
            provider: p.supplier && p.supplier.user ? p.supplier.user.full_name : 'Fournisseur Inconnu',
            image: p.image_url ? `http://localhost:3000${p.image_url}` : '/gas.svg'
        }));

        res.json({ success: true, data: formattedProducts });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/suppliers/:supplierId/products
 * Liste des produits d'un fournisseur
 */
exports.getSupplierProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: { supplier_id: req.params.supplierId, is_available: true },
            order: [['weight_kg', 'ASC']]
        });

        res.json({ success: true, data: { products } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/products (Fournisseur - ses propres produits)
 */
exports.getMyProducts = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const products = await Product.findAll({
            where: { supplier_id: supplier.id },
            order: [['weight_kg', 'ASC']]
        });

        res.json({ success: true, data: { products } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/products
 * Ajouter un produit (Fournisseur)
 */
exports.createProduct = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const { gas_type, weight_kg, price_cfa, stock_quantity, description, min_stock_alert } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const product = await Product.create({
            supplier_id: supplier.id,
            gas_type,
            weight_kg,
            price_cfa,
            stock_quantity: stock_quantity || 0,
            description,
            min_stock_alert: min_stock_alert || 5,
            is_available: stock_quantity > 0,
            image_url
        });

        await logAction(req.userId, 'CREATE_PRODUCT', 'product', product.id, null, { gas_type, weight_kg, price_cfa }, req);

        res.status(201).json({
            success: true,
            message: 'Produit ajouté avec succès',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id
 * Modifier un produit (Fournisseur)
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const product = await Product.findOne({
            where: { id: req.params.id, supplier_id: supplier.id }
        });
        if (!product) throw new AppError('Produit non trouvé', 404);

        const oldValues = { price_cfa: product.price_cfa, stock_quantity: product.stock_quantity };

        const allowedFields = ['gas_type', 'weight_kg', 'price_cfa', 'stock_quantity', 'description', 'is_available', 'min_stock_alert'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        }

        if (req.file) {
            product.image_url = `/uploads/${req.file.filename}`;
        }

        // Auto-désactiver si stock 0
        if (product.stock_quantity <= 0) {
            product.is_available = false;
        }

        await product.save();

        await logAction(req.userId, 'UPDATE_PRODUCT', 'product', product.id, oldValues,
            { price_cfa: product.price_cfa, stock_quantity: product.stock_quantity }, req);

        res.json({
            success: true,
            message: 'Produit mis à jour',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/products/:id
 * Supprimer un produit (Fournisseur)
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { user_id: req.userId } });
        if (!supplier) throw new AppError('Profil fournisseur non trouvé', 404);

        const product = await Product.findOne({
            where: { id: req.params.id, supplier_id: supplier.id }
        });
        if (!product) throw new AppError('Produit non trouvé', 404);

        await product.destroy();

        await logAction(req.userId, 'DELETE_PRODUCT', 'product', req.params.id, { gas_type: product.gas_type }, null, req);

        res.json({
            success: true,
            message: 'Produit supprimé'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/suppliers
 * Lister les fournisseurs disponibles (pour les clients)
 */
exports.getSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.findAll({
            where: { is_validated: true },
            include: [
                {
                    model: User, as: 'user',
                    attributes: ['id', 'full_name', 'phone', 'latitude', 'longitude', 'address'],
                    where: { is_active: true }
                },
                {
                    model: Product, as: 'products',
                    where: { is_available: true },
                    required: false
                }
            ],
            order: [['avg_rating', 'DESC']]
        });

        // Calculer la distance si le client a une position
        let result = suppliers;
        if (req.query.latitude && req.query.longitude) {
            const clientLat = parseFloat(req.query.latitude);
            const clientLng = parseFloat(req.query.longitude);

            result = suppliers.map(s => {
                const sData = s.toJSON();
                if (s.user.latitude && s.user.longitude) {
                    sData.distance_km = calculateDistance(
                        clientLat, clientLng,
                        parseFloat(s.user.latitude), parseFloat(s.user.longitude)
                    );
                }
                return sData;
            }).sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
        }

        res.json({ success: true, data: { suppliers: result } });
    } catch (error) {
        next(error);
    }
};

/**
 * Calcul de distance Haversine (en km)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
