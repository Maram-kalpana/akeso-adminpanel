const db = require('../config/db');

const Story = {
  async list({ search, page, limit, offset, speciality_id }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(st.patient_name LIKE ? OR st.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (speciality_id) {
      where.push('st.speciality_id = ?');
      params.push(Number(speciality_id));
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM our_stories st ${clause}`, params);
    const [rows] = await db.query(
      `SELECT st.*, s.name AS speciality_name
       FROM our_stories st
       LEFT JOIN specialities s ON s.id = st.speciality_id
       ${clause}
       ORDER BY st.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT st.*, s.name AS speciality_name
       FROM our_stories st
       LEFT JOIN specialities s ON s.id = st.speciality_id
       WHERE st.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO our_stories (patient_name, title, slug, speciality_id, video_url, is_published)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.patient_name,
        data.title,
        data.slug,
        data.speciality_id,
        data.video_url || null,
        data.is_published,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE our_stories SET
        patient_name = ?, title = ?, slug = ?, speciality_id = ?, video_url = ?, is_published = ?
       WHERE id = ?`,
      [
        data.patient_name,
        data.title,
        data.slug,
        data.speciality_id,
        data.video_url || null,
        data.is_published,
        id,
      ]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM our_stories WHERE id = ?', [id]);
  },
};

module.exports = Story;
