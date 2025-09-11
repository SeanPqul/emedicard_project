/**
 * Enterprise-Lite TypeScript Utility Types
 * 
 * Focused utility types for healthcare app safety without unnecessary complexity
 */

// ===== BRANDED TYPES FOR HEALTHCARE SAFETY =====

/**
 * Creates branded types for IDs and sensitive data to prevent mixups
 */
export type Brand<T, B> = T & { readonly __brand: B };

// Healthcare-specific branded types
export type UserId = Brand<string, 'UserId'>;
export type ApplicationId = Brand<string, 'ApplicationId'>;
export type FormId = Brand<string, 'FormId'>; // Keep for backward compatibility
export type PaymentId = Brand<string, 'PaymentId'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type VerificationToken = Brand<string, 'VerificationToken'>;

// Brand creation helpers
export const createUserId = (id: string): UserId => id as UserId;
export const createApplicationId = (id: string): ApplicationId => id as ApplicationId;
export const createFormId = (id: string): FormId => id as FormId; // Keep for backward compatibility
export const createPaymentId = (id: string): PaymentId => id as PaymentId;
export const createEmailAddress = (email: string): EmailAddress => email as EmailAddress;
export const createPhoneNumber = (phone: string): PhoneNumber => phone as PhoneNumber;
export const createVerificationToken = (token: string): VerificationToken => token as VerificationToken;

// ===== DISCRIMINATED UNIONS FOR SAFE STATE MANAGEMENT =====

/**
 * Application status with discriminated union for type-safe status handling
 */
export type ApplicationStatusData = 
  | { status: 'Submitted'; submittedAt: number; }
  | { status: 'Under Review'; reviewStartedAt: number; reviewerId: string; }
  | { status: 'Approved'; approvedAt: number; approvedBy: string; }
  | { status: 'Rejected'; rejectedAt: number; rejectedBy: string; reason: string; };

/**
 * Payment status with discriminated union for safe payment handling
 */
export type PaymentStatusData =
  | { status: 'Pending'; createdAt: number; }
  | { status: 'Complete'; completedAt: number; transactionId: string; }
  | { status: 'Failed'; failedAt: number; errorCode: string; errorMessage: string; };

/**
 * Document upload status for file management
 */
export type DocumentUploadStatus =
  | { status: 'uploading'; progress: number; }
  | { status: 'uploaded'; url: string; uploadedAt: number; }
  | { status: 'failed'; error: string; retryCount: number; };

// ===== API RESPONSE TYPES FOR SAFE BACKEND COMMUNICATION =====

/**
 * Generic API response wrapper for consistent error handling
 */
export type ApiResponse<TData = unknown, TError = string> = 
  | { success: true; data: TData; error?: never; }
  | { success: false; data?: never; error: TError; };

/**
 * API mutation result type for form submissions and actions
 */
export type MutationResult<TData, TError = string> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TData }
  | { status: 'error'; error: TError };

// ===== FORM VALIDATION TYPES FOR HEALTHCARE FORMS =====

/**
 * Form field validation result
 */
export type ValidationResult = 
  | { valid: true; error?: never; }
  | { valid: false; error: string; };

/**
 * Form state for each field
 */
export interface FormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

// ===== BASIC TYPE GUARDS FOR RUNTIME SAFETY =====

/**
 * Essential type guard functions for runtime type checking
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

export const isNonNull = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

// ===== COMMON UTILITY TYPES =====

/**
 * Common type combinations for convenience
 */
export type Nullish = null | undefined;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

/**
 * React component types
 */
export type WithChildren<T = {}> = T & { children?: React.ReactNode };

/**
 * Note: Built-in TypeScript utility types (Partial, Required, Readonly, Record, 
 * Pick, Omit, Exclude, Extract, NonNullable) are globally available and don't 
 * need to be re-exported.
 */