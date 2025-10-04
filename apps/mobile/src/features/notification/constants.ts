// Notification feature constants

export const NOTIFICATION_TYPES = {
  MISSING_DOC: 'MissingDoc',
  PAYMENT_RECEIVED: 'PaymentReceived',
  FORM_APPROVED: 'FormApproved',
  ORIENTATION_SCHEDULED: 'OrientationScheduled',
  CARD_ISSUE: 'CardIssue',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
