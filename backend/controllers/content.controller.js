const { uniqueSlug } = require('../utils/slug');
const { pagination, parseBoolean, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

function createContentController(model, table, label) {
  return {
    list: async (req, res, next) => {
      try {
        const { page, limit, offset } = pagination(req.query);
        const data = await model.list({
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
    },

    options: async (req, res, next) => {
      try {
        const rows = await model.published();
        res.json({ success: true, rows });
      } catch (err) {
        next(err);
      }
    },

    getOne: async (req, res, next) => {
      try {
        const row = await model.findById(req.params.id);
        if (!row) return res.status(404).json({ success: false, message: `${label} not found` });
        res.json({ success: true, data: row });
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        if (!req.body.title) {
          return res.status(400).json({ success: false, message: 'Title is required' });
        }
        const slug = await uniqueSlug(table, req.body.title, req.body.slug);
        const data = await model.create({
          title: req.body.title,
          slug,
          short_description: req.body.short_description,
          content: req.body.content,
          thumbnail: toPublicPath(req.file),
          is_published: parseBoolean(req.body.is_published, false) ? 1 : 0,
        });
        res.status(201).json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    update: async (req, res, next) => {
      try {
        const existing = await model.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: `${label} not found` });
        const slug = await uniqueSlug(table, req.body.title || existing.title, req.body.slug, existing.id);
        let thumbnail = existing.thumbnail;
        if (req.file) {
          deleteUploadedFile(existing.thumbnail);
          thumbnail = toPublicPath(req.file);
        }
        const data = await model.update(existing.id, {
          title: req.body.title || existing.title,
          slug,
          short_description: req.body.short_description,
          content: req.body.content,
          thumbnail,
          is_published: parseBoolean(req.body.is_published, existing.is_published) ? 1 : 0,
        });
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    remove: async (req, res, next) => {
      try {
        const existing = await model.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: `${label} not found` });
        deleteUploadedFile(existing.thumbnail);
        await model.remove(existing.id);
        res.json({ success: true, message: `${label} deleted` });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createContentController;
