import dotenv from 'dotenv';
import { connectDatabase } from '../bootstrap/database';
import { PERMISSION_SEEDS } from '../constants/permissions';
import Permission from '../modules/permission/permission.model';
import logger from '../modules/logger/logger';

dotenv.config();

export const seedPermissions = async () => {
  await connectDatabase();

  for (const permission of PERMISSION_SEEDS) {
    await Permission.updateOne(
      { code: permission.code },
      {
        $set: {
          name: permission.name,
          code: permission.code,
          module: permission.module,
          description: permission.description,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }

  logger.info(`Permissions seeded: ${PERMISSION_SEEDS.length}`);
};

if (require.main === module) {
  seedPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Permission seed failed: ${error.message}`);
      process.exit(1);
    });
}
