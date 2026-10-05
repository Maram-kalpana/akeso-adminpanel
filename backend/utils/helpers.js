const fs = require('fs');
const path = require('path');
const { UPLOAD_ROOT } = require('../config/multer');

function deleteUploadedFile(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') return;
  const relative = publicPath.replace(/^\/uploads\/?/, '');
  if (!relative || relative.includes('..')) return;
  const abs = path.join(UPLOAD_ROOT, relative);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).toLowerCase();
  return v === '1' || v === 'true' || v === 'on' || v === 'yes';
}

function parseIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (err) {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function parseIdList(value) {
  return parseList(value)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function pagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = {
  deleteUploadedFile,
  parseBoolean,
  parseIntOrNull,
  parseList,
  parseIdList,
  pagination,
};
