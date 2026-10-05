const db = require('../config/db');

const Testimonial = {
  async list({ search, page, limit, offset, is_published }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(t.patient_name LIKE ? OR t.message LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (is_published !== undefined && is_published !== '') {
      where.push('t.is_published = ?');
      params.push(Number(is_published) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM testimonials t ${clause}`, params);
    const [rows] = await db.query(
      `SELECT t.*, s.name AS speciality_name, d.name AS doctor_name
       FROM testimonials t
       LEFT JOIN specialities s ON s.id = t.speciality_id
       LEFT JOIN doctors d ON d.id = t.doctor_id
       ${clause}
       ORDER BY t.sort_order ASC, t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT t.*, s.name AS speciality_name, d.name AS doctor_name
       FROM testimonials t
       LEFT JOIN specialities s ON s.id = t.speciality_id
       LEFT JOIN doctors d ON d.id = t.doctor_id
       WHERE t.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO testimonials
        (patient_name, patient_photo, rating, message, speciality_id, doctor_id, video_url, is_published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patient_name,
        data.patient_photo || null,
        data.rating,
        data.message,
        data.speciality_id,
        data.doctor_id,
        data.video_url || null,
        data.is_published,
        data.sort_order || 0,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE testimonials SET
        patient_name = ?, patient_photo = ?, rating = ?, message = ?, speciality_id = ?,
        doctor_id = ?, video_url = ?, is_published = ?, sort_order = ?
       WHERE id = ?`,
      [
        data.patient_name,
        data.patient_photo,
        data.rating,
        data.message,
        data.speciality_id,
        data.doctor_id,
        data.video_url || null,
        data.is_published,
        data.sort_order || 0,
        id,
      ]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
  },
};

module.exports = Testimonial;
