const db = require('../config/db');

const Service = {
  async list({ search, page, limit, offset, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(name LIKE ? OR slug LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM services ${clause}`, params);
    const [rows] = await db.query(
      `SELECT * FROM services ${clause} ORDER BY sort_order ASC, name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO services (name, slug, icon_image, description, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.slug, data.icon_image || null, data.description || null, data.is_active, data.sort_order || 0]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE services SET name = ?, slug = ?, icon_image = ?, description = ?, is_active = ?, sort_order = ? WHERE id = ?`,
      [data.name, data.slug, data.icon_image, data.description || null, data.is_active, data.sort_order || 0, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM services WHERE id = ?', [id]);
  },
};

module.exports = Service;
