/**
 * Date Utilities for WebAdmin
 *
 * Uses the centralized timezone utilities from backend to ensure
 * consistent date handling across mobile and web admin.
 */

import { getPHTMidnightForDate } from '@/convex/lib/timezone';

/**
 * Convert a date string (YYYY-MM-DD) to PHT midnight timestamp
 * Uses the canonical timezone utility to match mobile app's date storage
 *
 * @param dateString Date in YYYY-MM-DD format
 * @returns UTC timestamp representing midnight PHT for that date
 *
 * @example
 * dateStringToPHTMidnight('2025-11-01')
 * // Returns: 1761926400000 (Nov 1 00:00 PHT)
 */
export function dateStringToPHTMidnight(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  return getPHTMidnightForDate(year, month, day);
}

/**
 * Convert a Date object to PHT midnight timestamp
 *
 * @param date JavaScript Date object
 * @returns UTC timestamp representing midnight PHT for that date
 */
export function dateToPHTMidnight(date: Date): number {
  return getPHTMidnightForDate(
    date.getFullYear(),
    date.getMonth() + 1, // Convert 0-indexed to 1-indexed
    date.getDate()
  );
}
