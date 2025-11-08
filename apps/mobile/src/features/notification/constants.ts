// Notification feature constants

export const NOTIFICATION_TYPES = {
  MISSING_DOC: 'MissingDoc',
  PAYMENT_RECEIVED: 'PaymentReceived',
  FORM_APPROVED: 'FormApproved',
  ORIENTATION_SCHEDULED: 'OrientationScheduled',
  CARD_ISSUE: 'CardIssue',
  APPLICATION_SUBMITTED: 'ApplicationSubmitted',
  DOCUMENT_APPROVED: 'DocumentApproved',
  DOCUMENT_REJECTED: 'DocumentRejection', // DEPRECATED - Legacy rejection
  PAYMENT_CONFIRMED: 'PaymentConfirmed',
  SYSTEM_MAINTENANCE: 'SystemMaintenance',
  
  // NEW - Proper medical terminology (Phase 4 Migration)
  DOCUMENT_REFERRED_MEDICAL: 'DocumentReferredMedical', // Medical finding requiring consultation
  DOCUMENT_ISSUE_FLAGGED: 'DocumentIssueFlagged', // Non-medical document issue
  MEDICAL_REFERRAL_RESUBMISSION: 'MedicalReferralResubmission', // After doctor consultation
  DOCUMENT_RESUBMISSION: 'DocumentResubmission', // After fixing document issues
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
