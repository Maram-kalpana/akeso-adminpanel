const db = require('../config/db');

const ALLOWED = new Set(['treatments', 'ailments', 'technologies']);

function createContentModel(table) {
  if (!ALLOWED.has(table)) throw new Error('Invalid content table');

  return {
    async list({ search, page, limit, offset, is_published }) {
      const where = [];
      const params = [];
      if (search) {
        where.push('(title LIKE ? OR slug LIKE ? OR short_description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (is_published !== undefined && is_published !== '') {
        where.push('is_published = ?');
        params.push(Number(is_published) ? 1 : 0);
      }
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM ${table} ${clause}`, params);
      const [rows] = await db.query(
        `SELECT * FROM ${table} ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      return { rows, total, page, limit };
    },

    async findById(id) {
      const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
      return rows[0] || null;
    },

    async create(data) {
      const [result] = await db.query(
        `INSERT INTO ${table} (title, slug, short_description, content, thumbnail, is_published)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.slug,
          data.short_description || null,
          data.content || null,
          data.thumbnail || null,
          data.is_published,
        ]
      );
      return this.findById(result.insertId);
    },

    async update(id, data) {
      await db.query(
        `UPDATE ${table}
         SET title = ?, slug = ?, short_description = ?, content = ?, thumbnail = ?, is_published = ?
         WHERE id = ?`,
        [
          data.title,
          data.slug,
          data.short_description || null,
          data.content || null,
          data.thumbnail,
          data.is_published,
          id,
        ]
      );
      return this.findById(id);
    },

    async remove(id) {
      await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    },

    async published() {
      const [rows] = await db.query(
        `SELECT id, title, slug, short_description, thumbnail FROM ${table} WHERE is_published = 1 ORDER BY title ASC`
      );
      return rows;
    },
  };
}

module.exports = {
  createContentModel,
  Treatment: createContentModel('treatments'),
  Ailment: createContentModel('ailments'),
  Technology: createContentModel('technologies'),
};
