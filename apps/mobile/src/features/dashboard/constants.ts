// Dashboard feature constants

export const REFRESH_INTERVALS = {
  DASHBOARD_DATA: 30000, // 30 seconds
  NOTIFICATIONS: 60000, // 1 minute
  ACTIVITIES: 15000, // 15 seconds
} as const;

export const ACTIVITY_TYPES = {
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_REVIEWED: 'document_reviewed',
  HEALTH_CARD_ISSUED: 'health_card_issued',
  HEALTH_CARD_EXPIRED: 'health_card_expired',
} as const;

export const QUICK_ACTION_IDS = {
  NEW_APPLICATION: 'new_application',
  VIEW_APPLICATIONS: 'view_applications',
  VIEW_HEALTH_CARDS: 'view_health_cards',
  UPLOAD_DOCUMENTS: 'upload_documents',
  MAKE_PAYMENT: 'make_payment',
  VIEW_PROFILE: 'view_profile',
} as const;

export const DASHBOARD_ROUTES = {
  HOME: '/(tabs)/',
  APPLICATIONS: '/(tabs)/application',
  APPLY: '/(tabs)/apply',
  PROFILE: '/(tabs)/profile',
  NOTIFICATIONS: '/(tabs)/notification',
} as const;
