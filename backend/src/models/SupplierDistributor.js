// ============================================
// TODJOM GAZ - Modèle SupplierDistributor
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SupplierDistributor = sequelize.define('SupplierDistributor', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        distributor_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        assigned_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'supplier_distributors',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['supplier_id', 'distributor_id']
            }
        ]
    });

    return SupplierDistributor;
};
