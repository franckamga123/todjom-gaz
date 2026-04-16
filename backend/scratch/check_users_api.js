const { User, Supplier, Distributor } = require('../src/models');
const { sequelize } = require('../src/models');

async function check() {
    try {
        console.log('Testing User.findAndCountAll...');
        const users = await User.findAndCountAll({
            include: [
                { model: Supplier, as: 'supplierProfile', required: false },
                { model: Distributor, as: 'distributorProfile', required: false }
            ],
            limit: 15,
            offset: 0,
            order: [['created_at', 'DESC']]
        });
        console.log('Success! Found:', users.count);
        process.exit(0);
    } catch (err) {
        console.error('FAILED with error:');
        console.error(err);
        process.exit(1);
    }
}

check();
