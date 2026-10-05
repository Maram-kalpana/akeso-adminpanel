const express = require('express');
const ctrl = require('../controllers/dashboard.controller');

const router = express.Router();
router.get('/stats', ctrl.stats);

module.exports = router;
