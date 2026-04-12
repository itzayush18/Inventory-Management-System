CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- =========================
-- USERS & ROLES
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =========================
-- CATEGORIES (HIERARCHY)
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    UNIQUE(name, parent_id),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =========================
-- SUPPLIERS (FULLY NORMALIZED)
-- =========================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    address TEXT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS supplier_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    contact_type VARCHAR(50), -- phone/email
    value VARCHAR(100),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- =========================
-- PRODUCTS (CORE)
-- =========================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IDENTIFIERS (SKU, BARCODE)
CREATE TABLE IF NOT EXISTS product_identifiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- MANY-TO-MANY CATEGORY
CREATE TABLE IF NOT EXISTS product_category_map (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- MANY-TO-MANY SUPPLIER
CREATE TABLE IF NOT EXISTS product_supplier_map (
    product_id INT,
    supplier_id INT,
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- =========================
-- PRODUCT ATTRIBUTES (ADVANCED 🔥)
-- =========================
CREATE TABLE IF NOT EXISTS attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS product_attribute_values (
    product_id INT,
    attribute_id INT,
    value VARCHAR(100),
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

-- =========================
-- PRICE HISTORY
-- =========================
CREATE TABLE IF NOT EXISTS product_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- LOCATIONS (WAREHOUSE SUPPORT)
-- =========================
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- =========================
-- INVENTORY (NORMALIZED)
-- =========================
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_levels (
    inventory_id INT,
    location_id INT,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INT DEFAULT 5 CHECK (min_stock_level >= 0),
    PRIMARY KEY (inventory_id, location_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- =========================
-- TRANSACTION TYPES
-- =========================
CREATE TABLE IF NOT EXISTS transaction_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- IN, OUT, RETURN, DAMAGE
);

-- =========================
-- STOCK TRANSACTIONS
-- =========================
CREATE TABLE IF NOT EXISTS stock_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    transaction_type_id INT,
    quantity INT NOT NULL,
    reference_id INT,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id)
);

-- =========================
-- AUDIT LOGS (STRUCTURED)
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    entity_type VARCHAR(50),
    entity_id INT,
    action_type VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- VIEW (FOR EASY QUERYING)
-- =========================
CREATE OR REPLACE VIEW product_overview AS
SELECT 
    p.id,
    p.name AS product_name,
    pi.sku,
    pp.price,
    c.name AS category_name,
    GROUP_CONCAT(s.name SEPARATOR ', ') AS supplier_name,
    COALESCE(SUM(il.stock_quantity), 0) AS stock_quantity
FROM products p
LEFT JOIN product_identifiers pi ON p.id = pi.product_id
LEFT JOIN product_prices pp ON pp.id = (
    SELECT id FROM product_prices WHERE product_id = p.id ORDER BY effective_from DESC, id DESC LIMIT 1
)
LEFT JOIN product_category_map pcm ON p.id = pcm.product_id
LEFT JOIN categories c ON pcm.category_id = c.id
LEFT JOIN product_supplier_map psm ON p.id = psm.product_id
LEFT JOIN suppliers s ON psm.supplier_id = s.id
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN inventory_levels il ON i.id = il.inventory_id
GROUP BY p.id, p.name, pi.sku, pp.price, c.name;
-- =========================
-- INITIAL DATA
-- =========================
INSERT IGNORE INTO roles (role_name) VALUES ('admin'), ('shopkeeper');
INSERT IGNORE INTO transaction_types (name) VALUES ('IN'), ('OUT'), ('RETURN'), ('DAMAGE');
INSERT IGNORE INTO locations (name) VALUES ('Main Warehouse');
INSERT IGNORE INTO attributes (name) VALUES ('Color'), ('Size'), ('Weight'), ('Material');
