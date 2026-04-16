
const { SystemLog, User } = require('./src/models');

async function seedLogs() {
    try {
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.error('❌ Admin non trouvé. Lance le seeder d\'abord.');
            return;
        }

        const logs = [
            {
                user_id: admin.id,
                action: 'LOGIN',
                entity_type: 'user',
                entity_id: admin.id,
                details: 'Connexion de l\'administrateur système',
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0',
                created_at: new Date(Date.now() - 1000 * 60 * 30) // Il y a 30 mins
            },
            {
                user_id: admin.id,
                action: 'VALIDATE_SUPPLIER',
                entity_type: 'supplier',
                entity_id: 1,
                details: 'Validation du fournisseur Niger Gaz',
                ip_address: '127.0.0.1',
                created_at: new Date(Date.now() - 1000 * 60 * 15) // Il y a 15 mins
            },
            {
                user_id: admin.id,
                action: 'UPDATE_SETTINGS',
                entity_type: 'settings',
                details: 'Mise à jour du taux de commission à 5%',
                ip_address: '127.0.0.1',
                created_at: new Date()
            }
        ];

        await SystemLog.bulkCreate(logs);
        console.log('✅ 3 logs de test injectés avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'injection :', error);
        process.exit(1);
    }
}

seedLogs();
