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

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
