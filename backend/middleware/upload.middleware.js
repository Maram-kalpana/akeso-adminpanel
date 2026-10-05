const { upload } = require('../config/multer');

function setUploadFolder(folder) {
  return (req, res, next) => {
    req.uploadFolder = folder;
    next();
  };
}

function optionalSingle(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

module.exports = { setUploadFolder, optionalSingle };
