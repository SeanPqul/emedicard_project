/**
 * User Domain Types
 * 
 * Type definitions for user-related entities and operations
 */

import { Id } from 'backend/convex/_generated/dataModel';

// ===== USER ROLE TYPES =====
export type UserRole = 'applicant' | 'inspector' | 'admin';
// Note: Admin functionality is handled via separate web interface

// ===== USER ENTITY TYPES =====
export interface User {
  _id: Id<"users">;
  _creationTime: number;
  username: string;
  fullname: string;
  email: string;
  image: string;
  gender?: string;
  birthDate?: string;
  phoneNumber?: string;
  role?: UserRole;
  clerkId: string;
  updatedAt?: number;
}

// ===== USER PROFILE TYPES =====
export interface UserProfile {
  id: string;
  username: string;
  fullname: string;
  email: string;
  image?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

// ===== USER PREFERENCES TYPES =====
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  language: 'en' | 'fil';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

// ===== USER AUTHENTICATION TYPES =====
export interface UserAuth {
  isAuthenticated: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// ===== USER OPERATION TYPES =====
export interface CreateUserInput {
  username: string;
  fullname: string;
  email: string;
  clerkId: string;
  role?: UserRole;
  image?: string;
}

export interface UpdateUserInput {
  fullname?: string;
  image?: string;
  gender?: string;
  birthDate?: string;
  phoneNumber?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}