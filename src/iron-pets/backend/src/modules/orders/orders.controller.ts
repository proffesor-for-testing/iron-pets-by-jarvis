/**
 * Orders Controller
 * Handles HTTP requests for order operations
 *
 * @module orders.controller
 */

import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { ErrorCode } from '../../types/api.types';

export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /**
   * GET /orders
   * Get user's order history
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        status: req.query.status as any,
      };

      const result = await this.ordersService.getOrders(userId, params);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to fetch orders',
        },
      });
    }
  }

  /**
   * GET /orders/:id
   * Get order details by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.id;

      const result = await this.ordersService.getOrderById(orderId, userId);
      res.json(result);
    } catch (error: any) {
      const statusCode =
        error.code === ErrorCode.NOT_FOUND ? 404 :
        error.code === ErrorCode.AUTHORIZATION_ERROR ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to fetch order',
        },
      });
    }
  }

  /**
   * POST /orders/:id/cancel
   * Cancel an order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.id;

      const result = await this.ordersService.cancelOrder(orderId, userId);
      res.json(result);
    } catch (error: any) {
      const statusCode =
        error.code === ErrorCode.NOT_FOUND ? 404 :
        error.code === ErrorCode.AUTHORIZATION_ERROR ? 403 :
        error.code === ErrorCode.VALIDATION_ERROR ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to cancel order',
        },
      });
    }
  }

  /**
   * POST /orders/:id/reorder
   * Reorder - add previous order items to cart
   */
  async reorderOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.id;

      const result = await this.ordersService.reorderOrder(orderId, userId);
      res.json(result);
    } catch (error: any) {
      const statusCode =
        error.code === ErrorCode.NOT_FOUND ? 404 :
        error.code === ErrorCode.AUTHORIZATION_ERROR ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || 'Failed to reorder',
        },
      });
    }
  }
}
