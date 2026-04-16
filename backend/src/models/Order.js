// ============================================
// TODJOM GAZ - Modèle Order (Commande)
// ============================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        client_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: true // Devient optionnel car on cherche le distributeur d'abord
        },
        brand_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        weight_kg: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        distributor_id: {
            type: DataTypes.UUID,
            defaultValue: null,
            comment: 'ID du point de vente qui fournit le gaz'
        },
        delivery_id: {
            type: DataTypes.UUID,
            defaultValue: null,
            comment: 'ID du livreur (DeliveryProfile) qui transporte le colis'
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: true // Peut être nul avant assignation produit spécifique
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        commission_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        commission_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        supplier_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        search_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 500.00,
            comment: 'Frais de recherche (accès plateforme) - 100% TODJOM'
        },
        delivery_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Frais de transport'
        },
        delivery_commission_livreur: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: '65% des frais de livraison'
        },
        delivery_commission_todjom: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: '35% des frais de livraison'
        },
        status: {
            type: DataTypes.ENUM(
                'pending_payment', 'paid', 'accepted', 'refused',
                'assigned', 'picked_up', 'in_delivery', 'delivered',
                'cancelled', 'failed', 'refunded'
            ),
            allowNull: false,
            defaultValue: 'pending_payment'
        },
        delivery_latitude: {
            type: DataTypes.DECIMAL(10, 8),
            defaultValue: null
        },
        delivery_longitude: {
            type: DataTypes.DECIMAL(11, 8),
            defaultValue: null
        },
        delivery_address: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        client_phone: {
            type: DataTypes.STRING(20),
            defaultValue: null
        },
        cancel_reason: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        refuse_reason: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        delivery_photo_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        estimated_delivery_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        accepted_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        assigned_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        picked_up_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        delivered_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        cancelled_at: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    }, {
        tableName: 'orders',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: (order) => {
                // Générer numéro de commande unique : TDG-YYYYMMDD-XXXX
                const date = new Date();
                const dateStr = date.getFullYear().toString() +
                    (date.getMonth() + 1).toString().padStart(2, '0') +
                    date.getDate().toString().padStart(2, '0');
                const rand = Math.floor(1000 + Math.random() * 9000);
                order.order_number = `TDG-${dateStr}-${rand}`;
            }
        }
    });

    // Statuts qui permettent l'annulation
    Order.CANCELLABLE_STATUSES = ['pending_payment', 'paid', 'accepted', 'assigned'];

    // Statuts terminaux
    Order.TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed', 'refunded'];

    // Vérifie si la commande est annulable
    Order.prototype.isCancellable = function() {
        return Order.CANCELLABLE_STATUSES.includes(this.status);
    };

    // Transitions de statut valides
    Order.VALID_TRANSITIONS = {
        'pending_payment': ['paid', 'cancelled'],
        'paid': ['accepted', 'refused', 'cancelled'],
        'accepted': ['assigned', 'cancelled'],
        'refused': ['refunded'],
        'assigned': ['picked_up', 'cancelled'],
        'picked_up': ['in_delivery'],
        'in_delivery': ['delivered', 'failed'],
        'delivered': [],
        'cancelled': ['refunded'],
        'failed': ['refunded', 'assigned'], // réassignation possible
        'refunded': []
    };

    // Vérifie si une transition est valide
    Order.prototype.canTransitionTo = function(newStatus) {
        const allowed = Order.VALID_TRANSITIONS[this.status] || [];
        return allowed.includes(newStatus);
    };

    return Order;
};
