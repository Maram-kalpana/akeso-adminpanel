const express = require("express");
const ctrl = require("../controllers/editorial.controller");
const {
  setUploadFolder,
  optionalSingle,
} = require("../middleware/upload.middleware");
const router = express.Router();
router.get("/:kind", ctrl.list);
router.get("/:kind/:id", ctrl.getOne);
router.post(
  "/:kind",
  setUploadFolder("editorial"),
  optionalSingle("thumbnail"),
  ctrl.save,
);
router.put(
  "/:kind/:id",
  setUploadFolder("editorial"),
  optionalSingle("thumbnail"),
  ctrl.save,
);
router.delete("/:kind/:id", ctrl.remove);
module.exports = router;
