// ============================================
// TODJOM GAZ - Modèle Supplier (Fournisseur)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Supplier = sequelize.define('Supplier', {
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
        company_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 150]
            }
        },
        registration_number: {
            type: DataTypes.STRING(50),
            defaultValue: null
        },
        registration_doc_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        is_validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        avg_rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total_orders: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        commission_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 5.00
        },
        bank_account: {
            type: DataTypes.STRING(50),
            defaultValue: null
        },
        mobile_money_number: {
            type: DataTypes.STRING(20),
            defaultValue: null
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        validated_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        validated_by: {
            type: DataTypes.UUID,
            defaultValue: null
        }
    }, {
        tableName: 'suppliers',
        timestamps: true,
        underscored: true
    });

    return Supplier;
};
