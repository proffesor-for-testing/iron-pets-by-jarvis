/**
 * Checkout Controller
 * Handles HTTP requests for checkout operations
 *
 * @module checkout.controller
 */

import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';
import { ErrorCode } from '../../types/api.types';

export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  /**
   * POST /checkout/shipping-rates
   * Get available shipping rates
   */
  async getShippingRates(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await this.checkoutService.getShippingRates(req.body, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to get shipping rates',
        },
      });
    }
  }

  /**
   * POST /checkout/validate
   * Validate checkout readiness
   */
  async validateCheckout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await this.checkoutService.validateCheckout(req.body, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Validation failed',
        },
      });
    }
  }

  /**
   * POST /checkout/apply-promo
   * Apply promo code to cart
   */
  async applyPromoCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await this.checkoutService.applyPromoCode(req.body, userId);
      res.json(result);
    } catch (error: any) {
      const statusCode = error.code === ErrorCode.INVALID_PROMO_CODE ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to apply promo code',
        },
      });
    }
  }

  /**
   * POST /checkout/create-payment
   * Create Stripe payment intent
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await this.checkoutService.createPaymentIntent(req.body, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code || ErrorCode.PAYMENT_FAILED,
          message: error.message || 'Failed to create payment',
        },
      });
    }
  }

  /**
   * POST /checkout/confirm
   * Confirm order and complete checkout
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;
      const result = await this.checkoutService.confirmOrder(req.body, userId, userEmail);
      res.status(201).json(result);
    } catch (error: any) {
      const statusCode = error.code === ErrorCode.INSUFFICIENT_STOCK ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to confirm order',
          details: error.details,
        },
      });
    }
  }
}
