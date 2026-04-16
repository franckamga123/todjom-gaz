const { sequelize } = require('../src/models');

async function check() {
    try {
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Tables in DB:', results.map(r => Object.values(r)[0]));
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

check();
