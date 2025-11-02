/**
 * Inspector Feature Types
 * 
 * TypeScript type definitions for the inspector module
 */

import type { Id } from '@backend/convex/_generated/dataModel';

// ============================================================================
// ORIENTATION SESSION TYPES
// ============================================================================

/**
 * Orientation session data with attendance information
 */
export interface OrientationSession {
  _id: Id<'orientationSchedules'>;
  date: number; // Timestamp (start of day)
  scheduledTime: string; // e.g., "9:00 AM - 10:00 AM" (renamed from timeSlot)
  venue: string; // e.g., "Gaisano Ilustre"
  maxCapacity: number;
  currentBookings: number;
  attendees: AttendeeData[];
}

/**
 * Computed session statistics
 */
export interface SessionStats {
  totalScheduled: number;
  totalAttendees: number;
  checkedIn: number;
  checkedOut: number;
  completed: number;
  pending: number;
  missed: number;
}

/**
 * Session with computed stats
 */
export interface SessionWithStats extends OrientationSession {
  stats: SessionStats;
  isActive: boolean; // Is this the current time slot?
  isPast: boolean;
  isFuture: boolean;
}

// ============================================================================
// ATTENDEE TYPES
// ============================================================================

/**
 * Attendee data for a specific session
 */
export interface AttendeeData {
  applicationId: Id<'applications'>;
  userId: Id<'users'>;
  fullname: string;
  orientationStatus: 'scheduled' | 'checked-in' | 'completed' | 'cancelled' | 'missed' | 'excused' | 'no-show';
  checkInTime?: number;
  checkOutTime?: number;
  qrCodeUrl: string;
}

/**
 * Computed attendee status
 */
export type AttendeeStatus = 
  | 'completed'    // Checked in and out
  | 'checked-in'   // Checked in only
  | 'pending'      // Not yet checked in
  | 'missed';      // Session ended without attendance

/**
 * Attendee with computed status
 */
export interface AttendeeWithStatus extends AttendeeData {
  status: AttendeeStatus;
  duration?: number; // Duration in milliseconds (for completed)
  isLate?: boolean; // Checked in after session start
}

// ============================================================================
// SCAN HISTORY TYPES
// ============================================================================

/**
 * Scan event record
 */
export interface ScanHistoryItem {
  _id: string;
  scanType: 'check-in' | 'check-out';
  timestamp: number;
  applicationId: Id<'applications'>;
  attendeeName: string;
  sessionScheduledTime: string;
  sessionVenue: string;
  sessionDate: number;
  inspectorId: Id<'users'>;
  duration?: number; // For check-out events, duration of session in ms
}

/**
 * Grouped scan history by date
 */
export interface GroupedScanHistory {
  date: string; // e.g., "Today", "Yesterday", "Jan 15, 2025"
  timestamp: number; // For sorting
  scans: ScanHistoryItem[];
}

/**
 * Scan history filter options
 */
export interface ScanHistoryFilters {
  startDate?: number;
  endDate?: number;
  scanType?: 'check-in' | 'check-out' | 'all';
  searchQuery?: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard statistics for today
 */
export interface DashboardStats {
  totalScheduled: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
  completed: number;
  completionRate?: number; // Percentage (optional)
}

/**
 * Dashboard data including sessions and stats
 */
export interface DashboardData {
  stats: DashboardStats;
  currentSession: SessionWithStats | null;
  upcomingSessions: SessionWithStats[];
  allSessions: SessionWithStats[];
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

/**
 * Search result highlighting
 */
export interface SearchMatch {
  text: string;
  isMatch: boolean;
}

/**
 * Generic filter options
 */
export interface FilterOptions {
  searchQuery: string;
  statusFilter: AttendeeStatus | 'all';
  sortBy: 'name' | 'checkInTime' | 'status';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Loading states for different data fetches
 */
export interface LoadingStates {
  sessions: boolean;
  attendees: boolean;
  scanHistory: boolean;
  stats: boolean;
}

/**
 * Error states
 */
export interface ErrorStates {
  sessions: string | null;
  attendees: string | null;
  scanHistory: string | null;
  stats: string | null;
}

// ============================================================================
// DATE RANGE TYPES
// ============================================================================

/**
 * Date range selection
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Date filter preset
 */
export type DateFilterPreset = 'today' | 'last-7-days' | 'last-30-days' | 'custom';

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

/**
 * Session attendees screen params
 */
export interface SessionAttendeesParams {
  date: number;
  scheduledTime: string;
  venue: string;
}

/**
 * Scan history screen params
 */
export interface ScanHistoryParams {
  filter?: DateFilterPreset;
  startDate?: number;
  endDate?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Async data state
 */
export type AsyncDataState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}
