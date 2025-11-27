/**
 * Error Handling Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ApiError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  error: ApiError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle known errors
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  // Map common error messages to status codes
  if (message.includes('already registered')) statusCode = 409;
  if (message.includes('Invalid email or password')) statusCode = 401;
  if (message.includes('locked')) statusCode = 423;
  if (message.includes('Invalid') || message.includes('expired')) statusCode = 400;
  if (message.includes('Invalid refresh token')) statusCode = 401;

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
