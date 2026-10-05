const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const DOC_EXTS = ['.pdf', '.doc', '.docx'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || 'misc';
    const dest = path.join(UPLOAD_ROOT, folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = [...IMAGE_EXTS, ...DOC_EXTS];
    const safeExt = allowed.includes(ext) ? ext : '.bin';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  const isImage = file.mimetype && file.mimetype.startsWith('image/');
  const isDoc = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ].includes(file.mimetype);
  if (file.fieldname === 'previous_reports') {
    if (isImage || isDoc) return cb(null, true);
    return cb(new Error('Only image or PDF files are allowed'));
  }
  if (!isImage) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

function toPublicPath(file) {
  if (!file) return null;
  const folder = file.destination ? path.basename(file.destination) : 'misc';
  return `/uploads/${folder}/${file.filename}`;
}

module.exports = {
  upload,
  toPublicPath,
  UPLOAD_ROOT,
};
