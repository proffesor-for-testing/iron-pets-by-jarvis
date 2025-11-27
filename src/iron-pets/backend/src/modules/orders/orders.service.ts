/**
 * Orders Service
 * Implements REQ-ORD-001 through REQ-ORD-005
 *
 * @module orders.service
 */

import {
  OrderListParams,
  OrderListResponse,
  OrderDetailResponse,
  OrderResponse,
  ErrorCode,
} from '../../types/api.types';
import { OrderStatus } from '../../types/domain.types';

export class OrdersService {
  constructor(
    private orderRepository: any,
    private productService: any,
    private cartService: any,
    private stripeService: any,
    private emailService: any
  ) {}

  /**
   * Get user's order history with pagination
   * REQ-ORD-001: Order History
   */
  async getOrders(userId: string, params: OrderListParams): Promise<OrderListResponse> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Fetch orders from repository
    const result = await this.orderRepository.findByUserId(userId, {
      limit,
      offset,
      status: params.status,
      orderBy: 'placedAt',
      orderDirection: 'DESC', // Newest first
    });

    return {
      success: true,
      data: result.orders,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get order details by ID
   * REQ-ORD-002: Order Detail View
   */
  async getOrderById(orderId: string, userId: string): Promise<OrderDetailResponse> {
    // Fetch order with items
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw {
        code: ErrorCode.NOT_FOUND,
        message: 'Order not found',
      };
    }

    // Verify user owns this order
    if (order.userId && order.userId !== userId) {
      throw {
        code: ErrorCode.AUTHORIZATION_ERROR,
        message: 'You do not have permission to view this order',
      };
    }

    return {
      success: true,
      data: order,
    };
  }

  /**
   * Cancel an order
   * REQ-ORD-004: Order Cancellation
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderResponse> {
    // Fetch order
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw {
        code: ErrorCode.NOT_FOUND,
        message: 'Order not found',
      };
    }

    // Verify user owns this order
    if (order.userId && order.userId !== userId) {
      throw {
        code: ErrorCode.AUTHORIZATION_ERROR,
        message: 'You do not have permission to cancel this order',
      };
    }

    // Check if order is in cancellable status
    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING];
    if (!cancellableStatuses.includes(order.status)) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Order cannot be cancelled in current status',
      };
    }

    // Restore inventory for each order item
    for (const item of order.items) {
      await this.productService.incrementStock(item.productId, item.quantity);
    }

    // Initiate refund via Stripe
    if (order.paymentIntentId) {
      try {
        await this.stripeService.refundPayment(order.paymentIntentId);
      } catch (error) {
        // Log error but continue with cancellation
        console.error('Stripe refund failed:', error);
      }
    }

    // Update order status to cancelled
    const updatedOrder = await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    // Send cancellation email
    try {
      await this.emailService.sendCancellationNotification({
        email: order.email,
        orderNumber: order.orderNumber,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      });
    } catch (error) {
      // Log error but don't fail the cancellation
      console.error('Email notification failed:', error);
    }

    return {
      success: true,
      data: updatedOrder,
    };
  }

  /**
   * Reorder - add previous order items to cart
   * REQ-ORD-005: Reorder
   */
  async reorderOrder(orderId: string, userId: string): Promise<any> {
    // Fetch original order
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw {
        code: ErrorCode.NOT_FOUND,
        message: 'Order not found',
      };
    }

    // Verify user owns this order
    if (order.userId && order.userId !== userId) {
      throw {
        code: ErrorCode.AUTHORIZATION_ERROR,
        message: 'You do not have permission to reorder this order',
      };
    }

    // Get or create user's cart
    let cart = await this.cartService.getCart(userId);
    if (!cart) {
      cart = await this.cartService.createCart(userId);
    }

    const addedItems: any[] = [];
    const unavailableItems: any[] = [];

    // Add each order item to cart
    for (const item of order.items) {
      // Check product availability and stock
      const product = await this.productService.getProduct(item.productId);

      if (!product || !product.isActive) {
        unavailableItems.push({
          productId: item.productId,
          productName: item.productName,
          reason: 'Product no longer available',
        });
        continue;
      }

      if (product.stockQuantity === 0) {
        unavailableItems.push({
          productId: item.productId,
          productName: item.productName,
          reason: 'Out of stock',
        });
        continue;
      }

      // Adjust quantity based on available stock
      const quantityToAdd = Math.min(item.quantity, product.stockQuantity);

      // Add item to cart
      await this.cartService.addItem(cart.id, {
        productId: item.productId,
        quantity: quantityToAdd,
      });

      addedItems.push({
        productId: item.productId,
        productName: item.productName,
        requestedQuantity: item.quantity,
        addedQuantity: quantityToAdd,
      });
    }

    return {
      success: true,
      data: {
        cartId: cart.id,
        addedItems,
        unavailableItems,
      },
    };
  }

  /**
   * Create a new order
   * Called by checkout service during order confirmation
   */
  async createOrder(orderData: any): Promise<any> {
    // Generate unique order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = await this.generateOrderNumber();
    }

    // Set placed timestamp
    orderData.placedAt = new Date();

    // Create order in database
    const order = await this.orderRepository.create(orderData);

    // Send order confirmation email
    try {
      await this.emailService.sendOrderConfirmation({
        email: order.email,
        orderNumber: order.orderNumber,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        items: order.items,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        taxAmount: order.taxAmount,
        total: order.total,
        shippingAddress: order.shippingAddress,
        estimatedDelivery: this.calculateEstimatedDelivery(order.shippingMethod),
      });
    } catch (error) {
      // Log error but don't fail order creation
      console.error('Order confirmation email failed:', error);
    }

    return order;
  }

  /**
   * Update order status (internal use)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<any> {
    const updateData: any = { status };

    // Set appropriate timestamp based on status
    switch (status) {
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        break;
    }

    return await this.orderRepository.update(orderId, updateData);
  }

  /**
   * Generate unique order number in format IP-YYYY-NNN
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    const timestamp = Date.now().toString().slice(-3);
    return `IP-${year}-${randomNum}${timestamp}`;
  }

  /**
   * Calculate estimated delivery date based on shipping method
   */
  private calculateEstimatedDelivery(shippingMethod: string): string {
    const today = new Date();
    let daysToAdd = 7; // Default: Standard shipping

    if (shippingMethod === 'expedited') {
      daysToAdd = 3;
    }

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd);

    return deliveryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
