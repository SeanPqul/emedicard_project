/**
 * Inspector Feature Utilities
 * 
 * Helper functions for the inspector module
 */

import type {
  AttendeeData,
  AttendeeStatus,
  AttendeeWithStatus,
  OrientationSession,
  SessionStats,
  SessionWithStats,
  ScanHistoryItem,
  GroupedScanHistory,
} from './types';
import { QR_CODE } from './constants';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Get start of day timestamp (00:00:00)
 */
export const getStartOfDay = (date: Date | number = new Date()): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Get end of day timestamp (23:59:59)
 */
export const getEndOfDay = (date: Date | number = new Date()): number => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

/**
 * Format timestamp to time string (e.g., "9:30 AM")
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format timestamp to date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format timestamp to relative date (e.g., "Today", "Yesterday")
 */
export const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = getStartOfDay();
  const yesterday = getStartOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const dateStart = getStartOfDay(date);

  if (dateStart === today) return 'Today';
  if (dateStart === yesterday) return 'Yesterday';
  
  return formatDate(timestamp);
};

/**
 * Calculate duration between two timestamps
 * @returns Duration string (e.g., "1h 30m", "45m")
 */
export const formatDuration = (startTime: number, endTime: number): string => {
  const durationMs = endTime - startTime;
  const minutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Check if timestamp is in the past
 */
export const isPast = (timestamp: number): boolean => {
  return timestamp < Date.now();
};

/**
 * Check if timestamp is in the future
 */
export const isFuture = (timestamp: number): boolean => {
  return timestamp > Date.now();
};

/**
 * Parse time slot string to get start and end times
 * @example "9:00 AM - 10:00 AM" => { start: "9:00 AM", end: "10:00 AM" }
 */
export const parseTimeSlot = (timeSlot: string): { start: string; end: string } => {
  const [start, end] = timeSlot.split(' - ').map((t: string) => t.trim());
  return { start: start || '', end: end || '' };
};

/**
 * Check if current time is within a time slot
 * @param timeSlot Time slot string (e.g., "9:00 AM - 10:00 AM")
 * @param date Session date timestamp (optional, defaults to today)
 */
export const isTimeSlotActive = (timeSlot: string, date?: number): boolean => {
  const now = new Date();
  const sessionDate = date ? new Date(date) : now;
  
  // Check if it's the same day
  if (getStartOfDay(now) !== getStartOfDay(sessionDate)) {
    return false;
  }
  
  const { start, end } = parseTimeSlot(timeSlot);
  
  // Convert time strings to timestamps for today
  const startTime = parseTimeString(start);
  const endTime = parseTimeString(end);
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  return currentTime >= startTime && currentTime < endTime;
};

/**
 * Convert time string to minutes since midnight
 * @example "9:30 AM" => 570
 */
const parseTimeString = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  if (!time || !period) return 0;
  
  const timeParts = time.split(':').map(Number);
  const hours = timeParts[0];
  const minutes = timeParts[1];
  
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) return 0;
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  return hour24 * 60 + minutes;
};

// ============================================================================
// ATTENDEE STATUS UTILITIES
// ============================================================================

/**
 * Determine attendee status based on check-in/out data
 */
export const getAttendeeStatus = (attendee: AttendeeData): AttendeeStatus => {
  if (attendee.checkInTime && attendee.checkOutTime) {
    return 'completed';
  }
  if (attendee.checkInTime) {
    return 'checked-in';
  }
  if (attendee.orientationStatus === 'Missed') {
    return 'missed';
  }
  return 'pending';
};

/**
 * Enhance attendee data with computed status
 */
export const enrichAttendeeData = (attendee: AttendeeData): AttendeeWithStatus => {
  const status = getAttendeeStatus(attendee);
  
  const enriched: AttendeeWithStatus = {
    ...attendee,
    status,
  };

  // Calculate duration for completed attendees
  if (status === 'completed' && attendee.checkInTime && attendee.checkOutTime) {
    enriched.duration = attendee.checkOutTime - attendee.checkInTime;
  }

  // Check if late (checked in after session start - simplified for now)
  if (attendee.checkInTime) {
    enriched.isLate = false; // TODO: Implement proper late detection with session start time
  }

  return enriched;
};

// ============================================================================
// SESSION STATISTICS UTILITIES
// ============================================================================

/**
 * Calculate session statistics from attendee list
 */
export const calculateSessionStats = (attendees: AttendeeData[]): SessionStats => {
  const stats: SessionStats = {
    totalScheduled: attendees.length,
    totalAttendees: attendees.length,
    checkedIn: 0,
    checkedOut: 0,
    completed: 0,
    pending: 0,
    missed: 0,
  };

  attendees.forEach((attendee) => {
    const status = getAttendeeStatus(attendee);
    
    if (attendee.checkInTime) stats.checkedIn++;
    if (attendee.checkOutTime) stats.checkedOut++;
    
    switch (status) {
      case 'completed':
        stats.completed++;
        break;
      case 'checked-in':
        // Already counted in checkedIn
        break;
      case 'pending':
        stats.pending++;
        break;
      case 'missed':
        stats.missed++;
        break;
    }
  });

  return stats;
};

/**
 * Enhance session data with computed stats and time checks
 */
export const enrichSessionData = (session: OrientationSession): SessionWithStats => {
  const stats = calculateSessionStats(session.attendees);
  const isActive = isTimeSlotActive(session.timeSlot, session.date);
  
  // Determine if session is past or future
  const { end } = parseTimeSlot(session.timeSlot);
  const endTimeMinutes = parseTimeString(end);
  const sessionEndTime = new Date(session.date);
  sessionEndTime.setHours(Math.floor(endTimeMinutes / 60), endTimeMinutes % 60);
  
  return {
    ...session,
    stats,
    isActive,
    isPast: isPast(sessionEndTime.getTime()),
    isFuture: isFuture(session.date),
  };
};

// ============================================================================
// QR CODE UTILITIES
// ============================================================================

/**
 * Validate QR code format
 */
export const isValidOrientationQR = (qrData: string): boolean => {
  return QR_CODE.PATTERN.test(qrData);
};

/**
 * Extract application ID from QR code
 */
export const parseOrientationQR = (qrData: string): string | null => {
  if (!isValidOrientationQR(qrData)) return null;
  return qrData.replace(QR_CODE.PREFIX, '');
};

/**
 * Generate QR code string from application ID
 */
export const generateOrientationQR = (applicationId: string): string => {
  return `${QR_CODE.PREFIX}${applicationId}`;
};

// ============================================================================
// SCAN HISTORY UTILITIES
// ============================================================================

/**
 * Group scan history items by date
 */
export const groupScanHistoryByDate = (
  scans: ScanHistoryItem[]
): GroupedScanHistory[] => {
  const grouped = new Map<string, ScanHistoryItem[]>();

  scans.forEach((scan) => {
    const dateKey = formatRelativeDate(scan.timestamp);
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, scan]);
  });

  const result: GroupedScanHistory[] = [];
  grouped.forEach((scans, dateKey) => {
    result.push({
      date: dateKey,
      timestamp: scans[0]?.timestamp || 0,
      scans: scans.sort((a, b) => b.timestamp - a.timestamp), // Most recent first
    });
  });

  return result.sort((a, b) => b.timestamp - a.timestamp);
};

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

/**
 * Filter attendees by search query (name)
 */
export const filterAttendeesBySearch = (
  attendees: AttendeeWithStatus[],
  searchQuery: string
): AttendeeWithStatus[] => {
  if (!searchQuery.trim()) return attendees;
  
  const query = searchQuery.toLowerCase().trim();
  return attendees.filter((attendee) =>
    attendee.fullname.toLowerCase().includes(query)
  );
};

/**
 * Sort attendees by different criteria
 */
export const sortAttendees = (
  attendees: AttendeeWithStatus[],
  sortBy: 'name' | 'checkInTime' | 'status',
  sortOrder: 'asc' | 'desc' = 'asc'
): AttendeeWithStatus[] => {
  const sorted = [...attendees];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.fullname.localeCompare(b.fullname);
        break;
      case 'checkInTime':
        comparison = (a.checkInTime || 0) - (b.checkInTime || 0);
        break;
      case 'status':
        const statusOrder = { completed: 1, 'checked-in': 2, pending: 3, missed: 4 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

// ============================================================================
// PERCENTAGE UTILITIES
// ============================================================================

/**
 * Calculate completion percentage
 */
export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};
