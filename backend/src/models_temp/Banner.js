const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Banner = sequelize.define('Banner', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        link_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'banners',
        underscored: true,
        timestamps: true
    });

    return Banner;
};
