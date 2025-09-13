/**
 * @emedicard/utils
 * 
 * Shared utility functions for eMediCard applications
 */

// User utilities
export * from './user-utils';

// Error utilities  
export * from './error-utils';

// Date utilities
export * from './date-utils';

// Re-export commonly used functions
export {
  // User utilities
  generateDisplayNameFromEmail,
  getUserDisplayName,
  hasPlaceholderName,
  isValidEmail,
  formatPhoneNumber,
  getUserInitials,
} from './user-utils';

export {
  // Error utilities
  createAppError,
  isNetworkError,
  isRetryableError,
  getUserFriendlyErrorMessage,
  logError,
  generateErrorId,
} from './error-utils';

export {
  // Date utilities
  formatDate,
  formatRelativeTime,
  isToday,
  isThisWeek,
  calculateAge,
  isExpired,
  getDaysUntilExpiry,
  formatDuration,
  formatDateRange
} from './date-utils';