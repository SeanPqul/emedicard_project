/**
 * @emedicard/validation
 *
 * Shared validation schemas and form logic for eMediCard applications
 */
export * from './validators';
export * from './application-validation';
export type { ValidationResult, FormValidationResult, FieldValidationRules, } from './validators';
export type { ApplicationFormData, DocumentUploadState, ApplicationValidationOptions, PaymentFormData } from './application-validation';
export { validators, validateField, validateForm, isValidEmail, isValidPhone, isStrongPassword, isValidUrl, } from './validators';
export { validateApplicationForm, validateApplicationStep, validateDocumentUploads, validatePaymentForm, isApplicationFormComplete, getApplicationStepProgress } from './application-validation';
//# sourceMappingURL=index.d.ts.map