const express = require('express');
const ctrl = require('../controllers/speciality.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/options', ctrl.options);
router.get(
  '/slug/:slug',
  ctrl.getBySlug
);
// router.get('/:id', ctrl.getOne);
router.get(
  '/:id',
  authMiddleware,
  ctrl.getOne
);

router.post(
  '/',
  authMiddleware,
  setUploadFolder('specialities'),
  optionalSingle('about_image'),
  ctrl.create
);

router.put(
  '/:id',
  authMiddleware,
  setUploadFolder('specialities'),
  optionalSingle('about_image'),
  ctrl.update
);

router.delete(
  '/:id',
  authMiddleware,
  ctrl.remove
);
// router.post('/', setUploadFolder('specialities'), optionalSingle('about_image'), ctrl.create);
// router.put('/:id', setUploadFolder('specialities'), optionalSingle('about_image'), ctrl.update);
// router.delete('/:id', ctrl.remove);

module.exports = router;
