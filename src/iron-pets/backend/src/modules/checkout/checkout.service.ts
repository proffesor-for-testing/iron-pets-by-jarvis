/**
 * Checkout Service
 * Implements REQ-CHK-001 through REQ-CHK-007
 *
 * @module checkout.service
 */

import { SHIPPING_OPTIONS, ShippingOption, ShippingAddress } from '../../types/domain.types';
import {
  ShippingRatesRequest,
  ShippingRatesResponse,
  ValidateCheckoutRequest,
  ValidateCheckoutResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmOrderRequest,
  ApplyPromoRequest,
  ApplyPromoResponse,
  StockIssue,
  ErrorCode,
} from '../../types/api.types';

export class CheckoutService {
  constructor(
    private cartService: any,
    private productService: any,
    private promoService: any,
    private stripeService: any,
    private orderService: any
  ) {}

  /**
   * Get shipping rates based on cart and address
   * REQ-CHK-003: Shipping Method Selection
   */
  async getShippingRates(
    request: ShippingRatesRequest,
    userId?: string
  ): Promise<ShippingRatesResponse> {
    // Get current cart
    const cart = await this.cartService.getCart(userId);

    // Calculate shipping options based on cart subtotal
    const options: ShippingOption[] = SHIPPING_OPTIONS.map(option => {
      const isFree = option.freeThreshold && cart.subtotal >= option.freeThreshold;

      return {
        id: option.id,
        name: option.name,
        description: option.description,
        price: isFree ? 0 : option.price,
        estimatedDays: option.estimatedDays,
        isFree,
      };
    });

    return {
      success: true,
      data: options,
    };
  }

  /**
   * Validate checkout readiness
   * REQ-CHK-001: Checkout Initiation
   */
  async validateCheckout(
    request: ValidateCheckoutRequest,
    userId?: string
  ): Promise<ValidateCheckoutResponse> {
    // Get current cart
    const cart = await this.cartService.getCart(userId);

    // Validate stock availability for all cart items
    const stockValidation = await this.cartService.validateCartStock(cart.id);

    return {
      success: true,
      data: {
        valid: stockValidation.valid,
        stockIssues: stockValidation.stockIssues || [],
      },
    };
  }

  /**
   * Apply promo code to cart
   * REQ-CHK-005: Promo Code Application
   */
  async applyPromoCode(
    request: ApplyPromoRequest,
    userId?: string
  ): Promise<ApplyPromoResponse> {
    // Get current cart
    const cart = await this.cartService.getCart(userId);

    // Validate promo code
    const promoCode = await this.promoService.validatePromoCode(request.code);

    if (!promoCode) {
      throw {
        code: ErrorCode.INVALID_PROMO_CODE,
        message: 'Promo code not found',
      };
    }

    // Check if code is expired
    const now = new Date();
    if (promoCode.expiresAt < now) {
      throw {
        code: ErrorCode.INVALID_PROMO_CODE,
        message: 'Promo code has expired',
      };
    }

    // Check if code has exceeded max uses
    if (promoCode.maxUses && promoCode.usesCount >= promoCode.maxUses) {
      throw {
        code: ErrorCode.INVALID_PROMO_CODE,
        message: 'Promo code has reached maximum uses',
      };
    }

    // Check if code is active
    if (!promoCode.isActive) {
      throw {
        code: ErrorCode.INVALID_PROMO_CODE,
        message: 'Promo code is not active',
      };
    }

    // Check minimum order value
    if (promoCode.minOrderValue && cart.subtotal < promoCode.minOrderValue) {
      throw {
        code: ErrorCode.INVALID_PROMO_CODE,
        message: `Order must be at least $${promoCode.minOrderValue} to use this code`,
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (promoCode.discountType === 'percentage') {
      discountAmount = (cart.subtotal * promoCode.discountValue) / 100;
    } else {
      discountAmount = promoCode.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cart.subtotal);

    return {
      success: true,
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
      },
    };
  }

  /**
   * Create Stripe payment intent
   * REQ-CHK-004: Payment Processing
   */
  async createPaymentIntent(
    request: CreatePaymentRequest,
    userId?: string
  ): Promise<CreatePaymentResponse> {
    // Get current cart
    const cart = await this.cartService.getCart(userId);

    // Calculate shipping cost
    const shippingOption = SHIPPING_OPTIONS.find(
      opt => opt.id === request.shippingMethodId
    );
    if (!shippingOption) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid shipping method',
      };
    }

    const shippingCost = shippingOption.freeThreshold && cart.subtotal >= shippingOption.freeThreshold
      ? 0
      : shippingOption.price;

    // Calculate discount if promo code provided
    let discountAmount = 0;
    if (request.promoCode) {
      const promoResult = await this.applyPromoCode({ code: request.promoCode }, userId);
      discountAmount = promoResult.data.discountAmount;
    }

    // Calculate tax (simplified: 8% for MVP)
    const taxRate = 0.08;
    const subtotalAfterDiscount = cart.subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * taxRate;

    // Calculate total
    const total = subtotalAfterDiscount + shippingCost + taxAmount;

    // Create Stripe payment intent
    const amountInCents = Math.round(total * 100);
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: userId || 'guest',
        cartId: cart.id,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
      },
    };
  }

  /**
   * Confirm order and complete checkout
   * REQ-CHK-007: Order Confirmation
   */
  async confirmOrder(
    request: ConfirmOrderRequest,
    userId?: string,
    userEmail?: string
  ): Promise<any> {
    // Get current cart
    const cart = await this.cartService.getCart(userId);

    // Validate stock one final time
    const stockValidation = await this.cartService.validateCartStock(cart.id);
    if (!stockValidation.valid) {
      throw {
        code: ErrorCode.INSUFFICIENT_STOCK,
        message: 'Some items are no longer available',
        details: stockValidation.stockIssues,
      };
    }

    // Calculate shipping cost
    const shippingOption = SHIPPING_OPTIONS.find(
      opt => opt.id === request.shippingMethodId
    );
    const shippingCost = shippingOption!.freeThreshold && cart.subtotal >= shippingOption!.freeThreshold
      ? 0
      : shippingOption!.price;

    // Calculate discount if promo code provided
    let discountAmount = 0;
    if (request.promoCode) {
      const promoResult = await this.applyPromoCode({ code: request.promoCode }, userId);
      discountAmount = promoResult.data.discountAmount;
    }

    // Calculate tax
    const taxRate = 0.08;
    const subtotalAfterDiscount = cart.subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * taxRate;
    const total = subtotalAfterDiscount + shippingCost + taxAmount;

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.orderService.createOrder({
      orderNumber,
      userId: userId || null,
      email: userEmail || request.shippingAddress.email,
      status: 'pending',
      subtotal: cart.subtotal,
      shippingAmount: shippingCost,
      taxAmount,
      discountAmount,
      total,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress || request.shippingAddress,
      shippingMethod: request.shippingMethodId,
      paymentIntentId: request.paymentIntentId,
      promoCode: request.promoCode || null,
      notes: request.notes || null,
      items: cart.items,
    });

    // Decrement stock for each item
    for (const item of cart.items) {
      await this.productService.decrementStock(item.productId, item.quantity);
    }

    // Increment promo code usage if used
    if (request.promoCode) {
      await this.promoService.incrementUsage(request.promoCode);
    }

    // Clear cart
    await this.cartService.clearCart(cart.id);

    return {
      success: true,
      data: order,
    };
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
}
