// ============================================
// TODJOM GAZ - Modèle DeliveryProfile (Livreur)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DeliveryProfile = sequelize.define('DeliveryProfile', {
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
        vehicle_type: {
            type: DataTypes.ENUM('moto', 'voiture', 'tricycle', 'velo', 'a_pied'),
            allowNull: false,
            defaultValue: 'moto'
        },
        license_number: {
            type: DataTypes.STRING(30),
            defaultValue: null
        },
        photo_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        id_card_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        license_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        has_accepted_contract: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_on_delivery: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        current_latitude: {
            type: DataTypes.DECIMAL(10, 8),
            defaultValue: null
        },
        current_longitude: {
            type: DataTypes.DECIMAL(11, 8),
            defaultValue: null
        },
        status: {
            type: DataTypes.ENUM('offline', 'online', 'busy'),
            defaultValue: 'offline'
        },
        total_earnings: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        delivery_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'delivery_profiles',
        timestamps: true,
        underscored: true
    });

    return DeliveryProfile;
};
