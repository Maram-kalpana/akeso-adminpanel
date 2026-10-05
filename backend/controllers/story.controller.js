const Story = require('../models/story.model');
const { uniqueSlug } = require('../utils/slug');
const { pagination, parseIntOrNull } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Story.list({
      search: req.query.search,
      speciality_id: req.query.speciality_id,
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
    const row = await Story.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Story not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = req.body.patient_name || req.body.name;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const slug = await uniqueSlug('our_stories', name, req.body.slug);
    const data = await Story.create({
      patient_name: name,
      title: name,
      slug,
      speciality_id: parseIntOrNull(req.body.speciality_id),
      video_url: req.body.video_url || null,
      is_published: 1,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Story.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Story not found' });
    const name = req.body.patient_name || req.body.name || existing.patient_name;
    const slug = await uniqueSlug('our_stories', name, req.body.slug, existing.id);
    const data = await Story.update(existing.id, {
      patient_name: name,
      title: name,
      slug,
      speciality_id: parseIntOrNull(req.body.speciality_id),
      video_url: req.body.video_url || null,
      is_published: 1,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Story.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Story not found' });
    await Story.remove(existing.id);
    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    next(err);
  }
};
