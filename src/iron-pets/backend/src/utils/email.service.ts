/**
 * Email Service - Email Sending Functionality
 * REQ-AUTH-001: Email Verification
 * REQ-AUTH-003: Password Reset Email
 */

interface VerificationEmailData {
  email: string;
  userId: string;
  token: string;
  firstName: string;
}

interface PasswordResetEmailData {
  email: string;
  token: string;
  firstName: string;
}

export class EmailService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.APP_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Send email verification email
   * REQ-AUTH-001
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const verificationUrl = `${this.baseUrl}/auth/verify-email?token=${data.token}`;

    // In production, integrate with actual email service (SendGrid, AWS SES, etc.)
    console.log(`
      ===== EMAIL VERIFICATION =====
      To: ${data.email}
      Subject: Verify Your Iron Pets Account

      Hello ${data.firstName},

      Thank you for registering with Iron Pets!

      Please verify your email address by clicking the link below:
      ${verificationUrl}

      This link will expire in 24 hours.

      If you did not create this account, please ignore this email.

      Best regards,
      The Iron Pets Team
      ==============================
    `);

    // Return true to simulate successful email sending
    return true;
  }

  /**
   * Send password reset email
   * REQ-AUTH-003
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const resetUrl = `${this.baseUrl}/auth/reset-password?token=${data.token}`;

    // In production, integrate with actual email service
    console.log(`
      ===== PASSWORD RESET =====
      To: ${data.email}
      Subject: Reset Your Iron Pets Password

      Hello ${data.firstName},

      We received a request to reset your password.

      Click the link below to reset your password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you did not request a password reset, please ignore this email.
      Your password will remain unchanged.

      Best regards,
      The Iron Pets Team
      ==========================
    `);

    return true;
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    console.log(`
      ===== WELCOME EMAIL =====
      To: ${email}
      Subject: Welcome to Iron Pets!

      Hello ${firstName},

      Welcome to Iron Pets! Your account has been successfully created.

      You can now:
      - Browse our extensive pet product catalog
      - Add items to your cart
      - Track your orders
      - Manage your account

      Happy shopping!

      Best regards,
      The Iron Pets Team
      =========================
    `);

    return true;
  }
}
