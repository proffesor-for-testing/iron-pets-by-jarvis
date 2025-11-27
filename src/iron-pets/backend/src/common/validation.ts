import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './errors';

/**
 * Validation target type
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation result interface
 */
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validation Helper Class
 */
export class ValidationHelper {
  /**
   * Validate data against schema
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const validated = schema.parse(data);
      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        };
      }

      return {
        success: false,
        errors: [{ path: 'unknown', message: 'Validation failed' }],
      };
    }
  }

  /**
   * Format Zod errors for API response
   */
  static formatErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(err.message);
    });

    return formatted;
  }
}

/**
 * Express middleware factory for request validation
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated data
      (req as any)[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = ValidationHelper.formatErrors(error);
        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  /**
   * UUID validation
   */
  uuid: z.string().uuid({ message: 'Invalid UUID format' }),

  /**
   * Email validation
   */
  email: z.string().email({ message: 'Invalid email format' }),

  /**
   * Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  /**
   * Positive integer validation
   */
  positiveInt: z.number().int().positive(),

  /**
   * Pagination query parameters
   */
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),

  /**
   * Date range validation
   */
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    { message: 'Start date must be before end date' }
  ),

  /**
   * Phone number validation (basic)
   */
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  /**
   * URL validation
   */
  url: z.string().url({ message: 'Invalid URL format' }),

  /**
   * Monetary amount validation (2 decimal places)
   */
  money: z.number().positive().multipleOf(0.01),
};

/**
 * Validation error formatter for client responses
 */
export function formatValidationErrors(
  error: ZodError
): Array<{ field: string; message: string }> {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Sanitization helpers
 */
export const Sanitize = {
  /**
   * Trim and normalize whitespace
   */
  string: (value: string): string => value.trim().replace(/\s+/g, ' '),

  /**
   * Convert to lowercase
   */
  lowercase: (value: string): string => value.toLowerCase().trim(),

  /**
   * Convert to uppercase
   */
  uppercase: (value: string): string => value.toUpperCase().trim(),

  /**
   * Remove HTML tags
   */
  stripHtml: (value: string): string => value.replace(/<[^>]*>/g, ''),

  /**
   * Normalize email
   */
  email: (value: string): string => value.toLowerCase().trim(),
};
