/**
 * Timezone Configuration
 * 
 * Centralized timezone handling for the application.
 * All orientation schedules are displayed in Philippine time (UTC+8).
 */

/**
 * Application timezone: Philippine Time (UTC+8)
 * Philippines does not observe Daylight Saving Time
 */
export const APP_TIMEZONE = "Asia/Manila";
export const APP_TIMEZONE_OFFSET_HOURS = 8;
export const APP_TIMEZONE_OFFSET_MINUTES = APP_TIMEZONE_OFFSET_HOURS * 60;

/**
 * Get the timezone offset in minutes for Philippine time
 * @returns Offset in minutes (480 for UTC+8)
 */
export function getAppTimezoneOffset(): number {
  return APP_TIMEZONE_OFFSET_MINUTES;
}

/**
 * Convert UTC timestamp to Philippine local time components
 * @param utcTimestamp UTC timestamp in milliseconds
 * @returns Object with year, month, day, hours, minutes in Philippine time
 */
export function getPhilippineTimeComponents(utcTimestamp: number) {
  const date = new Date(utcTimestamp);
  
  // Get components in Philippine timezone using Intl API
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const getValue = (type: string) => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };
  
  return {
    year: getValue('year'),
    month: getValue('month') - 1, // JavaScript months are 0-indexed
    day: getValue('day'),
    hours: getValue('hour'),
    minutes: getValue('minute'),
  };
}

/**
 * Calculate session start/end timestamps from a date and time range
 * @param dateUtcMidnight Date as UTC midnight timestamp
 * @param startMinutes Minutes since midnight (0-1439)
 * @param endMinutes Minutes since midnight (0-1439)
 * @returns Start and end timestamps in UTC
 */
export function calculateSessionBounds(
  dateUtcMidnight: number,
  startMinutes: number,
  endMinutes: number
): { sessionStart: number; sessionEnd: number } {
  // dateUtcMidnight is already a UTC timestamp representing midnight in PHT
  // Simply add the time offset (startMinutes/endMinutes) to get session bounds
  const sessionStart = dateUtcMidnight + (startMinutes * 60 * 1000);
  const sessionEnd = dateUtcMidnight + (endMinutes * 60 * 1000);
  
  return { sessionStart, sessionEnd };
}

/**
 * Check if current time is within a session
 * @param sessionStart Session start timestamp (UTC)
 * @param sessionEnd Session end timestamp (UTC)
 * @param now Current timestamp (defaults to Date.now())
 * @returns Boolean indicating if session is active
 */
export function isSessionActive(
  sessionStart: number,
  sessionEnd: number,
  now: number = Date.now()
): boolean {
  return now >= sessionStart && now < sessionEnd;
}

/**
 * Check if a session is in the past
 * @param sessionEnd Session end timestamp (UTC)
 * @param now Current timestamp (defaults to Date.now())
 * @returns Boolean indicating if session has ended
 */
export function isSessionPast(
  sessionEnd: number,
  now: number = Date.now()
): boolean {
  return now >= sessionEnd;
}

/**
 * Check if a session is upcoming
 * @param sessionStart Session start timestamp (UTC)
 * @param now Current timestamp (defaults to Date.now())
 * @returns Boolean indicating if session hasn't started yet
 */
export function isSessionUpcoming(
  sessionStart: number,
  now: number = Date.now()
): boolean {
  return now < sessionStart;
}

/**
 * Format a timestamp in Philippine timezone
 * @param timestamp UTC timestamp
 * @param format 'date' | 'time' | 'datetime'
 * @returns Formatted string
 */
export function formatPhilippineTime(
  timestamp: number,
  format: 'date' | 'time' | 'datetime' = 'datetime'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: APP_TIMEZONE,
  };
  
  if (format === 'date' || format === 'datetime') {
    options.year = 'numeric';
    options.month = 'short';
    options.day = 'numeric';
  }
  
  if (format === 'time' || format === 'datetime') {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(timestamp);
}
