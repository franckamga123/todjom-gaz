// ============================================
// TODJOM GAZ - Modèle Review
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Review', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false, unique: true },
        client_id: { type: DataTypes.UUID, allowNull: false },
        distributor_id: { type: DataTypes.UUID, allowNull: false },
        rating: { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 5 } },
        comment: { type: DataTypes.TEXT, defaultValue: null }
    }, { tableName: 'reviews', timestamps: true, underscored: true, updatedAt: false });
};
