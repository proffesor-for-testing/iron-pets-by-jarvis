/**
 * Cart Controller
 * Handles HTTP requests and responses for cart operations
 */

import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';

export class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  /**
   * GET /cart
   * Get cart for current session/user
   */
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user?.id;

      const cart = await this.cartService.getCart({ sessionId, userId });

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cart/items
   * Add item to cart
   */
  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user?.id;
      const { productId, quantity } = req.body;

      const cart = await this.cartService.addItem({
        sessionId,
        userId,
        productId,
        quantity,
      });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to cart',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /cart/items/:id
   * Update item quantity
   */
  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user?.id;
      const itemId = req.params.id;
      const { quantity } = req.body;

      const cart = await this.cartService.updateItem({
        sessionId,
        userId,
        itemId,
        quantity,
      });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item updated',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /cart/items/:id
   * Remove item from cart
   */
  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user?.id;
      const itemId = req.params.id;

      const cart = await this.cartService.removeItem({
        sessionId,
        userId,
        itemId,
      });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /cart
   * Clear entire cart
   */
  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user?.id;

      const cart = await this.cartService.clearCart({ sessionId, userId });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart cleared',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cart/merge
   * Merge guest cart with user cart on login
   */
  mergeCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Require authentication
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const userSessionId = req.sessionId || req.headers['x-session-id'] as string;
      const userId = req.user.id;
      const { guestSessionId } = req.body;

      const cart = await this.cartService.mergeCart({
        guestSessionId,
        userSessionId,
        userId,
      });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart merged successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
