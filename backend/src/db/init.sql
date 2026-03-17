CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role ENUM('admin', 'shopkeeper') DEFAULT 'shopkeeper',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category_id INT,
    supplier_id INT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INT DEFAULT 5 CHECK (min_stock_level >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE OR REPLACE VIEW comprehensive_product_view AS
SELECT 
    p.id,
    p.name AS product_name,
    p.sku,
    c.name AS category_name,
    s.name AS supplier_name,
    p.price,
    p.stock_quantity,
    p.min_stock_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

DELIMITER //

DROP FUNCTION IF EXISTS calculate_inventory_value //
CREATE FUNCTION calculate_inventory_value(prod_id INT) RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE total_val DECIMAL(10,2);
    SELECT (price * stock_quantity) INTO total_val FROM products WHERE id = prod_id;
    RETURN total_val;
END //

DROP TRIGGER IF EXISTS after_product_update //
CREATE TRIGGER after_product_update 
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < NEW.min_stock_level AND OLD.stock_quantity >= OLD.min_stock_level THEN
        INSERT INTO user_transactions (user_id, action) 
        VALUES (NULL, CONCAT('SYSTEM ALERT: Stock for product ', NEW.name, ' dropped below minimum level.'));
    END IF;
END //

DROP PROCEDURE IF EXISTS process_low_stock_alerts //
CREATE PROCEDURE process_low_stock_alerts()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE p_id INT;
    DECLARE p_name VARCHAR(200);
    DECLARE p_stock INT;
    DECLARE p_min INT;
    
    DECLARE cur_low_stock CURSOR FOR 
        SELECT id, name, stock_quantity, min_stock_level 
        FROM products 
        WHERE stock_quantity < min_stock_level;
        
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
    BEGIN
        INSERT INTO user_transactions (user_id, action) VALUES (NULL, 'ERROR: Exception caught during low stock processing.');
    END;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur_low_stock;
    
    read_loop: LOOP
        FETCH cur_low_stock INTO p_id, p_name, p_stock, p_min;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO user_transactions (user_id, action) 
        VALUES (NULL, CONCAT('PROCEDURE ALERT: Processed low stock for product: ', p_name, ' (ID: ', p_id, ')'));
    END LOOP;
    
    CLOSE cur_low_stock;
END //

DELIMITER ;
