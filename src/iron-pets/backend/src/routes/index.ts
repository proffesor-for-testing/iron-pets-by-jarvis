import { Router } from 'express';
import { authRoutes } from '../modules/auth';
import { catalogRoutes } from '../modules/catalog';
import { cartRoutes } from '../modules/cart';
import { checkoutRoutes } from '../modules/checkout';
import { ordersRoutes } from '../modules/orders';
import { userRoutes } from '../modules/user';
import { petsRoutes } from '../modules/pets';

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
