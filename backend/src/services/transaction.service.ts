import pool from '../db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export class TransactionService {
  static async recordStockTransaction(productId: number, userId: number, typeName: 'IN' | 'OUT' | 'RETURN' | 'DAMAGE', quantity: number, notes?: string, referenceId?: number) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Get transaction type ID
      const [typeRows]: any = await connection.query('SELECT id FROM transaction_types WHERE name = ?', [typeName]);
      if (typeRows.length === 0) throw new Error('Invalid transaction type');
      const typeId = typeRows[0].id;

      // 2. Record transaction
      await connection.query(
        'INSERT INTO stock_transactions (product_id, user_id, transaction_type_id, quantity, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [productId, userId, typeId, quantity, referenceId || null, notes || null]
      );

      // 3. Update inventory levels
      const adjustment = (typeName === 'IN' || typeName === 'RETURN') ? quantity : -quantity;
      
      // Find the inventory record for this product
      const [invRows]: any = await connection.query('SELECT id FROM inventory WHERE product_id = ?', [productId]);
      if (invRows.length > 0) {
        const inventoryId = invRows[0].id;
        
        // Find which location has this product's inventory level.
        // For simplicity, we prioritize location_id = 1, but if not found, we pick any existing record for this inventory_id.
        const [levelRows]: any = await connection.query('SELECT location_id FROM inventory_levels WHERE inventory_id = ? ORDER BY (location_id = 1) DESC LIMIT 1', [inventoryId]);
        
        if (levelRows.length > 0) {
          const locId = levelRows[0].location_id;
            // Check current stock to prevent negative inventory (DB also enforces CHECK)
            const [currentRows]: any = await connection.query(
              'SELECT stock_quantity FROM inventory_levels WHERE inventory_id = ? AND location_id = ?',
              [inventoryId, locId]
            );
            const currentStock = currentRows.length > 0 ? Number(currentRows[0].stock_quantity) : 0;
            const newStock = currentStock + adjustment;
            if (newStock < 0) {
              throw new Error('Insufficient stock');
            }

            await connection.query(
              'UPDATE inventory_levels SET stock_quantity = stock_quantity + ? WHERE inventory_id = ? AND location_id = ?',
              [adjustment, inventoryId, locId]
            );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getTransactions(limit?: number) {
    let query = `
      SELECT 
        st.*, 
        p.name as product_name, 
        u.username,
        tt.name as transaction_type
      FROM stock_transactions st 
      JOIN products p ON st.product_id = p.id 
      JOIN users u ON st.user_id = u.id 
      JOIN transaction_types tt ON st.transaction_type_id = tt.id
      ORDER BY st.timestamp DESC
    `;
    if (limit) query += ` LIMIT ${limit}`;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getDashboardStats() {
    const [[totalProducts]]: any = await pool.query('SELECT COUNT(*) as count FROM products');
    
    const [[lowStock]]: any = await pool.query(`
      SELECT COUNT(*) as count 
      FROM inventory_levels il
      WHERE il.stock_quantity <= il.min_stock_level
    `);

    const [[totalValue]]: any = await pool.query(`
      SELECT SUM(pp.price * il.stock_quantity) as value 
      FROM product_prices pp
      JOIN inventory i ON pp.product_id = i.product_id
      JOIN inventory_levels il ON i.id = il.inventory_id
      WHERE pp.id IN (SELECT MAX(id) FROM product_prices GROUP BY product_id)
    `);

    const [recentActivities]: any = await pool.query(`
      SELECT 
        st.*, 
        p.name as product_name,
        tt.name as transaction_type
      FROM stock_transactions st 
      JOIN products p ON st.product_id = p.id 
      JOIN transaction_types tt ON st.transaction_type_id = tt.id
      ORDER BY st.timestamp DESC 
      LIMIT 5
    `);

    return {
      totalProducts: totalProducts.count,
      lowStock: lowStock.count,
      totalValue: totalValue.value || 0,
      recentActivities
    };
  }
}
