// ============================================
// TODJOM GAZ - Routes Distributeurs Brands (Stock)
// /api/distributors/:id/brands
// ============================================

const router = require('express').Router();
const { GasStock, Brand, Distributor, User, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

// GET /api/distributors/:id/brands - Get distributor's brands and stock
router.get('/:id/brands', authenticate, async (req, res) => {
  try {
    const distributorId = req.params.id;

    // Find the distributor profile
    const distributor = await Distributor.findOne({
      where: { user_id: distributorId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'phone', 'first_name', 'full_name', 'neighborhood'] },
      ],
    });

    // Get all brands for the distributor with their stock
    const brands = await Brand.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });

    const stockData = [];
    for (const brand of brands) {
      // Try to find product for this brand
      const products = await Product.findAll({ where: { brand_id: brand.id } });

      let qty3kg = 0, qty6kg = 0, qty12_5kg = 0;

      for (const product of products) {
        const stock = await GasStock.findOne({
          where: { distributor_id: distributor?.id || distributorId, product_id: product.id },
        });
        if (stock) {
          // Determine volume from product name or weight
          const name = (product.name || '').toLowerCase();
          if (name.includes('3') || product.weight === 3) qty3kg += stock.quantity;
          else if (name.includes('12') || name.includes('12.5') || product.weight === 12) qty12_5kg += stock.quantity;
          else qty6kg += stock.quantity;
        }
      }

      stockData.push({
        id: `${distributorId}-${brand.id}`,
        distributorId: distributor?.id || distributorId,
        brandId: brand.id,
        brand: {
          id: brand.id,
          name: brand.name,
          logoUrl: brand.logo_url,
          price3kg: Number(brand.price_3kg || 0),
          price6kg: Number(brand.price_6kg || 0),
          price12_5kg: Number(brand.price_12kg || 0),
          isActive: brand.is_active,
        },
        quantity3kg: qty3kg,
        quantity6kg: qty6kg,
        quantity12_5kg: qty12_5kg,
        minStock: 5,
        totalStock: qty3kg + qty6kg + qty12_5kg,
      });
    }

    res.json({ success: true, data: stockData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/distributors/:id/brands - Update stock for a brand
router.put('/:id/brands', authenticate, async (req, res) => {
  try {
    const distributorId = req.params.id;
    const { brandId, quantity3kg, quantity6kg, quantity12_5kg } = req.body;

    const distributor = await Distributor.findOne({
      where: { user_id: distributorId },
    });

    if (!distributor) {
      return res.status(404).json({ success: false, error: 'Distributeur non trouvé' });
    }

    // Find products for this brand
    const products = await Product.findAll({ where: { brand_id: brandId } });

    // Update stock for each product
    for (const product of products) {
      const name = (product.name || '').toLowerCase();
      let qty = 0;
      if (name.includes('3') || product.weight === 3) qty = quantity3kg || 0;
      else if (name.includes('12') || name.includes('12.5') || product.weight === 12) qty = quantity12_5kg || 0;
      else qty = quantity6kg || 0;

      const [stock, created] = await GasStock.findOrCreate({
        where: { distributor_id: distributor.id, product_id: product.id },
        defaults: { quantity: qty },
      });

      if (!created) {
        stock.quantity = qty;
        await stock.save();
      }
    }

    // Return updated stock data
    const brand = await Brand.findByPk(brandId);
    res.json({
      success: true,
      data: {
        id: `${distributorId}-${brandId}`,
        distributorId: distributor.id,
        brandId,
        brand: brand ? {
          id: brand.id,
          name: brand.name,
          logoUrl: brand.logo_url,
          price3kg: Number(brand.price_3kg || 0),
          price6kg: Number(brand.price_6kg || 0),
          price12_5kg: Number(brand.price_12kg || 0),
        } : null,
        quantity3kg: quantity3kg || 0,
        quantity6kg: quantity6kg || 0,
        quantity12_5kg: quantity12_5kg || 0,
        minStock: 5,
      },
      message: 'Stock mis à jour',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
