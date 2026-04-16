const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Withdrawal = sequelize.define('Withdrawal', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
            defaultValue: 'PENDING'
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: true
        },
        payment_details: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        admin_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        processed_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'withdrawals',
        underscored: true,
        timestamps: true
    });

    return Withdrawal;
};
