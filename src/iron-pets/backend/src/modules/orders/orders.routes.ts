/**
 * Orders Routes
 * Defines API endpoints for order operations
 *
 * @module orders.routes
 */

import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { authenticate } from '../../middleware/auth';
import { validateOrderRequest } from './orders.validation';

/**
 * Create orders router with dependencies
 */
export function createOrdersRoutes(
  orderRepository: any,
  productService: any,
  cartService: any,
  stripeService: any,
  emailService: any
): Router {
  const router = Router();
  const ordersService = new OrdersService(
    orderRepository,
    productService,
    cartService,
    stripeService,
    emailService
  );
  const controller = new OrdersController(ordersService);

  /**
   * GET /orders
   * Get user's order history (paginated)
   * REQ-ORD-001
   */
  router.get(
    '/',
    authenticate,
    (req, res) => controller.getOrders(req, res)
  );

  /**
   * GET /orders/:id
   * Get order details by ID
   * REQ-ORD-002
   */
  router.get(
    '/:id',
    authenticate,
    validateOrderRequest('getOrder'),
    (req, res) => controller.getOrderById(req, res)
  );

  /**
   * POST /orders/:id/cancel
   * Cancel an order
   * REQ-ORD-004
   */
  router.post(
    '/:id/cancel',
    authenticate,
    validateOrderRequest('cancelOrder'),
    (req, res) => controller.cancelOrder(req, res)
  );

  /**
   * POST /orders/:id/reorder
   * Reorder - add previous order items to cart
   * REQ-ORD-005
   */
  router.post(
    '/:id/reorder',
    authenticate,
    validateOrderRequest('reorder'),
    (req, res) => controller.reorderOrder(req, res)
  );

  return router;
}
