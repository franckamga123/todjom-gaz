// ============================================
// TODJOM GAZ - Routes Marques de Gaz (Frontend API)
// /api/gas-brands
// ============================================

const router = require('express').Router();
const { Brand, Product, Supplier } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Helper: transform Brand to frontend format
function brandToFrontend(brand) {
  return {
    id: brand.id,
    name: brand.name,
    description: brand.description || '',
    logoUrl: brand.logo_url || `/logos/${(brand.name || '').toLowerCase().replace(/\s+/g, '-')}.png`,
    price3kg: Number(brand.price_3kg) || 1500,
    price6kg: Number(brand.price_6kg) || 3500,
    price12_5kg: Number(brand.price_12kg) || 7500,
    isActive: brand.is_active,
    createdAt: brand.created_at,
    updatedAt: brand.updated_at,
  };
}

// GET /api/gas-brands - Public: list all active brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    const data = brands.map(brandToFrontend);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gas-brands - Create brand (admin/supplier)
router.post('/', authenticate, authorize('admin', 'supplier'), async (req, res) => {
  try {
    const { name, description, logoUrl, price3kg, price6kg, price12_5kg, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Le nom est obligatoire' });

    // Check for duplicate name
    const existing = await Brand.findOne({ where: { name } });
    if (existing) return res.status(400).json({ success: false, error: 'Cette marque existe déjà' });

    const brand = await Brand.create({
      name,
      description: description || '',
      logo_url: logoUrl || null,
      price_3kg: price3kg || 1500,
      price_6kg: price6kg || 3500,
      price_12kg: price12_5kg || 7500,
      is_active: isActive !== false,
    });

    res.status(201).json({ success: true, data: brandToFrontend(brand) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/gas-brands/:id - Get single brand
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ success: false, error: 'Marque non trouvée' });
    res.json({ success: true, data: brandToFrontend(brand) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/gas-brands/:id - Update brand
router.put('/:id', authenticate, async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ success: false, error: 'Marque non trouvée' });

    const { name, description, logoUrl, price3kg, price6kg, price12_5kg, isActive } = req.body;
    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (logoUrl !== undefined) brand.logo_url = logoUrl;
    if (price3kg !== undefined) brand.price_3kg = price3kg;
    if (price6kg !== undefined) brand.price_6kg = price6kg;
    if (price12_5kg !== undefined) brand.price_12kg = price12_5kg;
    if (isActive !== undefined) brand.is_active = isActive;

    await brand.save();
    res.json({ success: true, data: brandToFrontend(brand) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/gas-brands/:id - Delete brand
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ success: false, error: 'Marque non trouvée' });
    await brand.destroy();
    res.json({ success: true, message: 'Marque supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
