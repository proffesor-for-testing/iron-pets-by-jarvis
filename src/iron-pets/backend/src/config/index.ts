import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration Schema
 * Validates required environment variables at startup
 * External services (Stripe, SendGrid) are optional in development
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  API_VERSION: z.string().default('v1'),
  APP_BASE_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  JWT_SECRET: z.string().min(32).default('dev-jwt-secret-change-in-production-min32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-in-production-min32'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Stripe (optional in development - uses mock)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // SendGrid (optional in development - uses mock)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),

  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880').transform(Number), // 5MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Session
  SESSION_SECRET: z.string().min(32).default('dev-session-secret-change-in-production32'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().default('false').transform(val => val === 'true'),

  // Mock services flag
  USE_MOCK_SERVICES: z.string().default('true').transform(val => val === 'true'),
});

/**
 * Parse environment variables with helpful error messages
 */
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .filter(e => e.message === 'Required')
        .map(e => e.path.join('.'));
      const invalid = error.errors
        .filter(e => e.message !== 'Required')
        .map(e => `${e.path.join('.')}: ${e.message}`);

      console.error('\n❌ Environment Configuration Error:');
      if (missing.length) {
        console.error(`\nMissing required variables:\n  - ${missing.join('\n  - ')}`);
      }
      if (invalid.length) {
        console.error(`\nInvalid variables:\n  - ${invalid.join('\n  - ')}`);
      }
      console.error('\nCheck your .env file or environment variables.\n');
    }
    throw error;
  }
}

/**
 * Parsed and validated environment configuration
 */
export const config = parseEnv();

/**
 * Determine if we should use mock services
 */
const shouldUseMockServices = () => {
  // Always use mock in test environment
  if (config.NODE_ENV === 'test') return true;

  // Use mock if explicitly enabled
  if (config.USE_MOCK_SERVICES) return true;

  // Use mock in development if Stripe keys are not configured
  if (config.NODE_ENV === 'development') {
    if (!config.STRIPE_SECRET_KEY || config.STRIPE_SECRET_KEY.startsWith('sk_test_xxx')) {
      return true;
    }
  }

  return false;
};

/**
 * Type-safe configuration object
 */
export const appConfig = {
  app: {
    env: config.NODE_ENV,
    port: config.PORT,
    apiVersion: config.API_VERSION,
    baseUrl: config.APP_BASE_URL,
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
    secretKey: config.STRIPE_SECRET_KEY || '',
    publishableKey: config.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: config.STRIPE_WEBHOOK_SECRET || '',
    useMock: shouldUseMockServices(),
  },

  email: {
    apiKey: config.SENDGRID_API_KEY || '',
    fromEmail: config.SENDGRID_FROM_EMAIL || 'noreply@ironpets.local',
    useMock: shouldUseMockServices(),
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

  services: {
    useMock: shouldUseMockServices(),
  },
} as const;

export type AppConfig = typeof appConfig;

// Log configuration status on startup
if (config.NODE_ENV !== 'test') {
  console.log('\n📦 Iron Pets API Configuration:');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Port: ${config.PORT}`);
  console.log(`   API Version: ${config.API_VERSION}`);
  console.log(`   Mock Services: ${appConfig.services.useMock ? 'Enabled' : 'Disabled'}`);
  if (appConfig.services.useMock) {
    console.log('   ⚠️  Using mock Stripe and Email services');
  }
  console.log('');
}
