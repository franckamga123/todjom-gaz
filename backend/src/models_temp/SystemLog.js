// ============================================
// TODJOM GAZ - Modèle SystemLog
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('SystemLog', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, defaultValue: null },
        action: { type: DataTypes.STRING(100), allowNull: false },
        entity_type: { type: DataTypes.STRING(50), defaultValue: null },
        entity_id: { type: DataTypes.UUID, defaultValue: null },
        old_value: { type: DataTypes.JSON, defaultValue: null },
        new_value: { type: DataTypes.JSON, defaultValue: null },
        ip_address: { type: DataTypes.STRING(45), defaultValue: null },
        user_agent: { type: DataTypes.TEXT, defaultValue: null }
    }, { tableName: 'system_logs', timestamps: true, underscored: true, updatedAt: false });
};
