/**
 * Inspector Feature Constants
 * 
 * Centralized constants for the inspector module including:
 * - Attendance status configurations
 * - Time slot definitions
 * - UI colors and styling
 */

import type { IconProps } from '@expo/vector-icons/build/createIconSet';

// ============================================================================
// ATTENDANCE STATUS CONFIGURATIONS
// ============================================================================

export const ATTENDANCE_STATUS = {
  COMPLETED: {
    color: '#10B981', // Green
    icon: 'checkmark-circle' as IconProps<string>['name'],
    label: 'Completed',
    description: 'Checked in and checked out',
  },
  CHECKED_IN: {
    color: '#F59E0B', // Yellow/Orange
    icon: 'time' as IconProps<string>['name'],
    label: 'Checked In',
    description: 'Waiting for check-out',
  },
  PENDING: {
    color: '#9CA3AF', // Gray
    icon: 'ellipse-outline' as IconProps<string>['name'],
    label: 'Pending',
    description: 'Not yet checked in',
  },
  MISSED: {
    color: '#EF4444', // Red
    icon: 'close-circle' as IconProps<string>['name'],
    label: 'Missed',
    description: 'Did not attend',
  },
  SCHEDULED: {
    color: '#3B82F6', // Blue
    icon: 'calendar' as IconProps<string>['name'],
    label: 'Scheduled',
    description: 'Upcoming session',
  },
} as const;

export type AttendanceStatusKey = keyof typeof ATTENDANCE_STATUS;

// ============================================================================
// TIME SLOT CONFIGURATIONS
// ============================================================================

/**
 * Common time slots for orientation sessions
 * These are typical slots but can be dynamic from backend
 */
export const COMMON_TIME_SLOTS = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
] as const;

// ============================================================================
// SCAN TYPES
// ============================================================================

export const SCAN_TYPE = {
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
} as const;

export type ScanType = typeof SCAN_TYPE[keyof typeof SCAN_TYPE];

// ============================================================================
// DATE FILTER OPTIONS (for Scan History)
// ============================================================================

export const DATE_FILTER_OPTIONS = {
  TODAY: {
    label: 'Today',
    value: 'today',
    days: 0,
  },
  LAST_7_DAYS: {
    label: 'Last 7 Days',
    value: 'last-7-days',
    days: 7,
  },
  LAST_30_DAYS: {
    label: 'Last 30 Days',
    value: 'last-30-days',
    days: 30,
  },
  CUSTOM: {
    label: 'Custom Range',
    value: 'custom',
    days: null,
  },
} as const;

export type DateFilterKey = keyof typeof DATE_FILTER_OPTIONS;

// ============================================================================
// ORIENTATION VENUE
// ============================================================================

/**
 * Default venue for orientation sessions
 * This is flexible and can be overridden by backend data
 */
export const DEFAULT_VENUE = 'Gaisano Ilustre' as const;

// ============================================================================
// REFRESH INTERVALS
// ============================================================================

export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  ATTENDEES: 10000, // 10 seconds
  SESSIONS: 60000, // 1 minute
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  SCAN_HISTORY_PAGE_SIZE: 20,
  SESSIONS_PAGE_SIZE: 10,
  ATTENDEES_PAGE_SIZE: 50,
} as const;

// ============================================================================
// QR CODE FORMAT
// ============================================================================

export const QR_CODE = {
  PREFIX: 'EMC-ORIENTATION-',
  PATTERN: /^EMC-ORIENTATION-[a-zA-Z0-9]+$/,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NO_SESSIONS: 'No orientation sessions scheduled for this date',
  NO_ATTENDEES: 'No attendees registered for this session',
  NO_SCAN_HISTORY: 'No scan history available',
  INVALID_QR: 'Invalid QR code format',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// ============================================================================
// EMPTY STATE MESSAGES
// ============================================================================

export const EMPTY_STATES = {
  NO_SESSIONS: {
    title: 'No Sessions Today',
    message: 'There are no orientation sessions scheduled for this date.',
    icon: 'calendar-outline',
  },
  NO_ATTENDEES: {
    title: 'No Attendees',
    message: 'No one has registered for this session yet.',
    icon: 'people-outline',
  },
  NO_SCAN_HISTORY: {
    title: 'No Scans Yet',
    message: 'Your scan history will appear here after you check in/out attendees.',
    icon: 'qr-code-outline',
  },
  NO_SEARCH_RESULTS: {
    title: 'No Results Found',
    message: 'Try adjusting your search query.',
    icon: 'search-outline',
  },
} as const;
