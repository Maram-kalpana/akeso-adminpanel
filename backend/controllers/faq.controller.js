const Faq = require('../models/faq.model');
const { pagination, parseBoolean, parseIntOrNull } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Faq.list({
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
    const row = await Faq.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.question || !req.body.answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    const data = await Faq.create({
      question: req.body.question,
      answer: req.body.answer,
      sort_order: parseIntOrNull(req.body.sort_order) || 0,
      is_published: parseBoolean(req.body.is_published, true) ? 1 : 0,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Faq.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'FAQ not found' });
    const data = await Faq.update(existing.id, {
      question: req.body.question || existing.question,
      answer: req.body.answer || existing.answer,
      sort_order: parseIntOrNull(req.body.sort_order) ?? existing.sort_order,
      is_published: parseBoolean(req.body.is_published, existing.is_published) ? 1 : 0,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Faq.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'FAQ not found' });
    await Faq.remove(existing.id);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    next(err);
  }
};
