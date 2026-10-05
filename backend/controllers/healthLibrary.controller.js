const HealthLibrary = require('../models/healthLibrary.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

function emptyToNull(value) {
  if (value === undefined || value === null || value === '') return null;
  return value;
}

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await HealthLibrary.list({
      search: req.query.search,
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
    const row = await HealthLibrary.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

function payload(body, previous_reports) {
  const name = body.patient_name || body.name;
  return {
    title: name,
    patient_name: name,
    phone: emptyToNull(body.phone),
    email: emptyToNull(body.email),
    country: emptyToNull(body.country),
    disease: emptyToNull(body.disease),
    previous_reports,
    treatment_start_date: emptyToNull(body.treatment_start_date),
    treatment_end_date: emptyToNull(body.treatment_end_date),
    amount: parseAmount(body.amount),
    hospital_name: emptyToNull(body.hospital_name),
    post_op_details: emptyToNull(body.post_op_details),
  };
}

function parseAmount(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

exports.create = async (req, res, next) => {
  try {
    const name = req.body.patient_name || req.body.name;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Patient name is required' });
    }
    const slug = await uniqueSlug('health_library', name, req.body.slug);
    const data = await HealthLibrary.create({
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
    const existing = await HealthLibrary.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });
    const name = req.body.patient_name || req.body.name || existing.patient_name || existing.title;
    const slug = await uniqueSlug('health_library', name, req.body.slug, existing.id);
    let previous_reports = existing.previous_reports;
    if (req.file) {
      deleteUploadedFile(existing.previous_reports);
      previous_reports = toPublicPath(req.file);
    }
    const data = await HealthLibrary.update(existing.id, {
      ...payload({ ...req.body, patient_name: name }, previous_reports),
      slug,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await HealthLibrary.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });
    deleteUploadedFile(existing.previous_reports);
    deleteUploadedFile(existing.thumbnail);
    await HealthLibrary.remove(existing.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
};
