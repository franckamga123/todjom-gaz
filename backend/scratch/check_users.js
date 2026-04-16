const { User } = require('../src/models');

async function check() {
  try {
    const users = await User.findAll();
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
      console.log(`Phone: ${u.phone}, Role: ${u.role}, Active: ${u.is_active}, PwdHash: ${u.password_hash.substring(0, 10)}...`);
    });
    console.log('-------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
