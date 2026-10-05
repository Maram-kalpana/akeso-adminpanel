const db = require('../config/db');

const Doctor = {
  async list({ search, page, limit, offset, speciality_id, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(d.name LIKE ? OR d.license_number LIKE ? OR d.hospital_location LIKE ? OR d.slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (speciality_id) {
      where.push('d.speciality_id = ?');
      params.push(Number(speciality_id));
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('d.is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM doctors d ${clause}`,
      params
    );
    const [rows] = await db.query(
      `SELECT d.*, s.name AS speciality_name,
        (SELECT GROUP_CONCAT(dq.qualification ORDER BY dq.sort_order SEPARATOR ', ')
         FROM doctor_qualifications dq WHERE dq.doctor_id = d.id) AS qualifications_text
       FROM doctors d
       LEFT JOIN specialities s ON s.id = d.speciality_id
       ${clause}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT d.*, s.name AS speciality_name
       FROM doctors d
       LEFT JOIN specialities s ON s.id = d.speciality_id
       WHERE d.id = ? LIMIT 1`,
      [id]
    );
    const doctor = rows[0];
    if (!doctor) return null;

    const [qualifications] = await db.query(
      'SELECT id, qualification, sort_order FROM doctor_qualifications WHERE doctor_id = ? ORDER BY sort_order, id',
      [id]
    );
    const [expertise] = await db.query(
      'SELECT id, expertise, sort_order FROM doctor_expertise WHERE doctor_id = ? ORDER BY sort_order, id',
      [id]
    );

    return {
      ...doctor,
      qualifications: qualifications.map((q) => q.qualification),
      expertise: expertise.map((e) => e.expertise),
    };
  },

  async create(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO doctors
          (name, slug, designation, speciality_id, photo, license_number, hospital_location,
           short_bio, experience_years, is_featured, is_active, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.slug,
          data.designation || null,
          data.speciality_id,
          data.photo || null,
          data.license_number || null,
          data.hospital_location || null,
          data.short_bio || null,
          data.experience_years,
          data.is_featured,
          data.is_active,
          data.meta_title || null,
          data.meta_description || null,
        ]
      );
      const id = result.insertId;
      await this.replaceChildren(conn, id, data);
      await conn.commit();
      return this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async update(id, data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `UPDATE doctors SET
          name = ?, slug = ?, designation = ?, speciality_id = ?, photo = ?,
          license_number = ?, hospital_location = ?, short_bio = ?,
          experience_years = ?, is_featured = ?, is_active = ?, meta_title = ?, meta_description = ?
         WHERE id = ?`,
        [
          data.name,
          data.slug,
          data.designation || null,
          data.speciality_id,
          data.photo,
          data.license_number || null,
          data.hospital_location || null,
          data.short_bio || null,
          data.experience_years,
          data.is_featured,
          data.is_active,
          data.meta_title || null,
          data.meta_description || null,
          id,
        ]
      );
      await this.replaceChildren(conn, id, data);
      await conn.commit();
      return this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async replaceChildren(conn, doctorId, data) {
    await conn.query('DELETE FROM doctor_qualifications WHERE doctor_id = ?', [doctorId]);
    await conn.query('DELETE FROM doctor_expertise WHERE doctor_id = ?', [doctorId]);

    for (let i = 0; i < (data.qualifications || []).length; i += 1) {
      await conn.query(
        'INSERT INTO doctor_qualifications (doctor_id, qualification, sort_order) VALUES (?, ?, ?)',
        [doctorId, data.qualifications[i], i]
      );
    }
    for (let i = 0; i < (data.expertise || []).length; i += 1) {
      await conn.query(
        'INSERT INTO doctor_expertise (doctor_id, expertise, sort_order) VALUES (?, ?, ?)',
        [doctorId, data.expertise[i], i]
      );
    }
  },

  async remove(id) {
    await db.query('DELETE FROM doctors WHERE id = ?', [id]);
  },

  async options() {
    const [rows] = await db.query(
      'SELECT id, name, designation FROM doctors WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows;
  },
};

module.exports = Doctor;
