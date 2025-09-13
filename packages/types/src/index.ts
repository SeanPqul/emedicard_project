/**
 * @emedicard/types
 * 
 * Shared TypeScript types and interfaces for eMediCard applications
 */

// Base types
export * from './base';

// Domain types
export * from './application';
export * from './user';
export * from './health-card';
export * from './payment';

// Re-export commonly used types for convenience
export type {
  // Base types
  GenericId,
  BaseEntity,
  Timestamp,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
} from './base';

export type {
  // Application types
  Application,
  ApplicationStatus,
  ApplicationType,
  JobCategory,
  CivilStatus,
} from './application';

export type {
  // User types
  User,
  UserRole,
  UserProfile,
} from './user';

export type {
  // Health Card types
  HealthCard,
  HealthCardStatus,
  HealthCardData,
} from './health-card';

export type {
  // Payment types
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentBreakdown
} from './payment';