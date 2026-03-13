import dotenv from 'dotenv';
import { connectDatabase } from '../bootstrap/database';
import { ROLE_PERMISSION_MAP, ROLE_SEEDS } from '../constants/role-permissions';
import Permission from '../modules/permission/permission.model';
import RolePermission from '../modules/role/role-permission.model';
import Role from '../modules/role/role.model';
import logger from '../modules/logger/logger';

dotenv.config();

export const seedRoles = async () => {
  await connectDatabase();

  for (const roleSeed of ROLE_SEEDS) {
    const role = await Role.findOneAndUpdate(
      { code: roleSeed.code },
      { $set: { ...roleSeed, isActive: true } },
      { upsert: true, new: true }
    );

    const mappedPermissionCodes = ROLE_PERMISSION_MAP[roleSeed.code] || [];
    const permissions = await Permission.find({ code: { $in: mappedPermissionCodes } }).select({ _id: 1 });

    await RolePermission.deleteMany({ roleId: role._id });
    if (permissions.length) {
      await RolePermission.insertMany(
        permissions.map((permission) => ({ roleId: role._id, permissionId: permission._id }))
      );
    }
  }

  logger.info(`Roles seeded: ${ROLE_SEEDS.length}`);
};

if (require.main === module) {
  seedRoles()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Role seed failed: ${error.message}`);
      process.exit(1);
    });
}
