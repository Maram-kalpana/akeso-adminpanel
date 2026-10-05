const express = require('express');
const ctrl = require('../controllers/healthLibrary.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', setUploadFolder('health-library'), optionalSingle('previous_reports'), ctrl.create);
router.put('/:id', setUploadFolder('health-library'), optionalSingle('previous_reports'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
