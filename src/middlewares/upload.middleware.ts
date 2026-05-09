import multer from 'multer';
import httpStatus from 'http-status';
import ApiError from '../modules/errors/ApiError';

const storage = multer.memoryStorage();

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image files are allowed'));
    return;
  }
  cb(null, true);
};

const jsonFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = ['application/json', 'text/json', 'text/plain', 'application/octet-stream'];
  const hasJsonExtension = file.originalname.toLowerCase().endsWith('.json');

  if (!allowedMimeTypes.includes(file.mimetype) && !hasJsonExtension) {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only JSON files are allowed'));
    return;
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadJson = multer({
  storage,
  fileFilter: jsonFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
