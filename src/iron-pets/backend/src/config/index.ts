import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration Schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // SendGrid
  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string().email(),

  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880').transform(Number), // 5MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Session
  SESSION_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().default('true').transform(val => val === 'true'),
});

/**
 * Parsed and validated environment configuration
 */
export const config = envSchema.parse(process.env);

/**
 * Type-safe configuration object
 */
export const appConfig = {
  app: {
    env: config.NODE_ENV,
    port: config.PORT,
    apiVersion: config.API_VERSION,
    isProduction: config.NODE_ENV === 'production',
    isDevelopment: config.NODE_ENV === 'development',
    isTest: config.NODE_ENV === 'test',
  },

  database: {
    url: config.DATABASE_URL,
  },

  auth: {
    jwt: {
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRES_IN,
      refreshSecret: config.JWT_REFRESH_SECRET,
      refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
    },
    bcrypt: {
      rounds: config.BCRYPT_ROUNDS,
    },
  },

  cors: {
    origin: config.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true,
  },

  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
  },

  stripe: {
    secretKey: config.STRIPE_SECRET_KEY,
    publishableKey: config.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  },

  email: {
    apiKey: config.SENDGRID_API_KEY,
    fromEmail: config.SENDGRID_FROM_EMAIL,
  },

  upload: {
    maxFileSize: config.MAX_FILE_SIZE,
    uploadDir: config.UPLOAD_DIR,
  },

  logging: {
    level: config.LOG_LEVEL,
  },

  session: {
    secret: config.SESSION_SECRET,
    cookie: {
      domain: config.COOKIE_DOMAIN,
      secure: config.COOKIE_SECURE,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
} as const;

export type AppConfig = typeof appConfig;
