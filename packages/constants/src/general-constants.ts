/**
 * General Constants
 * 
 * General application constants and configuration
 */

// ===== API CONSTANTS =====
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

// ===== HEALTH CARD CONSTANTS =====
export const HEALTH_CARD = {
  VALIDITY_PERIOD_YEARS: 1,
  QR_CODE_SIZE: 200,
  CARD_DIMENSIONS: {
    WIDTH: 85.6, // mm (standard credit card size)
    HEIGHT: 53.98, // mm
    DPI: 300
  },
  STATUSES: {
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    SUSPENDED: 'Suspended',
    REVOKED: 'Revoked'
  }
} as const;

// ===== TIME CONSTANTS =====
export const TIME_CONSTANTS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;

// ===== NOTIFICATION TYPES =====
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

// ===== ERROR CODES =====
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// ===== REGEX PATTERNS =====
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PH: /^(\+63|0)9\d{9}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[A-Za-z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d*\.?\d+$/
} as const;

// ===== ENVIRONMENT CONSTANTS =====
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
} as const;

// ===== CACHE KEYS =====
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  APPLICATIONS: 'applications',
  HEALTH_CARDS: 'health_cards',
  JOB_CATEGORIES: 'job_categories',
  DOCUMENT_REQUIREMENTS: 'document_requirements',
  PAYMENTS: 'payments'
} as const;

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  THEME: 'emedicard_theme',
  LANGUAGE: 'emedicard_language',
  USER_PREFERENCES: 'emedicard_user_preferences',
  FORM_DRAFT: 'emedicard_form_draft',
  AUTH_TOKEN: 'emedicard_auth_token',
  LAST_VISITED: 'emedicard_last_visited'
} as const;

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MMM YYYY'
} as const;

// ===== ANIMATION DURATIONS =====
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;