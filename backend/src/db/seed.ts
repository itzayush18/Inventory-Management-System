import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mysql',
    database: process.env.DB_NAME || 'inventory_db',
  });

  try {
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data (in reverse order of dependencies)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE user_roles');
    await connection.query('TRUNCATE TABLE product_category_map');
    await connection.query('TRUNCATE TABLE product_supplier_map');
    await connection.query('TRUNCATE TABLE product_attribute_values');
    await connection.query('TRUNCATE TABLE product_identifiers');
    await connection.query('TRUNCATE TABLE product_prices');
    await connection.query('TRUNCATE TABLE inventory_levels');
    await connection.query('TRUNCATE TABLE stock_transactions');
    await connection.query('TRUNCATE TABLE inventory');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE suppliers');
    await connection.query('TRUNCATE TABLE supplier_addresses');
    await connection.query('TRUNCATE TABLE supplier_contacts');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Roles & Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const shopkeeperPassword = await bcrypt.hash('keeper123', 10);

    const [adminResult]: any = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', adminPassword]);
    const adminId = adminResult.insertId;
    const [keeperResult]: any = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['shopkeeper', shopkeeperPassword]);
    const keeperId = keeperResult.insertId;

    const [adminRole]: any = await connection.query('SELECT id FROM roles WHERE role_name = "admin"');
    const [keeperRole]: any = await connection.query('SELECT id FROM roles WHERE role_name = "shopkeeper"');

    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?), (?, ?)', [adminId, adminRole[0].id, keeperId, keeperRole[0].id]);

    // 3. Categories
    const [electronicsResult]: any = await connection.query('INSERT INTO categories (name) VALUES (?)', ['Electronics']);
    const electronicsId = electronicsResult.insertId;
    await connection.query('INSERT INTO categories (name, parent_id) VALUES (?, ?)', ['Laptops', electronicsId]);
    await connection.query('INSERT INTO categories (name, parent_id) VALUES (?, ?)', ['Smartphones', electronicsId]);

    // 4. Suppliers
    const [supplierResult]: any = await connection.query('INSERT INTO suppliers (name) VALUES (?)', ['Global Tech']);
    const supplierId = supplierResult.insertId;
    await connection.query('INSERT INTO supplier_addresses (supplier_id, address) VALUES (?, ?)', [supplierId, '123 Tech Avenue, Silicon Valley']);
    await connection.query('INSERT INTO supplier_contacts (supplier_id, contact_type, value) VALUES (?, ?, ?)', [supplierId, 'email', 'info@globaltech.com']);

    // 5. Products
    const products = [
      { name: 'MacBook Pro', sku: 'MBP-2024-01', barcode: '123456789', price: 1999.99, stock: 10, min: 2 },
      { name: 'iPhone 15', sku: 'IPH-15-B', barcode: '987654321', price: 999.99, stock: 25, min: 5 }
    ];

    const [mainLocation]: any = await connection.query('SELECT id FROM locations LIMIT 1');
    const locationId = mainLocation[0].id;

    for (const p of products) {
      const [prodRes]: any = await connection.query('INSERT INTO products (name, description) VALUES (?, ?)', [p.name, p.name + ' description']);
      const pid = prodRes.insertId;
      await connection.query('INSERT INTO product_identifiers (product_id, sku, barcode) VALUES (?, ?, ?)', [pid, p.sku, p.barcode]);
      await connection.query('INSERT INTO product_prices (product_id, price) VALUES (?, ?)', [pid, p.price]);
      await connection.query('INSERT INTO product_category_map (product_id, category_id) VALUES (?, ?)', [pid, electronicsId]);
      await connection.query('INSERT INTO product_supplier_map (product_id, supplier_id) VALUES (?, ?)', [pid, supplierId]);
      
      const [invRes]: any = await connection.query('INSERT INTO inventory (product_id) VALUES (?)', [pid]);
      await connection.query('INSERT INTO inventory_levels (inventory_id, location_id, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?)', [invRes.insertId, locationId, p.stock, p.min]);
    }

    console.log('✅ Seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('- Admin: admin / admin123');
    console.log('- Shopkeeper: shopkeeper / keeper123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seed();
