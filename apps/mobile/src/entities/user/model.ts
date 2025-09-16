import { ConvexId } from '../../shared/api';

/**
 * User Entity - Domain Model
 * Contains all user-related types, interfaces, and business logic
 */

// ===== CORE USER TYPES =====

export type UserRole = "applicant" | "inspector" | "admin";

export interface User {
  _id: ConvexId<"users">;
  clerkId: string;
  email: string;
  username: string;
  fullname: string;
  image: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  metadata?: Record<string, any>;
  _creationTime: number;
}

// ===== INPUT TYPES =====

export interface CreateUserInput {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  image: string;
  role?: UserRole;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserRoleInput {
  userId: ConvexId<'users'>;
  role: UserRole;
}

// ===== DOMAIN LOGIC =====

/**
 * Transforms CreateUserInput into the format expected by the API
 */
export const createUserPayload = (input: CreateUserInput) => {
  const payload: any = {
    clerkId: input.clerkId,
    email: input.email,
    username: input.username,
    fullname: `${input.firstName} ${input.lastName}`,
    image: input.image,
  };

  // Only include optional fields if they're defined
  if (input.role !== undefined) {
    payload.role = input.role;
  }
  if (input.phoneNumber !== undefined) {
    payload.phoneNumber = input.phoneNumber;
  }
  if (input.gender !== undefined) {
    payload.gender = input.gender;
  }
  if (input.birthDate !== undefined) {
    payload.birthDate = input.birthDate;
  }

  return payload;
};

/**
 * Checks if a user has the required permissions for an action
 */
export const hasPermission = (user: User, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    applicant: 1,
    inspector: 2,
    admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

/**
 * Checks if a user profile is complete
 */
export const isProfileComplete = (user: User): boolean => {
  const requiredFields: (keyof User)[] = ['fullname', 'email', 'phoneNumber'];
  
  return requiredFields.every(field => {
    const value = user[field];
    return value !== undefined && value !== null && value !== '' && value !== 'Full Name';
  });
};

/**
 * Gets user's initials for avatar display
 */
export const getUserInitials = (user: User): string => {
  if (!user.fullname || user.fullname === 'Full Name') {
    return user.username?.charAt(0).toUpperCase() || 'U';
  }

  return user.fullname
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Formats user's display name
 */
export const formatUserDisplayName = (user: User): string => {
  if (user.fullname && user.fullname !== 'Full Name') {
    return user.fullname;
  }

  // Generate from email if available
  if (user.email) {
    const emailUsername = user.email.split('@')[0];
    return emailUsername
      .charAt(0).toUpperCase() + 
      emailUsername.slice(1).replace(/[._-]/g, ' ');
  }

  return user.username || 'User';
};