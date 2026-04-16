// ============================================
// TODJOM GAZ - Modèle Product (Produit Gaz)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: true // Peut être null si c'est un produit distributé par plusieurs
        },
        brand_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        gas_type: {
            type: DataTypes.STRING(30),
            allowNull: true, // Devient optionnel car la marque définit le gaz
            validate: {
                notEmpty: false
            }
        },
        weight_kg: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[3, 6, 12, 15]]
            }
        },
        price_cfa: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        min_stock_alert: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        image_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        }
    }, {
        tableName: 'products',
        timestamps: true,
        underscored: true
    });

    // Vérifie si le stock est suffisant
    Product.prototype.hasStock = function(quantity = 1) {
        return this.stock_quantity >= quantity && this.is_available;
    };

    // Décrémente le stock (avec vérification)
    Product.prototype.decrementStock = async function(quantity = 1) {
        if (!this.hasStock(quantity)) {
            throw new Error('Stock insuffisant');
        }
        this.stock_quantity -= quantity;
        if (this.stock_quantity === 0) {
            this.is_available = false;
        }
        return this.save();
    };

    return Product;
};
