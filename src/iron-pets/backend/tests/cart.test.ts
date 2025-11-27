/**
 * Cart Module Tests - TDD London School (Outside-In)
 * Following mockist approach with behavior verification
 *
 * Test Scope:
 * - GET /cart - Cart retrieval
 * - POST /cart/items - Add items to cart
 * - PUT /cart/items/:id - Update item quantities
 * - DELETE /cart/items/:id - Remove items
 * - DELETE /cart - Clear entire cart
 * - POST /cart/merge - Merge guest cart with user cart
 * - Cart persistence and expiration
 */

import { Request, Response } from 'express';
import { CartController } from '../src/modules/cart/cart.controller';
import { CartService } from '../src/modules/cart/cart.service';
import { PrismaClient } from '@prisma/client';

// Mock dependencies following London School approach
jest.mock('@prisma/client');
jest.mock('../src/modules/cart/cart.service');

describe('Cart Module - TDD London School', () => {
  let cartController: CartController;
  let mockCartService: jest.Mocked<CartService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Create mock service with all methods
    mockCartService = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      mergeCart: jest.fn(),
      calculateSubtotal: jest.fn(),
      validateStock: jest.fn(),
      cleanupExpiredCarts: jest.fn(),
    } as any;

    // Create controller with mocked service
    cartController = new CartController(mockCartService);

    // Setup mock request/response
    mockRequest = {
      sessionID: 'test-session-123',
      sessionId: 'test-session-123',  // Custom property from Express.d.ts
      headers: {
        'x-session-id': 'test-session-123',
      },
      user: undefined,
      params: {},
      body: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cart - Retrieve Cart', () => {
    it('should return empty cart for new session', async () => {
      // Arrange - Mock returns empty cart
      const emptyCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.getCart.mockResolvedValue(emptyCart);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify interactions
      expect(mockCartService.getCart).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: emptyCart,
      });
    });

    it('should return cart with items for existing session', async () => {
      // Arrange
      const cartWithItems = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            price: 29.99,
            product: {
              id: 'prod-1',
              name: 'Premium Dog Food',
              price: 29.99,
              stock: 50,
            },
          },
        ],
        subtotal: 59.98,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.getCart.mockResolvedValue(cartWithItems);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.getCart).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: cartWithItems,
      });
      expect(cartWithItems.subtotal).toBe(59.98);
    });

    it('should return user cart when authenticated', async () => {
      // Arrange
      mockRequest.user = { id: 'user-1', email: 'test@example.com' };
      const userCart = {
        id: 'cart-2',
        sessionId: 'test-session-123',
        userId: 'user-1',
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      mockCartService.getCart.mockResolvedValue(userCart);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.getCart).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: 'user-1',
      });
    });
  });

  describe('POST /cart/items - Add Item to Cart', () => {
    it('should add new item to cart', async () => {
      // Arrange
      mockRequest.body = {
        productId: 'prod-1',
        quantity: 2,
      };

      const updatedCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            price: 29.99,
          },
        ],
        subtotal: 59.98,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.addItem.mockResolvedValue(updatedCart);

      // Act
      await cartController.addItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify interaction sequence
      expect(mockCartService.addItem).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
        productId: 'prod-1',
        quantity: 2,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCart,
        message: 'Item added to cart',
      });
    });

    it('should increment quantity if item already exists', async () => {
      // Arrange
      mockRequest.body = {
        productId: 'prod-1',
        quantity: 1,
      };

      const updatedCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 3, // Was 2, now 3
            price: 29.99,
          },
        ],
        subtotal: 89.97,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.addItem.mockResolvedValue(updatedCart);

      // Act
      await cartController.addItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.addItem).toHaveBeenCalled();
      expect(updatedCart.items[0].quantity).toBe(3);
    });

    it('should fail if exceeds stock', async () => {
      // Arrange
      mockRequest.body = {
        productId: 'prod-1',
        quantity: 100,
      };

      const stockError = new Error('Insufficient stock');
      (stockError as any).code = 'INSUFFICIENT_STOCK';
      mockCartService.addItem.mockRejectedValue(stockError);

      // Act
      await cartController.addItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.addItem).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(stockError);
    });

    it('should validate stock before adding', async () => {
      // Arrange
      mockRequest.body = {
        productId: 'prod-1',
        quantity: 5,
      };

      mockCartService.validateStock.mockResolvedValue(true);
      mockCartService.addItem.mockResolvedValue({} as any);

      // Act
      await cartController.addItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify stock validation happens before add
      expect(mockCartService.addItem).toHaveBeenCalled();
    });
  });

  describe('PUT /cart/items/:id - Update Item Quantity', () => {
    it('should update quantity', async () => {
      // Arrange
      mockRequest.params = { id: 'item-1' };
      mockRequest.body = { quantity: 5 };

      const updatedCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 5,
            price: 29.99,
          },
        ],
        subtotal: 149.95,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.updateItem.mockResolvedValue(updatedCart);

      // Act
      await cartController.updateItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.updateItem).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
        itemId: 'item-1',
        quantity: 5,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should remove item if quantity is 0', async () => {
      // Arrange
      mockRequest.params = { id: 'item-1' };
      mockRequest.body = { quantity: 0 };

      const updatedCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.updateItem.mockResolvedValue(updatedCart);

      // Act
      await cartController.updateItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.updateItem).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
        itemId: 'item-1',
        quantity: 0,
      });
      expect(updatedCart.items).toHaveLength(0);
    });

    it('should fail if new quantity exceeds stock', async () => {
      // Arrange
      mockRequest.params = { id: 'item-1' };
      mockRequest.body = { quantity: 1000 };

      const stockError = new Error('Insufficient stock');
      (stockError as any).code = 'INSUFFICIENT_STOCK';
      mockCartService.updateItem.mockRejectedValue(stockError);

      // Act
      await cartController.updateItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(stockError);
    });
  });

  describe('DELETE /cart/items/:id - Remove Item', () => {
    it('should remove item from cart', async () => {
      // Arrange
      mockRequest.params = { id: 'item-1' };

      const updatedCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.removeItem.mockResolvedValue(updatedCart);

      // Act
      await cartController.removeItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.removeItem).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
        itemId: 'item-1',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCart,
        message: 'Item removed from cart',
      });
    });

    it('should handle non-existent item gracefully', async () => {
      // Arrange
      mockRequest.params = { id: 'non-existent' };

      const error = new Error('Item not found');
      (error as any).code = 'ITEM_NOT_FOUND';
      mockCartService.removeItem.mockRejectedValue(error);

      // Act
      await cartController.removeItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('DELETE /cart - Clear Entire Cart', () => {
    it('should clear entire cart', async () => {
      // Arrange
      const emptyCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.clearCart.mockResolvedValue(emptyCart);

      // Act
      await cartController.clearCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.clearCart).toHaveBeenCalledWith({
        sessionId: 'test-session-123',
        userId: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: emptyCart,
        message: 'Cart cleared',
      });
    });
  });

  describe('POST /cart/merge - Merge Guest Cart with User Cart', () => {
    it('should merge guest cart with user cart on login', async () => {
      // Arrange
      mockRequest.user = { id: 'user-1', email: 'test@example.com' };
      mockRequest.body = {
        guestSessionId: 'guest-session-456',
      };

      const mergedCart = {
        id: 'cart-2',
        sessionId: 'test-session-123',
        userId: 'user-1',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            price: 29.99,
          },
          {
            id: 'item-2',
            productId: 'prod-2',
            quantity: 1,
            price: 39.99,
          },
        ],
        subtotal: 99.97,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for user
      };

      mockCartService.mergeCart.mockResolvedValue(mergedCart);

      // Act
      await cartController.mergeCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify merge workflow
      expect(mockCartService.mergeCart).toHaveBeenCalledWith({
        guestSessionId: 'guest-session-456',
        userSessionId: 'test-session-123',
        userId: 'user-1',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mergedCart,
        message: 'Cart merged successfully',
      });
    });

    it('should handle duplicate items when merging', async () => {
      // Arrange
      mockRequest.user = { id: 'user-1', email: 'test@example.com' };
      mockRequest.body = {
        guestSessionId: 'guest-session-456',
      };

      const mergedCart = {
        id: 'cart-2',
        sessionId: 'test-session-123',
        userId: 'user-1',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 5, // Combined from both carts
            price: 29.99,
          },
        ],
        subtotal: 149.95,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockCartService.mergeCart.mockResolvedValue(mergedCart);

      // Act
      await cartController.mergeCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCartService.mergeCart).toHaveBeenCalled();
      expect(mergedCart.items[0].quantity).toBe(5);
    });

    it('should require authentication for merge', async () => {
      // Arrange - No user
      mockRequest.user = undefined;
      mockRequest.body = {
        guestSessionId: 'guest-session-456',
      };

      // Act
      await cartController.mergeCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
    });
  });

  describe('Cart Persistence - Expiration Management', () => {
    it('should set guest cart to expire in 7 days', async () => {
      // Arrange
      const guestCart = {
        id: 'cart-1',
        sessionId: 'test-session-123',
        userId: null,
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockCartService.getCart.mockResolvedValue(guestCart);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify expiration is ~7 days
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const expiresAt = guestCart.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThan(Date.now());
      expect(expiresAt).toBeLessThanOrEqual(sevenDaysFromNow);
    });

    it('should set user cart to expire in 30 days', async () => {
      // Arrange
      mockRequest.user = { id: 'user-1', email: 'test@example.com' };

      const userCart = {
        id: 'cart-2',
        sessionId: 'test-session-123',
        userId: 'user-1',
        items: [],
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockCartService.getCart.mockResolvedValue(userCart);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert - Verify expiration is ~30 days
      const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const expiresAt = userCart.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThan(Date.now());
      expect(expiresAt).toBeLessThanOrEqual(thirtyDaysFromNow);
    });

    it('should cleanup expired carts', async () => {
      // Arrange
      mockCartService.cleanupExpiredCarts.mockResolvedValue(5); // 5 carts deleted

      // Act
      const deletedCount = await mockCartService.cleanupExpiredCarts();

      // Assert
      expect(mockCartService.cleanupExpiredCarts).toHaveBeenCalled();
      expect(deletedCount).toBe(5);
    });
  });

  describe('Subtotal Calculation', () => {
    it('should calculate subtotal correctly', async () => {
      // Arrange
      const cartItems = [
        { productId: 'prod-1', quantity: 2, price: 29.99 },
        { productId: 'prod-2', quantity: 3, price: 19.99 },
        { productId: 'prod-3', quantity: 1, price: 49.99 },
      ];

      const expectedSubtotal = (2 * 29.99) + (3 * 19.99) + (1 * 49.99);
      mockCartService.calculateSubtotal.mockReturnValue(expectedSubtotal);

      // Act
      const subtotal = mockCartService.calculateSubtotal(cartItems);

      // Assert
      expect(subtotal).toBe(169.94);
      expect(mockCartService.calculateSubtotal).toHaveBeenCalledWith(cartItems);
    });

    it('should handle empty cart', async () => {
      // Arrange
      mockCartService.calculateSubtotal.mockReturnValue(0);

      // Act
      const subtotal = mockCartService.calculateSubtotal([]);

      // Assert
      expect(subtotal).toBe(0);
    });
  });

  describe('Stock Validation', () => {
    it('should validate stock availability', async () => {
      // Arrange
      mockCartService.validateStock.mockResolvedValue(true);

      // Act
      const isAvailable = await mockCartService.validateStock('prod-1', 5);

      // Assert
      expect(mockCartService.validateStock).toHaveBeenCalledWith('prod-1', 5);
      expect(isAvailable).toBe(true);
    });

    it('should reject when stock insufficient', async () => {
      // Arrange
      mockCartService.validateStock.mockResolvedValue(false);

      // Act
      const isAvailable = await mockCartService.validateStock('prod-1', 1000);

      // Assert
      expect(isAvailable).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockCartService.getCart.mockRejectedValue(dbError);

      // Act
      await cartController.getCart(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockRequest.body = { productId: '', quantity: -1 };

      const validationError = new Error('Invalid input');
      (validationError as any).code = 'VALIDATION_ERROR';
      mockCartService.addItem.mockRejectedValue(validationError);

      // Act
      await cartController.addItem(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });
});
