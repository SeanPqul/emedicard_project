/**
 * Application Constants
 * 
 * General application constants that don't fit into other categories.
 */

export const APP_CONSTANTS = {
  // Application Information
  APP_NAME: 'eMediCard',
  APP_VERSION: '1.0.0',
  
  // Date and Time Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
    TIME_ONLY: 'HH:mm',
  } as const,

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] as const,
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'] as const,
  } as const,

  // Form Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
  } as const,

  // Application States
  STATES: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
  } as const,

  // User Roles
  USER_ROLES: {
    APPLICANT: 'applicant',
    INSPECTOR: 'inspector',
    ADMIN: 'admin',
  } as const,

  // Application Types
  APPLICATION_TYPES: {
    NEW: 'New',
    RENEW: 'Renew',
  } as const,

  // Status Types
  STATUS_TYPES: {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected', // DEPRECATED - Use new statuses below
    // Phase 4 Migration: New statuses
    DOCUMENTS_NEED_REVISION: 'Documents Need Revision',
    REFERRED_FOR_MEDICAL_MANAGEMENT: 'Referred for Medical Management',
  } as const,
} as const;

export type AppConstants = typeof APP_CONSTANTS;
