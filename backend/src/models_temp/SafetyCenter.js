// ============================================
// TODJOM GAZ - Modèle SafetyCenter (Centres de Danger)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SafetyCenter = sequelize.define('SafetyCenter', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        risk_level: {
            type: DataTypes.ENUM('MODÉRÉ', 'ÉLEVÉ', 'CRITIQUE'),
            defaultValue: 'MODÉRÉ'
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        reported_by: {
            type: DataTypes.UUID,
            allowNull: true // Admin ID
        }
    }, {
        tableName: 'safety_centers',
        timestamps: true,
        underscored: true
    });

    return SafetyCenter;
};
