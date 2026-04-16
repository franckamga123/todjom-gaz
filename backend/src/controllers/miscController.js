const { Banner, Setting, SafetyCenter } = require('../models');

/**
 * GET /api/banners (Public)
 */
exports.getPublicBanners = async (req, res, next) => {
    try {
        const banners = await Banner.findAll({
            where: { is_active: true },
            order: [['position', 'ASC']]
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/settings (Public - basic)
 */
exports.getPublicSettings = async (req, res, next) => {
    try {
        const settings = await Setting.findAll({
            attributes: ['key', 'value']
        });
        // Convert array to object key-value
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        res.json({ success: true, data: settingsObj });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/safety-centers/public
 */
exports.getPublicSafetyCenters = async (req, res, next) => {
    try {
        const centers = await SafetyCenter.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: centers });
    } catch (error) {
        next(error);
    }
};
