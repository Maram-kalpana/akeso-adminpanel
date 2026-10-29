const HealthLibrary = require("../models/healthLibrary.model");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs/promises");
const { sendHealthEnquiryEmail } = require("../services/mail.service");
const TYPES = ["estimate", "contact", "callback"];
const parse = (x) => {
  try {
    return typeof x === "string" ? JSON.parse(x || "{}") : x || {};
  } catch {
    return {};
  }
};
const text = (x) => String(x ?? "").trim();
const fields = [
  "patient_name",
  "phone",
  "email",
  "country",
  "disease",
  "hospital_name",
  "treatment_start_date",
  "treatment_end_date",
  "amount",
  "post_op_details",
  "subject",
  "message",
  "preferred_time",
];
function build(body = {}, existing = {}) {
  const name = text(
  body.patient_name ||
    body.name ||
    body.fullName ||
    body.full_name ||
    [body.first_name, body.last_name].filter(Boolean).join(" ") ||
    existing.patient_name
);
  const phone = text(
    body.phone || body.mobile || body.mobileNumber || existing.phone,
  );
  const email = text(body.email || existing.email);
  if (!name || !phone)
    throw Object.assign(new Error("Name and phone are required"), {
      status: 400,
    });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Object.assign(new Error("Invalid email"), { status: 400 });
  const data = { ...existing, patient_name: name, phone, email: email || null };
  for (const k of fields) {
    if (k in body) data[k] = text(body[k]) || null;
  }
  data.country = data.country || text(body.country_name) || null;
  data.disease =
    data.disease ||
    text(body.speciality || body.disease_name || body.treatment) ||
    null;
  data.hospital_name = data.hospital_name || text(body.hospital) || null;
  data.message =
    data.message ||
    text(body.comments || body.query || body.description) ||
    null;
  data.preferred_time =
    data.preferred_time || text(body.preferredTime || body.time) || null;
  if (data.amount !== null && data.amount !== undefined && data.amount !== "") {
    const n = Number(data.amount);
    if (!Number.isFinite(n))
      throw Object.assign(new Error("Invalid amount"), { status: 400 });
    data.amount = n;
  } else data.amount = null;
  for (const k of ["treatment_start_date", "treatment_end_date"])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data[k] || "")) data[k] = null;
  return data;
}
function fail(res, e, next) {
  if (e.status)
    return res.status(e.status).json({ success: false, message: e.message });
  next(e);
}


exports.list = async (req, res, next) => {
  try {
    const type = req.query.type || "estimate";

    if (!TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    // Single date filter
    const date = text(req.query.date);

    if (
      date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const result = await HealthLibrary.list({
      type,
      search: text(req.query.search),
      date,
      page,
      limit,
      offset: (page - 1) * limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (e) {
    fail(res, e, next);
  }
};


exports.getOne = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};
exports.create = async (req, res, next) => {
  try {
    const type = text(req.body.type || req.body.form_type);
    if (!TYPES.includes(type))
      return res
        .status(400)
        .json({ success: false, message: "Invalid form type" });
    const data = build(req.body);
    const files = (req.files || []).map((f) => ({
      name: f.originalname,
      filename: f.filename,
      size: f.size,
    }));
    const saved = await HealthLibrary.create({
      ...data,
      title: data.patient_name,
      slug: `${type}-${randomUUID()}`,
      form_type: type,
      form_details: JSON.stringify(req.body),
      previous_reports: JSON.stringify(files),
    });
    // if (!req.admin) {
    if (!req.isAdminEntry) {
      try {
        await sendHealthEnquiryEmail({
          type,
          data: saved,
          details: req.body,
          files: req.files || [],
        });
      } catch (err) {
        console.error("Enquiry email failed:", err.message);
      }
    }
    res
      .status(201)
      .json({
        success: true,
        data: saved,
        message: "Form submitted successfully",
      });
  } catch (e) {
    fail(res, e, next);
  }
};
exports.update = async (req, res, next) => {
  try {
    const existing = await HealthLibrary.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Not found" });
    const data = build(req.body, existing);
    const details = { ...parse(existing.form_details), ...req.body };
    const newFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      filename: f.filename,
      size: f.size,
    }));
    const oldFiles = parse(existing.previous_reports);
    const files = [...(Array.isArray(oldFiles) ? oldFiles : []), ...newFiles];
    const updated = await HealthLibrary.update(existing.id, {
      ...data,
      form_details: JSON.stringify(details),
      previous_reports: JSON.stringify(files),
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    fail(res, e, next);
  }
};
exports.remove = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    await HealthLibrary.remove(row.id);
    const reports = parse(row.previous_reports);
    if (Array.isArray(reports))
      await Promise.allSettled(
        reports.map((r) =>
          fs.unlink(
            path.join(
              __dirname,
              "../private_uploads/health-library",
              path.basename(r.filename || ""),
            ),
          ),
        ),
      );
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};
exports.downloadReport = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    const reports = parse(row.previous_reports);
    const i = Number(req.params.index);
    if (
      !Array.isArray(reports) ||
      !Number.isInteger(i) ||
      i < 0 ||
      i >= reports.length
    )
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    const r = reports[i];
    res.download(
      path.join(
        __dirname,
        "../private_uploads/health-library",
        path.basename(r.filename),
      ),
      r.name,
    );
  } catch (e) {
    next(e);
  }
};















// const HealthLibrary = require('../models/healthLibrary.model');
// const { uniqueSlug } = require('../utils/slug');
// const { pagination, deleteUploadedFile } = require('../utils/helpers');
// const { toPublicPath } = require('../config/multer');

// function emptyToNull(value) {
//   if (value === undefined || value === null || value === '') return null;
//   return value;
// }

// exports.list = async (req, res, next) => {
//   try {
//     const { page, limit, offset } = pagination(req.query);
//     const data = await HealthLibrary.list({
//       search: req.query.search,
//       page,
//       limit,
//       offset,
//     });
//     res.json({ success: true, ...data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.getOne = async (req, res, next) => {
//   try {
//     const row = await HealthLibrary.findById(req.params.id);
//     if (!row) return res.status(404).json({ success: false, message: 'Record not found' });
//     res.json({ success: true, data: row });
//   } catch (err) {
//     next(err);
//   }
// };

// function payload(body, previous_reports) {
//   const name = body.patient_name || body.name;
//   return {
//     title: name,
//     patient_name: name,
//     phone: emptyToNull(body.phone),
//     email: emptyToNull(body.email),
//     country: emptyToNull(body.country),
//     disease: emptyToNull(body.disease),
//     previous_reports,
//     treatment_start_date: emptyToNull(body.treatment_start_date),
//     treatment_end_date: emptyToNull(body.treatment_end_date),
//     amount: parseAmount(body.amount),
//     hospital_name: emptyToNull(body.hospital_name),
//     post_op_details: emptyToNull(body.post_op_details),
//   };
// }

// function parseAmount(value) {
//   if (value === undefined || value === null || value === '') return null;
//   const n = Number(value);
//   return Number.isNaN(n) ? null : n;
// }

// exports.create = async (req, res, next) => {
//   try {
//     const name = req.body.patient_name || req.body.name;
//     if (!name) {
//       return res.status(400).json({ success: false, message: 'Patient name is required' });
//     }
//     const slug = await uniqueSlug('health_library', name, req.body.slug);
//     const data = await HealthLibrary.create({
//       ...payload(req.body, toPublicPath(req.file)),
//       slug,
//     });
//     res.status(201).json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.update = async (req, res, next) => {
//   try {
//     const existing = await HealthLibrary.findById(req.params.id);
//     if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });
//     const name = req.body.patient_name || req.body.name || existing.patient_name || existing.title;
//     const slug = await uniqueSlug('health_library', name, req.body.slug, existing.id);
//     let previous_reports = existing.previous_reports;
//     if (req.file) {
//       deleteUploadedFile(existing.previous_reports);
//       previous_reports = toPublicPath(req.file);
//     }
//     const data = await HealthLibrary.update(existing.id, {
//       ...payload({ ...req.body, patient_name: name }, previous_reports),
//       slug,
//     });
//     res.json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.remove = async (req, res, next) => {
//   try {
//     const existing = await HealthLibrary.findById(req.params.id);
//     if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });
//     deleteUploadedFile(existing.previous_reports);
//     deleteUploadedFile(existing.thumbnail);
//     await HealthLibrary.remove(existing.id);
//     res.json({ success: true, message: 'Record deleted' });
//   } catch (err) {
//     next(err);
//   }
// };
