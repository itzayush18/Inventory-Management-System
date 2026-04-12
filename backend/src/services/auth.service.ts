import pool from '../db';
import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export class AuthService {
  static async register(username: string, password: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      const userId = userResult.insertId;

      // Assign default 'shopkeeper' role
      const [roleRows]: any = await connection.query('SELECT id FROM roles WHERE role_name = ?', ['shopkeeper']);
      if (roleRows.length > 0) {
        await connection.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleRows[0].id]
        );
      }

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findUserByUsername(username: string) {
    const [rows]: any = await pool.query(
      `SELECT u.*, r.role_name as role 
       FROM users u 
       LEFT JOIN user_roles ur ON u.id = ur.user_id 
       LEFT JOIN roles r ON ur.role_id = r.id 
       WHERE u.username = ?`, 
      [username]
    );
    return rows[0];
  }
}
