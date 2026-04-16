
const { User } = require('../src/models');

async function listUsers() {
    try {
        console.log('📋 Liste des utilisateurs en base :');
        const users = await User.findAll({ attributes: ['phone', 'email', 'role', 'full_name'] });
        
        if (users.length === 0) {
            console.log('❌ Aucun utilisateur trouvé dans la base de données !');
        } else {
            console.table(users.map(u => u.toJSON()));
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
}

listUsers();
