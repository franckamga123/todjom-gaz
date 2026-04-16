// ============================================
// TODJOM GAZ - Modèle Stock (Inventaire Distributeur)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Stock = sequelize.define('Stock', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        distributor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID de l utilisateur avec le rôle distributeur'
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID du produit (ex: NigerGaz 6kg)'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        last_supplied_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'stocks',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['distributor_id', 'product_id']
            }
        ]
    });

    return Stock;
};
