// ============================================
// TODJOM GAZ - Modèle Marque de Gaz (Brand)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Brand = sequelize.define('Brand', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        logo_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        price_3kg: {
            type: DataTypes.INTEGER,
            defaultValue: 1500
        },
        price_6kg: {
            type: DataTypes.INTEGER,
            defaultValue: 3500
        },
        price_12kg: {
            type: DataTypes.INTEGER,
            defaultValue: 7500
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'brands',
        timestamps: true,
        underscored: true
    });

    return Brand;
};
