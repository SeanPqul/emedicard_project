import { UserRole } from '../../entities/user';

/**
 * Authentication Feature - Model Layer
 * Contains auth-related types, state, and business logic
 */

// ===== AUTH STATE TYPES =====

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  imageUrl?: string;
  role: UserRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface VerificationCredentials {
  code: string;
}

// ===== ROLE PERMISSIONS =====

export interface RolePermissions {
  canAccessApplicantTabs: boolean;
  canAccessInspectorTabs: boolean;
  canAccessAdminTabs: boolean;
  canViewAllApplications: boolean;
  canManageUsers: boolean;
  canApproveApplications: boolean;
  canViewAnalytics: boolean;
  defaultRoute: string;
}

export interface TabConfig {
  name: string;
  icon: string;
  label: string;
  visible: boolean;
}

// ===== DOMAIN LOGIC =====

/**
 * Gets role permissions based on user role
 */
export const getRolePermissions = (userRole?: UserRole): RolePermissions => {
  switch (userRole) {
    case 'inspector':
      return {
        canAccessApplicantTabs: false,
        canAccessInspectorTabs: true,
        canAccessAdminTabs: false,
        canViewAllApplications: true,
        canManageUsers: false,
        canApproveApplications: true,
        canViewAnalytics: false,
        defaultRoute: '/(screens)/(inspector)/inspector-dashboard',
      };
    
    case 'admin':
      return {
        canAccessApplicantTabs: false,
        canAccessInspectorTabs: true,
        canAccessAdminTabs: true,
        canViewAllApplications: true,
        canManageUsers: true,
        canApproveApplications: true,
        canViewAnalytics: true,
        defaultRoute: '/(screens)/(admin)/admin-dashboard',
      };
    
    case 'applicant':
    default:
      return {
        canAccessApplicantTabs: true,
        canAccessInspectorTabs: false,
        canAccessAdminTabs: false,
        canViewAllApplications: false,
        canManageUsers: false,
        canApproveApplications: false,
        canViewAnalytics: false,
        defaultRoute: '/(tabs)/index',
      };
  }
};

/**
 * Gets visible tabs based on user role
 */
export const getVisibleTabs = (userRole?: UserRole): TabConfig[] => {
  const permissions = getRolePermissions(userRole);
  const baseTabs: TabConfig[] = [];

  // Applicant tabs
  if (permissions.canAccessApplicantTabs) {
    baseTabs.push(
      {
        name: 'index',
        icon: 'home',
        label: 'Dashboard',
        visible: true,
      },
      {
        name: 'application',
        icon: 'document-text',
        label: 'Applications',
        visible: true,
      },
      {
        name: 'apply',
        icon: 'add-circle',
        label: 'Apply',
        visible: true,
      },
      {
        name: 'notification',
        icon: 'notifications',
        label: 'Notifications',
        visible: true,
      },
      {
        name: 'profile',
        icon: 'person',
        label: 'Profile',
        visible: true,
      }
    );
  }

  // Inspector tabs - No tabs navigation for inspectors
  // Inspectors use (screens)/(inspector) routes only
  
  return baseTabs;
};

/**
 * Checks if user can access a specific screen
 */
export const canAccessScreen = (screenName: string, userRole?: UserRole): boolean => {
  const permissions = getRolePermissions(userRole);
  
  // Inspector-only screens
  const inspectorOnlyScreens = ['inspector-dashboard', 'review-applications', 'inspection-queue', 'scanner'];
  
  // Applicant tab screens
  const applicantTabScreens = ['index', 'application', 'apply', 'notification'];
  
  // Shared screens - both roles can access
  const universalSharedScreens = ['(shared)', 'edit', 'change-password', 'qr-scanner'];
  
  // Applicant-only shared screens
  const applicantSharedScreens = ['activity', 'document-requirements', 'health-cards', 'orientation', 'payment', 'qr-code', 'upload-documents'];

  if (permissions.canAccessInspectorTabs) {
    return inspectorOnlyScreens.includes(screenName) || 
           universalSharedScreens.includes(screenName) || 
           screenName === 'profile';
  }
  
  if (permissions.canAccessApplicantTabs) {
    return applicantTabScreens.includes(screenName) || 
           universalSharedScreens.includes(screenName) ||
           applicantSharedScreens.includes(screenName) ||
           screenName === 'profile';
  }
  
  return false;
};

// ===== VALIDATION =====

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Gets password strength score
 */
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  return { score, feedback };
};

/**
 * Validates sign-up form
 */
export const validateSignUpForm = (credentials: SignUpCredentials): string[] => {
  const errors: string[] = [];

  if (!credentials.firstName.trim()) {
    errors.push('First name is required');
  }

  if (!credentials.lastName.trim()) {
    errors.push('Last name is required');
  }

  if (!isValidEmail(credentials.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!isValidPassword(credentials.password)) {
    errors.push('Password must be at least 8 characters long');
  }

  return errors;
};