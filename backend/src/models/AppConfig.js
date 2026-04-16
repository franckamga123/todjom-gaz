// ============================================
// TODJOM GAZ - Modèle de Configuration App
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AppConfig = sequelize.define('AppConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        platform_name: {
            type: DataTypes.STRING(100),
            defaultValue: 'TODJOM GAZ'
        },
        platform_logo_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        background_image_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        primary_color: {
            type: DataTypes.STRING(20),
            defaultValue: '#ff8c00' // Orange Todjom
        },
        secondary_color: {
            type: DataTypes.STRING(20),
            defaultValue: '#050507'
        },
        contact_phone: {
            type: DataTypes.STRING(20),
            defaultValue: '+22700000000'
        },
        contact_email: {
            type: DataTypes.STRING(100),
            defaultValue: 'contact@todjom.com'
        }
    }, {
        tableName: 'app_configs',
        timestamps: true,
        underscored: true
    });

    return AppConfig;
};
