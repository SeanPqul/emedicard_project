/**
 * Shared Infrastructure Index
 * 
 * Comprehensive shared utilities, services, components, and hooks
 */

// Services
export * from './services';

// Hooks  
export * from './hooks';

// Components
export * from './components';

// Utilities
export * from './utils';

// Basic validation utilities
export {
  validators,
  validateField,
  validateForm,
} from './validation/form-validation';

// Essential formatting utilities
export {
  dateFormatters,
  currencyFormatters,
  stringFormatters,
  statusFormatters,
} from './formatting/data-formatters';

// Simple error handling
export {
  errorHandlers,
} from './api/error-handling';
