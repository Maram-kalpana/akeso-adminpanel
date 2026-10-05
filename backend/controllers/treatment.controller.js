const createContentController = require('./content.controller');
const { Treatment, Ailment, Technology } = require('../models/content.model');

exports.treatments = createContentController(Treatment, 'treatments', 'Treatment');
exports.ailments = createContentController(Ailment, 'ailments', 'Ailment');
exports.technologies = createContentController(Technology, 'technologies', 'Technology');
