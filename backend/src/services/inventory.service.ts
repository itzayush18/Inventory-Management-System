import pool from '../db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export class InventoryService {
  // Products
  static async getAllProducts() {
    // Using the view provided in init.sql for basic info, plus stock levels
    const [rows] = await pool.query(`
      SELECT 
        po.*, 
        p.description,
        pi.barcode,
        inv.stock_quantity,
        inv.min_stock_level
      FROM product_overview po
      JOIN products p ON po.id = p.id
      LEFT JOIN product_identifiers pi ON p.id = pi.product_id
      LEFT JOIN (
        SELECT 
          i.product_id,
          COALESCE(SUM(il.stock_quantity), 0) as stock_quantity,
          MIN(il.min_stock_level) as min_stock_level
        FROM inventory i
        LEFT JOIN inventory_levels il ON i.id = il.inventory_id
        GROUP BY i.product_id
      ) inv ON p.id = inv.product_id
    `);
    return rows;
  }

  static async createProduct(data: any) {
    const { 
      name, sku, barcode, category_id, supplier_id, 
      description, price, stock_quantity, min_stock_level,
      location_id 
    } = data;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert into products
      const [productResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO products (name, description) VALUES (?, ?)',
        [name, description]
      );
      const productId = productResult.insertId;

      // 2. Insert identifiers
      await connection.query(
        'INSERT INTO product_identifiers (product_id, sku, barcode) VALUES (?, ?, ?)',
        [productId, sku, barcode]
      );

      // 3. Map to category
      if (category_id) {
        await connection.query(
          'INSERT INTO product_category_map (product_id, category_id) VALUES (?, ?)',
          [productId, category_id]
        );
      }

      // 4. Map to supplier
      if (supplier_id) {
        await connection.query(
          'INSERT INTO product_supplier_map (product_id, supplier_id) VALUES (?, ?)',
          [productId, supplier_id]
        );
      }

      // 5. Initial Price
      await connection.query(
        'INSERT INTO product_prices (product_id, price) VALUES (?, ?)',
        [productId, price]
      );

      // 6. Initialize Inventory
      const [invResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO inventory (product_id) VALUES (?)',
        [productId]
      );
      const inventoryId = invResult.insertId;

      // 7. Set Inventory Level at location
      const locId = location_id || 1; // Default to 'Main Warehouse' which has ID 1 if seeded
      await connection.query(
        'INSERT INTO inventory_levels (inventory_id, location_id, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?)',
        [inventoryId, locId, stock_quantity || 0, min_stock_level || 5]
      );

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateProduct(id: string, data: any) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (data.name !== undefined || data.description !== undefined) {
        const productFields: string[] = [];
        const productValues: any[] = [];
        if (data.name !== undefined) { productFields.push('name = ?'); productValues.push(data.name); }
        if (data.description !== undefined) { productFields.push('description = ?'); productValues.push(data.description); }
        if (productFields.length > 0) {
          await connection.query(`UPDATE products SET ${productFields.join(', ')} WHERE id = ?`, [...productValues, id]);
        }
      }

      if (data.sku !== undefined || data.barcode !== undefined) {
        const identFields: string[] = [];
        const identValues: any[] = [];
        if (data.sku !== undefined) { identFields.push('sku = ?'); identValues.push(data.sku); }
        if (data.barcode !== undefined) { identFields.push('barcode = ?'); identValues.push(data.barcode); }
        if (identFields.length > 0) {
          await connection.query(`UPDATE product_identifiers SET ${identFields.join(', ')} WHERE product_id = ?`, [...identValues, id]);
        }
      }

      if (data.price !== undefined) {
        await connection.query('INSERT INTO product_prices (product_id, price) VALUES (?, ?)', [id, data.price]);
      }

      if (data.category_id !== undefined) {
        await connection.query('DELETE FROM product_category_map WHERE product_id = ?', [id]);
        await connection.query('INSERT INTO product_category_map (product_id, category_id) VALUES (?, ?)', [id, data.category_id]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteProduct(id: string) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }

  // Categories
  static async getAllCategories() {
    const [rows] = await pool.query(`
      SELECT c1.*, c2.name as parent_name 
      FROM categories c1 
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
    `);
    return rows;
  }

  static async createCategory(name: string, description?: string, parent_id?: number) {
    // Note: 'description' column is actually NOT in the new 'categories' table in init.sql
    // User schema for categories: (id, name, parent_id)
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categories (name, parent_id) VALUES (?, ?)',
      [name, parent_id || null]
    );
    return result.insertId;
  }

  // Suppliers
  static async getAllSuppliers() {
    const [rows]: any = await pool.query('SELECT * FROM suppliers');
    for (const supplier of rows as any[]) {
      const [addresses]: any = await pool.query('SELECT address FROM supplier_addresses WHERE supplier_id = ?', [supplier.id]);
      const [contacts]: any = await pool.query('SELECT contact_type, value FROM supplier_contacts WHERE supplier_id = ?', [supplier.id]);
      supplier.addresses = addresses.map((a: any) => a.address);
      supplier.contacts = contacts;
    }
    return rows;
  }

  static async createSupplier(data: any) {
    const { name, addresses, contacts } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO suppliers (name) VALUES (?)',
        [name]
      );
      const supplierId = result.insertId;

      if (addresses && Array.isArray(addresses)) {
        for (const addr of addresses) {
          await connection.query('INSERT INTO supplier_addresses (supplier_id, address) VALUES (?, ?)', [supplierId, addr]);
        }
      }

      if (contacts && Array.isArray(contacts)) {
        for (const contact of contacts) {
          await connection.query('INSERT INTO supplier_contacts (supplier_id, contact_type, value) VALUES (?, ?, ?)', [supplierId, contact.type, contact.value]);
        }
      }

      await connection.commit();
      return supplierId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateSupplier(id: string, data: any) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (data.name) {
        await connection.query('UPDATE suppliers SET name = ? WHERE id = ?', [data.name, id]);
      }

      if (data.addresses) {
        await connection.query('DELETE FROM supplier_addresses WHERE supplier_id = ?', [id]);
        for (const addr of data.addresses) {
          await connection.query('INSERT INTO supplier_addresses (supplier_id, address) VALUES (?, ?)', [id, addr]);
        }
      }

      if (data.contacts) {
        await connection.query('DELETE FROM supplier_contacts WHERE supplier_id = ?', [id]);
        for (const contact of data.contacts) {
          await connection.query('INSERT INTO supplier_contacts (supplier_id, contact_type, value) VALUES (?, ?, ?)', [id, contact.type, contact.value]);
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

  static async deleteSupplier(id: string) {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
  }
}
