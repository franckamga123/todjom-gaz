// ============================================
// TODJOM GAZ - Modèle User
// ============================================

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        neighborhood: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Quartier de l\'utilisateur'
        },
        role: {
            type: DataTypes.ENUM('client', 'delivery', 'supplier', 'distributor', 'admin'),
            allowNull: false,
            defaultValue: 'client'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // Désactivé par défaut jusqu'à validation Admin
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        has_accepted_contract: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        contract_accepted_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        approval_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        avatar_url: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            defaultValue: null
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            defaultValue: null
        },
        address: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        otp_code: {
            type: DataTypes.STRING(6),
            defaultValue: null
        },
        otp_expires_at: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        refresh_token: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        last_login_at: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    const salt = await bcrypt.genSalt(12);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(12);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            }
        }
    });

    // Méthodes d'instance
    User.prototype.validatePassword = async function(password) {
        return bcrypt.compare(password, this.password_hash);
    };

    User.prototype.toJSON = function() {
        const values = { ...this.get() };
        delete values.password_hash;
        delete values.otp_code;
        delete values.otp_expires_at;
        delete values.refresh_token;
        return values;
    };

    // Méthode pour générer un OTP
    User.prototype.generateOTP = function() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otp_code = otp;
        this.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        return otp;
    };

    User.prototype.verifyOTP = function(code) {
        if (!this.otp_code || !this.otp_expires_at) return false;
        if (new Date() > this.otp_expires_at) return false;
        return this.otp_code === code;
    };

    return User;
};
