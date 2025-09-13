/**
 * User Utility Functions
 * 
 * Platform-agnostic utility functions for user data processing
 */

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
 * @param user - User object with potential name fields
 * @param userProfile - User profile object with potential name fields
 * @returns The best available display name
 */
export const getUserDisplayName = (
  user: any, 
  userProfile: any
): string => {
  // Priority: 
  // 1. User fullName (from authentication provider)
  // 2. Profile fullname (if not placeholder)
  // 3. Generated name from email
  // 4. Fallback to 'User'
  
  if (user?.fullName && user.fullName !== 'Full Name') {
    return user.fullName;
  }
  
  if (userProfile?.fullname && userProfile.fullname !== 'Full Name') {
    return userProfile.fullname;
  }
  
  // Generate from email if available
  const email = user?.emailAddresses?.[0]?.emailAddress || 
                user?.email || 
                userProfile?.email;
  if (email) {
    return generateDisplayNameFromEmail(email);
  }
  
  return 'User';
};

/**
 * Checks if a user has a placeholder name that should be updated
 * @param userProfile - User profile object
 * @returns true if the user has a placeholder name
 */
export const hasPlaceholderName = (userProfile: any): boolean => {
  return !userProfile?.fullname || userProfile.fullname === 'Full Name';
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats phone number for display
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length (assuming Philippine format)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber; // Return original if format not recognized
};

/**
 * Gets user initials from name
 * @param fullName - Full name of the user
 * @returns Initials (max 2 characters)
 */
export const getUserInitials = (fullName?: string): string => {
  if (!fullName) return 'U';
  
  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};