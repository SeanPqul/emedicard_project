/**
 * Main Src Index
 *
 * Central export point for the entire src folder following Feature-Sliced Design.
 * Provides clean imports for all major architectural layers.
 */

// App Layer - Global app configuration and providers
export * from './app-layer';

// Entities Layer - Business entities
export type {
  PaymentStatus,
  Application,
  ApplicationStatus,
  PaymentMethod,
  UserProfile,
  HealthCardStatus,
  HealthCardData,
} from './entities';

// Features Layer - User scenarios and features
// export * from './features'; // Removed due to duplicate exports

// Widgets Layer - Complex UI blocks
// export * from './widgets'; // Removed due to duplicate exports

// Processes Layer - Complex business processes
// export * from './processes'; // Removed due to duplicate exports

// Shared Layer - Reusable utilities, components, hooks
// export * from './shared'; // Removed due to duplicate exports

// Types - Global type definitions
// export * from './types'; // Removed due to duplicate exports

// Screens - Page components (legacy, being migrated)
// export * from './screens'; // Removed due to duplicate exports
