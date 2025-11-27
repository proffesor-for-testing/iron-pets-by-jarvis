/**
 * Cart Routes
 * Defines all cart-related endpoints
 */

import { Router } from 'express';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaClient } from '@prisma/client';
import { validate } from '../../middleware/validate';
import {
  addItemSchema,
  updateItemSchema,
  removeItemSchema,
  mergeCartSchema,
} from './cart.validation';

// Initialize dependencies
const prisma = new PrismaClient();
const cartService = new CartService(prisma);
const cartController = new CartController(cartService);

const router = Router();

/**
 * @route   GET /api/cart
 * @desc    Get cart for current session/user
 * @access  Public
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public
 * @body    { productId: string, quantity: number }
 */
router.post('/items', validate(addItemSchema), cartController.addItem);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Update item quantity
 * @access  Public
 * @params  id - Cart item ID
 * @body    { quantity: number }
 */
router.put('/items/:id', validate(updateItemSchema), cartController.updateItem);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Remove item from cart
 * @access  Public
 * @params  id - Cart item ID
 */
router.delete(
  '/items/:id',
  validate(removeItemSchema),
  cartController.removeItem
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Public
 */
router.delete('/', cartController.clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart with user cart on login
 * @access  Private (requires authentication)
 * @body    { guestSessionId: string }
 */
router.post('/merge', validate(mergeCartSchema), cartController.mergeCart);

export default router;
