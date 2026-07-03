import multer from 'multer';
import { AppError } from '../utils/helpers.js';

/**
 * Allowed MIME types for image uploads.
 */
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Magic byte signatures for allowed image formats.
 * Provides a second layer of validation beyond MIME type spoofing.
 * 
 * JPEG: FF D8 FF
 * PNG:  89 50 4E 47 0D 0A 1A 0A
 * WebP: 52 49 46 46 xx xx xx xx 57 45 42 50 (RIFF....WEBP)
 */
const checkMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return true;

  // WebP (RIFF....WEBP)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;

  return false;
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
  // Note: magic byte check runs in the controller after the buffer is in memory
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10,                  // Max 10 files
  },
});

/**
 * Middleware to verify uploaded files against their actual magic bytes.
 * Must run AFTER multer (so req.files is populated).
 * Prevents polyglot/file-disguise attacks where someone renames a .exe to .jpg.
 */
export const verifyFileMagicBytes = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  for (const file of req.files) {
    if (!checkMagicBytes(file.buffer)) {
      return next(new AppError('Invalid file format. Only real JPEG, PNG, or WebP images are accepted.', 400));
    }
  }
  next();
};
