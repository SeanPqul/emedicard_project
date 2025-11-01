/**
 * Session Status Calculation Utilities
 *
 * Pure functions to calculate orientation session status (active/past/upcoming).
 * These can be used on both backend and frontend for consistent status calculation.
 *
 * The functions use Philippine Time (PHT/UTC+8) for all calculations.
 */

import { getPhilippineTimeComponents } from "./timezone";

export interface SessionStatusInput {
  date: number; // UTC timestamp of session date (PHT midnight)
  startMinutes: number; // Minutes since midnight (0-1439)
  endMinutes: number; // Minutes since midnight (0-1439)
}

export interface SessionStatus {
  isActive: boolean; // Session is currently running
  isPast: boolean; // Session has ended
  isUpcoming: boolean; // Session hasn't started yet
}

/**
 * Calculate session status based on current server time
 *
 * @param session - Session with date and time information
 * @param serverTime - Current server timestamp (UTC)
 * @returns Object with isActive, isPast, isUpcoming flags
 *
 * @example
 * ```typescript
 * const status = calculateSessionStatus(
 *   { date: 1761926400000, startMinutes: 1246, endMinutes: 1294 },
 *   Date.now()
 * );
 * // Returns: { isActive: true, isPast: false, isUpcoming: false }
 * ```
 */
export function calculateSessionStatus(
  session: SessionStatusInput,
  serverTime: number
): SessionStatus {
  // Get current time in PHT components
  const serverPhtComponents = getPhilippineTimeComponents(serverTime);
  const serverPhtMinutes = serverPhtComponents.hours * 60 + serverPhtComponents.minutes;

  // Get schedule date in PHT components
  const schedulePhtComponents = getPhilippineTimeComponents(session.date);

  // Check if schedule is today (in PHT)
  const isToday =
    schedulePhtComponents.year === serverPhtComponents.year &&
    schedulePhtComponents.month === serverPhtComponents.month &&
    schedulePhtComponents.day === serverPhtComponents.day;

  let isPast = false;
  let isUpcoming = false;
  let isActive = false;

  if (isToday) {
    // For today: compare current PHT time with session times
    isPast = serverPhtMinutes > session.endMinutes;
    isUpcoming = serverPhtMinutes < session.startMinutes;
    isActive =
      serverPhtMinutes >= session.startMinutes &&
      serverPhtMinutes <= session.endMinutes;
  } else {
    // For other dates: compare the date itself (not time)
    const serverPhtDate = new Date(
      serverPhtComponents.year,
      serverPhtComponents.month,
      serverPhtComponents.day
    ).getTime();

    const schedulePhtDate = new Date(
      schedulePhtComponents.year,
      schedulePhtComponents.month,
      schedulePhtComponents.day
    ).getTime();

    isPast = schedulePhtDate < serverPhtDate;
    isUpcoming = schedulePhtDate > serverPhtDate;
  }

  return {
    isActive,
    isPast,
    isUpcoming,
  };
}

/**
 * Check if a session is currently active
 * Convenience function that wraps calculateSessionStatus
 */
export function isSessionActive(
  session: SessionStatusInput,
  serverTime: number
): boolean {
  return calculateSessionStatus(session, serverTime).isActive;
}

/**
 * Check if a session has ended
 * Convenience function that wraps calculateSessionStatus
 */
export function isSessionPast(
  session: SessionStatusInput,
  serverTime: number
): boolean {
  return calculateSessionStatus(session, serverTime).isPast;
}

/**
 * Check if a session is upcoming
 * Convenience function that wraps calculateSessionStatus
 */
export function isSessionUpcoming(
  session: SessionStatusInput,
  serverTime: number
): boolean {
  return calculateSessionStatus(session, serverTime).isUpcoming;
}
