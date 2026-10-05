const Testimonial = require('../models/testimonial.model');
const { pagination, parseBoolean, parseIntOrNull, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Testimonial.list({
      search: req.query.search,
      is_published: req.query.is_published,
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
    const row = await Testimonial.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.patient_name || !req.body.message) {
      return res.status(400).json({ success: false, message: 'Patient name and message are required' });
    }
    const rating = Math.min(5, Math.max(1, parseIntOrNull(req.body.rating) || 5));
    const data = await Testimonial.create({
      patient_name: req.body.patient_name,
      patient_photo: toPublicPath(req.file),
      rating,
      message: req.body.message,
      speciality_id: parseIntOrNull(req.body.speciality_id),
      doctor_id: parseIntOrNull(req.body.doctor_id),
      video_url: req.body.video_url,
      is_published: parseBoolean(req.body.is_published, false) ? 1 : 0,
      sort_order: parseIntOrNull(req.body.sort_order) || 0,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    let patient_photo = existing.patient_photo;
    if (req.file) {
      deleteUploadedFile(existing.patient_photo);
      patient_photo = toPublicPath(req.file);
    }
    const rating = Math.min(5, Math.max(1, parseIntOrNull(req.body.rating) || existing.rating));
    const data = await Testimonial.update(existing.id, {
      patient_name: req.body.patient_name || existing.patient_name,
      patient_photo,
      rating,
      message: req.body.message || existing.message,
      speciality_id: parseIntOrNull(req.body.speciality_id),
      doctor_id: parseIntOrNull(req.body.doctor_id),
      video_url: req.body.video_url,
      is_published: parseBoolean(req.body.is_published, existing.is_published) ? 1 : 0,
      sort_order: parseIntOrNull(req.body.sort_order) ?? existing.sort_order,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    deleteUploadedFile(existing.patient_photo);
    await Testimonial.remove(existing.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
};
