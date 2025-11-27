import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuthRouter } from '../modules/auth';
import { createCatalogRoutes, CatalogService, CatalogController } from '../modules/catalog';
import cartRoutes from '../modules/cart/cart.routes';
import { createUserRouter } from '../modules/user';
import { createPetsRouter } from '../modules/pets';
import { JwtService } from '../utils/jwt.service';
import { EmailService } from '../utils/email.service';
import { MockEmailService, getMockEmailService } from '../services/mock-email.service';
import { appConfig } from '../config';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const jwtService = new JwtService({
  secret: appConfig.auth.jwt.secret,
  expiresIn: appConfig.auth.jwt.expiresIn,
  refreshSecret: appConfig.auth.jwt.refreshSecret,
  refreshExpiresIn: appConfig.auth.jwt.refreshExpiresIn,
});

// Email service (mock or real)
let emailService: EmailService | MockEmailService;
if (appConfig.email.useMock) {
  emailService = getMockEmailService(appConfig.email.fromEmail);
} else {
  emailService = new EmailService(appConfig.app.baseUrl);
}

// Module services
const catalogService = new CatalogService(prisma);

// Module controllers
const catalogController = new CatalogController(catalogService);

// Create routers
const authRoutes = createAuthRouter(prisma, jwtService, emailService as any);
const catalogRoutes = createCatalogRoutes(catalogController);
const userRoutes = createUserRouter(prisma);
const petsRoutes = createPetsRouter(prisma);

// Checkout and orders routes need more complex setup - use placeholder for now
// These will be mounted in app.ts with full dependency injection
const checkoutRoutes = Router();
const ordersRoutes = Router();

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API version prefix
const API_V1 = '/api/v1';

// Mount all module routes
router.use(`${API_V1}/auth`, authRoutes);
router.use(`${API_V1}/catalog`, catalogRoutes);
router.use(`${API_V1}/cart`, cartRoutes);
router.use(`${API_V1}/checkout`, checkoutRoutes);
router.use(`${API_V1}/orders`, ordersRoutes);
router.use(`${API_V1}/user`, userRoutes);
router.use(`${API_V1}/pets`, petsRoutes);

// 404 handler for API routes
router.use(`${API_V1}/*`, (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

export { router as mainRouter };
