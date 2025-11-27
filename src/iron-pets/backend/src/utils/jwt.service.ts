/**
 * JWT Service - Token Generation and Verification
 * REQ-AUTH-002: JWT Token Management
 */

import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiry: string = '15m';
  private readonly refreshTokenExpiry: string = '30d';

  constructor(accessTokenSecret?: string) {
    this.accessTokenSecret = accessTokenSecret || process.env.JWT_SECRET || 'default-secret-change-in-production';
  }

  /**
   * Generate access token (15 minutes)
   */
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token (30 days, random string)
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Verify access token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
