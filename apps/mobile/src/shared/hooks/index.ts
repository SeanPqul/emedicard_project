// =============================================================================
// SHARED HOOKS INDEX - Generic/Utility hooks only
// =============================================================================
// Note: All business logic hooks have been moved to their respective features/entities:
// - useUsers -> @entities/user
// - useJobCategories -> @entities/jobCategory
// - useApplications -> @features/application
// - usePayments -> @features/payment
// - useHealthCards -> @features/healthCards
// - useRequirements -> @features/upload
// - useNotifications -> @features/notification
// - useVerification -> @features/scanner
// - useOptimizedDashboard -> @features/dashboard
// - useRoleBasedNavigation -> @features/navigation
// - useDocumentUpload -> @features/upload

// Generic Hooks (these remain in shared)
export { useStorage } from './useStorage';
export { useDeepLink } from './useDeepLink';
export { useNetwork } from './useNetwork';
export { useNetworkStatus } from './useNetworkStatus';

// Payment flow hooks (from processes)
export { usePaymentFlow, usePaymentMethod, usePaymentManager } from '@processes/paymentFlow';
