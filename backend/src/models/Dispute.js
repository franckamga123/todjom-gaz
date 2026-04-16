// ============================================
// TODJOM GAZ - Modèle Dispute
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Dispute', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        raised_by: { type: DataTypes.UUID, allowNull: false },
        type: {
            type: DataTypes.ENUM('quantity', 'quality', 'delay', 'non_delivery', 'other'),
            allowNull: false
        },
        description: { type: DataTypes.TEXT, allowNull: false },
        proof_photo_url: { type: DataTypes.STRING(255), defaultValue: null },
        status: {
            type: DataTypes.ENUM('open', 'investigating', 'resolved', 'closed'),
            allowNull: false, defaultValue: 'open'
        },
        resolution: { type: DataTypes.TEXT, defaultValue: null },
        resolved_by: { type: DataTypes.UUID, defaultValue: null },
        resolved_at: { type: DataTypes.DATE, defaultValue: null }
    }, { tableName: 'disputes', timestamps: true, underscored: true });
};
