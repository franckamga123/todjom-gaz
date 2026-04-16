const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    distributor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('moto', 'tricycle', 'camionnette', 'camion'),
      defaultValue: 'moto'
    },
    plate_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    brand_model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active'
    },
    last_service_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'vehicles',
    timestamps: true,
    underscored: true
  });

  return Vehicle;
};
