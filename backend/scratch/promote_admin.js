const { User } = require('../src/models');

async function fixRole() {
    try {
        const user = await User.findOne({ where: { email: 'hhhhhhhhhhhhhhhhf@todjom.com' } });
        if (user) {
            console.log(`Found user: ${user.full_name} (${user.email}) - Current Role: ${user.role}`);
            user.role = 'admin';
            await user.save();
            console.log('SUCCESS: User is now ADMIN');
        } else {
            console.log('User not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

fixRole();
