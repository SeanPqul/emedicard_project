/**
 * User Domain Types
 *
 * Type definitions for user-related entities and operations
 */
import { GenericId, BaseEntity, Timestamp } from './base';
export type UserRole = 'applicant' | 'inspector' | 'admin';
export interface User extends BaseEntity {
    _id: GenericId<"users">;
    username: string;
    fullname: string;
    email: string;
    image: string;
    gender?: string;
    birthDate?: string;
    phoneNumber?: string;
    role?: UserRole;
    clerkId: string;
}
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
    lastLoginAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
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
export interface UserAuth {
    isAuthenticated: boolean;
    user?: User;
    token?: string;
    refreshToken?: string;
    expiresAt?: Timestamp;
}
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
//# sourceMappingURL=user.d.ts.map