/**
 * Main Src Index
 * 
 * Central export point for the entire src folder following Feature-Sliced Design.
 * Provides clean imports for all major architectural layers.
 */

// App Layer - Global app configuration and providers
export * from './app-layer';

// Entities Layer - Business entities
export * from './entities';

// Features Layer - User scenarios and features  
export * from './features';

// Widgets Layer - Complex UI blocks
export * from './widgets';

// Processes Layer - Complex business processes
export * from './processes';

// Shared Layer - Reusable utilities, components, hooks
export * from './shared';

// Types - Global type definitions
export * from './types';

// Screens - Page components (legacy, being migrated)
export * from './screens';
