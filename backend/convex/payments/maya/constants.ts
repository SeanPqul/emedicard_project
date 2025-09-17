/**
 * Maya Payment Gateway Constants
 * Defines API endpoints, configuration values, and status codes
 */

// API Endpoints
export const MAYA_ENDPOINTS = {
  // Checkout endpoints
  CHECKOUT_CREATE: '/checkout/v1/checkouts',
  CHECKOUT_GET: '/checkout/v1/checkouts/:checkoutId',
  
  // Payment endpoints
  PAYMENT_GET: '/payments/v1/payments/:paymentId',
  PAYMENT_VOID: '/payments/v1/payments/:paymentId/voids',
  PAYMENT_REFUND: '/payments/v1/payments/:paymentId/refunds',
  
  // Webhook endpoints
  WEBHOOK_REGISTER: '/checkout/v1/webhooks',
  WEBHOOK_DELETE: '/checkout/v1/webhooks/:webhookId',
  WEBHOOK_GET: '/checkout/v1/webhooks/:webhookId',
} as const;

// Payment statuses
export const MAYA_PAYMENT_STATUS = {
  // Checkout statuses
  CREATED: 'CREATED',
  PROCESSING: 'PROCESSING',
  EXPIRED: 'EXPIRED',
  
  // Payment statuses
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  
  // Transaction statuses
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  VOIDED: 'VOIDED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

// Error codes from Maya
export const MAYA_ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_METHOD_NOT_ALLOWED: 'PAYMENT_METHOD_NOT_ALLOWED',
  EXPIRED_CHECKOUT: 'EXPIRED_CHECKOUT',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Default configuration values
export const MAYA_DEFAULTS = {
  CURRENCY: 'PHP',
  CHECKOUT_EXPIRY_MINUTES: 60,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
} as const;

// Webhook events
export const MAYA_WEBHOOK_EVENTS = {
  CHECKOUT_SUCCESS: 'CHECKOUT_SUCCESS',
  CHECKOUT_FAILURE: 'CHECKOUT_FAILURE',
  CHECKOUT_DROPOUT: 'CHECKOUT_DROPOUT',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURE: 'CAPTURE',
  VOID: 'VOID',
  REFUND: 'REFUND',
} as const;

// Payment schemes
export const MAYA_PAYMENT_SCHEMES = {
  MAYA: 'maya',
  GCASH: 'gcash',
  GRABPAY: 'grab_pay',
  CARD: 'card',
  DIRECT_DEBIT: 'direct_debit',
  QR_PH: 'qr_ph',
} as const;

// Regular expressions for validation
export const MAYA_REGEX = {
  // Philippine mobile number format
  PH_MOBILE: /^(\+63|0)9\d{9}$/,
  // Email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Reference number format (alphanumeric with hyphens)
  REFERENCE_NUMBER: /^[A-Za-z0-9-]+$/,
} as const;

// Response headers
export const MAYA_HEADERS = {
  SIGNATURE: 'Maya-Signature',
  REQUEST_ID: 'Request-Reference-No',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const;

// Status code mappings for our system
export const PAYMENT_STATUS_MAP = {
  [MAYA_PAYMENT_STATUS.CREATED]: 'Pending',
  [MAYA_PAYMENT_STATUS.PROCESSING]: 'Processing',
  [MAYA_PAYMENT_STATUS.PAYMENT_SUCCESS]: 'Complete',
  [MAYA_PAYMENT_STATUS.PAYMENT_FAILED]: 'Failed',
  [MAYA_PAYMENT_STATUS.PAYMENT_CANCELLED]: 'Cancelled',
  [MAYA_PAYMENT_STATUS.PAYMENT_EXPIRED]: 'Expired',
  [MAYA_PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [MAYA_PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Refunded',
} as const;

// Metadata keys
export const MAYA_METADATA_KEYS = {
  APPLICATION_ID: 'applicationId',
  USER_ID: 'userId',
  PAYMENT_TYPE: 'paymentType',
  ENVIRONMENT: 'environment',
} as const;
