const Speciality = require('../models/speciality.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, parseBoolean, parseIntOrNull, parseList, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Speciality.list({
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
    const rows = await Speciality.options();
    res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await Speciality.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Speciality not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

function payload(body, about_image) {
  return {
    name: body.name,
    about_content: body.about_content,
    about_image,
    is_active: parseBoolean(body.is_active, true) ? 1 : 0,
    sort_order: parseIntOrNull(body.sort_order) || 0,
    highlights: parseList(body.highlights),
    subspecialities: parseList(body.subspecialities),
    ailments: parseList(body.ailments),
  };
}

exports.create = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const slug = await uniqueSlug('specialities', req.body.name, req.body.slug);
    const data = await Speciality.create({
      ...payload(req.body, toPublicPath(req.file)),
      slug,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Speciality.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Speciality not found' });
    const slug = await uniqueSlug('specialities', req.body.name || existing.name, req.body.slug, existing.id);
    let about_image = existing.about_image;
    if (req.file) {
      deleteUploadedFile(existing.about_image);
      about_image = toPublicPath(req.file);
    }
    const data = await Speciality.update(existing.id, {
      ...payload({ ...req.body, name: req.body.name || existing.name, is_active: req.body.is_active ?? existing.is_active }, about_image),
      slug,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Speciality.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Speciality not found' });
    deleteUploadedFile(existing.about_image);
    deleteUploadedFile(existing.icon_image);
    await Speciality.remove(existing.id);
    res.json({ success: true, message: 'Speciality deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const row =
      await Speciality.findPublicDetailsBySlug(
        req.params.slug
      );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Speciality not found',
      });
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    next(err);
  }
};


exports.getPublicDetails = async (
  req,
  res,
  next
) => {
  try {
    const row =
      await Speciality.findPublicDetailsBySlug(
        req.params.slug
      );

    if (!row) {
      return res.status(404).json({
        success: false,
        message:
          'Speciality not found',
      });
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    next(err);
  }
};