import dotenv from 'dotenv';
import { connectDatabase } from '../bootstrap/database';
import Permission from '../modules/permission/permission.model';
import { DEFAULT_PERMISSIONS } from '../modules/permission/permission.constants';
import logger from '../modules/logger/logger';

dotenv.config();

export const seedPermissions = async () => {
  await connectDatabase();

  for (const permission of DEFAULT_PERMISSIONS) {
    await Permission.updateOne(
      { key: permission.key },
      { $set: { description: permission.description, group: permission.group, isActive: true } },
      { upsert: true }
    );
  }

  logger.info(`Permissions seeded: ${DEFAULT_PERMISSIONS.length}`);
};

if (require.main === module) {
  seedPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Permission seed failed: ${error.message}`);
      process.exit(1);
    });
}
