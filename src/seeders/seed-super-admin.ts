import dotenv from 'dotenv';
import { connectDatabase } from '../bootstrap/database';
import config from '../configs/config';
import Role from '../modules/role/role.model';
import User from '../modules/user/user.model';
import logger from '../modules/logger/logger';

dotenv.config();

export const seedSuperAdmin = async () => {
  await connectDatabase();

  const role = await Role.findOne({ code: 'super_admin' });
  if (!role) {
    throw new Error('Role super_admin not found. Please run seed:roles first.');
  }

  const existing = await User.findOne({ email: config.seed.superAdminEmail.toLowerCase() });
  if (existing) {
    logger.info('Super admin already exists');
    return;
  }

  await User.create({
    name: config.seed.superAdminName,
    email: config.seed.superAdminEmail.toLowerCase(),
    password: config.seed.superAdminPassword,
    phone: config.seed.superAdminPhone,
    roleId: role._id,
    roleCode: role.code,
    permissions: [],
    isActive: true,
  });

  logger.info('Super admin seeded successfully');
};

if (require.main === module) {
  seedSuperAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Super admin seed failed: ${error.message}`);
      process.exit(1);
    });
}
