import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/index';
import { UnauthorizedError, ForbiddenError } from '@common/errors';

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No token provided', 'NO_TOKEN');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid token format', 'INVALID_TOKEN_FORMAT');
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      appConfig.auth.jwt.secret
    ) as JwtPayload;

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token', 'TOKEN_INVALID'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const decoded = jwt.verify(
        token,
        appConfig.auth.jwt.secret
      ) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}

/**
 * Role-based Authorization Middleware Factory
 */
export function authorize(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated', 'NOT_AUTHENTICATED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          'Insufficient permissions',
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
}

/**
 * Token Generator Utility
 */
export class TokenGenerator {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload,
      appConfig.auth.jwt.secret,
      {
        expiresIn: appConfig.auth.jwt.expiresIn,
      }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload,
      appConfig.auth.jwt.refreshSecret,
      {
        expiresIn: appConfig.auth.jwt.refreshExpiresIn,
      }
    );
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, appConfig.auth.jwt.refreshSecret) as JwtPayload;
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: TokenGenerator.generateAccessToken(payload),
      refreshToken: TokenGenerator.generateRefreshToken(payload),
    };
  }
}

/**
 * Extract user ID from request
 */
export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated', 'NOT_AUTHENTICATED');
  }
  return req.user.userId;
}

/**
 * Check if user is admin
 */
export function isAdmin(req: AuthenticatedRequest): boolean {
  return req.user?.role === 'ADMIN';
}

/**
 * Check if user owns resource
 */
export function isOwner(req: AuthenticatedRequest, ownerId: string): boolean {
  return req.user?.userId === ownerId || isAdmin(req);
}
