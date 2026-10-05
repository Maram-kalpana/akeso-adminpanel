const db = require('../config/db');

const HealthLibrary = {
  async list({ search, page, limit, offset }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(hl.patient_name LIKE ? OR hl.phone LIKE ? OR hl.email LIKE ? OR hl.disease LIKE ? OR hl.hospital_name LIKE ? OR hl.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM health_library hl ${clause}`, params);
    const [rows] = await db.query(
      `SELECT hl.* FROM health_library hl ${clause} ORDER BY hl.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM health_library WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO health_library
        (title, slug, patient_name, phone, email, country, disease, previous_reports,
         treatment_start_date, treatment_end_date, amount, hospital_name, post_op_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.slug,
        data.patient_name || null,
        data.phone || null,
        data.email || null,
        data.country || null,
        data.disease || null,
        data.previous_reports || null,
        data.treatment_start_date || null,
        data.treatment_end_date || null,
        data.amount,
        data.hospital_name || null,
        data.post_op_details || null,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE health_library SET
        title = ?, slug = ?, patient_name = ?, phone = ?, email = ?, country = ?, disease = ?,
        previous_reports = ?, treatment_start_date = ?, treatment_end_date = ?, amount = ?,
        hospital_name = ?, post_op_details = ?
       WHERE id = ?`,
      [
        data.title,
        data.slug,
        data.patient_name || null,
        data.phone || null,
        data.email || null,
        data.country || null,
        data.disease || null,
        data.previous_reports,
        data.treatment_start_date || null,
        data.treatment_end_date || null,
        data.amount,
        data.hospital_name || null,
        data.post_op_details || null,
        id,
      ]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM health_library WHERE id = ?', [id]);
  },
};

module.exports = HealthLibrary;
