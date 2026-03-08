import mongoose from 'mongoose';
import config from '../configs/config';
import logger from '../modules/logger/logger';

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(config.mongoose.url, { serverSelectionTimeoutMS: 5000 });
  logger.info('Connected to mongodb');
};
