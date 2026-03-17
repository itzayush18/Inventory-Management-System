import pool from '../db';
import type { ResultSetHeader } from 'mysql2';

export class ReportsService {
  // Week 4: Aggregate Functions & Week 6: Functions
  static async getDashboardStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        AVG(price) as average_price,
        (SELECT SUM(calculate_inventory_value(id)) FROM products) as total_inventory_value
      FROM products
    `);
    
    const [categories] = await pool.query(`
      SELECT c.name as category_name, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id, c.name
    `);
    
    return {
      overall: (rows as any)[0],
      byCategory: categories
    };
  }

  // Week 4: Set Operations (UNION)
  static async getCriticalStock() {
    const [rows] = await pool.query(`
      SELECT 'OUT_OF_STOCK' as alert_type, id, name, stock_quantity, min_stock_level, price 
      FROM products 
      WHERE stock_quantity = 0
      UNION
      SELECT 'LOW_STOCK' as alert_type, id, name, stock_quantity, min_stock_level, price 
      FROM products 
      WHERE stock_quantity > 0 AND stock_quantity < min_stock_level
    `);
    return rows;
  }

  // Week 5: Subqueries
  static async getPremiumProducts() {
    const [rows] = await pool.query(`
      SELECT id, name, price, stock_quantity 
      FROM products 
      WHERE price > (SELECT AVG(price) FROM products)
    `);
    return rows;
  }

  // Week 5: Views and Joins
  static async getComprehensiveProducts() {
    const [rows] = await pool.query(`
      SELECT * FROM comprehensive_product_view
    `);
    return rows;
  }

  // Week 6: Stored Procedures & Cursors
  static async runLowStockProcedure() {
    // Calling the stored procedure which uses a cursor and exception handling
    await pool.query('CALL process_low_stock_alerts()');
    
    // Fetch the recent user_transactions to show the procedure's effect
    const [rows] = await pool.query(`
      SELECT id, action, timestamp FROM user_transactions 
      WHERE action LIKE 'PROCEDURE ALERT:%' 
      ORDER BY timestamp DESC LIMIT 10
    `);
    return rows;
  }
}
