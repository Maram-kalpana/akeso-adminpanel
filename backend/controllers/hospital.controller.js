const Hospital = require('../models/hospital.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, parseBoolean } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Hospital.list({
      search: req.query.search,
      is_active: req.query.is_active,
      page,
      limit,
      offset,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.options = async (req, res, next) => {
  try {
    const rows = await Hospital.options();
    res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await Hospital.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.city) {
      return res.status(400).json({ success: false, message: 'Name and city are required' });
    }
    const slug = await uniqueSlug('hospitals', req.body.name, req.body.slug);
    const data = await Hospital.create({
      name: req.body.name,
      slug,
      city: req.body.city,
      address: req.body.address,
      phone: req.body.phone,
      is_active: parseBoolean(req.body.is_active, true) ? 1 : 0,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Hospital.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Hospital not found' });
    const slug = await uniqueSlug('hospitals', req.body.name || existing.name, req.body.slug, existing.id);
    const data = await Hospital.update(existing.id, {
      name: req.body.name || existing.name,
      slug,
      city: req.body.city || existing.city,
      address: req.body.address,
      phone: req.body.phone,
      is_active: parseBoolean(req.body.is_active, existing.is_active) ? 1 : 0,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Hospital.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Hospital not found' });
    await Hospital.remove(existing.id);
    res.json({ success: true, message: 'Hospital deleted' });
  } catch (err) {
    next(err);
  }
};
