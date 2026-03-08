import dotenv from 'dotenv';
import app from './app';
import config from './configs/config';
import { connectDatabase } from './bootstrap/database';
import logger from './modules/logger/logger';

dotenv.config();

let server: any;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${String(error)}`);
  exitHandler();
});

process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled Rejection: ${String(error)}`);
  exitHandler();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
