/**
 * User Entity - Public API
 * 
 * This file defines the public interface for the User entity.
 * Other parts of the application should import from this file only.
 */

// ===== TYPES & INTERFACES =====
export type {
  User,
  UserRole,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
} from './model';

// ===== DOMAIN LOGIC =====
export {
  createUserPayload,
  hasPermission,
  isProfileComplete,
  getUserInitials,
  formatUserDisplayName,
} from './model';

// ===== API HOOKS =====
export {
  useCurrentUser,
  useUsersByRole,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useUpdateUserRole,
  useUserMutations,
} from './api';

// ===== UTILITY FUNCTIONS =====
export {
  generateDisplayNameFromEmail,
  getUserDisplayName,
  hasPlaceholderName,
  isValidEmail,
  isValidPhoneNumber,
  isValidUsername,
  getUserAvatar,
  getProfileCompletionPercentage,
  getMissingProfileFields,
} from './lib';