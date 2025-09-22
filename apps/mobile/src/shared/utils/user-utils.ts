/**
 * User utility functions
 */

/**
 * Generate a display name from an email address
 * @param email - The user's email address
 * @returns A formatted display name
 */
export function generateDisplayNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'User';
  }
  
  const username = email.split('@')[0];
  // Convert email username to a more readable format
  // e.g., john.doe -> John Doe, john_doe -> John Doe
  return username
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a user has a placeholder name
 * @param name - The user's name
 * @returns True if the name is a placeholder
 */
export function hasPlaceholderName(name: string | null | undefined): boolean {
  if (!name) return true;
  
  const placeholderPatterns = [
    /^user$/i,
    /^guest$/i,
    /^anonymous$/i,
    /^unknown$/i,
    /^placeholder$/i,
    /^\d+$/, // Just numbers
    /^user\d+$/i, // user123, etc
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(name.trim()));
}

/**
 * Get a display name for a user
 * @param user - The user object
 * @returns The user's display name
 */
export function getUserDisplayName(user: { 
  fullName?: string | null; 
  firstName?: string | null; 
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
} | null | undefined, userProfile?: any): string {
  // If userProfile is provided, merge it with user for backward compatibility
  const userData = userProfile ? { ...user, ...userProfile } : user;
  if (!userData) return 'Guest';
  
  // Try full name first (check both fullName and fullname properties)
  const fullName = userData.fullName || userData.fullname;
  if (fullName && !hasPlaceholderName(fullName)) {
    return fullName;
  }
  
  // Try combining first and last name
  if (userData.firstName && userData.lastName) {
    const combined = `${userData.firstName} ${userData.lastName}`.trim();
    if (!hasPlaceholderName(combined)) {
      return combined;
    }
  }
  
  // Try just first name
  if (userData.firstName && !hasPlaceholderName(userData.firstName)) {
    return userData.firstName;
  }
  
  // Try username
  if (userData.username && !hasPlaceholderName(userData.username)) {
    return userData.username;
  }
  
  // Fall back to email
  if (userData.email) {
    return generateDisplayNameFromEmail(userData.email);
  }
  
  return 'User';
}
