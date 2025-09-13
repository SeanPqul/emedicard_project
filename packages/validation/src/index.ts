/**
 * @emedicard/validation
 * 
 * Shared validation schemas and form logic for eMediCard applications
 */

// Core validation utilities
export * from './validators';

// Application-specific validation
export * from './application-validation';

// Re-export commonly used functions and types
export type {
  ValidationResult,
  FormValidationResult,
  FieldValidationRules,
} from './validators';

export type {
  ApplicationFormData,
  DocumentUploadState,
  ApplicationValidationOptions,
  PaymentFormData
} from './application-validation';

export {
  // Core validators
  validators,
  validateField,
  validateForm,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isValidUrl,
} from './validators';

export {
  // Application validation
  validateApplicationForm,
  validateApplicationStep,
  validateDocumentUploads,
  validatePaymentForm,
  isApplicationFormComplete,
  getApplicationStepProgress
} from './application-validation';