/**
 * Cart Service - Business Logic
 * Handles cart operations, stock validation, and persistence
 */

import { PrismaClient } from '@prisma/client';

export interface CartIdentifier {
  sessionId: string;
  userId?: string;
}

export interface AddItemInput extends CartIdentifier {
  productId: string;
  quantity: number;
}

export interface UpdateItemInput extends CartIdentifier {
  itemId: string;
  quantity: number;
}

export interface RemoveItemInput extends CartIdentifier {
  itemId: string;
}

export interface MergeCartInput {
  guestSessionId: string;
  userSessionId: string;
  userId: string;
}

export class CartService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get cart for session or user
   * Creates new cart if doesn't exist
   */
  async getCart(identifier: CartIdentifier) {
    const { sessionId, userId } = identifier;

    // Try to find existing cart
    let cart = await this.prisma.cart.findFirst({
      where: userId
        ? { userId }
        : { sessionId, userId: null },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create new cart if doesn't exist
    if (!cart) {
      const expiresAt = userId
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for users
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for guests

      cart = await this.prisma.cart.create({
        data: {
          sessionId,
          userId: userId || null,
          expiresAt,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(cart.items);

    return {
      ...cart,
      subtotal,
    };
  }

  /**
   * Add item to cart
   * Increments quantity if item already exists
   */
  async addItem(input: AddItemInput) {
    const { sessionId, userId, productId, quantity } = input;

    // Validate stock availability
    const hasStock = await this.validateStock(productId, quantity);
    if (!hasStock) {
      const error = new Error('Insufficient stock');
      (error as any).code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    // Get or create cart
    const cart = await this.getCart({ sessionId, userId });

    // Get product price
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error('Product not found');
      (error as any).code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      // Increment quantity
      const newQuantity = existingItem.quantity + quantity;

      // Validate stock for new quantity
      const hasStockForNew = await this.validateStock(productId, newQuantity);
      if (!hasStockForNew) {
        const error = new Error('Insufficient stock');
        (error as any).code = 'INSUFFICIENT_STOCK';
        throw error;
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: product.price,
        },
      });
    }

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    // Return updated cart
    return this.getCart({ sessionId, userId });
  }

  /**
   * Update item quantity
   * Removes item if quantity is 0
   */
  async updateItem(input: UpdateItemInput) {
    const { sessionId, userId, itemId, quantity } = input;

    // Get cart
    const cart = await this.getCart({ sessionId, userId });

    // Find item
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      const error = new Error('Item not found');
      (error as any).code = 'ITEM_NOT_FOUND';
      throw error;
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Validate stock
      const hasStock = await this.validateStock(item.productId, quantity);
      if (!hasStock) {
        const error = new Error('Insufficient stock');
        (error as any).code = 'INSUFFICIENT_STOCK';
        throw error;
      }

      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    // Return updated cart
    return this.getCart({ sessionId, userId });
  }

  /**
   * Remove item from cart
   */
  async removeItem(input: RemoveItemInput) {
    const { sessionId, userId, itemId } = input;

    // Get cart
    const cart = await this.getCart({ sessionId, userId });

    // Find item
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      const error = new Error('Item not found');
      (error as any).code = 'ITEM_NOT_FOUND';
      throw error;
    }

    // Delete item
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    // Return updated cart
    return this.getCart({ sessionId, userId });
  }

  /**
   * Clear entire cart
   */
  async clearCart(identifier: CartIdentifier) {
    const { sessionId, userId } = identifier;

    // Get cart
    const cart = await this.getCart({ sessionId, userId });

    // Delete all items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    // Return empty cart
    return this.getCart({ sessionId, userId });
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeCart(input: MergeCartInput) {
    const { guestSessionId, userSessionId, userId } = input;

    // Get guest cart
    const guestCart = await this.prisma.cart.findFirst({
      where: {
        sessionId: guestSessionId,
        userId: null,
      },
      include: {
        items: true,
      },
    });

    // Get or create user cart
    let userCart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!userCart) {
      // Create user cart
      userCart = await this.prisma.cart.create({
        data: {
          sessionId: userSessionId,
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: {
          items: true,
        },
      });
    }

    // If guest cart exists, merge items
    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        // Check if item already exists in user cart
        const existingItem = userCart.items.find(
          item => item.productId === guestItem.productId
        );

        if (existingItem) {
          // Increment quantity
          const newQuantity = existingItem.quantity + guestItem.quantity;

          // Validate stock
          const hasStock = await this.validateStock(
            guestItem.productId,
            newQuantity
          );

          if (hasStock) {
            await this.prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: newQuantity },
            });
          }
        } else {
          // Add item to user cart
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              priceAtAdd: guestItem.priceAtAdd,
            },
          });
        }
      }

      // Delete guest cart
      await this.prisma.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      });
      await this.prisma.cart.delete({
        where: { id: guestCart.id },
      });
    }

    // Update user cart timestamp
    await this.prisma.cart.update({
      where: { id: userCart.id },
      data: { updatedAt: new Date() },
    });

    // Return merged cart
    return this.getCart({ sessionId: userSessionId, userId });
  }

  /**
   * Calculate cart subtotal
   */
  calculateSubtotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Validate stock availability
   */
  async validateStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return false;
    }

    return product.stockQuantity >= quantity;
  }

  /**
   * Cleanup expired carts
   * Should be run periodically via cron job
   */
  async cleanupExpiredCarts(): Promise<number> {
    const now = new Date();

    // Delete items from expired carts
    const expiredCarts = await this.prisma.cart.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
      select: { id: true },
    });

    const cartIds = expiredCarts.map(cart => cart.id);

    if (cartIds.length > 0) {
      // Delete items
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: {
            in: cartIds,
          },
        },
      });

      // Delete carts
      await this.prisma.cart.deleteMany({
        where: {
          id: {
            in: cartIds,
          },
        },
      });
    }

    return cartIds.length;
  }
}
