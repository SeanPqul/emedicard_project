// ===== API UTILITIES =====
export * from './convex';
export * from './types';
export * from './error-handling';

// ===== CONVENIENCE RE-EXPORTS =====

// Common types that are used frequently
export type {
  ConvexId,
  User,
  Application,
  HealthCard,
  Payment,
  QueryResult,
  MutationResult,
  LoadingState,
  ApiError,
} from './types';

// Common utilities
export {
  createQueryHook,
  createMutationHook,
  createCrudHooks,
  apiEndpoints,
  convex,
} from './convex';

export {
  errorHandlers,
} from './error-handling';