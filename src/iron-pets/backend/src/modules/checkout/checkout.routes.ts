/**
 * Checkout Routes
 * Defines API endpoints for checkout operations
 *
 * @module checkout.routes
 */

import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { authenticateOptional } from '../../middleware/auth';
import { validateCheckoutRequest } from './checkout.validation';

// Initialize service and controller
// Note: Dependencies will be injected in the main app initialization
export function createCheckoutRoutes(
  cartService: any,
  productService: any,
  promoService: any,
  stripeService: any,
  orderService: any
): Router {
  const router = Router();
  const checkoutService = new CheckoutService(
    cartService,
    productService,
    promoService,
    stripeService,
    orderService
  );
  const controller = new CheckoutController(checkoutService);

  /**
   * POST /checkout/shipping-rates
   * Get available shipping rates
   * REQ-CHK-003
   */
  router.post(
    '/shipping-rates',
    authenticateOptional,
    validateCheckoutRequest('shippingRates'),
    (req, res) => controller.getShippingRates(req, res)
  );

  /**
   * POST /checkout/validate
   * Validate checkout readiness
   * REQ-CHK-001
   */
  router.post(
    '/validate',
    authenticateOptional,
    validateCheckoutRequest('validate'),
    (req, res) => controller.validateCheckout(req, res)
  );

  /**
   * POST /checkout/apply-promo
   * Apply promo code to cart
   * REQ-CHK-005
   */
  router.post(
    '/apply-promo',
    authenticateOptional,
    validateCheckoutRequest('applyPromo'),
    (req, res) => controller.applyPromoCode(req, res)
  );

  /**
   * POST /checkout/create-payment
   * Create Stripe payment intent
   * REQ-CHK-004
   */
  router.post(
    '/create-payment',
    authenticateOptional,
    validateCheckoutRequest('createPayment'),
    (req, res) => controller.createPaymentIntent(req, res)
  );

  /**
   * POST /checkout/confirm
   * Confirm order and complete checkout
   * REQ-CHK-007
   */
  router.post(
    '/confirm',
    authenticateOptional,
    validateCheckoutRequest('confirmOrder'),
    (req, res) => controller.confirmOrder(req, res)
  );

  return router;
}
