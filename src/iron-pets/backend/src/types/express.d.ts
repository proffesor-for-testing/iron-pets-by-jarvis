/**
 * Express type extensions
 * Extends Express Request to include user property from JWT auth
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;         // User ID (alias for userId for backwards compat)
        userId: string;     // User ID from JWT
        email: string;
        role?: string;
        iat?: number;
        exp?: number;
      };
      sessionId?: string;
    }
  }
}

export {};
