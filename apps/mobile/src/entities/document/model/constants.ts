import { DocumentStatus, RejectionCategory } from './rejection-types';
import { theme } from '@shared/styles/theme';

/**
 * Document status colors
 */
export const DocumentStatusColors: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: theme.colors.gray[400],
  [DocumentStatus.APPROVED]: theme.colors.accent.safetyGreen,
  [DocumentStatus.REJECTED]: theme.colors.semantic.error,
  [DocumentStatus.RESUBMITTED]: theme.colors.accent.warningOrange,
};

/**
 * Document status icons
 */
export const DocumentStatusIcons: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: 'clock-outline',
  [DocumentStatus.APPROVED]: 'checkmark-circle',
  [DocumentStatus.REJECTED]: 'close-circle',
  [DocumentStatus.RESUBMITTED]: 'refresh-circle',
};

/**
 * Rejection category icons
 */
export const RejectionCategoryIcons: Record<RejectionCategory, string> = {
  [RejectionCategory.QUALITY_ISSUE]: 'image-off-outline',
  [RejectionCategory.WRONG_DOCUMENT]: 'document-text-outline',
  [RejectionCategory.EXPIRED_DOCUMENT]: 'calendar-clear-outline',
  [RejectionCategory.INCOMPLETE_DOCUMENT]: 'document-outline',
  [RejectionCategory.INVALID_DOCUMENT]: 'shield-off-outline',
  [RejectionCategory.FORMAT_ISSUE]: 'file-tray-full-outline',
  [RejectionCategory.OTHER]: 'information-circle-outline',
};

/**
 * Rejection category colors
 */
export const RejectionCategoryColors: Record<RejectionCategory, string> = {
  [RejectionCategory.QUALITY_ISSUE]: theme.colors.accent.warningOrange,
  [RejectionCategory.WRONG_DOCUMENT]: theme.colors.semantic.error,
  [RejectionCategory.EXPIRED_DOCUMENT]: theme.colors.semantic.error,
  [RejectionCategory.INCOMPLETE_DOCUMENT]: theme.colors.accent.warningOrange,
  [RejectionCategory.INVALID_DOCUMENT]: theme.colors.semantic.error,
  [RejectionCategory.FORMAT_ISSUE]: theme.colors.accent.warningOrange,
  [RejectionCategory.OTHER]: theme.colors.gray[400],
};

/**
 * File size limits
 */
export const FILE_SIZE_LIMITS = {
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  PDF_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_IMAGE_WIDTH: 800,
  MIN_IMAGE_HEIGHT: 600,
};

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  documents: ['application/pdf'],
  all: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
};

/**
 * File type extensions
 */
export const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

/**
 * Rejection attempt limits
 */
export const REJECTION_LIMITS = {
  MAX_ATTEMPTS: 5,
  WARNING_ATTEMPTS: 3,
};

/**
 * Document upload states
 */
export const UPLOAD_STATES = {
  IDLE: 'idle',
  SELECTING: 'selecting',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * Document notification types
 */
export const DOCUMENT_NOTIFICATION_TYPES = {
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_RESUBMIT_REMINDER: 'document_resubmit_reminder',
  ALL_DOCUMENTS_APPROVED: 'all_documents_approved',
} as const;

/**
 * Common rejection messages
 */
export const COMMON_REJECTION_MESSAGES = {
  [RejectionCategory.QUALITY_ISSUE]: [
    'Image is too blurry to read clearly',
    'Document is too dark or poorly lit',
    'Text is not legible',
    'Image resolution is too low',
    'Document appears to be damaged',
  ],
  [RejectionCategory.WRONG_DOCUMENT]: [
    'This is not the correct document type',
    'Wrong document uploaded',
    'Document does not match requirements',
    'Please upload the specified document type',
  ],
  [RejectionCategory.EXPIRED_DOCUMENT]: [
    'Document has expired',
    'Document validity date has passed',
    'Please provide a current/valid document',
    'Document expiration date is not acceptable',
  ],
  [RejectionCategory.INCOMPLETE_DOCUMENT]: [
    'Document is missing required pages',
    'Some sections are not filled out',
    'Document is incomplete',
    'Missing required information',
    'Additional pages needed',
  ],
  [RejectionCategory.INVALID_DOCUMENT]: [
    'Document appears to be invalid',
    'Unable to verify document authenticity',
    'Document format is not recognized',
    'Document does not meet requirements',
  ],
  [RejectionCategory.FORMAT_ISSUE]: [
    'File format is not supported',
    'File size exceeds limit',
    'Unable to open or process file',
    'Please upload in correct format',
  ],
  [RejectionCategory.OTHER]: [
    'Document does not meet requirements',
    'Please contact support for assistance',
    'Additional information needed',
  ],
};
