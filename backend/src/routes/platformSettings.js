// ============================================
// TODJOM GAZ - Routes Paramètres Plateforme
// /api/platform-settings
// ============================================

const router = require('express').Router();
const { AppConfig, Setting } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/platform-settings - Get platform settings
router.get('/', async (req, res) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) {
      config = await AppConfig.create({
        platform_name: 'TODJOM GAZ',
        primary_color: '#ff8c00',
      });
    }

    res.json({
      success: true,
      data: {
        platformName: config.platform_name || 'TODJOM GAZ',
        platformLogo: config.platform_logo_url || '',
        backgroundImage: config.background_image_url || '',
        primaryColor: config.primary_color || '#f97316',
        secondaryColor: config.secondary_color || '#ff8c00',
        serviceFee: 500,
        deliveryFeePerKm: 250,
        livreurCommission: 65,
        tomtomCommission: 35,
        mynitaNumber: '',
        amanaNumber: '',
        bankAccount: '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/platform-settings - Update platform settings
router.put('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) config = await AppConfig.create({});

    const {
      platformName, primaryColor, secondaryColor,
      platformLogo, backgroundImage,
      serviceFee, deliveryFeePerKm,
      livreurCommission, tomtomCommission,
      mynitaNumber, amanaNumber, bankAccount,
    } = req.body;

    if (platformName) config.platform_name = platformName;
    if (primaryColor) config.primary_color = primaryColor;
    if (secondaryColor) config.secondary_color = secondaryColor;
    if (platformLogo) config.platform_logo_url = platformLogo;
    if (backgroundImage) config.background_image_url = backgroundImage;

    await config.save();

    res.json({
      success: true,
      message: 'Configuration mise à jour',
      data: {
        platformName: config.platform_name,
        primaryColor: config.primary_color,
        secondaryColor: config.secondary_color,
        platformLogo: config.platform_logo_url,
        backgroundImage: config.background_image_url,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
