const express = require('express');
const ctrl = require('../controllers/testimonial.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', setUploadFolder('testimonials'), optionalSingle('patient_photo'), ctrl.create);
router.put('/:id', setUploadFolder('testimonials'), optionalSingle('patient_photo'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
