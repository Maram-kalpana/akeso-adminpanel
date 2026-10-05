const db = require('../config/db');

const Blog = {
  async list({ search, page, limit, offset, category, is_published }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(title LIKE ? OR author_name LIKE ? OR slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (is_published !== undefined && is_published !== '') {
      where.push('is_published = ?');
      params.push(Number(is_published) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM blogs ${clause}`, params);
    const [rows] = await db.query(
      `SELECT * FROM blogs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO blogs
        (title, slug, author_name, thumbnail, category, content, tags, is_published, published_at, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.slug,
        data.author_name || null,
        data.thumbnail || null,
        data.category || null,
        data.content || null,
        data.tags,
        data.is_published,
        data.published_at,
        data.meta_title || null,
        data.meta_description || null,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE blogs SET
        title = ?, slug = ?, author_name = ?, thumbnail = ?, category = ?, content = ?,
        tags = ?, is_published = ?, published_at = ?, meta_title = ?, meta_description = ?
       WHERE id = ?`,
      [
        data.title,
        data.slug,
        data.author_name || null,
        data.thumbnail,
        data.category || null,
        data.content || null,
        data.tags,
        data.is_published,
        data.published_at,
        data.meta_title || null,
        data.meta_description || null,
        id,
      ]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
  },
};

module.exports = Blog;
