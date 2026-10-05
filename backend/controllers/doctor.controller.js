const Doctor = require('../models/doctor.model');
const { uniqueSlug } = require('../utils/slug');
const {
  pagination,
  parseBoolean,
  parseIntOrNull,
  parseList,
  deleteUploadedFile,
} = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Doctor.list({
      search: req.query.search,
      speciality_id: req.query.speciality_id,
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
    const rows = await Doctor.options();
    res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await Doctor.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

function payload(body, photo) {
  return {
    name: body.name,
    slug: body.slug,
    designation: body.designation,
    speciality_id: parseIntOrNull(body.speciality_id),
    photo,
    license_number: body.license_number,
    hospital_location: body.hospital_location,
    short_bio: body.short_bio,
    experience_years: parseIntOrNull(body.experience_years),
    is_featured: parseBoolean(body.is_featured, false) ? 1 : 0,
    is_active: parseBoolean(body.is_active, true) ? 1 : 0,
    meta_title: body.meta_title,
    meta_description: body.meta_description,
    qualifications: parseList(body.qualifications),
    expertise: parseList(body.expertise),
  };
}

exports.create = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const slug = await uniqueSlug('doctors', req.body.name, req.body.slug);
    const data = await Doctor.create({ ...payload(req.body, toPublicPath(req.file)), slug });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Doctor.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const slug = await uniqueSlug('doctors', req.body.name || existing.name, req.body.slug, existing.id);
    let photo = existing.photo;
    if (req.file) {
      deleteUploadedFile(existing.photo);
      photo = toPublicPath(req.file);
    }
    const body = { ...req.body, name: req.body.name || existing.name };
    const data = await Doctor.update(existing.id, { ...payload(body, photo), slug });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Doctor.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Doctor not found' });
    deleteUploadedFile(existing.photo);
    await Doctor.remove(existing.id);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) {
    next(err);
  }
};
