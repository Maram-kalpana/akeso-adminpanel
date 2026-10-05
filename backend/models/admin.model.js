const db = require('../config/db');

const Admin = {
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id, name, email, password, role, created_at FROM admins WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, role }) {
    const [result] = await db.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'editor']
    );
    return this.findById(result.insertId);
  },
};

module.exports = Admin;
