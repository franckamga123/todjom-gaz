// ============================================
// TODJOM GAZ - Modèle Setting
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Setting', {
        key: { type: DataTypes.STRING(100), primaryKey: true, field: 'key' },
        value: { type: DataTypes.JSON, allowNull: false },
        description: { type: DataTypes.STRING(255), defaultValue: null },
        updated_by: { type: DataTypes.UUID, defaultValue: null }
    }, { tableName: 'settings', timestamps: true, underscored: true, createdAt: false });
};
