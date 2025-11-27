/**
 * Mock Stripe Service
 * Provides mock implementations for Stripe operations in development/testing
 */

export interface PaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  metadata?: Record<string, string>;
}

export interface MockStripeConfig {
  enabled: boolean;
  simulateFailures?: boolean;
  failureRate?: number;
}

export class MockStripeService {
  private config: MockStripeConfig;
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  constructor(config: MockStripeConfig = { enabled: true }) {
    this.config = config;
    console.log('[MockStripe] Mock Stripe service initialized');
  }

  /**
   * Create a mock payment intent
   */
  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    // Simulate network delay
    await this.simulateDelay(100, 300);

    // Check for simulated failures
    if (this.shouldFail()) {
      throw new Error('Mock Stripe: Payment intent creation failed');
    }

    const id = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientSecret = `${id}_secret_${Math.random().toString(36).substr(2, 16)}`;

    const paymentIntent: PaymentIntent = {
      id,
      client_secret: clientSecret,
      amount: params.amount,
      currency: params.currency,
      status: 'requires_payment_method',
      metadata: params.metadata,
    };

    this.paymentIntents.set(id, paymentIntent);
    console.log(`[MockStripe] Created payment intent: ${id} for $${(params.amount / 100).toFixed(2)}`);

    return paymentIntent;
  }

  /**
   * Confirm a mock payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    await this.simulateDelay(200, 500);

    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Mock Stripe: Payment intent ${paymentIntentId} not found`);
    }

    if (this.shouldFail()) {
      paymentIntent.status = 'canceled';
      throw new Error('Mock Stripe: Payment confirmation failed');
    }

    paymentIntent.status = 'succeeded';
    console.log(`[MockStripe] Confirmed payment intent: ${paymentIntentId}`);

    return paymentIntent;
  }

  /**
   * Retrieve a mock payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    await this.simulateDelay(50, 150);
    return this.paymentIntents.get(paymentIntentId) || null;
  }

  /**
   * Cancel a mock payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    await this.simulateDelay(100, 200);

    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Mock Stripe: Payment intent ${paymentIntentId} not found`);
    }

    paymentIntent.status = 'canceled';
    console.log(`[MockStripe] Canceled payment intent: ${paymentIntentId}`);

    return paymentIntent;
  }

  /**
   * Simulate webhook event
   */
  async simulateWebhookEvent(type: string, paymentIntentId: string): Promise<any> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    return {
      id: `evt_mock_${Date.now()}`,
      type,
      data: {
        object: paymentIntent || { id: paymentIntentId },
      },
    };
  }

  /**
   * Verify webhook signature (always returns true for mock)
   */
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    console.log('[MockStripe] Webhook signature verification bypassed in mock mode');
    return true;
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private shouldFail(): boolean {
    if (!this.config.simulateFailures) return false;
    const failureRate = this.config.failureRate || 0.1;
    return Math.random() < failureRate;
  }
}

// Singleton instance for use across the application
let mockStripeInstance: MockStripeService | null = null;

export function getMockStripeService(config?: MockStripeConfig): MockStripeService {
  if (!mockStripeInstance) {
    mockStripeInstance = new MockStripeService(config);
  }
  return mockStripeInstance;
}
