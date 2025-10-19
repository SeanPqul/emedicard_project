// Notification feature constants

export const NOTIFICATION_TYPES = {
  MISSING_DOC: 'MissingDoc',
  PAYMENT_RECEIVED: 'PaymentReceived',
  FORM_APPROVED: 'FormApproved',
  ORIENTATION_SCHEDULED: 'OrientationScheduled',
  CARD_ISSUE: 'CardIssue',
  APPLICATION_SUBMITTED: 'ApplicationSubmitted',
  DOCUMENT_APPROVED: 'DocumentApproved',
  DOCUMENT_REJECTED: 'DocumentRejection', // Backend uses 'DocumentRejection'
  PAYMENT_CONFIRMED: 'PaymentConfirmed',
  SYSTEM_MAINTENANCE: 'SystemMaintenance',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
