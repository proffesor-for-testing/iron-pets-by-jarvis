import express, { Application, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { appConfig } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimiter';

// Module imports
import { cartRoutes } from './modules/cart';
import { CatalogService, CatalogController, createCatalogRoutes } from './modules/catalog';
import { createAuthRouter } from './modules/auth';
import { createUserRouter } from './modules/user';
import { createPetsRouter } from './modules/pets';

// Services
import { JwtService } from './utils/jwt.service';
import { EmailService } from './utils/email.service';
import { getMockStripeService } from './services/mock-stripe.service';
import { getMockEmailService } from './services/mock-email.service';

// Initialize Prisma
const prisma = new PrismaClient();

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: appConfig.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  }));

  // ============================================
  // Request Parsing Middleware
  // ============================================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(appConfig.session.secret));

  // ============================================
  // Rate Limiting
  // ============================================

  app.use(defaultRateLimiter);

  // ============================================
  // Health Check & Status Endpoints
  // ============================================

  app.get('/health', (_req, res) => {
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

  app.get('/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        success: true,
        data: {
          status: 'ready',
          database: 'connected',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        data: {
          status: 'not_ready',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // ============================================
  // Initialize Services
  // ============================================

  // JWT Service
  const jwtService = new JwtService({
    secret: appConfig.auth.jwt.secret,
    expiresIn: appConfig.auth.jwt.expiresIn,
    refreshSecret: appConfig.auth.jwt.refreshSecret,
    refreshExpiresIn: appConfig.auth.jwt.refreshExpiresIn,
  });

  // Email Service (mock or real based on config)
  const emailService = appConfig.email.useMock
    ? getMockEmailService(appConfig.email.fromEmail)
    : new EmailService(appConfig.app.baseUrl);

  // Stripe Service (mock or real based on config)
  const stripeService = appConfig.stripe.useMock
    ? getMockStripeService({ enabled: true })
    : (() => {
        const Stripe = require('stripe');
        return new Stripe(appConfig.stripe.secretKey);
      })();

  // ============================================
  // Initialize Module Services & Routes
  // ============================================

  // Catalog - uses controller injection
  const catalogService = new CatalogService(prisma);
  const catalogController = new CatalogController(catalogService);
  const catalogRoutes = createCatalogRoutes(catalogController);

  // Auth - uses prisma + services injection
  const authRoutes = createAuthRouter(prisma, jwtService, emailService as EmailService);

  // User - uses prisma injection (creates own service internally)
  const userRoutes = createUserRouter(prisma);

  // Pets - uses prisma injection (creates own service internally)
  const petsRoutes = createPetsRouter(prisma);

  // Orders - simplified inline routes for now (complex DI)
  const ordersRoutes = Router();
  ordersRoutes.get('/', async (req, res): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { placedAt: 'desc' },
      });
      res.json({ success: true, data: { orders, total: orders.length } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  ordersRoutes.get('/:id', async (req, res): Promise<void> => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Checkout routes
  const checkoutRoutes = Router();
  checkoutRoutes.get('/shipping-rates', (_req, res) => {
    res.json({
      success: true,
      data: [
        { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7' },
        { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', price: 24.99, estimatedDays: '1' },
      ],
    });
  });
  checkoutRoutes.post('/shipping-rates', (_req, res) => {
    res.json({
      success: true,
      data: {
        rates: [
          { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7' },
          { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: '2-3' },
          { id: 'overnight', name: 'Overnight Shipping', price: 24.99, estimatedDays: '1' },
        ],
      },
    });
  });
  checkoutRoutes.post('/payment-intent', async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: Math.round((amount || 100) * 100),
        currency: 'usd',
      });
      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  });
  checkoutRoutes.post('/confirm', async (_req, res) => {
    try {
      const orderNumber = `IP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      res.json({
        success: true,
        data: {
          id: `order-${Date.now()}`,
          orderNumber,
          status: 'processing',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  });
  checkoutRoutes.post('/validate-address', (req, res) => {
    res.json({ success: true, data: { valid: true, normalized: req.body } });
  });

  // ============================================
  // API Routes
  // ============================================

  const apiPrefix = `/api/${appConfig.app.apiVersion}`;

  // Mount module routes under /api/v1/
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/catalog`, catalogRoutes);
  app.use(`${apiPrefix}/cart`, cartRoutes);
  app.use(`${apiPrefix}/checkout`, checkoutRoutes);
  app.use(`${apiPrefix}/orders`, ordersRoutes);
  app.use(`${apiPrefix}/user`, userRoutes);
  app.use(`${apiPrefix}/pets`, petsRoutes);

  // ============================================
  // Aliased Routes for Frontend Compatibility
  // Frontend uses /api/products, /api/categories, etc.
  // ============================================

  // Direct product/category routes (aliases to catalog)
  app.use(`${apiPrefix}/products`, catalogRoutes);
  app.use(`${apiPrefix}/categories`, catalogRoutes);
  app.use(`${apiPrefix}/brands`, catalogRoutes);

  // Also support without version prefix for simpler frontend URLs
  app.use('/api/products', catalogRoutes);
  app.use('/api/categories', catalogRoutes);
  app.use('/api/brands', catalogRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/pets', petsRoutes);

  // ============================================
  // API Info Endpoint
  // ============================================

  app.get(apiPrefix, (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Iron Pets API',
        version: appConfig.app.apiVersion,
        environment: appConfig.app.env,
        mockServices: appConfig.services.useMock,
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: `${apiPrefix}/auth`,
          catalog: `${apiPrefix}/catalog`,
          products: `${apiPrefix}/products`,
          categories: `${apiPrefix}/categories`,
          cart: `${apiPrefix}/cart`,
          checkout: `${apiPrefix}/checkout`,
          orders: `${apiPrefix}/orders`,
          user: `${apiPrefix}/user`,
          pets: `${apiPrefix}/pets`,
        },
      },
    });
  });

  app.get('/api', (_req, res) => {
    res.redirect(apiPrefix);
  });

  // ============================================
  // Error Handling
  // ============================================

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Express application instance
 */
export const app = createApp();

/**
 * Export Prisma client for use in other modules
 */
export { prisma };
