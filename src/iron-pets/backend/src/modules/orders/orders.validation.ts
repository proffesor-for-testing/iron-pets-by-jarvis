/**
 * Orders Validation Middleware
 * Validates request payloads for order operations
 *
 * @module orders.validation
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../../types/api.types';

/**
 * Validation middleware factory
 */
export function validateOrderRequest(operation: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string }> = [];

    switch (operation) {
      case 'getOrder':
      case 'cancelOrder':
      case 'reorder':
        validateOrderId(req.params.id, errors);
        break;
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Validate order ID parameter
 */
function validateOrderId(orderId: string, errors: any[]): void {
  if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
    errors.push({ field: 'id', message: 'Order ID is required' });
  }

  // Validate UUID format (basic check)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (orderId && !uuidPattern.test(orderId)) {
    errors.push({ field: 'id', message: 'Invalid order ID format' });
  }
}
