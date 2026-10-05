const express = require('express');
const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

function createContentRoutes(ctrl, folder) {
  const router = express.Router();
  router.get('/', ctrl.list);
  router.get('/options', ctrl.options);
  router.get('/:id', ctrl.getOne);
  router.post('/', setUploadFolder(folder), optionalSingle('thumbnail'), ctrl.create);
  router.put('/:id', setUploadFolder(folder), optionalSingle('thumbnail'), ctrl.update);
  router.delete('/:id', ctrl.remove);
  return router;
}

module.exports = createContentRoutes;
