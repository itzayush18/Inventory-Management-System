import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('🚀 Starting database initialization...');
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    if (sql.includes('DELIMITER //')) {
      const parts = sql.split('DELIMITER //');
      const standardSql = parts[0] || '';
      const customDelimiterPart = (parts[1] || '').split('DELIMITER ;')[0] || '';
      
      if (standardSql.trim()) {
        await connection.query(standardSql);
      }
      
      const statements = customDelimiterPart.split('//').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        await connection.query(stmt);
      }
    } else {
      await connection.query(sql);
    }

    console.log('✅ Database and tables created successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initDB();
