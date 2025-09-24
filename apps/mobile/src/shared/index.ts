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

// Note: Validation utilities moved to @features/application/lib during FSD migration
// Note: Formatting utilities moved to respective feature/entity lib folders during FSD migration

// Simple error handling
export {
  errorHandlers,
} from './api/error-handling';
