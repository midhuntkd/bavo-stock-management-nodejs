import dotenv from 'dotenv';
import { connectDatabase } from '../bootstrap/database';
import config from '../configs/config';
import User from '../modules/user/user.model';
import logger from '../modules/logger/logger';
import { DEFAULT_PERMISSIONS } from '../modules/permission/permission.constants';

dotenv.config();

export const seedSuperAdmin = async () => {
  await connectDatabase();

  const existing = await User.findOne({ email: config.seed.superAdminEmail });
  if (existing) {
    logger.info('Super admin already exists');
    process.exit(0);
  }

  const allPermissions = DEFAULT_PERMISSIONS.map((item) => item.key);

  await User.create({
    name: config.seed.superAdminName,
    email: config.seed.superAdminEmail,
    password: config.seed.superAdminPassword,
    role: 'super_admin',
    permissions: allPermissions,
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
