import pool from '../db';

export class TransactionService {
  static async recordStockTransaction(productId: number, userId: number, type: 'IN' | 'OUT', quantity: number, reason: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Record transaction
      await connection.query(
        'INSERT INTO stock_transactions (product_id, user_id, type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
        [productId, userId, type, quantity, reason]
      );

      // Update product stock
      const adjustment = type === 'IN' ? quantity : -quantity;
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [adjustment, productId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getTransactions(limit?: number) {
    let query = 'SELECT st.*, p.name as product_name, u.username FROM stock_transactions st JOIN products p ON st.product_id = p.id JOIN users u ON st.user_id = u.id ORDER BY st.timestamp DESC';
    if (limit) query += ` LIMIT ${limit}`;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getDashboardStats() {
    const [[totalProducts]]: any = await pool.query('SELECT COUNT(*) as count FROM products');
    const [[lowStock]]: any = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level');
    const [[totalValue]]: any = await pool.query('SELECT SUM(price * stock_quantity) as value FROM products');
    const [recentActivities]: any = await pool.query(
      'SELECT st.*, p.name as product_name FROM stock_transactions st JOIN products p ON st.product_id = p.id ORDER BY st.timestamp DESC LIMIT 5'
    );

    return {
      totalProducts: totalProducts.count,
      lowStock: lowStock.count,
      totalValue: totalValue.value || 0,
      recentActivities
    };
  }
}
