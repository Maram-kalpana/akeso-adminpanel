const Service = require('../models/service.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, parseBoolean, parseIntOrNull, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Service.list({
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

exports.getOne = async (req, res, next) => {
  try {
    const row = await Service.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const slug = await uniqueSlug('services', req.body.name, req.body.slug);
    const data = await Service.create({
      name: req.body.name,
      slug,
      icon_image: toPublicPath(req.file),
      description: req.body.description,
      is_active: parseBoolean(req.body.is_active, true) ? 1 : 0,
      sort_order: parseIntOrNull(req.body.sort_order) || 0,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });
    const slug = await uniqueSlug('services', req.body.name || existing.name, req.body.slug, existing.id);
    let icon_image = existing.icon_image;
    if (req.file) {
      deleteUploadedFile(existing.icon_image);
      icon_image = toPublicPath(req.file);
    }
    const data = await Service.update(existing.id, {
      name: req.body.name || existing.name,
      slug,
      icon_image,
      description: req.body.description,
      is_active: parseBoolean(req.body.is_active, existing.is_active) ? 1 : 0,
      sort_order: parseIntOrNull(req.body.sort_order) ?? existing.sort_order,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });
    deleteUploadedFile(existing.icon_image);
    await Service.remove(existing.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};
