// Auth entity types

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullname: string;
  isVerified: boolean;
  role?: 'applicant' | 'inspector' | 'admin' | 'system_admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
  expiresAt: Date;
}

export interface EmailVerification {
  userId: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
}

export type AuthRole = 'applicant' | 'inspector' | 'admin' | 'system_admin';

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
