/**
 * JWT Service - Token Generation and Verification
 * REQ-AUTH-002: JWT Token Management
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import * as crypto from 'crypto';

interface JwtPayload {
  userId: string;
  email: string;
}

interface JwtConfig {
  secret: string;
  expiresIn?: string | number;
  refreshSecret?: string;
  refreshExpiresIn?: string | number;
}

// Convert time string to seconds
function parseTimeToSeconds(time: string | number): number {
  if (typeof time === 'number') return time;

  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;

  constructor(config?: JwtConfig | string) {
    if (typeof config === 'string') {
      // Legacy: single secret string
      this.accessTokenSecret = config;
      this.refreshTokenSecret = config;
      this.accessTokenExpiry = 900; // 15 minutes
      this.refreshTokenExpiry = 2592000; // 30 days
    } else if (config) {
      // Config object
      this.accessTokenSecret = config.secret;
      this.refreshTokenSecret = config.refreshSecret || config.secret;
      this.accessTokenExpiry = parseTimeToSeconds(config.expiresIn || '15m');
      this.refreshTokenExpiry = parseTimeToSeconds(config.refreshExpiresIn || '30d');
    } else {
      // Default (development only)
      this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.accessTokenSecret;
      this.accessTokenExpiry = 900;
      this.refreshTokenExpiry = 2592000;
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256',
    };
    return jwt.sign(payload, this.accessTokenSecret, options);
  }

  /**
   * Generate refresh token (random string stored in database)
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate JWT refresh token (alternative to random string)
   */
  generateJwtRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256',
    };
    return jwt.sign(payload, this.refreshTokenSecret, options);
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
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
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

  /**
   * Generate email verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
