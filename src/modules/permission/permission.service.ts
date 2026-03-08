import Permission from './permission.model';

export const listPermissions = async () => Permission.find({ isActive: true }).sort({ key: 1 }).lean();

export const validatePermissionKeys = async (keys: string[]) => {
  if (!keys.length) return { allowed: [], unknown: [] };
  const normalized = [...new Set(keys.map((key) => key.trim()))];
  const found = await Permission.find({ key: { $in: normalized }, isActive: true }).select('key -_id').lean();
  const allowed = found.map((item) => item.key);
  const unknown = normalized.filter((key) => !allowed.includes(key));
  return { allowed, unknown };
};
