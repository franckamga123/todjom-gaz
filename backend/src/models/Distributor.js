// ============================================
// TODJOM GAZ - Modèle Distributor (Distributeur)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Distributor = sequelize.define('Distributor', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true
        },
        shop_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Confirmé par TODJOM'
        },
        opening_hours: {
            type: DataTypes.STRING(100),
            defaultValue: '08:00 - 20:00'
        },
        avg_rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 0.00
        }
    }, {
        tableName: 'distributors',
        timestamps: true,
        underscored: true
    });

    return Distributor;
};
