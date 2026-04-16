const { sequelize, User, Supplier, Product, Distributor, GasStock, AppConfig, Brand } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Base de données synchronisée.');

    // 1. App Config
    await AppConfig.create({
      platform_name: 'TODJOM GAZ',
      primary_color: '#ff8c00',
      secondary_color: '#050507'
    });

    // 2. Marques
    const nigerGaz = await Brand.create({
      name: 'Niger Gaz',
      price_3kg: 2000, price_6kg: 3500, price_12kg: 7500
    });
    const oryx = await Brand.create({
      name: 'Oryx Gaz',
      price_3kg: 2100, price_6kg: 3600, price_12kg: 7600
    });

    // 3. Utilisateurs
    const admin = await User.create({
        full_name: 'Admin TODJOM', email: 'admin@todjom.com', phone: '90000000',
        password_hash: 'admin123', role: 'admin', is_active: true, approval_status: 'approved'
    });

    const client = await User.create({
        full_name: 'Amadou Client', first_name: 'Amadou', neighborhood: 'Poudrière',
        email: 'client@todjom.com', phone: '90000001', password_hash: 'password123',
        role: 'client', is_active: true, approval_status: 'approved'
    });

    const distUser = await User.create({
        full_name: 'Boutique Alpha', phone: '90000002', password_hash: 'password123',
        role: 'distributor', is_active: true, approval_status: 'approved'
    });

    const deliveryUser = await User.create({
        full_name: 'Moussa Livreur', phone: '90000003', password_hash: 'password123',
        role: 'delivery', is_active: true, approval_status: 'approved'
    });

    // 4. Profils
    const distProfile = await Distributor.create({
        user_id: distUser.id,
        shop_name: 'Dépôt Gaz Poudrière',
        latitude: 13.5115, longitude: 2.1254, // Niamey Center
        is_active: true
    });

    // 5. Produits & Stocks
    const prod3 = await Product.create({ brand_id: nigerGaz.id, weight_kg: 3, price_cfa: 2000, is_available: true });
    const prod6 = await Product.create({ brand_id: nigerGaz.id, weight_kg: 6, price_cfa: 3500, is_available: true });

    await GasStock.create({ distributor_id: distProfile.id, product_id: prod3.id, quantity: 50 });
    await GasStock.create({ distributor_id: distProfile.id, product_id: prod6.id, quantity: 30 });

    console.log('🌱 Seed terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seed();
