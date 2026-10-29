const express = require('express');
const ctrl = require('../controllers/partners.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  setUploadFolder('partners'),
  optionalSingle('logo'),
  ctrl.create
);

router.put(
  '/:id',
  setUploadFolder('partners'),
  optionalSingle('logo'),
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;