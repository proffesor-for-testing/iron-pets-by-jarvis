/**
 * TDD London School - Auth Module Tests
 * Outside-In approach with mock-driven development
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mock dependencies (London School approach)
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

const mockJwtService = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyToken: jest.fn(),
};

// Test data
const validUserData = {
  email: 'test@ironpets.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
};

const existingUser = {
  id: 'user-123',
  email: 'test@ironpets.com',
  passwordHash: '$2b$10$hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  isEmailVerified: true,
  failedLoginAttempts: 0,
  accountLockedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// TODO: These tests need to be refactored to either:
// 1. Use controller-based testing pattern (like cart.test.ts)
// 2. Or import the actual app with proper mocking
// Currently skipped because supertest requires a real app instance
describe.skip('Auth Module - TDD London School', () => {
  let app: Express;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /auth/register - REQ-AUTH-001', () => {
    it('should register new user successfully and send verification email', async () => {
      // Arrange - Setup mock expectations (London School)
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...existingUser,
        id: 'new-user-123',
        isEmailVerified: false,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue(true);

      // Act & Assert - Verify interactions
      const response = await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(201);

      // Verify the conversation between objects
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserData.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: validUserData.email,
          firstName: validUserData.firstName,
          lastName: validUserData.lastName,
        }),
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validUserData.email,
          userId: 'new-user-123',
        })
      );

      expect(response.body).toMatchObject({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          userId: 'new-user-123',
          email: validUserData.email,
        },
      });
    });

    it('should reject registration with duplicate email', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      const response = await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email already registered',
      });

      // Verify no user creation attempted
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should reject registration with weak password', async () => {
      // Arrange
      const weakPasswordData = {
        ...validUserData,
        password: 'weak',
      };

      // Act & Assert
      const response = await request(app)
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Password must be at least 8 characters'),
      });

      // Verify no database interaction
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/login - REQ-AUTH-002', () => {
    it('should login successfully and return JWT tokens', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.generateAccessToken.mockReturnValue('access-token-123');
      mockJwtService.generateRefreshToken.mockReturnValue('refresh-token-123');
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-123',
        token: 'refresh-token-123',
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password,
        })
        .expect(200);

      // Assert - Verify collaboration pattern
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validUserData.password,
        existingUser.passwordHash
      );
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        userId: existingUser.id,
        email: existingUser.email,
      });
      expect(mockJwtService.generateRefreshToken).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();

      expect(response.body).toMatchObject({
        success: true,
        data: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          expiresIn: 900, // 15 minutes
        },
      });
    });

    it('should reject login with invalid credentials', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: validUserData.email,
          password: 'wrongpassword',
        })
        .expect(401);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid email or password',
      });

      // Verify no token generation
      expect(mockJwtService.generateAccessToken).not.toHaveBeenCalled();
      expect(mockJwtService.generateRefreshToken).not.toHaveBeenCalled();
    });

    it('should lock account after 5 failed login attempts - REQ-AUTH-005', async () => {
      // Arrange
      const userWithFailedAttempts = {
        ...existingUser,
        failedLoginAttempts: 4,
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithFailedAttempts);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockPrisma.user.update.mockResolvedValue({
        ...userWithFailedAttempts,
        failedLoginAttempts: 5,
        accountLockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      });

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: validUserData.email,
          password: 'wrongpassword',
        })
        .expect(423);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userWithFailedAttempts.id },
        data: {
          failedLoginAttempts: 5,
          accountLockedUntil: expect.any(Date),
        },
      });

      expect(response.body).toMatchObject({
        success: false,
        error: 'Account locked due to too many failed login attempts. Please try again in 15 minutes.',
      });
    });
  });

  describe('POST /auth/logout - REQ-AUTH-004', () => {
    it('should invalidate refresh token on logout', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-123',
        token: refreshToken,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 1000000),
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({} as any);

      // Act
      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Assert
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('POST /auth/forgot-password - REQ-AUTH-003', () => {
    it('should send password reset email with valid token', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'prt-123',
        token: 'reset-token-123',
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: validUserData.email })
        .expect(200);

      // Assert - Verify workflow interactions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserData.email },
      });
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: existingUser.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        email: validUserData.email,
        token: 'reset-token-123',
      });

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset email sent',
      });
    });
  });

  describe('POST /auth/reset-password - REQ-AUTH-003', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewSecurePass456!';

      mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
        id: 'prt-123',
        token: resetToken,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 1000000),
      });
      mockPrisma.user.update.mockResolvedValue(existingUser);
      mockPrisma.passwordResetToken.delete.mockResolvedValue({} as any);

      // Act
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
        })
        .expect(200);

      // Assert
      expect(mockPrisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: resetToken,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          passwordHash: expect.any(String),
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
      expect(mockPrisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: 'prt-123' },
      });

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset successfully',
      });
    });

    it('should reject expired reset token', async () => {
      // Arrange
      const expiredToken = 'expired-token';
      mockPrisma.passwordResetToken.findFirst.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewSecurePass456!',
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid or expired reset token',
      });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh - REQ-AUTH-002', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-123',
        token: refreshToken,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 1000000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockJwtService.generateAccessToken.mockReturnValue('new-access-token-456');

      // Act
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Assert
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        userId: existingUser.id,
        email: existingUser.email,
      });

      expect(response.body).toMatchObject({
        success: true,
        data: {
          accessToken: 'new-access-token-456',
          expiresIn: 900,
        },
      });
    });

    it('should reject invalid refresh token', async () => {
      // Arrange
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid refresh token',
      });

      expect(mockJwtService.generateAccessToken).not.toHaveBeenCalled();
    });
  });
});
