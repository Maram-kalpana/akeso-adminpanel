const express = require('express');
const ctrl = require('../controllers/settings.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.get);

router.put(
  '/',
  setUploadFolder('settings'),
  optionalSingle('logo'),
  ctrl.update
);

module.exports = router;