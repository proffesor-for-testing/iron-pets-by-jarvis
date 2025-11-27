/**
 * Auth Module - Service Layer
 * Business logic for authentication operations
 * REQ-AUTH-001 to REQ-AUTH-005
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  RefreshTokenDTO,
  VerifyEmailDTO,
} from './auth.validation';
import { JwtService } from '../../utils/jwt.service';
import { EmailService } from '../../utils/email.service';

export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
  private readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
  private readonly RESET_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  /**
   * REQ-AUTH-001: User Registration with Email Verification
   */
  async register(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        failedLoginAttempts: 0,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail({
      email: user.email,
      userId: user.id,
      token: verificationToken,
      firstName: user.firstName,
    });

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * REQ-AUTH-002: User Login with JWT
   * REQ-AUTH-005: Account Lockout
   */
  async login(data: LoginDTO) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.accountLockedUntil.getTime() - Date.now()) / 60000
      );
      throw new Error(
        `Account locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = {
        failedLoginAttempts: newFailedAttempts,
      };

      // Lock account if max attempts reached
      if (newFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        updateData.accountLockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (newFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        throw new Error(
          'Account locked due to too many failed login attempts. Please try again in 15 minutes.'
        );
      }

      throw new Error('Invalid email or password');
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.generateRefreshToken();

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * REQ-AUTH-004: Logout (Invalidate Refresh Token)
   */
  async logout(data: RefreshTokenDTO) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Delete refresh token
    await this.prisma.refreshToken.delete({
      where: { token: data.refreshToken },
    });

    return { success: true };
  }

  /**
   * REQ-AUTH-003: Forgot Password (Send Reset Email)
   */
  async forgotPassword(data: ForgotPasswordDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return { success: true };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY * 1000);

    // Store reset token
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      token: resetToken,
      firstName: user.firstName,
    });

    return { success: true };
  }

  /**
   * REQ-AUTH-003: Reset Password with Token
   */
  async resetPassword(data: ResetPasswordDTO) {
    // Find valid reset token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: data.token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

    // Update user password and reset failed attempts
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // Delete used reset token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  }

  /**
   * REQ-AUTH-002: Refresh Access Token
   */
  async refreshToken(data: RefreshTokenDTO) {
    // Find refresh token
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: { token: data.refreshToken },
      });
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const accessToken = this.jwtService.generateAccessToken({
      userId: refreshToken.user.id,
      email: refreshToken.user.email,
    });

    return {
      accessToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }

  /**
   * REQ-AUTH-001: Verify Email
   */
  async verifyEmail(data: VerifyEmailDTO) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: data.token,
        emailVerificationExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { success: true };
  }
}
