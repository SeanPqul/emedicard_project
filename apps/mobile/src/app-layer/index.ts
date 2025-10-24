/**
 * App Layer - Application-level Configuration, Navigation, and Providers
 * 
 * This layer contains the highest-level application concerns following FSD architecture:
 * - Global providers (authentication, state management)
 * - Root layouts and navigation configuration
 * - App-level configuration and constants
 * 
 * Structure:
 * - providers/  - Global providers (Clerk, Convex)
 * - layouts/    - Root layouts (InitialLayout)
 * - config/     - App-level configuration (APP_CONFIG, ENV_CONFIG)
 * 
 * Note: UI providers like Toast are in shared/components for reusability
 * 
 * @module app
 */

// Export providers
export * from './providers';

// Export layouts
export * from './layouts';

// Export configuration
export * from './config';
