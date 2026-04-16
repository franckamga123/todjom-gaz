
const { User } = require('../src/models');

async function resetPasswords() {
    try {
        const testPhones = [
            '90000000', // Admin TODJOM
            '90000002', // Niger Gaz SA
            '90000001', // Amadou Client
            '93290967', // Le priceKamga
            '98689477'  // ALL-SERVICES NIGER
        ];

        console.log('🔄 Réinitialisation des mots de passe réels en cours...');

        for (const phone of testPhones) {
            const user = await User.findOne({ where: { phone } });
            if (user) {
                user.password_hash = 'password123';
                await user.save();
                console.log(`✅ Mot de passe réinitialisé pour : ${phone} (${user.full_name})`);
            }
        }

        console.log('✨ Succès ! Connectez-vous avec "password123".');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
}

resetPasswords();
