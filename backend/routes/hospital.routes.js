const express = require('express');
const ctrl = require('../controllers/hospital.controller');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/options', ctrl.options);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
