-- ============================================
-- TODJOM GAZ - Schéma Base de Données MySQL
-- Version 1.0 | Avril 2026
-- ============================================

-- Création de la base
CREATE DATABASE IF NOT EXISTS todjom_gaz
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE todjom_gaz;

-- ============================================
-- TABLE: users
-- Tous les utilisateurs de la plateforme
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('client', 'supplier', 'distributor', 'admin') NOT NULL DEFAULT 'client',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255) DEFAULT NULL,
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    fcm_token VARCHAR(255) DEFAULT NULL,
    otp_code VARCHAR(6) DEFAULT NULL,
    otp_expires_at DATETIME DEFAULT NULL,
    refresh_token TEXT DEFAULT NULL,
    last_login_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: suppliers
-- Profil étendu des fournisseurs
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(50) DEFAULT NULL,
    registration_doc_url VARCHAR(255) DEFAULT NULL,
    is_validated TINYINT(1) NOT NULL DEFAULT 0,
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    bank_account VARCHAR(50) DEFAULT NULL,
    mobile_money_number VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    validated_at DATETIME DEFAULT NULL,
    validated_by CHAR(36) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_suppliers_validated (is_validated),
    INDEX idx_suppliers_rating (avg_rating)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: distributors
-- Profil étendu des distributeurs/livreurs
-- ============================================
CREATE TABLE IF NOT EXISTS distributors (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    vehicle_type ENUM('moto', 'voiture', 'tricycle', 'velo', 'a_pied') NOT NULL DEFAULT 'moto',
    license_number VARCHAR(30) DEFAULT NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 0,
    is_on_delivery TINYINT(1) NOT NULL DEFAULT 0,
    current_latitude DECIMAL(10, 8) DEFAULT NULL,
    current_longitude DECIMAL(11, 8) DEFAULT NULL,
    total_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_deliveries INT NOT NULL DEFAULT 0,
    last_location_update DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_distributors_available (is_available),
    INDEX idx_distributors_location (current_latitude, current_longitude)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: supplier_distributors
-- Association fournisseur <-> distributeur
-- ============================================
CREATE TABLE IF NOT EXISTS supplier_distributors (
    id CHAR(36) NOT NULL PRIMARY KEY,
    supplier_id CHAR(36) NOT NULL,
    distributor_id CHAR(36) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
    UNIQUE KEY uk_supplier_distributor (supplier_id, distributor_id),
    INDEX idx_sd_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: products
-- Types de gaz proposés par les fournisseurs
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) NOT NULL PRIMARY KEY,
    supplier_id CHAR(36) NOT NULL,
    gas_type VARCHAR(30) NOT NULL,
    weight_kg INT NOT NULL,
    price_cfa DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_products_supplier (supplier_id),
    INDEX idx_products_available (is_available),
    INDEX idx_products_weight (weight_kg),
    CONSTRAINT chk_stock_positive CHECK (stock_quantity >= 0),
    CONSTRAINT chk_price_positive CHECK (price_cfa > 0)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: orders
-- Commandes de gaz
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    distributor_id CHAR(36) DEFAULT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    supplier_amount DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM(
        'pending_payment',
        'paid',
        'accepted',
        'refused',
        'assigned',
        'picked_up',
        'in_delivery',
        'delivered',
        'cancelled',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending_payment',
    delivery_latitude DECIMAL(10, 8) DEFAULT NULL,
    delivery_longitude DECIMAL(11, 8) DEFAULT NULL,
    delivery_address TEXT DEFAULT NULL,
    client_phone VARCHAR(20) DEFAULT NULL,
    cancel_reason TEXT DEFAULT NULL,
    refuse_reason TEXT DEFAULT NULL,
    delivery_photo_url VARCHAR(255) DEFAULT NULL,
    estimated_delivery_at DATETIME DEFAULT NULL,
    accepted_at DATETIME DEFAULT NULL,
    assigned_at DATETIME DEFAULT NULL,
    picked_up_at DATETIME DEFAULT NULL,
    delivered_at DATETIME DEFAULT NULL,
    cancelled_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_orders_client (client_id),
    INDEX idx_orders_supplier (supplier_id),
    INDEX idx_orders_distributor (distributor_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_number (order_number)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: order_status_history
-- Historique des changements de statut
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    old_status VARCHAR(30) DEFAULT NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by CHAR(36) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_osh_order (order_id),
    INDEX idx_osh_date (changed_at)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: payments
-- Transactions de paiement
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method ENUM('orange_money', 'moov_money', 'my_nita', 'amana_bank', 'card', 'cash') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(100) DEFAULT NULL,
    provider_transaction_id VARCHAR(100) DEFAULT NULL,
    provider_response JSON DEFAULT NULL,
    refund_amount DECIMAL(12, 2) DEFAULT NULL,
    refund_reason TEXT DEFAULT NULL,
    refunded_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_ref (transaction_ref),
    INDEX idx_payments_method (method)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: reviews
-- Évaluations des livreurs par les clients
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    distributor_id CHAR(36) NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
    INDEX idx_reviews_distributor (distributor_id),
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: disputes
-- Litiges et réclamations
-- ============================================
CREATE TABLE IF NOT EXISTS disputes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    raised_by CHAR(36) NOT NULL,
    type ENUM('quantity', 'quality', 'delay', 'non_delivery', 'other') NOT NULL,
    description TEXT NOT NULL,
    proof_photo_url VARCHAR(255) DEFAULT NULL,
    status ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    resolution TEXT DEFAULT NULL,
    resolved_by CHAR(36) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_disputes_order (order_id),
    INDEX idx_disputes_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: notifications
-- Notifications push/SMS/email
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    channel ENUM('push', 'sms', 'email', 'in_app') NOT NULL DEFAULT 'in_app',
    type VARCHAR(50) DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    data JSON DEFAULT NULL,
    sent_at DATETIME DEFAULT NULL,
    read_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_type (type)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: system_logs
-- Journalisation des actions sensibles
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id CHAR(36) DEFAULT NULL,
    old_value JSON DEFAULT NULL,
    new_value JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_date (created_at)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: settings
-- Configuration système
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) NOT NULL PRIMARY KEY,
    value JSON NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36) DEFAULT NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- INSERTIONS INITIALES
-- ============================================

-- Paramètres par défaut
INSERT INTO settings (`key`, value, description) VALUES
('commission_rate', '5', 'Taux de commission Todjom (%)'),
('max_delivery_time', '180', 'Délai de livraison maximum en minutes'),
('reassign_delay', '60', 'Délai avant réassignation distributeur (minutes)'),
('client_wait_time', '15', 'Temps d''attente client injoignable (minutes)'),
('refund_delay_hours', '48', 'Délai de remboursement en heures'),
('app_name', '"TODJOM GAZ"', 'Nom de l''application'),
('currency', '"CFA"', 'Devise utilisée'),
('country', '"Niger"', 'Pays d''opération'),
('sms_enabled', 'false', 'Activer les notifications SMS'),
('push_enabled', 'false', 'Activer les notifications push');
