const db = require('../config/db');

const FIELDS = [
  'email',
  'phone',
  'alt_phone',
  'facebook_url',
  'instagram_url',
  'linkedin_url',
  'youtube_url',
  'address',
  'terms_conditions',
  'privacy_policy',
];

// Quill sends this when the editor is empty
const clean = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '<p><br></p>' ? '' : s;
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const email = clean(req.body.email);
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const [rows] = await db.query('SELECT logo FROM settings WHERE id = 1');
    const logo = req.file
      ? `/uploads/settings/${req.file.filename}`
      : rows[0]?.logo || null;

    const data = { logo };
    FIELDS.forEach((f) => {
      data[f] = clean(req.body[f]);
    });

    const cols = Object.keys(data);
    await db.query(
      `INSERT INTO settings (id, ${cols.join(', ')})
       VALUES (1, ${cols.map(() => '?').join(', ')})
       ON DUPLICATE KEY UPDATE ${cols.map((c) => `${c} = VALUES(${c})`).join(', ')}`,
      cols.map((c) => data[c])
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};