// ============================================
// TODJOM GAZ - Contrôleur des Marques de Gaz
// ============================================

const { Brand, Product, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/brands
 * Lister toutes les marques actives (Public/Client)
 */
exports.getAllBrands = async (req, res, next) => {
    try {
        const brands = await Brand.findAll({ where: { is_active: true } });
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/brands
 * Créer une marque (Admin)
 */
exports.createBrand = async (req, res, next) => {
    try {
        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/brands/:id
 * Modifier une marque (Prix, Logo, Nom) - Admin
 */
exports.updateBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) throw new AppError('Marque non trouvée', 404);

        await brand.update(req.body);
        
        // Optionnel: Mettre à jour les prix des produits liés si nécessaire
        // Pour l'instant on garde les prix centralisés dans Brand
        
        res.json({ success: true, message: 'Marque mise à jour', data: brand });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/brands/:id
 * Supprimer une marque (Admin)
 */
exports.deleteBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) throw new AppError('Marque non trouvée', 404);
        
        await brand.destroy();
        res.json({ success: true, message: 'Marque supprimée' });
    } catch (error) {
        next(error);
    }
};
