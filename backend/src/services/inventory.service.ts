import pool from '../db';
import type { ResultSetHeader } from 'mysql2';

export class InventoryService {
  // Products
  static async getAllProducts() {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, s.name as supplier_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN suppliers s ON p.supplier_id = s.id'
    );
    return rows;
  }

  static async createProduct(data: any) {
    const { name, sku, category_id, supplier_id, description, price, stock_quantity, min_stock_level } = data;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, sku, category_id, supplier_id, description, price, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category_id, supplier_id, description, price, stock_quantity || 0, min_stock_level || 5]
    );
    return result.insertId;
  }

  static async updateProduct(id: string, data: any) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await pool.query(`UPDATE products SET ${fields} WHERE id = ?`, values);
  }

  static async deleteProduct(id: string) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }

  // Categories
  static async getAllCategories() {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
  }

  static async createCategory(name: string, description: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  // Suppliers
  static async getAllSuppliers() {
    const [rows] = await pool.query('SELECT * FROM suppliers');
    return rows;
  }

  static async createSupplier(data: any) {
    const { name, contact_person, email, phone, address } = data;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address]
    );
    return result.insertId;
  }

  static async updateSupplier(id: string, data: any) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await pool.query(`UPDATE suppliers SET ${fields} WHERE id = ?`, values);
  }

  static async deleteSupplier(id: string) {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
  }
}
