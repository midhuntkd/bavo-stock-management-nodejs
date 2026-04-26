import Joi from 'joi';
import 'dotenv/config';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(4000),

    APP_NAME: Joi.string().default('Bavo Stock'),
    APP_BASE_URL: Joi.string().default('https://stockapi.bavoapp.in/'),

    MONGODB_URI: Joi.string().required(),

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('30m'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

    BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).default(10),

    SUPER_ADMIN_NAME: Joi.string().default('Super Admin'),
    SUPER_ADMIN_EMAIL: Joi.string().email().default('superadmin@example.com'),
    SUPER_ADMIN_PASSWORD: Joi.string().min(8).required(),
    SUPER_ADMIN_PHONE: Joi.string().allow('').default(''),

    DEFAULT_TIMEZONE: Joi.string().default('UTC'),
    ALLOW_NEGATIVE_STOCK: Joi.boolean().truthy('true').falsy('false').default(false),
    ALLOW_NEGATIVE_BALANCE: Joi.boolean().truthy('true').falsy('false').default(false),
    DEFAULT_PAGINATION_LIMIT: Joi.number().integer().min(1).default(20),
    MAX_PAGINATION_LIMIT: Joi.number().integer().min(1).default(500),

    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    CORS_ORIGIN: Joi.string().default('*'),
    ENABLE_DOCS: Joi.boolean().truthy('true').falsy('false').default(false),
    SMTP_HOST: Joi.string().allow('').default(''),
    SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
    SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
    SMTP_USER: Joi.string().allow('').default(''),
    SMTP_PASS: Joi.string().allow('').default(''),
    SMTP_FROM_NAME: Joi.string().default('Bavo Stock'),
    SMTP_FROM_EMAIL: Joi.string().email().allow('').default(''),

    RESERVATION_DEFAULT_EXPIRY_MINUTES: Joi.number().integer().min(1).default(30),
    INVOICE_PREFIX: Joi.string().default('INV'),
    PO_PREFIX: Joi.string().default('PO'),
    GRN_PREFIX: Joi.string().default('GRN'),
    TRANSFER_PREFIX: Joi.string().default('TRN'),
    ADJUSTMENT_PREFIX: Joi.string().default('ADJ'),
    ACCOUNT_CODE_PREFIX: Joi.string().default('ACC'),
    INVESTMENT_PREFIX: Joi.string().default('INVST'),
    REIMBURSEMENT_PREFIX: Joi.string().default('RMB'),

    AWS_REGION: Joi.string().allow(''),
    AWS_ACCESS_KEY_ID: Joi.string().allow(''),
    AWS_SECRET_ACCESS_KEY: Joi.string().allow(''),
    AWS_S3_BUCKET: Joi.string().allow(''),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const normalizeJwtTimespan = (value: string, defaultUnit: 'm' | 'd') => {
  const trimmed = String(value || '').trim();
  // Prevent accidental immediate expiry when values are set like "30"
  // and interpreted as milliseconds by jsonwebtoken/ms.
  return /^\d+$/.test(trimmed) ? `${trimmed}${defaultUnit}` : trimmed;
};

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  appName: envVars.APP_NAME,
  appBaseUrl: envVars.APP_BASE_URL,
  mongoose: {
    url: envVars.MONGODB_URI,
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    accessExpiresIn: normalizeJwtTimespan(envVars.JWT_ACCESS_EXPIRES_IN, 'm'),
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: normalizeJwtTimespan(envVars.JWT_REFRESH_EXPIRES_IN, 'd'),
  },
  bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  docs: {
    enabled: envVars.ENABLE_DOCS,
  },
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    secure: envVars.SMTP_SECURE,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    fromName: envVars.SMTP_FROM_NAME,
    fromEmail: envVars.SMTP_FROM_EMAIL,
  },
  corsOrigin: envVars.CORS_ORIGIN,
  timezone: envVars.DEFAULT_TIMEZONE,
  allowNegativeStock: envVars.ALLOW_NEGATIVE_STOCK,
  allowNegativeBalance:
    typeof process.env.ALLOW_NEGATIVE_BALANCE !== 'undefined'
      ? envVars.ALLOW_NEGATIVE_BALANCE
      : envVars.ALLOW_NEGATIVE_STOCK,
  pagination: {
    defaultLimit: envVars.DEFAULT_PAGINATION_LIMIT,
    maxLimit: envVars.MAX_PAGINATION_LIMIT,
  },
  logLevel: envVars.LOG_LEVEL,
  numbering: {
    invoicePrefix: envVars.INVOICE_PREFIX,
    poPrefix: envVars.PO_PREFIX,
    grnPrefix: envVars.GRN_PREFIX,
    transferPrefix: envVars.TRANSFER_PREFIX,
    adjustmentPrefix: envVars.ADJUSTMENT_PREFIX,
    accountCodePrefix: envVars.ACCOUNT_CODE_PREFIX,
    investmentPrefix: envVars.INVESTMENT_PREFIX,
    reimbursementPrefix: envVars.REIMBURSEMENT_PREFIX,
  },
  reservation: {
    defaultExpiryMinutes: envVars.RESERVATION_DEFAULT_EXPIRY_MINUTES,
  },
  seed: {
    superAdminName: envVars.SUPER_ADMIN_NAME,
    superAdminEmail: envVars.SUPER_ADMIN_EMAIL,
    superAdminPassword: envVars.SUPER_ADMIN_PASSWORD,
    superAdminPhone: envVars.SUPER_ADMIN_PHONE,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
};

export default config;
