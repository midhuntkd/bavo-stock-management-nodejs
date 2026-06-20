import dotenv from 'dotenv';
import logger from '../modules/logger/logger';
import { seedUserAccessIds } from './seed-user-access-ids';
import { seedPermissions } from './seed-permissions';
import { seedRoles } from './seed-roles';
import { seedSuperAdmin } from './seed-super-admin';

dotenv.config();

const run = async () => {
  await seedPermissions();
  await seedRoles();
  await seedSuperAdmin();
  await seedUserAccessIds();
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error(`Seed all failed: ${error.message}`);
    process.exit(1);
  });
