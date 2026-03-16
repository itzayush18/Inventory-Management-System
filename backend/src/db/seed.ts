import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_db',
  });

  try {
    console.log('🌱 Starting database seeding...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const shopkeeperPassword = await bcrypt.hash('keeper123', 10);

    // Initial Users
    await connection.query(
      'INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?), (?, ?, ?)',
      [
        'admin', adminPassword, 'admin',
        'shopkeeper', shopkeeperPassword, 'shopkeeper'
      ]
    );

    // Initial Categories
    await connection.query(
      'INSERT IGNORE INTO categories (name, description) VALUES (?, ?), (?, ?)',
      [
        'Electronics', 'Gadgets and hardware',
        'Stationery', 'Office and school supplies'
      ]
    );

    // Initial Suppliers
    await connection.query(
      'INSERT IGNORE INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      ['Global Tech', 'John Doe', 'john@globaltech.com', '+123456789', '123 Tech Avenue']
    );

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
