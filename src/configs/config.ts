import Joi from 'joi';
import 'dotenv/config';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(4000),
    MONGODB_URL: Joi.string().required(),
    CLIENT_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    ENABLE_DOCS: Joi.boolean().default(false),
    SUPER_ADMIN_NAME: Joi.string().default('Super Admin'),
    SUPER_ADMIN_EMAIL: Joi.string().email().default('superadmin@example.com'),
    SUPER_ADMIN_PASSWORD: Joi.string().min(8).default('Admin@123456'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  clientUrl: envVars.CLIENT_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  docs: {
    enabled: envVars.ENABLE_DOCS,
  },
  seed: {
    superAdminName: envVars.SUPER_ADMIN_NAME,
    superAdminEmail: envVars.SUPER_ADMIN_EMAIL,
    superAdminPassword: envVars.SUPER_ADMIN_PASSWORD,
  },
};

export default config;
