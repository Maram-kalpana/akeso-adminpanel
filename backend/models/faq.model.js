const db = require('../config/db');

const Faq = {
  async list({ search, page, limit, offset }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(question LIKE ? OR answer LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM faqs ${clause}`, params);
    const [rows] = await db.query(
      `SELECT * FROM faqs ${clause} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO faqs (question, answer, sort_order, is_published) VALUES (?, ?, ?, ?)',
      [data.question, data.answer, data.sort_order || 0, data.is_published]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_published = ? WHERE id = ?',
      [data.question, data.answer, data.sort_order || 0, data.is_published, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM faqs WHERE id = ?', [id]);
  },
};

module.exports = Faq;
