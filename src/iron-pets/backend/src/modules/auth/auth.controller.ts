/**
 * Auth Module - Controller Layer
 * HTTP request handlers for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  validate,
} from './auth.validation';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * REQ-AUTH-001: User Registration
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(registerSchema)(req.body);
      const result = await this.authService.register(data);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login
   * REQ-AUTH-002: User Login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(loginSchema)(req.body);
      const result = await this.authService.login(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * REQ-AUTH-004: User Logout
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(logoutSchema)(req.body);
      await this.authService.logout(data);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/forgot-password
   * REQ-AUTH-003: Forgot Password
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(forgotPasswordSchema)(req.body);
      await this.authService.forgotPassword(data);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/reset-password
   * REQ-AUTH-003: Reset Password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(resetPasswordSchema)(req.body);
      await this.authService.resetPassword(data);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   * REQ-AUTH-002: Refresh Access Token
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(refreshTokenSchema)(req.body);
      const result = await this.authService.refreshToken(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/verify-email
   * REQ-AUTH-001: Email Verification
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(verifyEmailSchema)(req.body);
      await this.authService.verifyEmail(data);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
