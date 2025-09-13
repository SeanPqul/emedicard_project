/**
 * @emedicard/types
 *
 * Shared TypeScript types and interfaces for eMediCard applications
 */
export * from './base';
export * from './application';
export * from './user';
export * from './health-card';
export * from './payment';
export type { GenericId, BaseEntity, Timestamp, ApiResponse, ApiError, PaginatedResponse, PaginationParams, } from './base';
export type { Application, ApplicationStatus, ApplicationType, JobCategory, CivilStatus, } from './application';
export type { User, UserRole, UserProfile, } from './user';
export type { HealthCard, HealthCardStatus, HealthCardData, } from './health-card';
export type { Payment, PaymentStatus, PaymentMethod, PaymentBreakdown } from './payment';
//# sourceMappingURL=index.d.ts.map