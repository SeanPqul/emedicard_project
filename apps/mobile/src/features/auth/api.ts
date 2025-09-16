import { useMemo } from 'react';
import { useCurrentUser } from '../../entities/user';
import { 
  SignInCredentials, 
  SignUpCredentials, 
  ResetPasswordCredentials, 
  AuthUser,
  getRolePermissions,
  getVisibleTabs,
  canAccessScreen,
  TabConfig,
  RolePermissions
} from './model';

/**
 * Authentication Feature - API Layer
 * Integrates with Clerk and provides auth state management
 */

// ===== AUTH HOOKS =====

/**
 * Hook for role-based navigation
 * Extracted from useRoleBasedNavigation.ts
 */
export const useRoleBasedNavigation = (userRole?: string) => {
  const permissions = useMemo((): RolePermissions => {
    return getRolePermissions(userRole as any);
  }, [userRole]);

  const visibleTabs = useMemo((): TabConfig[] => {
    return getVisibleTabs(userRole as any);
  }, [userRole]);

  const canAccess = (screenName: string): boolean => {
    return canAccessScreen(screenName, userRole as any);
  };

  return {
    permissions,
    visibleTabs,
    canAccessScreen: canAccess,
    userRole: userRole || 'applicant',
  };
};

/**
 * Hook for authentication state
 * Combines Clerk auth with user profile data
 */
export const useAuthState = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error: null, // TODO: Implement proper error handling
  };
};

/**
 * Hook for auth user data (transformed for auth context)
 */
export const useAuthUser = (): AuthUser | null => {
  const { data: user } = useCurrentUser();
  
  if (!user) return null;

  return {
    id: user._id,
    email: user.email,
    fullName: user.fullname,
    imageUrl: user.image,
    role: user.role,
  };
};

// ===== CLERK INTEGRATION HELPERS =====

/**
 * These functions would integrate with Clerk hooks in actual components
 * They're defined here for type safety and consistent error handling
 */

export interface AuthMethods {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

/**
 * Auth error handling
 */
export const handleAuthError = (error: any): string => {
  // Common Clerk error handling
  if (error?.errors?.[0]?.message) {
    return error.errors[0].message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Default error messages
  switch (error?.code) {
    case 'form_identifier_not_found':
      return 'No account found with this email address';
    case 'form_password_incorrect':
      return 'Incorrect password';
    case 'form_identifier_exists':
      return 'An account with this email already exists';
    case 'session_exists':
      return 'You are already signed in';
    default:
      return 'An error occurred. Please try again.';
  }
};

/**
 * Route helpers for navigation after auth
 */
export const getPostAuthRoute = (userRole?: string): string => {
  const permissions = getRolePermissions(userRole as any);
  return permissions.defaultRoute;
};

export const getAuthRoute = (action: 'sign-in' | 'sign-up' | 'reset-password' | 'verification'): string => {
  return `/(auth)/${action}`;
};