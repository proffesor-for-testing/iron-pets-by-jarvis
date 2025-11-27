import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { appConfig } from '@config/index';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import { defaultRateLimiter } from '@middleware/rateLimiter';
import { authRoutes } from '@modules/auth';
import { catalogRoutes } from '@modules/catalog';
import { cartRoutes } from '@modules/cart';
import { checkoutRoutes } from '@modules/checkout';
import { ordersRoutes } from '@modules/orders';
import { userRoutes } from '@modules/user';
import { petsRoutes } from '@modules/pets';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================

  // Helmet - sets various HTTP headers for security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS - enable cross-origin requests
  app.use(cors(appConfig.cors));

  // ============================================
  // Request Parsing Middleware
  // ============================================

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Parse cookies
  app.use(cookieParser(appConfig.session.secret));

  // Compression
  app.use(compression());

  // ============================================
  // Rate Limiting
  // ============================================

  // Apply default rate limiter to all routes
  app.use(defaultRateLimiter);

  // ============================================
  // Health Check & Status Endpoints
  // ============================================

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appConfig.app.env,
      },
    });
  });

  app.get('/ready', async (req, res) => {
    // TODO: Add database connection check
    res.status(200).json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ============================================
  // API Routes
  // ============================================

  // API version prefix
  const apiPrefix = `/api/${appConfig.app.apiVersion}`;

  // Mount all module routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/catalog`, catalogRoutes);
  app.use(`${apiPrefix}/cart`, cartRoutes);
  app.use(`${apiPrefix}/checkout`, checkoutRoutes);
  app.use(`${apiPrefix}/orders`, ordersRoutes);
  app.use(`${apiPrefix}/user`, userRoutes);
  app.use(`${apiPrefix}/pets`, petsRoutes);

  // API info endpoint
  app.get(apiPrefix, (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Iron Pets API',
        version: appConfig.app.apiVersion,
        environment: appConfig.app.env,
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: `${apiPrefix}/auth`,
          catalog: `${apiPrefix}/catalog`,
          cart: `${apiPrefix}/cart`,
          checkout: `${apiPrefix}/checkout`,
          orders: `${apiPrefix}/orders`,
          user: `${apiPrefix}/user`,
          pets: `${apiPrefix}/pets`,
        },
      },
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}

/**
 * Express application instance
 */
export const app = createApp();
