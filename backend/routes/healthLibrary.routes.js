
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/healthLibrary.controller");

const router = express.Router();

/* =========================================
   MEDICAL REPORT UPLOAD FOLDER
========================================= */

const dir = path.join(
  __dirname,
  "../private_uploads/health-library"
);

fs.mkdirSync(dir, { recursive: true });

/* =========================================
   ALLOWED FILE TYPES
========================================= */


const types = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};


/* =========================================
   MULTER CONFIGURATION
========================================= */

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dir);
    },

    filename: (req, file, cb) => {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      cb(null, randomUUID() + extension);
    },
  }),

 limits: {
  files: 21,
  fileSize: 10 * 1024 * 1024,
},

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedExtensions = types[file.mimetype] || [];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
        "Only PDF, JPG, JPEG, PNG, WEBP, DOC and DOCX files are allowed."
        //   "Only PDF, JPG, JPEG, PNG and WEBP files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/* =========================================
   RECEIVE MULTIPLE MEDICAL REPORTS
========================================= */


function receive(req, res, next) {
  upload.fields([
    {
      name: "reports[]",
      maxCount: 20,
    },
    {
      name: "previous_reports",
      maxCount: 1,
    },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    req.files = [
      ...(req.files?.["reports[]"] || []),
      ...(req.files?.previous_reports || []),
    ];

    const totalSize = req.files.reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (totalSize > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Maximum total upload size is 50 MB.",
      });
    }

    next();
  });
}


/* =========================================
   USER SIDE - PUBLIC FORM SUBMISSION

   Request an Estimate
   Contact Form
   Request a Call

   No admin login required
========================================= */

router.post(
  "/submit",
  receive,
  ctrl.create
);

/* =========================================
   ADMIN PANEL - AUTHENTICATION REQUIRED
========================================= */

router.use(auth);

/* =========================================
   ADMIN - LIST RECORDS

   Three tabs:
   estimate
   contact
   callback

   Supports:
   Search
   Date filters
   Pagination
========================================= */

router.get(
  "/",
  ctrl.list
);

/* =========================================
   ADMIN - VIEW SINGLE RECORD
========================================= */

router.get(
  "/:id",
  ctrl.getOne
);

/* =========================================
   ADMIN - DOWNLOAD MEDICAL REPORT
========================================= */

router.get(
  "/:id/reports/:index",
  ctrl.downloadReport
);

/* =========================================
   ADMIN - ADD NEW RECORD

   Database save only
   No email notification
========================================= */

router.post(
  "/",
  (req, res, next) => {
    req.isAdminEntry = true;
    next();
  },
  receive,
  ctrl.create
);

/* =========================================
   ADMIN - EDIT RECORD
========================================= */

router.put(
  "/:id",
  receive,
  ctrl.update
);

/* =========================================
   ADMIN - DELETE RECORD
========================================= */

router.delete(
  "/:id",
  ctrl.remove
);

/* =========================================
   EXPORT ROUTER
========================================= */

module.exports = router;





// const express = require('express');
// const ctrl = require('../controllers/healthLibrary.controller');
// const { setUploadFolder, optionalSingle } = require('../middleware/upload.middleware');

// const router = express.Router();

// router.get('/', ctrl.list);
// router.get('/:id', ctrl.getOne);
// router.post('/', setUploadFolder('health-library'), optionalSingle('previous_reports'), ctrl.create);
// router.put('/:id', setUploadFolder('health-library'), optionalSingle('previous_reports'), ctrl.update);
// router.delete('/:id', ctrl.remove);

// module.exports = router;
