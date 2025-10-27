/**
 * Time Utilities for Web Admin
 * Handles conversion between HH:MM format (24hr) and minutes since midnight
 */

/**
 * Convert "HH:MM" (24-hour) to minutes since midnight
 * @param hhMM - Time string in "HH:MM" format (e.g., "09:00", "14:30")
 * @returns Minutes since midnight (0-1439)
 */
export function timeToMinutes(hhMM: string): number {
  if (!hhMM) return 0;
  const [h, m] = hhMM.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert minutes since midnight to "HH:MM" (24-hour)
 * @param minutes - Minutes since midnight (0-1439)
 * @returns Time string in "HH:MM" format
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format minutes to 12-hour display
 * @param minutes - Minutes since midnight
 * @returns Formatted time (e.g., "9:00 AM", "2:30 PM")
 */
export function formatMinutesTo12Hour(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  
  return `${hours12}:${String(mins).padStart(2, "0")} ${ampm}`;
}

/**
 * Format time range for display
 * @param startTime - Start time in "HH:MM" format
 * @param endTime - End time in "HH:MM" format
 * @returns Formatted range (e.g., "9:00 AM - 11:00 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  
  return `${formatMinutesTo12Hour(startMins)} - ${formatMinutesTo12Hour(endMins)}`;
}

/**
 * Calculate duration between two times
 * @param startTime - Start time in "HH:MM" format
 * @param endTime - End time in "HH:MM" format
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  
  return endMins - startMins;
}

/**
 * Format duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "2 hours", "1.5 hours", "30 minutes")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}.${Math.round((mins / 60) * 10)} hours`;
}

/**
 * Validate time range
 * @param startTime - Start time in "HH:MM" format
 * @param endTime - End time in "HH:MM" format
 * @returns Error message if invalid, null if valid
 */
export function validateTimeRange(startTime: string, endTime: string): string | null {
  if (!startTime || !endTime) {
    return "Both start and end times are required";
  }
  
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  
  if (startMins >= endMins) {
    return "Start time must be before end time";
  }
  
  const duration = endMins - startMins;
  
  if (duration < 30) {
    return "Duration must be at least 30 minutes";
  }
  
  if (duration > 480) {
    return "Duration cannot exceed 8 hours";
  }
  
  return null;
}
