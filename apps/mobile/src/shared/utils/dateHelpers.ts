/**
 * Date Helpers
 * 
 * Shared utility functions for date formatting, validation, and manipulation
 */

export const DateHelpers = {
  /**
   * Format date to readable string
   */
  formatDate(date: Date | number, format: 'short' | 'long' | 'relative' = 'short'): string {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    
    if (format === 'relative') {
      return this.getRelativeTime(dateObj);
    }
    
    const options: Intl.DateTimeFormatOptions = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return dateObj.toLocaleDateString('en-US', options);
  },

  /**
   * Format date and time
   */
  formatDateTime(date: Date | number): string {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(date: Date | number): string {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return this.formatDate(dateObj, 'short');
  },

  /**
   * Check if date is today
   */
  isToday(date: Date | number): boolean {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    const today = new Date();
    
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
  },

  /**
   * Check if date is within last N days
   */
  isWithinDays(date: Date | number, days: number): boolean {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays <= days;
  },

  /**
   * Add days to date
   */
  addDays(date: Date | number, days: number): Date {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  },

  /**
   * Get start of day
   */
  startOfDay(date: Date | number): Date {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj;
  },

  /**
   * Get end of day
   */
  endOfDay(date: Date | number): Date {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    dateObj.setHours(23, 59, 59, 999);
    return dateObj;
  },

  /**
   * Calculate age from birthdate
   */
  calculateAge(birthDate: Date | number): number {
    const birthDateObj = typeof birthDate === 'number' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Check if date is expired (past current time)
   */
  isExpired(date: Date | number): boolean {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.getTime() < Date.now();
  },

  /**
   * Get time until expiration
   */
  getTimeUntilExpiration(expirationDate: Date | number): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } {
    const expireObj = typeof expirationDate === 'number' ? new Date(expirationDate) : expirationDate;
    const totalMs = expireObj.getTime() - Date.now();
    
    if (totalMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }
    
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, totalMs };
  }
};

export default DateHelpers;
