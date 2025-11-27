/**
 * Mock Email Service
 * Logs emails to console instead of sending them
 * For development and testing environments
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId: string;
  timestamp: Date;
}

export class MockEmailService {
  private sentEmails: EmailResult[] = [];
  private fromEmail: string;

  constructor(fromEmail: string = 'noreply@ironpets.local') {
    this.fromEmail = fromEmail;
    console.log('[MockEmail] Mock email service initialized');
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, userId: string, token: string, firstName: string): Promise<EmailResult> {
    const verificationUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

    return this.logEmail({
      to: email,
      subject: 'Verify Your Iron Pets Account',
      html: `
        <h1>Welcome to Iron Pets, ${firstName}!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
        <p>User ID: ${userId}</p>
      `,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<EmailResult> {
    const resetUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    return this.logEmail({
      to: email,
      subject: 'Reset Your Iron Pets Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${firstName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<EmailResult> {
    return this.logEmail({
      to: email,
      subject: 'Welcome to Iron Pets!',
      html: `
        <h1>Welcome to Iron Pets, ${firstName}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Start shopping for your furry friends today!</p>
      `,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    email: string,
    orderNumber: string,
    total: number,
    items: Array<{ name: string; quantity: number; price: number }>
  ): Promise<EmailResult> {
    const itemsList = items
      .map(item => `<li>${item.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>`)
      .join('');

    return this.logEmail({
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <h2>Items:</h2>
        <ul>${itemsList}</ul>
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      `,
    });
  }

  /**
   * Send shipping notification email
   */
  async sendShippingNotificationEmail(
    email: string,
    orderNumber: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<EmailResult> {
    return this.logEmail({
      to: email,
      subject: `Your Order ${orderNumber} Has Shipped!`,
      html: `
        <h1>Your Order Has Shipped!</h1>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        ${trackingUrl ? `<p><a href="${trackingUrl}">Track Your Package</a></p>` : ''}
      `,
    });
  }

  /**
   * Generic email sending (logs to console)
   */
  private async logEmail(options: EmailOptions): Promise<EmailResult> {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('\n' + '='.repeat(60));
    console.log('[MockEmail] EMAIL SENT (Development Mode)');
    console.log('='.repeat(60));
    console.log(`Message ID: ${messageId}`);
    console.log(`From: ${options.from || this.fromEmail}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('-'.repeat(60));
    if (options.text) {
      console.log('Text Content:');
      console.log(options.text);
    }
    if (options.html) {
      // Strip HTML tags for console output
      const textContent = options.html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('Content (HTML stripped):');
      console.log(textContent);
    }
    console.log('='.repeat(60) + '\n');

    const result: EmailResult = {
      success: true,
      messageId,
      timestamp: new Date(),
    };

    this.sentEmails.push(result);
    return result;
  }

  /**
   * Get sent emails (useful for testing)
   */
  getSentEmails(): EmailResult[] {
    return [...this.sentEmails];
  }

  /**
   * Clear sent emails (useful for testing)
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

// Singleton instance
let mockEmailInstance: MockEmailService | null = null;

export function getMockEmailService(fromEmail?: string): MockEmailService {
  if (!mockEmailInstance) {
    mockEmailInstance = new MockEmailService(fromEmail);
  }
  return mockEmailInstance;
}
