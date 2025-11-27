/**
 * User Module Validation
 * Input validation and business rules
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate profile update data
 */
export function validateProfileUpdate(data: any): ValidationResult {
  if (data.phone !== undefined) {
    // Phone number validation (basic E.164 format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(data.phone)) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
      };
    }
  }

  if (data.firstName !== undefined && typeof data.firstName !== 'string') {
    return {
      isValid: false,
      error: 'First name must be a string',
    };
  }

  if (data.lastName !== undefined && typeof data.lastName !== 'string') {
    return {
      isValid: false,
      error: 'Last name must be a string',
    };
  }

  return { isValid: true };
}

/**
 * Validate password change data
 */
export function validatePasswordChange(data: any): ValidationResult {
  if (!data.currentPassword || !data.newPassword) {
    return {
      isValid: false,
      error: 'Current password and new password are required',
    };
  }

  if (typeof data.newPassword !== 'string' || data.newPassword.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  // Check password strength
  const hasUpperCase = /[A-Z]/.test(data.newPassword);
  const hasLowerCase = /[a-z]/.test(data.newPassword);
  const hasNumber = /[0-9]/.test(data.newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, and numbers',
    };
  }

  return { isValid: true };
}

/**
 * Validate address data
 */
export function validateAddress(data: any): ValidationResult {
  const requiredFields = [
    'type',
    'firstName',
    'lastName',
    'addressLine1',
    'city',
    'state',
    'zipCode',
    'phone',
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        isValid: false,
        error: `${field} is required`,
      };
    }
  }

  // Validate address type
  if (!['shipping', 'billing'].includes(data.type)) {
    return {
      isValid: false,
      error: 'Address type must be shipping or billing',
    };
  }

  // Validate ZIP code format (US)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(data.zipCode)) {
    return {
      isValid: false,
      error: 'Invalid ZIP code format',
    };
  }

  // Validate phone number
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(data.phone)) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }

  return { isValid: true };
}
