/**
 * @emedicard/constants
 * 
 * Shared constants and enums for eMediCard applications
 */

// Application constants
export * from './application-constants';

// Payment constants
export * from './payment-constants';

// User constants  
export * from './user-constants';

// General constants
export * from './general-constants';

// Re-export commonly used constants
export {
  // Application constants
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  CIVIL_STATUSES,
  APPLICATION_STEPS,
  STATUS_COLORS,
} from './application-constants';

export {
  // Payment constants
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_FEES,
} from './payment-constants';

export {
  // User constants
  USER_ROLES,
  USER_ROLE_LABELS,
  LANGUAGES,
  THEMES,
  GENDERS,
} from './user-constants';

export {
  // General constants
  API_CONFIG,
  HEALTH_CARD,
  TIME_CONSTANTS,
  ERROR_CODES,
  HTTP_STATUS,
  REGEX_PATTERNS
} from './general-constants';