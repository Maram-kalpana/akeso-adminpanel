const db = require('../config/db');
const { baseSlug } = require('../utils/slug');

const Speciality = {
  async list({ search, page, limit, offset, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(sp.name LIKE ? OR sp.slug LIKE ? OR sp.about_content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('sp.is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM specialities sp ${clause}`, params);
    const [rows] = await db.query(
      `SELECT sp.*,
        (SELECT GROUP_CONCAT(h.highlight_text ORDER BY h.sort_order SEPARATOR ', ')
         FROM speciality_highlights h WHERE h.speciality_id = sp.id) AS highlights_text,
        (SELECT GROUP_CONCAT(ss.name ORDER BY ss.sort_order SEPARATOR ', ')
         FROM speciality_subspecialities ss WHERE ss.speciality_id = sp.id) AS subspecialities_text,
        (SELECT GROUP_CONCAT(ai.name ORDER BY ai.sort_order SEPARATOR ', ')
         FROM speciality_ailment_items ai WHERE ai.speciality_id = sp.id) AS ailments_text
       FROM specialities sp ${clause}
       ORDER BY sp.sort_order ASC, sp.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM specialities WHERE id = ? LIMIT 1', [id]);
    const row = rows[0];
    if (!row) return null;
    const [highlights] = await db.query(
      'SELECT highlight_text FROM speciality_highlights WHERE speciality_id = ? ORDER BY sort_order, id',
      [id]
    );
    const [subs] = await db.query(
      'SELECT name FROM speciality_subspecialities WHERE speciality_id = ? ORDER BY sort_order, id',
      [id]
    );
    const [ailments] = await db.query(
      'SELECT name FROM speciality_ailment_items WHERE speciality_id = ? ORDER BY sort_order, id',
      [id]
    );
    return {
      ...row,
      highlights: highlights.map((h) => h.highlight_text),
      subspecialities: subs.map((s) => s.name),
      ailments: ailments.map((a) => a.name),
    };
  },





  async create(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO specialities (name, slug, about_content, about_image, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.slug,
          data.about_content || null,
          data.about_image || null,
          data.is_active,
          data.sort_order || 0,
        ]
      );
      await this.replaceChildren(conn, result.insertId, data);
      await conn.commit();
      return this.findById(result.insertId);
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
        `UPDATE specialities
         SET name = ?, slug = ?, about_content = ?, about_image = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.name,
          data.slug,
          data.about_content || null,
          data.about_image,
          data.is_active,
          data.sort_order || 0,
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

  async replaceChildren(conn, specialityId, data) {
    await conn.query('DELETE FROM speciality_highlights WHERE speciality_id = ?', [specialityId]);
    await conn.query('DELETE FROM speciality_subspecialities WHERE speciality_id = ?', [specialityId]);
    await conn.query('DELETE FROM speciality_ailment_items WHERE speciality_id = ?', [specialityId]);

    for (let i = 0; i < (data.highlights || []).length; i += 1) {
      await conn.query(
        'INSERT INTO speciality_highlights (speciality_id, highlight_text, sort_order) VALUES (?, ?, ?)',
        [specialityId, data.highlights[i], i]
      );
    }
    const usedSlugs = new Set();
    for (let i = 0; i < (data.subspecialities || []).length; i += 1) {
      let slug = baseSlug(data.subspecialities[i]);
      let n = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug(data.subspecialities[i])}-${n}`;
        n += 1;
      }
      usedSlugs.add(slug);
      await conn.query(
        'INSERT INTO speciality_subspecialities (speciality_id, name, slug, sort_order) VALUES (?, ?, ?, ?)',
        [specialityId, data.subspecialities[i], slug, i]
      );
    }
    for (let i = 0; i < (data.ailments || []).length; i += 1) {
      await conn.query(
        'INSERT INTO speciality_ailment_items (speciality_id, name, sort_order) VALUES (?, ?, ?)',
        [specialityId, data.ailments[i], i]
      );
    }
  },


async findPublicDetailsBySlug(slug) {
  /* =========================================
     SPECIALITY MAIN DATA
  ========================================= */

  const [rows] = await db.query(
    `SELECT *
     FROM specialities
     WHERE slug = ?
       AND is_active = 1
     LIMIT 1`,
    [slug]
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  const specialityId = row.id;


  /* =========================================
     RELATED DATA
     Run queries parallel for better performance
  ========================================= */

  const [
    [highlights],
    [subspecialities],
    [ailments],
    [stories],
  ] = await Promise.all([

    /* HIGHLIGHTS */
    db.query(
      `SELECT
         id,
         highlight_text,
         sort_order
       FROM speciality_highlights
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),


    /* SUB SPECIALITIES */
    db.query(
      `SELECT
         id,
         name,
         slug,
         sort_order
       FROM speciality_subspecialities
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),


    /* AILMENTS */
    db.query(
      `SELECT
         id,
         name,
         sort_order
       FROM speciality_ailment_items
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),


    /* OUR STORIES */
    db.query(
      `SELECT
         id,
         patient_name,
         title,
         slug,
         speciality_id,
         video_url,
         created_at
       FROM our_stories
       WHERE speciality_id = ?
         AND is_published = 1
       ORDER BY created_at DESC`,
      [specialityId]
    ),
  ]);


  /* =========================================
     FINAL USER-SIDE RESPONSE
  ========================================= */

  return {
    ...row,

    highlights:
      highlights.map(
        (item) =>
          item.highlight_text
      ),

    subspecialities,

    ailments:
      ailments.map(
        (item) =>
          item.name
      ),

    patient_stories:
      stories,
  };
},


  async remove(id) {
    await db.query('DELETE FROM specialities WHERE id = ?', [id]);
  },

  async options() {
    const [rows] = await db.query(
      'SELECT id, name FROM specialities WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
    );
    return rows;
  },
};

module.exports = Speciality;
