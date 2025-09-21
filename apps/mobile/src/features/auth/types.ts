// Auth feature types

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullname: string;
  isVerified: boolean;
  role?: 'applicant' | 'inspector' | 'admin';
}

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
