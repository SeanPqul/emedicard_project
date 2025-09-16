/**
 * Main Src Index
 * 
 * Central export point for the entire src folder.
 * Provides clean imports for all major modules.
 */


// Components
// Components are now feature-scoped and imported directly

// Configuration
export * from './config';

// Constants
export * from './constants';

// Contexts
export * from './contexts';

// Hooks
export * from './hooks';

// Types
export * from './types';

// Utilities
export * from './utils';

// Shared utilities (new architectural layer)
export * from './shared';

// Styles
export * from './styles';

// Layouts
export * from './layouts';

// Features (only healthCards is active)
export * from './features/healthCards';