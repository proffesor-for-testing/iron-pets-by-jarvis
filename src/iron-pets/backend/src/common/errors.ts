/**
 * Base Application Error
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code?: string, details?: unknown) {
    super(message, 400, true, code, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, true, code);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 - Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, true, code);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', code?: string) {
    super(`${resource} not found`, 404, true, code);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', code?: string, details?: unknown) {
    super(message, 409, true, code, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 - Unprocessable Entity (Validation Error)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown, code?: string) {
    super(message, 422, true, code, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 - Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, true, code);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string, details?: unknown) {
    super(message, 500, true, code, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 503 - Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', code?: string) {
    super(message, 503, true, code);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: unknown) {
    super(message, 500, true, 'DATABASE_ERROR', details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Payment Error
 */
export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed', code?: string, details?: unknown) {
    super(message, 402, true, code, details);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: unknown) {
    super(
      message || `External service ${service} failed`,
      503,
      true,
      'EXTERNAL_SERVICE_ERROR',
      details
    );
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Error factory for common scenarios
 */
export const ErrorFactory = {
  invalidCredentials: () =>
    new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS'),

  tokenExpired: () =>
    new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'),

  tokenInvalid: () =>
    new UnauthorizedError('Invalid token', 'TOKEN_INVALID'),

  emailAlreadyExists: () =>
    new ConflictError('Email already exists', 'EMAIL_EXISTS'),

  userNotFound: () =>
    new NotFoundError('User', 'USER_NOT_FOUND'),

  productNotFound: () =>
    new NotFoundError('Product', 'PRODUCT_NOT_FOUND'),

  orderNotFound: () =>
    new NotFoundError('Order', 'ORDER_NOT_FOUND'),

  insufficientStock: (productName: string, available: number) =>
    new BadRequestError(
      `Insufficient stock for ${productName}`,
      'INSUFFICIENT_STOCK',
      { available }
    ),

  invalidPaymentMethod: () =>
    new BadRequestError('Invalid payment method', 'INVALID_PAYMENT_METHOD'),

  paymentFailed: (reason?: string) =>
    new PaymentError(reason || 'Payment processing failed', 'PAYMENT_FAILED'),
};
