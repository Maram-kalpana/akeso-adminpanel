const express = require('express');
const ctrl = require('../controllers/speciality.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/options', ctrl.options);
router.get('/:id', ctrl.getOne);
router.post('/', setUploadFolder('specialities'), optionalSingle('about_image'), ctrl.create);
router.put('/:id', setUploadFolder('specialities'), optionalSingle('about_image'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
