import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Users API Module
 * 
 * Feature-scoped API functions for user operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  return convex.query(api.users.getCurrentUser.getCurrentUserQuery, {});
}

/**
 * Create a new user
 */
export async function createUser(input: {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  image: string;
  role?: "applicant" | "inspector";
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
}) {
  return convex.mutation(api.users.createUser.createUserMutation, {
    clerkId: input.clerkId,
    email: input.email,
    username: input.username,
    fullname: `${input.firstName} ${input.lastName}`,
    image: input.image,
    role: input.role,
    phoneNumber: input.phoneNumber,
    gender: input.gender,
    birthDate: input.birthDate,
  });
}

/**
 * Update user profile
 */
export async function updateUser(updates: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  metadata?: Record<string, any>;
}) {
  return convex.mutation(api.users.updateUser, updates);
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: Id<'users'>, role: string) {
  return convex.mutation(api.users.updateRole, { userId, role });
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string) {
  return convex.query(api.users.getUsersByRole, { role });
}

