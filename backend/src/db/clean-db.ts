import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Adjust path relative to where it's executed so env is loaded properly
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function cleanDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('🧹 Starting database cleanup...');
    await connection.query('DROP DATABASE IF EXISTS inventory_db');
    console.log('✅ Database inventory_db dropped successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await connection.end();
  }
}

cleanDB();
