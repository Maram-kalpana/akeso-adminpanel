const Blog = require('../models/blog.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, parseBoolean, parseList, deleteUploadedFile } = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

function publishedAt(isPublished, existing) {
  if (!isPublished) return null;
  return existing || new Date();
}

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Blog.list({
      search: req.query.search,
      category: req.query.category,
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
    const row = await Blog.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const slug = await uniqueSlug('blogs', req.body.title, req.body.slug);
    const is_published = parseBoolean(req.body.is_published, false) ? 1 : 0;
    const data = await Blog.create({
      title: req.body.title,
      slug,
      author_name: req.body.author_name,
      thumbnail: toPublicPath(req.file),
      category: req.body.category,
      content: req.body.content,
      tags: JSON.stringify(parseList(req.body.tags)),
      is_published,
      published_at: publishedAt(is_published),
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Blog not found' });
    const slug = await uniqueSlug('blogs', req.body.title || existing.title, req.body.slug, existing.id);
    let thumbnail = existing.thumbnail;
    if (req.file) {
      deleteUploadedFile(existing.thumbnail);
      thumbnail = toPublicPath(req.file);
    }
    const is_published = parseBoolean(req.body.is_published, existing.is_published) ? 1 : 0;
    const data = await Blog.update(existing.id, {
      title: req.body.title || existing.title,
      slug,
      author_name: req.body.author_name,
      thumbnail,
      category: req.body.category,
      content: req.body.content,
      tags: JSON.stringify(parseList(req.body.tags)),
      is_published,
      published_at: publishedAt(is_published, existing.published_at),
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Blog not found' });
    deleteUploadedFile(existing.thumbnail);
    await Blog.remove(existing.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    next(err);
  }
};
