// Auth feature types - Uses entities from entities layer (FSD pattern)
import type { AuthUser, AuthRole, AuthErrorCode } from '@entities/auth';

// Re-export entity types for backward compatibility
export type { AuthUser, AuthRole };

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  fullname: string;
  username: string;
}

export interface VerificationFormData {
  code: string;
}

export interface ResetPasswordFormData {
  email?: string;
  code?: string;
  newPassword?: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}
