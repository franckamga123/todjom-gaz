// ============================================
// TODJOM GAZ - Modèles Sequelize (Index)
// ============================================

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialisation Sequelize
let sequelize;
if (dbConfig.url) {
    sequelize = new Sequelize(dbConfig.url, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: dbConfig.logging,
        define: dbConfig.define,
        timezone: dbConfig.timezone
    });
} else {
    sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            pool: dbConfig.pool,
            logging: dbConfig.logging,
            define: dbConfig.define,
            timezone: dbConfig.timezone
        }
    );
}

// Import des modèles
const User = require('./User')(sequelize);
const Supplier = require('./Supplier')(sequelize);
const Distributor = require('./Distributor')(sequelize);
const SupplierDistributor = require('./SupplierDistributor')(sequelize);
const Product = require('./Product')(sequelize);
const Order = require('./Order')(sequelize);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize);
const Payment = require('./Payment')(sequelize);
const Review = require('./Review')(sequelize);
const Dispute = require('./Dispute')(sequelize);
const Notification = require('./Notification')(sequelize);
const SystemLog = require('./SystemLog')(sequelize);
const Setting = require('./Setting')(sequelize);
const Emergency = require('./Emergency')(sequelize);
const Vehicle = require('./Vehicle')(sequelize);
const PromoCode = require('./PromoCode')(sequelize);
const Banner = require('./Banner')(sequelize);
const Withdrawal = require('./Withdrawal')(sequelize);
const SafetyCenter = require('./SafetyCenter')(sequelize);
const GasStock = require('./GasStock')(sequelize);
const DeliveryProfile = require('./DeliveryProfile')(sequelize);
const Brand = require('./Brand')(sequelize);
const AppConfig = require('./AppConfig')(sequelize);


// ============================================
// ASSOCIATIONS
// ============================================

// Brand -> Product (1:N)
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// Supplier -> Brand (1:N) - Un fournisseur détient les marques
Supplier.hasMany(Brand, { foreignKey: 'supplier_id', as: 'brands' });
Brand.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Distributor -> Vehicle (1:N)
Distributor.hasMany(Vehicle, { foreignKey: 'distributor_id', as: 'vehicles' });
Vehicle.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'distributor' });

// User -> Emergency (1:N)
User.hasMany(Emergency, { foreignKey: 'client_id', as: 'emergencies' });
Emergency.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

// User -> Supplier (1:1)
User.hasOne(Supplier, { foreignKey: 'user_id', as: 'supplierProfile' });
Supplier.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Distributor (1:1) - Le Point de Vente
User.hasOne(Distributor, { foreignKey: 'user_id', as: 'distributorProfile' });
Distributor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> DeliveryProfile (1:1) - Le Livreur/Chauffeur
User.hasOne(DeliveryProfile, { foreignKey: 'user_id', as: 'deliveryProfile' });
DeliveryProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Supplier <-> Distributor (M:N via supplier_distributors)
Supplier.belongsToMany(Distributor, {
    through: SupplierDistributor,
    foreignKey: 'supplier_id',
    otherKey: 'distributor_id',
    as: 'distributors'
});
Distributor.belongsToMany(Supplier, {
    through: SupplierDistributor,
    foreignKey: 'distributor_id',
    otherKey: 'supplier_id',
    as: 'suppliers'
});

// Supplier -> Products (1:N)
Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });
Distributor.hasMany(GasStock, { foreignKey: 'distributor_id', as: 'inventory' });
GasStock.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'distributor' });

Product.hasMany(GasStock, { foreignKey: 'product_id', as: 'stocks' });
GasStock.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Orders
User.hasMany(Order, { foreignKey: 'client_id', as: 'clientOrders' });
Order.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

Supplier.hasMany(Order, { foreignKey: 'supplier_id', as: 'supplierOrders' });
Order.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Distributor.hasMany(Order, { foreignKey: 'distributor_id', as: 'distributorOrders' });
Order.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'distributor' });

Product.hasMany(Order, { foreignKey: 'product_id', as: 'orders' });
Order.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order -> Delivery (Livreur)
DeliveryProfile.hasMany(Order, { foreignKey: 'delivery_id', as: 'deliveries' });
Order.belongsTo(DeliveryProfile, { foreignKey: 'delivery_id', as: 'deliverer' });

// Order -> StatusHistory (1:N)
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order -> Payment (1:N)
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order -> Review (1:1)
Order.hasOne(Review, { foreignKey: 'order_id', as: 'review' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Review.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Review.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'distributor' });

// Order -> Disputes (1:N)
Order.hasMany(Dispute, { foreignKey: 'order_id', as: 'disputes' });
Dispute.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Dispute.belongsTo(User, { foreignKey: 'raised_by', as: 'raisedByUser' });
Dispute.belongsTo(User, { foreignKey: 'resolved_by', as: 'resolvedByUser' });

// User -> Notifications (1:N)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order -> Brand (1:1)
Order.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });
Brand.hasMany(Order, { foreignKey: 'brand_id', as: 'orders' });

// User -> SystemLogs (1:N)
User.hasMany(SystemLog, { foreignKey: 'user_id', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export
// Supplier -> Withdrawal (1:N)
Supplier.hasMany(Withdrawal, { foreignKey: 'supplier_id', as: 'withdrawals' });
Withdrawal.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

const db = {
    sequelize,
    Sequelize,
    User,
    Supplier,
    Distributor,
    SupplierDistributor,
    Product,
    Order,
    OrderStatusHistory,
    Payment,
    Review,
    Dispute,
    Notification,
    SystemLog,
    Setting,
    Emergency,
    Vehicle,
    PromoCode,
    Banner,
    Withdrawal,
    SafetyCenter,
    GasStock,
    DeliveryProfile,
    Brand,
    AppConfig
};

module.exports = db;
