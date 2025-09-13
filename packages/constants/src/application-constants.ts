/**
 * Application Constants
 * 
 * Constants related to health card applications
 */

// ===== APPLICATION STATUS CONSTANTS =====
export const APPLICATION_STATUSES = {
  SUBMITTED: 'Submitted',
  FOR_DOCUMENT_VERIFICATION: 'For Document Verification', 
  FOR_PAYMENT_VALIDATION: 'For Payment Validation',
  FOR_ORIENTATION: 'For Orientation',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const;

export const APPLICATION_TYPES = {
  NEW: 'New',
  RENEW: 'Renew'
} as const;

export const CIVIL_STATUSES = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
  SEPARATED: 'Separated'
} as const;

// ===== APPLICATION WORKFLOW CONSTANTS =====
export const APPLICATION_STEPS = {
  APPLICATION_TYPE: 0,
  JOB_CATEGORY: 1,
  PERSONAL_DETAILS: 2,
  DOCUMENT_UPLOAD: 3,
  REVIEW: 4
} as const;

export const APPLICATION_STEP_NAMES = {
  [APPLICATION_STEPS.APPLICATION_TYPE]: 'Application Type',
  [APPLICATION_STEPS.JOB_CATEGORY]: 'Job Category',
  [APPLICATION_STEPS.PERSONAL_DETAILS]: 'Personal Details',
  [APPLICATION_STEPS.DOCUMENT_UPLOAD]: 'Document Upload',
  [APPLICATION_STEPS.REVIEW]: 'Review & Submit'
} as const;

// ===== STATUS COLOR MAPPING =====
export const STATUS_COLORS = {
  [APPLICATION_STATUSES.SUBMITTED]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [APPLICATION_STATUSES.FOR_DOCUMENT_VERIFICATION]: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  [APPLICATION_STATUSES.FOR_PAYMENT_VALIDATION]: { bg: 'bg-purple-100', text: 'text-purple-800' },
  [APPLICATION_STATUSES.FOR_ORIENTATION]: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  [APPLICATION_STATUSES.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [APPLICATION_STATUSES.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' }
} as const;

// ===== FILE UPLOAD CONSTANTS =====
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  DOCUMENT: ['.pdf', '.doc', '.docx'],
  ALL: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf', '.doc', '.docx']
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  DEFAULT: 5 * 1024 * 1024 // 5MB
} as const;

// ===== VALIDATION CONSTANTS =====
export const VALIDATION_LIMITS = {
  POSITION_MIN_LENGTH: 2,
  POSITION_MAX_LENGTH: 100,
  ORGANIZATION_MIN_LENGTH: 2,
  ORGANIZATION_MAX_LENGTH: 200,
  NOTES_MAX_LENGTH: 500,
  REFERENCE_NUMBER_MIN_LENGTH: 6,
  REFERENCE_NUMBER_MAX_LENGTH: 20
} as const;