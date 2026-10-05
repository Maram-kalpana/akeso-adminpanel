const db = require('../config/db');

const Hospital = {
  async list({ search, page, limit, offset, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(name LIKE ? OR city LIKE ? OR slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM hospitals ${clause}`, params);
    const [rows] = await db.query(
      `SELECT * FROM hospitals ${clause} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM hospitals WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO hospitals (name, slug, city, address, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.slug, data.city, data.address || null, data.phone || null, data.is_active]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      'UPDATE hospitals SET name = ?, slug = ?, city = ?, address = ?, phone = ?, is_active = ? WHERE id = ?',
      [data.name, data.slug, data.city, data.address || null, data.phone || null, data.is_active, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM hospitals WHERE id = ?', [id]);
  },

  async options() {
    const [rows] = await db.query(
      'SELECT id, name, city FROM hospitals WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows;
  },
};

module.exports = Hospital;
