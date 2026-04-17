// ============================================
// TODJOM GAZ - Configuration Base de Données
// ============================================

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'todjom_gaz',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'postgres',
    // Pour Render/Postgres, on peut utiliser DATABASE_URL
    url: process.env.DATABASE_URL || null,
    
    // Options Sequelize
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
    },
    
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ...(process.env.DB_DIALECT !== 'postgres' && {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        })
    },

    timezone: '+01:00' // WAT (West Africa Time)
};
