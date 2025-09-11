/**
 * Validation Utilities
 * 
 * Platform-agnostic form validation functions
 */

import { ApplicationType, CivilStatus } from '@emedicard/types';

// ===== VALIDATION RESULT TYPES =====
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormValidationResult<T = any> {
  isValid: boolean;
  errors: Partial<T>;
}

export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  type?: 'email' | 'phone' | 'password' | 'url' | 'number';
  pattern?: RegExp;
  min?: number;
  max?: number;
}

// ===== BASE VALIDATORS =====
export const validators = {
  required: (value: any): ValidationResult => {
    const isValid = value !== null && value !== undefined && String(value).trim() !== '';
    return isValid ? { valid: true } : { valid: false, error: 'This field is required' };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid email address' };
  },

  phone: (value: string): ValidationResult => {
    // Philippine phone number format
    const phoneRegex = /^(\+63|0)9\d{9}$/;
    const cleanValue = value.replace(/\s|-|\(|\)/g, ''); // Remove spaces, dashes, parentheses
    const isValid = phoneRegex.test(cleanValue);
    return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid Philippine phone number' };
  },

  password: (value: string): ValidationResult => {
    const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
    return isValid ? { 
      valid: true 
    } : { 
      valid: false, 
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
    };
  },

  url: (value: string): ValidationResult => {
    try {
      // Basic URL validation without relying on browser URL constructor
      const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      const isValid = urlPattern.test(value);
      return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid URL' };
    } catch {
      return { valid: false, error: 'Please enter a valid URL' };
    }
  },

  number: (value: any): ValidationResult => {
    const num = Number(value);
    const isValid = !isNaN(num) && isFinite(num);
    return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid number' };
  },

  minLength: (min: number) => (value: string): ValidationResult => {
    const isValid = value && value.length >= min;
    return isValid ? { valid: true } : { valid: false, error: `Must be at least ${min} characters long` };
  },

  maxLength: (max: number) => (value: string): ValidationResult => {
    const isValid = !value || value.length <= max;
    return isValid ? { valid: true } : { valid: false, error: `Must be no more than ${max} characters long` };
  },

  min: (minValue: number) => (value: any): ValidationResult => {
    const num = Number(value);
    const isValid = !isNaN(num) && num >= minValue;
    return isValid ? { valid: true } : { valid: false, error: `Must be at least ${minValue}` };
  },

  max: (maxValue: number) => (value: any): ValidationResult => {
    const num = Number(value);
    const isValid = !isNaN(num) && num <= maxValue;
    return isValid ? { valid: true } : { valid: false, error: `Must be no more than ${maxValue}` };
  },

  pattern: (regex: RegExp, errorMessage: string) => (value: string): ValidationResult => {
    const isValid = !value || regex.test(value);
    return isValid ? { valid: true } : { valid: false, error: errorMessage };
  }
};

// ===== FIELD VALIDATION =====
export const validateField = (value: any, rules: FieldValidationRules): ValidationResult => {
  // Check required first
  if (rules.required) {
    const result = validators.required(value);
    if (!result.valid) return result;
  }

  // If value is empty and not required, it's valid
  if (!value || String(value).trim() === '') {
    return { valid: true };
  }

  // Check length constraints
  if (rules.minLength) {
    const result = validators.minLength(rules.minLength)(value);
    if (!result.valid) return result;
  }

  if (rules.maxLength) {
    const result = validators.maxLength(rules.maxLength)(value);
    if (!result.valid) return result;
  }

  // Check numeric constraints
  if (rules.min !== undefined) {
    const result = validators.min(rules.min)(value);
    if (!result.valid) return result;
  }

  if (rules.max !== undefined) {
    const result = validators.max(rules.max)(value);
    if (!result.valid) return result;
  }

  // Check type-specific validation
  if (rules.type === 'email') {
    return validators.email(value);
  }

  if (rules.type === 'phone') {
    return validators.phone(value);
  }

  if (rules.type === 'password') {
    return validators.password(value);
  }

  if (rules.type === 'url') {
    return validators.url(value);
  }

  if (rules.type === 'number') {
    return validators.number(value);
  }

  // Check pattern matching
  if (rules.pattern) {
    return validators.pattern(rules.pattern, 'Please enter a valid format')(value);
  }

  return { valid: true };
};

// ===== FORM VALIDATION =====
export const validateForm = <T extends Record<string, any>>(
  formData: T, 
  rules: Record<keyof T, FieldValidationRules>
): FormValidationResult<T> => {
  const errors: Partial<T> = {};
  
  Object.entries(rules).forEach(([fieldName, validation]) => {
    const result = validateField(formData[fieldName as keyof T], validation);
    if (!result.valid && result.error) {
      errors[fieldName as keyof T] = result.error as any;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== UTILITY VALIDATORS =====
export const isValidEmail = (email: string): boolean => {
  return validators.email(email).valid;
};

export const isValidPhone = (phone: string): boolean => {
  return validators.phone(phone).valid;
};

export const isStrongPassword = (password: string): boolean => {
  return validators.password(password).valid;
};

export const isValidUrl = (url: string): boolean => {
  return validators.url(url).valid;
};