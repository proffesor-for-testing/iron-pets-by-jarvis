/**
 * Checkout Validation Middleware
 * Validates request payloads for checkout operations
 *
 * @module checkout.validation
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../../types/api.types';

/**
 * Validation middleware factory
 */
export function validateCheckoutRequest(operation: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string }> = [];

    switch (operation) {
      case 'shippingRates':
        validateShippingRatesRequest(req.body, errors);
        break;
      case 'validate':
        validateCheckoutValidationRequest(req.body, errors);
        break;
      case 'applyPromo':
        validateApplyPromoRequest(req.body, errors);
        break;
      case 'createPayment':
        validateCreatePaymentRequest(req.body, errors);
        break;
      case 'confirmOrder':
        validateConfirmOrderRequest(req.body, errors);
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

function validateShippingRatesRequest(body: any, errors: any[]): void {
  if (!body.address) {
    errors.push({ field: 'address', message: 'Address is required' });
    return;
  }
  validateAddress(body.address, errors, 'address');
}

function validateCheckoutValidationRequest(body: any, errors: any[]): void {
  if (!body.shippingAddress) {
    errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
    return;
  }
  validateAddress(body.shippingAddress, errors, 'shippingAddress');
}

function validateApplyPromoRequest(body: any, errors: any[]): void {
  if (!body.code || typeof body.code !== 'string') {
    errors.push({ field: 'code', message: 'Promo code is required' });
  }
}

function validateCreatePaymentRequest(body: any, errors: any[]): void {
  if (!body.shippingAddress) {
    errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
  } else {
    validateAddress(body.shippingAddress, errors, 'shippingAddress');
  }

  if (!body.shippingMethodId) {
    errors.push({ field: 'shippingMethodId', message: 'Shipping method is required' });
  } else if (!['standard', 'expedited'].includes(body.shippingMethodId)) {
    errors.push({ field: 'shippingMethodId', message: 'Invalid shipping method' });
  }
}

function validateConfirmOrderRequest(body: any, errors: any[]): void {
  if (!body.paymentIntentId || typeof body.paymentIntentId !== 'string') {
    errors.push({ field: 'paymentIntentId', message: 'Payment intent ID is required' });
  }

  if (!body.shippingAddress) {
    errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
  } else {
    validateAddress(body.shippingAddress, errors, 'shippingAddress');
  }

  if (!body.shippingMethodId) {
    errors.push({ field: 'shippingMethodId', message: 'Shipping method is required' });
  } else if (!['standard', 'expedited'].includes(body.shippingMethodId)) {
    errors.push({ field: 'shippingMethodId', message: 'Invalid shipping method' });
  }
}

function validateAddress(address: any, errors: any[], fieldPrefix: string): void {
  const requiredFields = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'zipCode', 'phone'];

  for (const field of requiredFields) {
    if (!address[field] || typeof address[field] !== 'string' || !address[field].trim()) {
      errors.push({
        field: `${fieldPrefix}.${field}`,
        message: `${field} is required`
      });
    }
  }

  // Validate ZIP code format (US: 12345 or 12345-6789)
  if (address.zipCode && !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.push({
      field: `${fieldPrefix}.zipCode`,
      message: 'Invalid ZIP code format'
    });
  }
}
