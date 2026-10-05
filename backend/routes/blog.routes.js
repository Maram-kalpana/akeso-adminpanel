const express = require('express');
const ctrl = require('../controllers/blog.controller');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', setUploadFolder('blogs'), optionalSingle('thumbnail'), ctrl.create);
router.put('/:id', setUploadFolder('blogs'), optionalSingle('thumbnail'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
