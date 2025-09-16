import { User } from './model';

/**
 * User Entity - Utility Library
 * User-specific utility functions extracted from user-utils.ts
 */

// ===== DISPLAY NAME UTILITIES =====

/**
 * Generates a display name from an email address
 * @param email - The email address to extract name from
 * @returns A formatted display name
 */
export const generateDisplayNameFromEmail = (email: string): string => {
  if (!email) return 'User';
  
  const emailUsername = email.split('@')[0];
  
  if (!emailUsername) return 'User';
  
  // Convert email username to a readable display name
  // e.g., "john.doe" becomes "John Doe", "user_123" becomes "User 123"
  return emailUsername
    .charAt(0).toUpperCase() + 
    emailUsername.slice(1).replace(/[._-]/g, ' ');
};

/**
 * Gets the best available display name for a user
 * @param user - Clerk user object
 * @param userProfile - Convex user profile object
 * @returns The best available display name
 */
export const getUserDisplayName = (
  user: any, 
  userProfile: any
): string => {
  // Priority: 
  // 1. Clerk fullName (from Google/social login)
  // 2. Convex fullname (if not placeholder)
  // 3. Generated name from email
  // 4. Fallback to 'User'
  
  if (user?.fullName && user.fullName !== 'Full Name') {
    return user.fullName;
  }
  
  if (userProfile?.fullname && userProfile.fullname !== 'Full Name') {
    return userProfile.fullname;
  }
  
  // Generate from email if available
  const email = user?.emailAddresses?.[0]?.emailAddress || userProfile?.email;
  if (email) {
    return generateDisplayNameFromEmail(email);
  }
  
  return 'User';
};

/**
 * Checks if a user has a placeholder name that should be updated
 * @param userProfile - Convex user profile object
 * @returns true if the user has a placeholder name
 */
export const hasPlaceholderName = (userProfile: any): boolean => {
  return !userProfile?.fullname || userProfile.fullname === 'Full Name';
};

// ===== USER VALIDATION UTILITIES =====

/**
 * Validates user email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation - accepts various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[-\s\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Validates if username is available format (basic rules)
 */
export const isValidUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric with underscores/dots
  const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
  return usernameRegex.test(username);
};

// ===== USER PROFILE UTILITIES =====

/**
 * Gets user's avatar URL or fallback to initials
 */
export const getUserAvatar = (user: User): { type: 'image' | 'initials'; value: string } => {
  if (user.image && user.image !== '') {
    return { type: 'image', value: user.image };
  }

  // Generate initials
  let initials = 'U';
  if (user.fullname && user.fullname !== 'Full Name') {
    initials = user.fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  } else if (user.username) {
    initials = user.username.charAt(0).toUpperCase();
  }

  return { type: 'initials', value: initials };
};

/**
 * Calculates user profile completion percentage
 */
export const getProfileCompletionPercentage = (user: User): number => {
  const fields = [
    { key: 'fullname', weight: 25 },
    { key: 'email', weight: 20 },
    { key: 'phoneNumber', weight: 20 },
    { key: 'address', weight: 15 },
    { key: 'image', weight: 10 },
    { key: 'birthDate', weight: 10 },
  ] as const;

  let completedWeight = 0;
  
  fields.forEach(({ key, weight }) => {
    const value = user[key];
    const isComplete = value !== undefined && 
                      value !== null && 
                      value !== '' && 
                      value !== 'Full Name';
    
    if (isComplete) {
      completedWeight += weight;
    }
  });

  return completedWeight;
};

/**
 * Gets missing required fields for user profile
 */
export const getMissingProfileFields = (user: User): string[] => {
  const requiredFields = [
    { key: 'fullname', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
  ] as const;

  return requiredFields
    .filter(({ key }) => {
      const value = user[key];
      return value === undefined || value === null || value === '' || value === 'Full Name';
    })
    .map(({ label }) => label);
};