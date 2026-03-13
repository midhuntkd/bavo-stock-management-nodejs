import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { Permission } from '../permission';
import Role from './role.model';
import RolePermission from './role-permission.model';

export const listRoles = async () => Role.find().sort({ createdAt: -1 }).lean();

export const getRoleById = async (id: string) => {
  const role = await Role.findById(id).lean();
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');

  const mappings = await RolePermission.find({ roleId: role._id }).populate('permissionId', 'code name module').lean();
  const permissions = mappings
    .map((mapping: any) => mapping.permissionId)
    .filter(Boolean)
    .map((permission: any) => permission.code);

  return { ...role, permissions };
};

export const createRole = async (payload: {
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  isActive?: boolean;
}) => {
  const code = payload.code.trim().toLowerCase();
  if (await Role.isCodeTaken(code)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role code already exists');
  }
  return Role.create({ ...payload, code });
};

export const updateRole = async (
  id: string,
  payload: Partial<{ name: string; code: string; description?: string; isActive: boolean }>
) => {
  if (payload.code) {
    const code = payload.code.trim().toLowerCase();
    if (await Role.isCodeTaken(code, id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role code already exists');
    }
    payload.code = code;
  }

  const role = await Role.findById(id);
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  if (role.isSystem && typeof payload.isActive !== 'undefined' && payload.isActive === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'System role cannot be deactivated');
  }

  Object.assign(role, payload);
  await role.save();
  return role;
};

export const setRolePermissions = async (roleId: string, permissionCodes: string[]) => {
  const role = await Role.findById(roleId);
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');

  const normalizedCodes = [...new Set(permissionCodes.map((code) => code.trim().toLowerCase()))];
  const permissions = await Permission.find({ code: { $in: normalizedCodes }, isActive: true });
  if (permissions.length !== normalizedCodes.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Some permission codes are invalid');
  }

  await RolePermission.deleteMany({ roleId: role._id });
  if (permissions.length) {
    await RolePermission.insertMany(
      permissions.map((permission) => ({ roleId: role._id, permissionId: permission._id }))
    );
  }

  return getRoleById(roleId);
};

export const getRolePermissionCodes = async (roleId: string) => {
  const mappings = await RolePermission.find({ roleId }).populate('permissionId', 'code').lean();
  return mappings
    .map((mapping: any) => mapping.permissionId?.code)
    .filter(Boolean) as string[];
};
