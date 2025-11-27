/**
 * Auth Module - Route Definitions
 * REQ-AUTH-001 to REQ-AUTH-005
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '../../utils/jwt.service';
import { EmailService } from '../../utils/email.service';

export const createAuthRouter = (
  prisma: PrismaClient,
  jwtService: JwtService,
  emailService: EmailService
): Router => {
  const router = Router();
  const authService = new AuthService(prisma, jwtService, emailService);
  const authController = new AuthController(authService);

  /**
   * @route   POST /auth/register
   * @desc    Register new user
   * @access  Public
   * @req     REQ-AUTH-001
   */
  router.post('/register', authController.register);

  /**
   * @route   POST /auth/login
   * @desc    Login user
   * @access  Public
   * @req     REQ-AUTH-002, REQ-AUTH-005
   */
  router.post('/login', authController.login);

  /**
   * @route   POST /auth/logout
   * @desc    Logout user (invalidate refresh token)
   * @access  Public
   * @req     REQ-AUTH-004
   */
  router.post('/logout', authController.logout);

  /**
   * @route   POST /auth/forgot-password
   * @desc    Request password reset
   * @access  Public
   * @req     REQ-AUTH-003
   */
  router.post('/forgot-password', authController.forgotPassword);

  /**
   * @route   POST /auth/reset-password
   * @desc    Reset password with token
   * @access  Public
   * @req     REQ-AUTH-003
   */
  router.post('/reset-password', authController.resetPassword);

  /**
   * @route   POST /auth/refresh
   * @desc    Refresh access token
   * @access  Public
   * @req     REQ-AUTH-002
   */
  router.post('/refresh', authController.refreshToken);

  /**
   * @route   POST /auth/verify-email
   * @desc    Verify email address
   * @access  Public
   * @req     REQ-AUTH-001
   */
  router.post('/verify-email', authController.verifyEmail);

  return router;
};
