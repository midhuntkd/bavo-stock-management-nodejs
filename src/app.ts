import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import routes from './routes';
import config from './configs/config';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import { httpLogger } from './modules/logger';

const app: Express = express();

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

const allowedOrigins = config.corsOrigin
  .split(',')
  .map((origin: string) => normalizeOrigin(origin))
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(httpLogger);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bavo Stock API is running',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health check successful',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/v1', routes);

app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
