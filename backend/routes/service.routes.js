const express = require('express');
const ctrl = require('../controllers/service.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', setUploadFolder('services'), optionalSingle('icon_image'), ctrl.create);
router.put('/:id', setUploadFolder('services'), optionalSingle('icon_image'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
