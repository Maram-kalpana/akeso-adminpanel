const slugify = require('slugify');
const db = require('../config/db');

function baseSlug(value) {
  return slugify(String(value || ''), { lower: true, strict: true, trim: true }) || 'item';
}

const ALLOWED_TABLES = new Set([
  'hospitals',
  'specialities',
  'services',
  'doctors',
  'health_library',
  'our_stories',
  'blogs',
]);

async function uniqueSlug(table, source, existingSlug, excludeId) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error('Invalid slug table');
  }
  let slug = existingSlug ? baseSlug(existingSlug) : baseSlug(source);
  let candidate = slug;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const sql = excludeId
      ? `SELECT id FROM ${table} WHERE slug = ? AND id <> ? LIMIT 1`
      : `SELECT id FROM ${table} WHERE slug = ? LIMIT 1`;
    const [rows] = await db.query(sql, params);
    if (!rows.length) return candidate;
    candidate = `${slug}-${i}`;
    i += 1;
  }
}

module.exports = { baseSlug, uniqueSlug };
