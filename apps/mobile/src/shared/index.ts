/**
 * Shared Layer Index
 * 
 * Centralized exports for API, UI, and utility modules
 */

// ===== API LAYER =====
export * from './api';

// ===== SHARED UTILITIES =====
export * from './lib';

// ===== UI COMPONENTS =====
export * from './ui';

// ===== BACKWARD COMPATIBILITY =====
// Keep existing exports for compatibility during migration
export {
  validators,
  validateField,
  validateForm,
} from './lib/validation/form-validation';

export {
  dateFormatters,
  currencyFormatters,
  stringFormatters,
  statusFormatters,
} from './lib/formatting/data-formatters';

export {
  errorHandlers,
} from './api/error-handling';
