import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import Permission from './permission.model';

export const listPermissions = async () => Permission.find({ isActive: true }).sort({ module: 1, code: 1 }).lean();

export const listAllPermissions = async () => Permission.find().sort({ module: 1, code: 1 }).lean();

export const createPermission = async (payload: {
  name: string;
  code: string;
  module: string;
  description?: string;
}) => {
  const normalizedCode = payload.code.trim().toLowerCase();
  if (await Permission.isCodeTaken(normalizedCode)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission code already exists');
  }
  return Permission.create({ ...payload, code: normalizedCode });
};

export const updatePermission = async (
  id: string,
  payload: Partial<{ name: string; code: string; module: string; description: string; isActive: boolean }>
) => {
  if (payload.code) {
    const normalizedCode = payload.code.trim().toLowerCase();
    if (await Permission.isCodeTaken(normalizedCode, id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Permission code already exists');
    }
    payload.code = normalizedCode;
  }
  const doc = await Permission.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  return doc;
};

export const validatePermissionCodes = async (codes: string[]) => {
  if (!codes.length) return { allowed: [], unknown: [] as string[] };
  const normalized = [...new Set(codes.map((code) => code.trim().toLowerCase()))];
  const docs = await Permission.find({ code: { $in: normalized }, isActive: true }).select({ code: 1, _id: 0 }).lean();
  const allowed = docs.map((doc) => doc.code);
  const unknown = normalized.filter((code) => !allowed.includes(code));
  return { allowed, unknown };
};

export const findPermissionsByCodes = async (codes: string[]) => Permission.find({ code: { $in: codes } });
