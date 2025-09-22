// =============================================================================
// HOOKS INDEX - Central export point for all application hooks
// =============================================================================

// API Integration Hooks (using new service architecture)
export { useHealthCards } from './useHealthCards';
export { useApplications } from './useApplications';
export { useJobCategories } from './useJobCategories';
export { usePayments } from './usePayments';
export { useRequirements } from './useRequirements';
export { useNotifications } from './useNotifications';
export { useUsers } from './useUsers';
export { useVerification } from './useVerification';
export { useStorage } from './useStorage';

// Feature Hooks
export { useOptimizedDashboard as useDashboard } from './useOptimizedDashboard';
export { useDocumentUpload } from './useDocumentUpload';
// Payment flow hooks
export { usePaymentFlow, usePaymentMethod, usePaymentManager } from '@processes/paymentFlow';

// Utility Hooks
export { useDeepLink } from './useDeepLink';
export { useNetwork } from './useNetwork';
export { useRoleBasedNavigation } from './useRoleBasedNavigation';