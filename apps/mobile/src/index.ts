/**
 * Main Src Index
 * 
 * Central export point for the entire src folder.
 * Provides clean imports for all major modules.
 * 
 * Note: Components and constants have been migrated to Feature-Sliced Design structure.
 * - Components are now in @/src/shared/components or feature-specific folders
 * - Constants are now in @/src/shared/constants or feature-specific folders
 */

// Configuration
export * from './config';

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
