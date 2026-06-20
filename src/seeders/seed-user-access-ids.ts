import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { connectDatabase } from '../bootstrap/database';
import logger from '../modules/logger/logger';
import User from '../modules/user/user.model';

dotenv.config();

export const seedUserAccessIds = async () => {
  await connectDatabase();

  const usersWithoutAccessId = await User.find({
    $or: [{ accessId: { $exists: false } }, { accessId: null }, { accessId: '' }],
  }).select('_id');

  if (!usersWithoutAccessId.length) {
    logger.info('All users already have access IDs');
    return;
  }

  await User.bulkWrite(
    usersWithoutAccessId.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { accessId: randomUUID() } },
      },
    }))
  );

  logger.info(`Assigned access IDs to ${usersWithoutAccessId.length} user(s)`);
};

if (require.main === module) {
  seedUserAccessIds()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`User access ID seed failed: ${error.message}`);
      process.exit(1);
    });
}
