const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const PRIVATE_DIR = path.join(__dirname, "../private-patient-files");
const PATIENT_EDIT = new Set([
  "personal",
  "passport",
  "medical",
]);
const STAFF_EDIT = new Set([
  "visa",
  "medical",
  "treatment",
  "hospital",
  "stay",
  "travel",
  "appointments",
  "payments",
  "journey",
]);
const PUBLIC_SECTIONS = [
  "personal",
  "passport",
  "visa",
  "medical",
  "treatment",
  "hospital",
  "stay",
  "travel",
  "appointments",
];
const STAFF_SECTIONS = [...PUBLIC_SECTIONS, "payments", "journey"];
const PATIENT_KEYS = {
  personal: [
    "fullName",
    "dob",
    "gender",
    "phone",
    "email",
    "address",
    "emergencyName",
    "emergencyRelation",
    "emergencyPhone",
  ],
  passport: [
    "passportNumber",
    "citizenship",
    "nationality",
    "residence",
    "passportIssue",
    "passportExpiry",
  ],
  visa: [
    "visaType",
    "visaReference",
    "visaApplicationDate",
    "medicalVisaType",
    "medicalVisaNumber",
    "attendantName",
    "attendantRelationship",
    "attendantPassport",
    "attendantVisa",
  ],
  medical: [
    "condition",
    "diagnosis",
    "medicalHistory",
    "existingConditions",
    "previousSurgeries",
    "medications",
    "allergies",
    "labReportsSummary",
    "scanSummary",
    "diagnosticHistory",
    "medicalSummary",
    "previousTreatmentSummary",
  ],
  treatment: [
  "treatmentType",
  "specialty",
  "treatmentPlan",
  "treatmentDuration",
  "estimatedCost",
  "approvedQuotation",
  "treatmentStatus",
  "plannedAdmission",
  "plannedDischarge",
  "actualAdmission",
  "actualDischarge",
],
};
function parse(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
function numberFor(id) {
  return `AKESO-${String(id).padStart(8, "0")}`;
}
async function ensure(id) {
  await db.query(
    "INSERT IGNORE INTO patient_profiles(customer_id,patient_number) VALUES (?,?)",
    [id, numberFor(id)],
  );
}
async function audit(id, type, actor, action, section = null) {
  await db.query(
    "INSERT INTO patient_activity_logs(customer_id,actor_type,actor_id,action,section_id) VALUES (?,?,?,?,?)",
    [id, type, actor, action, section],
  );
}
async function profile(id, staff = false) {
  await ensure(id);
  const [[row]] = await db.query(
    "SELECT * FROM patient_profiles WHERE customer_id=?",
    [id],
  );
  const [[customer]] = await db.query(
    "SELECT id,name,email,phone,status,created_at FROM customers WHERE id=?",
    [id],
  );
  if (!customer) return null;
  const sections = {};
  for (const key of staff ? STAFF_SECTIONS : PUBLIC_SECTIONS) {
    const value = parse(row[key]);
    if (!staff && key === "medical") delete value.doctorNotes;
    if (!staff && key === "visa") {
      delete value.internalRemarks;
    }
    sections[key] = value;
  }
  const [docs] = await db.query(
    "SELECT id,section_id AS sectionId,category,original_name AS name,mime_type AS type,file_size AS size,created_at AS date FROM patient_documents WHERE customer_id=? ORDER BY id DESC",
    [id],
  );
  return {
    customer,
    patientId: row.patient_number,
    sections,
    documents: docs.filter(
      (d) => staff || !["payments", "journey"].includes(d.sectionId),
    ),
  };
}
exports.me = async (req, res, next) => {
  try {
    const data = await profile(req.patientId);
    await audit(req.patientId, "patient", req.patientId, "profile_view");
    res.json(data);
  } catch (e) {
    next(e);
  }
};
exports.list = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").slice(0, 100);
    const status = String(req.query.status || "").slice(0, 30);
    const [rows] = await db.query(
      `SELECT c.id,c.name,c.email,c.phone,c.status,p.patient_number AS patientId,JSON_UNQUOTE(JSON_EXTRACT(p.treatment,'$.treatmentStatus')) AS treatmentStatus,JSON_UNQUOTE(JSON_EXTRACT(p.travel,'$.arrivalDate')) AS arrivalDate FROM customers c LEFT JOIN patient_profiles p ON p.customer_id=c.id WHERE (c.name LIKE ? OR c.email LIKE ? OR p.patient_number LIKE ?) AND (?='' OR JSON_UNQUOTE(JSON_EXTRACT(p.treatment,'$.treatmentStatus'))=?) ORDER BY c.id DESC LIMIT 250`,
      [`%${search}%`, `%${search}%`, `%${search}%`, status, status],
    );
    res.json({ rows });
  } catch (e) {
    next(e);
  }
};
exports.getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await profile(id, true);
    if (!data) return res.status(404).json({ message: "Patient not found" });
    await audit(id, "admin", req.admin.id, "profile_view");
    res.json(data);
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const staff = Boolean(req.admin);
    const id = staff ? Number(req.params.id) : req.patientId;
    const section = String(req.params.section || "");
    if (!(staff ? STAFF_EDIT : PATIENT_EDIT).has(section))
      return res.status(403).json({ message: "Section not editable" });
    if (!Number.isSafeInteger(id) || id <= 0)
      return res.status(400).json({ message: "Invalid patient" });
    const input = req.body;
    if (!input || typeof input !== "object" || Array.isArray(input))
      return res.status(400).json({ message: "Invalid data" });
    if (JSON.stringify(input).length > 30000)
      return res.status(413).json({ message: "Section too large" });
    await ensure(id);
    const [[row]] = await db.query(
      `SELECT \`${section}\` AS data FROM patient_profiles WHERE customer_id=?`,
      [id],
    );
    const old = parse(row.data);
    let updated;
    if (staff) {
      updated = { ...old, ...input };
    } else {
      updated = { ...old };
      for (const k of PATIENT_KEYS[section])
        if (
          Object.hasOwn(input, k) &&
          typeof input[k] === "string" &&
          input[k].length <= 5000
        )
          updated[k] = input[k];
    }
    await db.query(
      `UPDATE patient_profiles SET \`${section}\`=? WHERE customer_id=?`,
      [JSON.stringify(updated), id],
    );
    await audit(
      id,
      staff ? "admin" : "patient",
      staff ? req.admin.id : id,
      "section_updated",
      section,
    );
    res.json({
      success: true,
      data: staff
        ? updated
        : (() => {
            const o = { ...updated };
            if (section === "medical") delete o.doctorNotes;
            if (section === "visa") delete o.internalRemarks;
            return o;
          })(),
    });
  } catch (e) {
    next(e);
  }
};
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });
    const staff = Boolean(req.admin),
      id = staff ? Number(req.params.id) : req.patientId;
    const section = String(req.body.sectionId || "");
    const patientUploadSections = new Set([
  "personal",
  "passport",
  "medical",
  "documents",
]);

if (
  !(staff
    ? STAFF_EDIT.has(section) ||
      [
        "personal",
        "passport",
        "documents",
      ].includes(section)
    : patientUploadSections.has(section))
) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Invalid section" });
    }
    if (!Number.isSafeInteger(id) || id <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid patient" });
    }
    const category = String(req.body.category || "Other").slice(0, 100);
    const [result] = await db.query(
      "INSERT INTO patient_documents(customer_id,section_id,category,original_name,stored_name,mime_type,file_size,uploaded_by_type,uploaded_by_id) VALUES(?,?,?,?,?,?,?,?,?)",
      [
        id,
        section,
        category,
        req.file.originalname.slice(0, 255),
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        staff ? "admin" : "patient",
        staff ? req.admin.id : id,
      ],
    );
    await audit(
      id,
      staff ? "admin" : "patient",
      staff ? req.admin.id : id,
      "document_uploaded",
      section,
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        sectionId: section,
        category,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        date: new Date().toISOString(),
      });
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(e);
  }
};
exports.download = async (req, res, next) => {
  try {
    const staff = Boolean(req.admin),
      id = staff ? Number(req.params.id) : req.patientId;
    const [[doc]] = await db.query(
      "SELECT * FROM patient_documents WHERE id=? AND customer_id=?",
      [req.params.documentId, id],
    );
    if (!doc || (!staff && ["payments", "journey"].includes(doc.section_id)))
      return res.status(404).json({ message: "Document not found" });
    await audit(
      id,
      staff ? "admin" : "patient",
      staff ? req.admin.id : id,
      "document_view",
      doc.section_id,
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", doc.mime_type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.original_name.replace(/["\r\n]/g, "_")}"`,
    );
    res.sendFile(path.join(PRIVATE_DIR, doc.stored_name));
  } catch (e) {
    next(e);
  }
};
exports.remove = async (req, res, next) => {
  try {
    const staff = Boolean(req.admin),
      id = staff ? Number(req.params.id) : req.patientId;
    const [[doc]] = await db.query(
      "SELECT * FROM patient_documents WHERE id=? AND customer_id=?",
      [req.params.documentId, id],
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (
      !staff &&
      (doc.uploaded_by_type !== "patient" || doc.uploaded_by_id !== id)
    )
      return res.status(403).json({ message: "Not allowed" });
    await db.query("DELETE FROM patient_documents WHERE id=?", [doc.id]);
    fs.unlink(path.join(PRIVATE_DIR, doc.stored_name), () => {});
    await audit(
      id,
      staff ? "admin" : "patient",
      staff ? req.admin.id : id,
      "document_deleted",
      doc.section_id,
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
