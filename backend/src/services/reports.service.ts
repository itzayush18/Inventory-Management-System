import pool from '../db';

export class ReportsService {
  static async getDashboardStats() {
    const [[rows]]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        (SELECT SUM(stock_quantity) FROM inventory_levels) as total_stock,
        (SELECT AVG(price) FROM product_prices WHERE id IN (SELECT MAX(id) FROM product_prices GROUP BY product_id)) as average_price,
        (SELECT SUM(pp.price * il.stock_quantity) 
         FROM product_prices pp 
         JOIN inventory i ON pp.product_id = i.product_id 
         JOIN inventory_levels il ON i.id = il.inventory_id
         WHERE pp.id IN (SELECT MAX(id) FROM product_prices GROUP BY product_id)
        ) as total_inventory_value
      FROM products
    `);
    
    const [categories]: any = await pool.query(`
      SELECT c.name as category_name, COUNT(pcm.product_id) as product_count 
      FROM categories c 
      LEFT JOIN product_category_map pcm ON c.id = pcm.category_id 
      GROUP BY c.id, c.name
    `);
    
    return {
      overall: rows,
      byCategory: categories
    };
  }

  static async getCriticalStock() {
    const [rows]: any = await pool.query(`
      SELECT 'OUT_OF_STOCK' as alert_type, p.id, p.name, il.stock_quantity, il.min_stock_level, pp.price 
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      JOIN inventory_levels il ON i.id = il.inventory_id
      LEFT JOIN product_prices pp ON p.id = pp.product_id
      WHERE il.stock_quantity = 0
      AND (pp.id IS NULL OR pp.id = (SELECT MAX(id) FROM product_prices WHERE product_id = p.id))
      
      UNION
      
      SELECT 'LOW_STOCK' as alert_type, p.id, p.name, il.stock_quantity, il.min_stock_level, pp.price 
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      JOIN inventory_levels il ON i.id = il.inventory_id
      LEFT JOIN product_prices pp ON p.id = pp.product_id
      WHERE il.stock_quantity > 0 AND il.stock_quantity < il.min_stock_level
      AND (pp.id IS NULL OR pp.id = (SELECT MAX(id) FROM product_prices WHERE product_id = p.id))
    `);
    return rows;
  }

  static async getPremiumProducts() {
    const [rows]: any = await pool.query(`
      SELECT p.id, p.name, pp.price, il.stock_quantity 
      FROM products p
      JOIN product_prices pp ON p.id = pp.product_id
      JOIN inventory i ON p.id = i.product_id
      JOIN inventory_levels il ON i.id = il.inventory_id
      WHERE pp.price > (SELECT AVG(price) FROM product_prices)
      AND pp.id IN (SELECT MAX(id) FROM product_prices GROUP BY product_id)
    `);
    return rows;
  }

  static async getComprehensiveProducts() {
    // Falls back to the view created in init.sql
    const [rows]: any = await pool.query(`
      SELECT * FROM product_overview
    `);
    return rows;
  }

  static async runLowStockProcedure() {
    // This simulates an automated diagnostic procedure.
    // In a real scenario, this might trigger emails, update tables, etc.
    const criticalItems = await this.getCriticalStock();
    
    // Transform into "logs" for the frontend
    const logs = criticalItems.map((item: any) => ({
      timestamp: new Date().toISOString(),
      action: `ALERT: Low stock detected for ${item.name} (${item.stock_quantity}/${item.min_stock_level})`
    }));

    if (logs.length === 0) {
      logs.push({
        timestamp: new Date().toISOString(),
        action: 'System diagnostic completed: All stock levels healthy.'
      });
    }

    return logs;
  }
}
