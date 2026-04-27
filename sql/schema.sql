CREATE DATABASE IF NOT EXISTS bikexpert;
USE bikexpert;

CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scso_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  shop_address TEXT,
  whatsapp_number VARCHAR(20),
  role ENUM('scso') NOT NULL DEFAULT 'scso',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_by_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_scso_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scso_user_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20),
  address TEXT,
  last_service_date DATE NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_scso FOREIGN KEY (scso_user_id) REFERENCES scso_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bikes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  bike_model VARCHAR(120) NOT NULL,
  bike_number VARCHAR(50) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bike_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scso_user_id INT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  reward_points INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_scso FOREIGN KEY (scso_user_id) REFERENCES scso_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scso_user_id INT NOT NULL,
  customer_id INT NOT NULL,
  bike_id INT NOT NULL,
  service_date DATETIME NOT NULL,
  service_notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  points_used INT NOT NULL DEFAULT 0,
  reminder_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_record_scso FOREIGN KEY (scso_user_id) REFERENCES scso_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_record_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_record_bike FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_record_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_record_id INT NOT NULL,
  service_id INT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  reward_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_record_item_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_record_item_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reward_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL UNIQUE,
  current_balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reward_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_id INT NOT NULL,
  service_record_id INT NULL,
  type ENUM('earned', 'redeemed', 'adjustment') NOT NULL,
  points INT NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES reward_wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scso_user_id INT NOT NULL,
  customer_id INT NOT NULL,
  service_record_id INT NULL,
  reminder_type VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminder_scso FOREIGN KEY (scso_user_id) REFERENCES scso_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminder_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminder_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_record_id INT NOT NULL UNIQUE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  shop_name VARCHAR(150) NOT NULL,
  shop_address TEXT,
  shop_phone VARCHAR(20),
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20),
  bike_model VARCHAR(120) NOT NULL,
  bike_number VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  points_used INT NOT NULL DEFAULT 0,
  whatsapp_share_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scope_type ENUM('global', 'scso') NOT NULL DEFAULT 'scso',
  scope_id INT NULL,
  setting_key VARCHAR(120) NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_setting_scope (scope_type, scope_id, setting_key)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
