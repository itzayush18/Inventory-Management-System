import pool from '../db';
import bcrypt from 'bcryptjs';
import type { ResultSetHeader } from 'mysql2';

export class AuthService {
  static async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'shopkeeper']
    );
    return result.insertId;
  }

  static async findUserByUsername(username: string) {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }
}
