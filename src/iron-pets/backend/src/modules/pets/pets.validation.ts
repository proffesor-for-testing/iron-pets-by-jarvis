/**
 * Pets Module Validation
 * Input validation and business rules
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const VALID_SPECIES = ['dog', 'cat', 'small_pet'];
const VALID_WEIGHT_UNITS = ['lbs', 'kg'];

/**
 * Validate create pet data
 */
export function validateCreatePet(data: any): ValidationResult {
  // Required fields
  if (!data.name || !data.species) {
    return {
      isValid: false,
      error: 'name and species are required',
    };
  }

  // Validate species enum
  if (!VALID_SPECIES.includes(data.species)) {
    return {
      isValid: false,
      error: 'Invalid species. Must be: dog, cat, or small_pet',
    };
  }

  // Validate weight if provided
  if (data.weight !== undefined) {
    if (typeof data.weight !== 'number' || data.weight <= 0) {
      return {
        isValid: false,
        error: 'Weight must be a positive number',
      };
    }
  }

  // Validate weight unit if provided
  if (data.weightUnit && !VALID_WEIGHT_UNITS.includes(data.weightUnit)) {
    return {
      isValid: false,
      error: 'Invalid weight unit. Must be: lbs or kg',
    };
  }

  // Validate birthDate if provided
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    if (isNaN(birthDate.getTime())) {
      return {
        isValid: false,
        error: 'Invalid birth date format',
      };
    }

    // Birth date cannot be in the future
    if (birthDate > new Date()) {
      return {
        isValid: false,
        error: 'Birth date cannot be in the future',
      };
    }
  }

  // Validate photo URL if provided
  if (data.photoUrl !== undefined && data.photoUrl !== null) {
    if (typeof data.photoUrl !== 'string') {
      return {
        isValid: false,
        error: 'Photo URL must be a string',
      };
    }

    // Basic URL validation
    try {
      new URL(data.photoUrl);
    } catch {
      return {
        isValid: false,
        error: 'Invalid photo URL format',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate update pet data
 */
export function validateUpdatePet(data: any): ValidationResult {
  // Cannot change species after creation
  if (data.species !== undefined) {
    return {
      isValid: false,
      error: 'Cannot change pet species after creation',
    };
  }

  // Validate weight if provided
  if (data.weight !== undefined) {
    if (typeof data.weight !== 'number' || data.weight <= 0) {
      return {
        isValid: false,
        error: 'Weight must be a positive number',
      };
    }
  }

  // Validate weight unit if provided
  if (data.weightUnit && !VALID_WEIGHT_UNITS.includes(data.weightUnit)) {
    return {
      isValid: false,
      error: 'Invalid weight unit. Must be: lbs or kg',
    };
  }

  // Validate birthDate if provided
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    if (isNaN(birthDate.getTime())) {
      return {
        isValid: false,
        error: 'Invalid birth date format',
      };
    }

    // Birth date cannot be in the future
    if (birthDate > new Date()) {
      return {
        isValid: false,
        error: 'Birth date cannot be in the future',
      };
    }
  }

  // Validate photo URL if provided
  if (data.photoUrl !== undefined && data.photoUrl !== null) {
    if (typeof data.photoUrl !== 'string') {
      return {
        isValid: false,
        error: 'Photo URL must be a string',
      };
    }

    // Basic URL validation
    try {
      new URL(data.photoUrl);
    } catch {
      return {
        isValid: false,
        error: 'Invalid photo URL format',
      };
    }
  }

  return { isValid: true };
}
