/**
 * Utility functions for user data processing
 */

/**
 * Generates a display name from an email address
 * @param email - The email address to extract name from
 * @returns A formatted display name
 */
export const generateDisplayNameFromEmail = (email: string): string => {
  if (!email) return 'User';
  
  const emailUsername = email.split('@')[0];
  
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
