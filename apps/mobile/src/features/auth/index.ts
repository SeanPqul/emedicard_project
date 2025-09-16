/**
 * Authentication Feature - Public API
 * 
 * This file defines the public interface for the Auth feature.
 * Other parts of the application should import from this file only.
 */

// ===== TYPES =====
export type {
  AuthState,
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
  ResetPasswordCredentials,
  VerificationCredentials,
  RolePermissions,
  TabConfig,
} from './model';

// ===== DOMAIN LOGIC =====
export {
  getRolePermissions,
  getVisibleTabs,
  canAccessScreen,
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  validateSignUpForm,
} from './model';

// ===== API HOOKS =====
export {
  useRoleBasedNavigation,
  useAuthState,
  useAuthUser,
  handleAuthError,
  getPostAuthRoute,
  getAuthRoute,
} from './api';

export type {
  AuthMethods,
} from './api';

// ===== UI COMPONENTS =====
export * from './ui';

// ===== BACKWARD COMPATIBILITY =====
// Re-export the navigation hook for existing components
export { useRoleBasedNavigation as useRoleBasedNavigationLegacy } from './api';