// ============================================
// TODJOM GAZ - Seed Data (Données de test)
// ============================================

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

const seed = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Connexion DB OK');

        // Synchroniser les tables
        await db.sequelize.sync({ force: true });
        console.log('✅ Tables recréées');

        // ============================================
        // 1. ADMIN TODJOM
        // ============================================
        const adminId = uuidv4();
        const adminPassword = await bcrypt.hash('admin123', 12);
        await db.User.create({
            id: adminId,
            phone: '+22790000001',
            email: 'admin@todjomgaz.com',
            password_hash: adminPassword,
            full_name: 'Admin Todjom',
            role: 'admin',
            is_active: true,
            is_verified: true,
            latitude: 13.5116,
            longitude: 2.1254
        }, { hooks: false }); // Skip le hook de hash car déjà hashé
        console.log('✅ Admin créé (admin@todjomgaz.com / admin123)');

        // ============================================
        // 2. FOURNISSEURS
        // ============================================
        const suppliers = [];

        // Niger Gaz
        const nigerGazUserId = uuidv4();
        const nigerGazSupplierId = uuidv4();
        const supplierPassword = await bcrypt.hash('fournisseur123', 12);

        await db.User.create({
            id: nigerGazUserId,
            phone: '+22790100001',
            email: 'contact@nigergaz.ne',
            password_hash: supplierPassword,
            full_name: 'Niger Gaz SA',
            role: 'supplier',
            is_active: true,
            is_verified: true,
            latitude: 13.5137,
            longitude: 2.1098,
            address: 'Boulevard de la République, Niamey'
        }, { hooks: false });

        await db.Supplier.create({
            id: nigerGazSupplierId,
            user_id: nigerGazUserId,
            company_name: 'Niger Gaz',
            registration_number: 'NE-RC-2020-1234',
            is_validated: true,
            avg_rating: 4.5,
            total_orders: 1250,
            commission_rate: 5.00,
            mobile_money_number: '+22790100001',
            description: 'Premier distributeur de gaz domestique au Niger. Qualité et fiabilité depuis 2005.',
            validated_at: new Date(),
            validated_by: adminId
        });
        suppliers.push({ userId: nigerGazUserId, supplierId: nigerGazSupplierId });

        // Gani Gaz
        const ganiGazUserId = uuidv4();
        const ganiGazSupplierId = uuidv4();

        await db.User.create({
            id: ganiGazUserId,
            phone: '+22790100002',
            email: 'info@ganigaz.ne',
            password_hash: supplierPassword,
            full_name: 'Gani Gaz SARL',
            role: 'supplier',
            is_active: true,
            is_verified: true,
            latitude: 13.4987,
            longitude: 2.1356,
            address: 'Quartier Plateau, Niamey'
        }, { hooks: false });

        await db.Supplier.create({
            id: ganiGazSupplierId,
            user_id: ganiGazUserId,
            company_name: 'Gani Gaz',
            registration_number: 'NE-RC-2022-5678',
            is_validated: true,
            avg_rating: 4.2,
            total_orders: 830,
            commission_rate: 5.00,
            mobile_money_number: '+22790100002',
            description: 'Gaz domestique de qualité à prix compétitif.',
            validated_at: new Date(),
            validated_by: adminId
        });
        suppliers.push({ userId: ganiGazUserId, supplierId: ganiGazSupplierId });

        // Sahel Gaz
        const sahelGazUserId = uuidv4();
        const sahelGazSupplierId = uuidv4();

        await db.User.create({
            id: sahelGazUserId,
            phone: '+22790100003',
            email: 'contact@sahelgaz.ne',
            password_hash: supplierPassword,
            full_name: 'Sahel Gaz',
            role: 'supplier',
            is_active: true,
            is_verified: true,
            latitude: 13.5225,
            longitude: 2.0876,
            address: 'Route de Tillabéri, Niamey'
        }, { hooks: false });

        await db.Supplier.create({
            id: sahelGazSupplierId,
            user_id: sahelGazUserId,
            company_name: 'Sahel Gaz',
            registration_number: 'NE-RC-2023-9012',
            is_validated: true,
            avg_rating: 3.8,
            total_orders: 410,
            commission_rate: 5.00,
            mobile_money_number: '+22790100003',
            description: 'Distribution rapide de gaz dans toute la région de Niamey.',
            validated_at: new Date(),
            validated_by: adminId
        });
        suppliers.push({ userId: sahelGazUserId, supplierId: sahelGazSupplierId });

        console.log('✅ 3 Fournisseurs créés (fournisseur123)');

        // ============================================
        // 3. PRODUITS (Gaz)
        // ============================================
        const gasTypes = [
            { type: 'Bouteille 6 kg', weight: 6, prices: [3500, 3600, 3400] },
            { type: 'Bouteille 12 kg', weight: 12, prices: [6500, 6800, 6300] },
            { type: 'Bouteille 15 kg', weight: 15, prices: [8500, 8800, 8200] }
        ];

        for (let i = 0; i < suppliers.length; i++) {
            for (const gas of gasTypes) {
                await db.Product.create({
                    supplier_id: suppliers[i].supplierId,
                    gas_type: gas.type,
                    weight_kg: gas.weight,
                    price_cfa: gas.prices[i],
                    stock_quantity: Math.floor(Math.random() * 80) + 20,
                    min_stock_alert: 5,
                    is_available: true,
                    description: `${gas.type} - Gaz butane domestique certifié`
                });
            }
        }
        console.log('✅ 9 Produits créés (3 types × 3 fournisseurs)');

        // ============================================
        // 4. DISTRIBUTEURS
        // ============================================
        const distributorPassword = await bcrypt.hash('livreur123', 12);
        const distributors = [];

        const distributorData = [
            { name: 'Moussa Ibrahim', phone: '+22790200001', lat: 13.5080, lng: 2.1150, vehicle: 'moto' },
            { name: 'Amadou Oumarou', phone: '+22790200002', lat: 13.5200, lng: 2.1300, vehicle: 'moto' },
            { name: 'Ibrahim Souleymane', phone: '+22790200003', lat: 13.5050, lng: 2.1000, vehicle: 'tricycle' },
            { name: 'Ali Djibo', phone: '+22790200004', lat: 13.4950, lng: 2.1400, vehicle: 'moto' },
            { name: 'Hamidou Maiga', phone: '+22790200005', lat: 13.5300, lng: 2.0950, vehicle: 'voiture' }
        ];

        for (const d of distributorData) {
            const userId = uuidv4();
            const distId = uuidv4();

            await db.User.create({
                id: userId,
                phone: d.phone,
                email: `${d.name.split(' ')[0].toLowerCase()}@todjomgaz.ne`,
                password_hash: distributorPassword,
                full_name: d.name,
                role: 'distributor',
                is_active: true,
                is_verified: true,
                latitude: d.lat,
                longitude: d.lng
            }, { hooks: false });

            await db.Distributor.create({
                id: distId,
                user_id: userId,
                vehicle_type: d.vehicle,
                is_available: true,
                current_latitude: d.lat,
                current_longitude: d.lng,
                total_deliveries: Math.floor(Math.random() * 100),
                avg_rating: (3.5 + Math.random() * 1.5).toFixed(2),
                last_location_update: new Date()
            });

            distributors.push({ userId, distId });
        }

        // Assigner les distributeurs aux fournisseurs
        for (let i = 0; i < distributors.length; i++) {
            await db.SupplierDistributor.create({
                supplier_id: suppliers[i % suppliers.length].supplierId,
                distributor_id: distributors[i].distId,
                is_active: true
            });
        }
        console.log('✅ 5 Distributeurs créés (livreur123)');

        // ============================================
        // 5. CLIENTS
        // ============================================
        const clientPassword = await bcrypt.hash('client123', 12);
        const clients = [];

        const clientData = [
            { name: 'Fatima Abdou', phone: '+22790300001', lat: 13.5100, lng: 2.1200 },
            { name: 'Mariama Issoufou', phone: '+22790300002', lat: 13.5000, lng: 2.1350 },
            { name: 'Aïcha Boubacar', phone: '+22790300003', lat: 13.5150, lng: 2.1050 }
        ];

        for (const c of clientData) {
            const userId = uuidv4();
            await db.User.create({
                id: userId,
                phone: c.phone,
                email: `${c.name.split(' ')[0].toLowerCase()}@gmail.com`,
                password_hash: clientPassword,
                full_name: c.name,
                role: 'client',
                is_active: true,
                is_verified: true,
                latitude: c.lat,
                longitude: c.lng,
                address: 'Niamey, Niger'
            }, { hooks: false });
            clients.push(userId);
        }
        console.log('✅ 3 Clients créés (client123)');

        // ============================================
        // 6. PARAMÈTRES SYSTÈME
        // ============================================
        const settings = [
            { key: 'commission_rate', value: 5, description: 'Taux de commission Todjom (%)' },
            { key: 'max_delivery_time', value: 180, description: 'Délai de livraison maximum (minutes)' },
            { key: 'reassign_delay', value: 60, description: 'Délai avant réassignation distributeur (minutes)' },
            { key: 'client_wait_time', value: 15, description: 'Temps d\'attente client injoignable (minutes)' },
            { key: 'refund_delay_hours', value: 48, description: 'Délai de remboursement (heures)' },
            { key: 'app_name', value: 'TODJOM GAZ', description: 'Nom de l\'application' },
            { key: 'currency', value: 'CFA', description: 'Devise' },
            { key: 'country', value: 'Niger', description: 'Pays' }
        ];

        for (const s of settings) {
            await db.Setting.create({
                key: s.key,
                value: s.value,
                description: s.description,
                updated_by: adminId
            });
        }
        console.log('✅ Paramètres système configurés');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !');
        console.log('='.repeat(50));
        console.log('\nComptes de test :');
        console.log('  Admin:        admin@todjomgaz.com / admin123');
        console.log('  Fournisseur:  contact@nigergaz.ne / fournisseur123');
        console.log('  Distributeur: +22790200001 / livreur123');
        console.log('  Client:       +22790300001 / client123');
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur seed:', error);
        process.exit(1);
    }
};

seed();
