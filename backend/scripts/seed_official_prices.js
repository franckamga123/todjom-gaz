/**
 * TODJOM GAZ - Seeder des Prix Officiels (Niger)
 * Ce script initialise les marques et les prix officiels du marché.
 */

const { User, Supplier, Product, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seedOfficialPrices() {
    const t = await sequelize.transaction();
    try {
        console.log('--- Initialisation des Prix Officiels ---');

        const brands = [
            'Niger Gaz', 'Ténéré Gaz', 'SONIHY', 'ORIBA Gaz', 'Gani Gaz', 
            'Niyya Da Kokari Gaz', 'Éléphant Gaz', 'Zanzat Gaz', 'Arewa Gaz', 
            'Zamany Gaz', 'NECO Gaz', 'Dangara Gaz', 'Adaltchi Gaz', 'Star Oil', 'SONIGAZ'
        ];

        const gasTypes = [
            { type: '3kg (Mini)', price: 900 },
            { type: '6kg (Petit)', price: 1800 },
            { type: '12.5kg (Moyen)', price: 3750 }
        ];

        for (const brandName of brands) {
            // 1. Créer/Trouver l'utilisateur Fournisseur
            const phone = `227000000${brands.indexOf(brandName).toString().padStart(2, '0')}`;
            const [user] = await User.findOrCreate({
                where: { phone },
                defaults: {
                    full_name: `Responsable ${brandName}`,
                    email: `${brandName.toLowerCase().replace(/ /g, '')}@todjom.com`,
                    password_hash: 'Todjom2024!', // sera haché par le hook
                    role: 'supplier',
                    is_active: true,
                    approval_status: 'approved'
                },
                transaction: t
            });

            // 2. Créer le profil Fournisseur
            const [supplier] = await Supplier.findOrCreate({
                where: { user_id: user.id },
                defaults: {
                    company_name: brandName,
                    is_validated: true
                },
                transaction: t
            });

            // 3. Créer les produits pour ce fournisseur
            for (const gas of gasTypes) {
                // Spécial pour SONIGAZ qui n'a pas tous les prix dans le tableau
                if (brandName === 'SONIGAZ' && gas.type !== '3kg (Mini)') continue;

                await Product.findOrCreate({
                    where: { 
                        supplier_id: supplier.id,
                        gas_type: gas.type 
                    },
                    defaults: {
                        name: `${brandName} - ${gas.type}`,
                        description: `Bouteille de gaz ${brandName} format ${gas.type}`,
                        price: gas.price,
                        stock: 100, // Stock initial par défaut
                        is_active: true
                    },
                    transaction: t
                });
            }
            console.log(`✅ ${brandName} initialisé avec ses produits.`);
        }

        await t.commit();
        console.log('--- Fin de l\'initialisation ---');
        process.exit(0);
    } catch (error) {
        await t.rollback();
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seedOfficialPrices();
