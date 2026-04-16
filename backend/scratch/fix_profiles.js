const { User, Supplier, Distributor, Product, sequelize } = require('../src/models');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion BD réussie');

        // 1. Trouver l'utilisateur fournisseur
        const user = await User.findOne({ where: { email: 'nigergaz@todjom.com' } });
        if (!user) {
            console.log('❌ Utilisateur nigergaz@todjom.com non trouvé. As-tu lancé le seeder ?');
            return;
        }

        // 2. Créer le profil fournisseur s'il n'existe pas
        const [supplier, created] = await Supplier.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                company_name: 'NIGER GAZ',
                registration_number: 'RCCM-NI-12345',
                is_validated: true,
                commission_rate: 5,
                mobile_money_number: '90000000'
            }
        });

        if (created) console.log('✅ Profil fournisseur créé !');
        else console.log('ℹ️ Profil fournisseur existait déjà.');

        // 3. Créer un produit pour ce fournisseur pour pouvoir tester
        const [product, pCreated] = await Product.findOrCreate({
            where: { supplier_id: supplier.id, gas_type: 'Bouteille 12 kg' },
            defaults: {
                gas_type: 'Bouteille 12 kg',
                weight_kg: 12,
                price_cfa: 6500,
                stock_quantity: 50,
                is_available: true
            }
        });
        if (pCreated) console.log('✅ Produit de test créé !');

        // 4. Vérifier/Créer l'utilisateur client
        const clientUser = await User.findOne({ where: { email: 'client@nita.com' } });
        if (clientUser) {
            console.log('✅ Utilisateur client trouvé.');
        }

        // 5. Créer un livreur de test (pour l'assignation)
        const dUser = await User.findOne({ where: { email: 'livreur@todjom.com' } });
        if (dUser) {
            await Distributor.findOrCreate({
                where: { user_id: dUser.id },
                defaults: {
                    vehicle_type: 'Moto',
                    is_available: true,
                    is_validated: true,
                    vehicle_plate: 'NI-8888-A'
                }
            });
            console.log('✅ Profil livreur prêt !');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

fix();
