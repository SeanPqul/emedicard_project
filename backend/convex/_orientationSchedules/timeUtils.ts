/**
 * Time Utilities for Orientation Schedules
 * Handles conversion between minutes since midnight and formatted time strings
 */

/**
 * Convert minutes since midnight to 12-hour formatted time string
 * @param minutes - Minutes since midnight (0-1439)
 * @returns Formatted time string (e.g., "9:00 AM", "2:30 PM")
 */
export function formatMinutesTo12Hour(minutes: number): string {
  if (minutes < 0 || minutes >= 1440) {
    throw new Error(`Invalid minutes: ${minutes}. Must be 0-1439.`);
  }

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  
  return `${hours12}:${String(mins).padStart(2, "0")} ${ampm}`;
}

/**
 * Convert start and end minutes to a formatted time range string
 * @param startMinutes - Start time in minutes since midnight
 * @param endMinutes - End time in minutes since midnight
 * @returns Formatted range (e.g., "9:00 AM - 11:00 AM")
 */
export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  return `${formatMinutesTo12Hour(startMinutes)} - ${formatMinutesTo12Hour(endMinutes)}`;
}

/**
 * Parse 12-hour time string to minutes since midnight
 * Supports formats: "9:00 AM", "9am", "09:00 AM", etc.
 * @param timeStr - Time string to parse
 * @returns Minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const cleaned = timeStr.trim().toUpperCase();
  
  // Match patterns like "9:00 AM", "9am", "09:00 AM"
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
  
  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}". Expected format: "9:00 AM" or "2:30 PM"`);
  }
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const period = match[3]?.toUpperCase();
  
  if (hours < 1 || hours > 12) {
    throw new Error(`Invalid hours: ${hours}. Must be 1-12.`);
  }
  
  if (minutes < 0 || minutes >= 60) {
    throw new Error(`Invalid minutes: ${minutes}. Must be 0-59.`);
  }
  
  // Convert to 24-hour
  let hours24 = hours;
  if (period === "PM" && hours !== 12) {
    hours24 += 12;
  } else if (period === "AM" && hours === 12) {
    hours24 = 0;
  }
  
  return hours24 * 60 + minutes;
}

/**
 * Parse a time range string (e.g., "9:00 AM - 11:00 AM") into start and end minutes
 * @param rangeStr - Time range string
 * @returns Object with startMinutes and endMinutes
 */
export function parseTimeRange(rangeStr: string): { startMinutes: number; endMinutes: number } {
  const parts = rangeStr.split("-").map(s => s.trim());
  
  if (parts.length !== 2) {
    throw new Error(`Invalid time range format: "${rangeStr}". Expected "START - END" format.`);
  }
  
  const startMinutes = parseTimeToMinutes(parts[0]!);
  const endMinutes = parseTimeToMinutes(parts[1]!);
  
  if (startMinutes >= endMinutes) {
    throw new Error(`Invalid time range: start time must be before end time. Got: ${rangeStr}`);
  }
  
  return { startMinutes, endMinutes };
}

/**
 * Calculate duration in minutes between start and end times
 * @param startMinutes - Start time in minutes
 * @param endMinutes - End time in minutes
 * @returns Duration in minutes
 */
export function calculateDuration(startMinutes: number, endMinutes: number): number {
  if (startMinutes >= endMinutes) {
    throw new Error("Start time must be before end time");
  }
  return endMinutes - startMinutes;
}

/**
 * Validate time range for orientation schedules
 * @param startMinutes - Start time in minutes
 * @param endMinutes - End time in minutes
 * @throws Error if validation fails
 */
export function validateTimeRange(startMinutes: number, endMinutes: number): void {
  if (startMinutes < 0 || startMinutes >= 1440) {
    throw new Error(`Invalid start time: ${startMinutes} minutes. Must be 0-1439.`);
  }
  
  if (endMinutes < 0 || endMinutes >= 1440) {
    throw new Error(`Invalid end time: ${endMinutes} minutes. Must be 0-1439.`);
  }
  
  if (startMinutes >= endMinutes) {
    throw new Error("Start time must be before end time");
  }
  
  const duration = endMinutes - startMinutes;
  
  // Minimum 30 minutes
  if (duration < 30) {
    throw new Error(`Orientation duration must be at least 30 minutes. Got: ${duration} minutes.`);
  }
  
  // Maximum 8 hours
  if (duration > 480) {
    throw new Error(`Orientation duration cannot exceed 8 hours. Got: ${duration} minutes.`);
  }
}
