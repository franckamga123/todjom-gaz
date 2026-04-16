const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Emergency = sequelize.define('Emergency', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'URGENCE'
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    lng: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    media_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('NOUVEAU', 'EN_COURS', 'RESOLU'),
      defaultValue: 'NOUVEAU'
    }
  }, {
    tableName: 'emergencies',
    timestamps: true,
    underscored: true
  });

  return Emergency;
};
