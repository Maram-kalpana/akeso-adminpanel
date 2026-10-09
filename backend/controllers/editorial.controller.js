
const db = require("../config/db");
const { toPublicPath } = require("../config/multer");
const { deleteUploadedFile } = require("../utils/helpers");

const tableFor = (kind) =>
  ({ blogs: "blogs", cases: "case_studies" })[kind];

const fail = (res, code, message) =>
  res.status(code).json({ success: false, message });

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 190);

const cleanDescription = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const selectColumns = (alias) => `
  ${alias}.*,
  s.name AS speciality_name
`;

exports.list = async (req, res, next) => {
  try {
    const table = tableFor(req.params.kind);

    if (!table) {
      return fail(res, 404, "Unknown content type");
    }

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const where = [];
    const params = [];

    if (req.query.public === "1") {
      where.push("b.is_published = 1");
    }

    if (req.query.search) {
      where.push(
        "(b.title LIKE ? OR b.content LIKE ?)"
      );

      const search = `%${req.query.search}%`;
      params.push(search, search);
    }

    const whereSQL = where.length
      ? `WHERE ${where.join(" AND ")}`
      : "";

    const fromSQL = `
      FROM ${table} b
      LEFT JOIN specialities s
        ON s.id = b.speciality_id
    `;

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       ${fromSQL}
       ${whereSQL}`,
      params
    );

    const [rows] = await db.query(
      `SELECT ${selectColumns("b")}
       ${fromSQL}
       ${whereSQL}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );

    res.json({
      success: true,
      rows,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const table = tableFor(req.params.kind);

    if (!table) {
      return fail(res, 404, "Unknown content type");
    }

    const key = req.params.id;
    const column = /^\d+$/.test(key)
      ? "b.id"
      : "b.slug";

    const [rows] = await db.query(
      `SELECT ${selectColumns("b")}
       FROM ${table} b
       LEFT JOIN specialities s
         ON s.id = b.speciality_id
       WHERE ${column} = ?
       LIMIT 1`,
      [key]
    );

    if (!rows.length) {
      return fail(res, 404, "Not found");
    }

    if (
      req.query.public === "1" &&
      Number(rows[0].is_published) !== 1
    ) {
      return fail(res, 404, "Not found");
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.save = async (req, res, next) => {
  try {
    const table = tableFor(req.params.kind);

    if (!table) {
      return fail(res, 404, "Unknown content type");
    }

    const id = req.params.id;
    let old = null;

    if (id) {
      const [rows] = await db.query(
        `SELECT * FROM ${table} WHERE id = ?`,
        [id]
      );

      old = rows[0];

      if (!old) {
        return fail(res, 404, "Not found");
      }
    }

    const title = String(
      req.body.title ?? old?.title ?? ""
    ).trim();

    if (!title) {
      return fail(res, 400, "Title required");
    }

    const slug =
      old?.slug ||
      `${slugify(title) || "entry"}-${Date.now().toString(36)}`;

    const image = req.file
      ? toPublicPath(req.file)
      : old?.thumbnail || null;

    const rawSpeciality =
      req.body.speciality_id !== undefined
        ? req.body.speciality_id
        : old?.speciality_id;

    const speciality =
      rawSpeciality === "" ||
      rawSpeciality === null ||
      rawSpeciality === undefined
        ? null
        : Number(rawSpeciality);

    if (
      speciality !== null &&
      (!Number.isInteger(speciality) ||
        speciality <= 0)
    ) {
      return fail(res, 400, "Invalid speciality");
    }

    if (speciality !== null) {
      const [matches] = await db.query(
        "SELECT id FROM specialities WHERE id = ? LIMIT 1",
        [speciality]
      );

      if (!matches.length) {
        return fail(res, 400, "Speciality not found");
      }
    }

    // Only one Description field in the form.
    // Rich text is stored in the content column.
    const content = String(
      req.body.content ?? old?.content ?? ""
    );

    // Preserve the old column for compatibility.
    // No separate short-description input is needed.
    const short = cleanDescription(content).slice(0, 5000);

    const pub =
      req.body.is_published === undefined
        ? Boolean(Number(old?.is_published))
        : ["true", "1", "on"].includes(
            String(req.body.is_published)
          );

    const publishedAt = pub
      ? old?.published_at || new Date()
      : null;

    if (id) {
      await db.query(
        `UPDATE ${table}
         SET title = ?,
             thumbnail = ?,
             speciality_id = ?,
             short_description = ?,
             content = ?,
             is_published = ?,
             published_at = ?
         WHERE id = ?`,
        [
          title,
          image,
          speciality,
          short,
          content,
          pub ? 1 : 0,
          publishedAt,
          id,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO ${table}
         (
           title,
           slug,
           thumbnail,
           speciality_id,
           short_description,
           content,
           is_published,
           published_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          slug,
          image,
          speciality,
          short,
          content,
          pub ? 1 : 0,
          publishedAt,
        ]
      );
    }

    if (req.file && old?.thumbnail) {
      deleteUploadedFile(old.thumbnail);
    }

    res.json({
      success: true,
      message: "Saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const table = tableFor(req.params.kind);

    if (!table) {
      return fail(res, 404, "Unknown content type");
    }

    const [rows] = await db.query(
      `SELECT thumbnail FROM ${table} WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return fail(res, 404, "Not found");
    }

    await db.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [req.params.id]
    );

    if (rows[0].thumbnail) {
      deleteUploadedFile(rows[0].thumbnail);
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
