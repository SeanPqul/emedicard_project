/**
 * Authentication Feature - UI Components
 * 
 * This file would contain auth-specific UI components that are extracted
 * from the current auth screens. For now, we'll define the component interfaces
 * that should be created when migrating the actual auth screens.
 */

// ===== COMPONENT INTERFACES =====

export interface SignInFormProps {
  onSignIn: (credentials: { email: string; password: string }) => void;
  onGoogleSignIn: () => void;
  loading?: boolean;
  error?: string;
}

export interface SignUpFormProps {
  onSignUp: (credentials: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) => void;
  onGoogleSignUp: () => void;
  loading?: boolean;
  error?: string;
}

export interface ResetPasswordFormProps {
  onResetPassword: (email: string) => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

export interface VerificationFormProps {
  onVerify: (code: string) => void;
  onResendCode: () => void;
  loading?: boolean;
  error?: string;
  email?: string;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogos?: boolean;
}

export interface RoleBasedTabLayoutProps {
  userRole?: string;
}

// ===== PLACEHOLDER COMPONENTS =====
// These would be implemented when migrating the actual UI components

export const SignInForm = () => null; // TODO: Extract from sign-in.tsx
export const SignUpForm = () => null; // TODO: Extract from sign-up.tsx  
export const ResetPasswordForm = () => null; // TODO: Extract from reset-password.tsx
export const VerificationForm = () => null; // TODO: Extract from verification.tsx
export const PasswordStrengthIndicator = () => null; // TODO: Extract from components
export const AuthLayout = () => null; // TODO: Create common auth layout
export const RoleBasedTabLayout = () => null; // TODO: Migrate from navigation components