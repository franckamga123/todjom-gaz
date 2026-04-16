// ============================================
// TODJOM GAZ - Modèle OrderStatusHistory
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('OrderStatusHistory', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        old_status: { type: DataTypes.STRING(30), defaultValue: null },
        new_status: { type: DataTypes.STRING(30), allowNull: false },
        changed_by: { type: DataTypes.UUID, defaultValue: null },
        note: { type: DataTypes.TEXT, defaultValue: null },
        changed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    }, { tableName: 'order_status_history', timestamps: false, underscored: true });
};
