const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PromoCode = sequelize.define('PromoCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      defaultValue: 'percentage'
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    max_discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'promo_codes',
    timestamps: true,
    underscored: true
  });

  return PromoCode;
};
