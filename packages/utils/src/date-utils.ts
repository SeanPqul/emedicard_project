/**
 * Date Utility Functions
 * 
 * Platform-agnostic date and time utilities
 */

// ===== DATE FORMATTING =====

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  timestamp: number, 
  options: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long';
    locale?: string;
  } = {}
): string => {
  const { includeTime = false, format = 'medium', locale = 'en-US' } = options;
  
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : format === 'long' ? 'long' : 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat(locale, dateOptions).format(date);
};

/**
 * Formats a date to relative time (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 0) return 'In the future';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 30) return `${seconds} seconds ago`;
  
  return 'Just now';
};

/**
 * Checks if a date is today
 * @param timestamp - Unix timestamp in milliseconds
 * @returns true if the date is today
 */
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Checks if a date is this week
 * @param timestamp - Unix timestamp in milliseconds
 * @returns true if the date is this week
 */
export const isThisWeek = (timestamp: number): boolean => {
  const now = new Date();
  const date = new Date(timestamp);
  
  // Get the start of this week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get the end of this week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
};

/**
 * Calculates age from birth date
 * @param birthDate - Birth date as ISO string or timestamp
 * @returns Age in years
 */
export const calculateAge = (birthDate: string | number): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : new Date(birthDate);
  const now = new Date();
  
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Checks if a date has expired
 * @param expiryTimestamp - Expiry timestamp in milliseconds
 * @returns true if expired
 */
export const isExpired = (expiryTimestamp: number): boolean => {
  return Date.now() > expiryTimestamp;
};

/**
 * Gets days until expiry
 * @param expiryTimestamp - Expiry timestamp in milliseconds
 * @returns Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (expiryTimestamp: number): number => {
  const now = Date.now();
  const diff = expiryTimestamp - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Formats duration in milliseconds to human readable string
 * @param duration - Duration in milliseconds
 * @returns Human readable duration
 */
export const formatDuration = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Creates a date range string
 * @param startTimestamp - Start timestamp
 * @param endTimestamp - End timestamp
 * @returns Formatted date range
 */
export const formatDateRange = (
  startTimestamp: number, 
  endTimestamp: number,
  options: { format?: 'short' | 'medium' | 'long' } = {}
): string => {
  const start = formatDate(startTimestamp, options);
  const end = formatDate(endTimestamp, options);
  
  if (start === end) return start;
  return `${start} - ${end}`;
};