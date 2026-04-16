// ============================================
// TODJOM GAZ - Modèle Payment
// ============================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Payment', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        method: {
            type: DataTypes.ENUM('orange_money', 'moov_money', 'my_nita', 'amana_bank', 'card', 'cash'),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
            allowNull: false, defaultValue: 'pending'
        },
        transaction_ref: { type: DataTypes.STRING(100), defaultValue: null },
        provider_transaction_id: { type: DataTypes.STRING(100), defaultValue: null },
        provider_response: { type: DataTypes.JSON, defaultValue: null },
        refund_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: null },
        refund_reason: { type: DataTypes.TEXT, defaultValue: null },
        refunded_at: { type: DataTypes.DATE, defaultValue: null }
    }, { tableName: 'payments', timestamps: true, underscored: true });
};
