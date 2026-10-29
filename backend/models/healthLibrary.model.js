const db = require("../config/db");
const TYPES = ["estimate", "contact", "callback"];
const columns = [
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
const json = (x) => {
  try {
    return typeof x === "string" ? JSON.parse(x) : x || {};
  } catch {
    return {};
  }
};
const HealthLibrary = {
  async list({
  type = "estimate",
  search = "",
  date = "",
  page = 1,
  limit = 10,
  offset = 0,
}) {
    if (!TYPES.includes(type))
      throw Object.assign(new Error("Invalid type"), { status: 400 });
    const where = ["form_type = ?"];
    const args = [type];
    if (search) {
      where.push(
        "(patient_name LIKE ? OR phone LIKE ? OR email LIKE ? OR disease LIKE ? OR subject LIKE ?)",
      );
      args.push(...Array(5).fill(`%${search}%`));
    }
    if (date) {
  where.push(
    "created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)"
  );
  args.push(`${date} 00:00:00`, date);
}
    const sql = `WHERE ${where.join(" AND ")}`;
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) total FROM health_library ${sql}`,
      args,
    );
    const [rows] = await db.query(
      `SELECT * FROM health_library ${sql} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
      [...args, Number(limit), Number(offset)],
    );
    return { rows, total, page, limit };
  },
  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM health_library WHERE id=? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  },
  async create(data) {
    const keys = [
      "title",
      "slug",
      "form_type",
      ...columns,
      "form_details",
      "previous_reports",
    ];
    const values = keys.map((k) => data[k] ?? null);
    const [r] = await db.query(
      `INSERT INTO health_library (${keys.map((k) => "`" + k + "`").join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      values,
    );
    return this.findById(r.insertId);
  },
  async update(id, data) {
    const keys = [...columns, "form_details", "previous_reports"];
    const values = keys.map((k) => data[k] ?? null);
    await db.query(
      `UPDATE health_library SET ${keys.map((k) => "`" + k + "`=?").join(",")} WHERE id=?`,
      [...values, id],
    );
    return this.findById(id);
  },
  async remove(id) {
    await db.query("DELETE FROM health_library WHERE id=?", [id]);
  },
};
module.exports = HealthLibrary;




// const db = require('../config/db');

// const HealthLibrary = {
//   async list({ search, page, limit, offset }) {
//     const where = [];
//     const params = [];
//     if (search) {
//       where.push('(hl.patient_name LIKE ? OR hl.phone LIKE ? OR hl.email LIKE ? OR hl.disease LIKE ? OR hl.hospital_name LIKE ? OR hl.title LIKE ?)');
//       params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
//     }
//     const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
//     const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM health_library hl ${clause}`, params);
//     const [rows] = await db.query(
//       `SELECT hl.* FROM health_library hl ${clause} ORDER BY hl.created_at DESC LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );
//     return { rows, total, page, limit };
//   },

//   async findById(id) {
//     const [rows] = await db.query('SELECT * FROM health_library WHERE id = ? LIMIT 1', [id]);
//     return rows[0] || null;
//   },

//   async create(data) {
//     const [result] = await db.query(
//       `INSERT INTO health_library
//         (title, slug, patient_name, phone, email, country, disease, previous_reports,
//          treatment_start_date, treatment_end_date, amount, hospital_name, post_op_details)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         data.title,
//         data.slug,
//         data.patient_name || null,
//         data.phone || null,
//         data.email || null,
//         data.country || null,
//         data.disease || null,
//         data.previous_reports || null,
//         data.treatment_start_date || null,
//         data.treatment_end_date || null,
//         data.amount,
//         data.hospital_name || null,
//         data.post_op_details || null,
//       ]
//     );
//     return this.findById(result.insertId);
//   },

//   async update(id, data) {
//     await db.query(
//       `UPDATE health_library SET
//         title = ?, slug = ?, patient_name = ?, phone = ?, email = ?, country = ?, disease = ?,
//         previous_reports = ?, treatment_start_date = ?, treatment_end_date = ?, amount = ?,
//         hospital_name = ?, post_op_details = ?
//        WHERE id = ?`,
//       [
//         data.title,
//         data.slug,
//         data.patient_name || null,
//         data.phone || null,
//         data.email || null,
//         data.country || null,
//         data.disease || null,
//         data.previous_reports,
//         data.treatment_start_date || null,
//         data.treatment_end_date || null,
//         data.amount,
//         data.hospital_name || null,
//         data.post_op_details || null,
//         id,
//       ]
//     );
//     return this.findById(id);
//   },

//   async remove(id) {
//     await db.query('DELETE FROM health_library WHERE id = ?', [id]);
//   },
// };

// module.exports = HealthLibrary;
