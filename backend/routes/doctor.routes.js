const express = require('express');
const ctrl = require('../controllers/doctor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/options', ctrl.options);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  authMiddleware,
  setUploadFolder('doctors'),
  optionalSingle('photo'),
  ctrl.create
);

router.put(
  '/:id',
  authMiddleware,
  setUploadFolder('doctors'),
  optionalSingle('photo'),
  ctrl.update
);

router.delete(
  '/:id',
  authMiddleware,
  ctrl.remove
);

// router.post('/', setUploadFolder('doctors'), optionalSingle('photo'), ctrl.create);
// router.put('/:id', setUploadFolder('doctors'), optionalSingle('photo'), ctrl.update);
// router.delete('/:id', ctrl.remove);

module.exports = router;
