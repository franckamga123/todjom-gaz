// ============================================
// TODJOM GAZ - Routes Configuration & Branding
// ============================================

const router = require('express').Router();
const { AppConfig } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Route publique pour récupérer la config (Couleurs, Logo, Nom)
router.get('/', async (req, res) => {
    try {
        let config = await AppConfig.findOne();
        if (!config) {
            config = await AppConfig.create({
                platform_name: 'TODJOM GAZ',
                primary_color: '#ff8c00'
            });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route admin pour mettre à jour la config
router.put('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { platform_name, primary_color, secondary_color, platform_logo_url, background_image_url } = req.body;
        
        let config = await AppConfig.findOne();
        if (!config) config = await AppConfig.create({});

        await config.update({
            platform_name,
            primary_color,
            secondary_color,
            platform_logo_url,
            background_image_url
        });

        res.json({ success: true, message: 'Configuration mise à jour', data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
