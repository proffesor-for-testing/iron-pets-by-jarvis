import { Request, Response, NextFunction } from 'express';
import { AppError } from '@common/errors';
import { appConfig } from '@config/index';
import { Prisma } from '@prisma/client';

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them for API response
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: appConfig.app.isDevelopment ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle known application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || 'ERROR',
        message: error.message,
        details: appConfig.app.isDevelopment ? error.details : undefined,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    res.status(prismaError.statusCode).json({
      success: false,
      error: {
        code: prismaError.code,
        message: prismaError.message,
        details: appConfig.app.isDevelopment ? error.meta : undefined,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
        details: appConfig.app.isDevelopment ? error.message : undefined,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle JWT errors (if not already handled by auth middleware)
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: appConfig.app.isDevelopment
        ? error.message
        : 'An unexpected error occurred',
      details: appConfig.app.isDevelopment
        ? { stack: error.stack }
        : undefined,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  code: string;
  message: string;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
        message: `A record with this ${field} already exists`,
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Record not found',
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Referenced record does not exist',
      };

    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        code: 'REQUIRED_RELATION',
        message: 'Required relation is missing',
      };

    case 'P2000':
      // Value too long
      return {
        statusCode: 400,
        code: 'VALUE_TOO_LONG',
        message: 'Value too long for field',
      };

    case 'P2001':
      // Record not found in where condition
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Record not found',
      };

    default:
      return {
        statusCode: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      };
  }
}

/**
 * 404 Not Found Handler
 * Must be added after all routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Async handler wrapper
 * Catches async errors and passes them to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
