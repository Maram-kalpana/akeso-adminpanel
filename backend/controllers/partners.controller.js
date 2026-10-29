const db = require('../config/db'); // COPY the same db import your specialities controller uses

// COPY: use the same logo path format that specialities stores for about_image,
// so mediaUrl() on the frontend works unchanged.
const filePath = (file) => `/uploads/partners/${file.filename}`;

exports.list = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM partners ORDER BY id DESC');
  res.json({ success: true, data: rows });
};

exports.getOne = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
  res.json({ success: true, data: rows[0] });
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Partner name is required' });
  if (!req.file) return res.status(400).json({ success: false, message: 'Logo is required' });
  const [result] = await db.query('INSERT INTO partners (name, logo) VALUES (?, ?)', [name.trim(), filePath(req.file)]);
  res.status(201).json({ success: true, data: { id: result.insertId } });
};

exports.update = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Partner name is required' });
  const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
  const logo = req.file ? filePath(req.file) : rows[0].logo; // keep old logo if none uploaded
  await db.query('UPDATE partners SET name = ?, logo = ? WHERE id = ?', [name.trim(), logo, req.params.id]);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await db.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
  res.json({ success: true });
};