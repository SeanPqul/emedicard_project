// This file maintains backward compatibility for old imports
// All components have been migrated to their proper feature locations

// Re-export shared components
export * from '@/src/shared/components';

// Re-export feature components
export * from '@/src/features/auth/components';
export * from '@/src/features/dashboard/components';
export * from '@/src/features/application/components';
export * from '@/src/features/profile/components';
export * from '@/src/features/scanner/components';
export * from '@/src/features/upload/components';

// Re-export navigation components
export { default as RoleBasedTabLayout } from '@/src/core/navigation/components/RoleBasedTabLayout';

// Re-export feedback components
export * from '@/src/shared/components/feedback/feedback';

// Legacy type exports for backward compatibility
export type { ToastType, ToastProps } from '@/src/shared/components/feedback/feedback';
export type { ErrorType } from '@/src/shared/components';

// This file will be deprecated once all imports are updated to use direct imports

