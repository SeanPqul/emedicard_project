/**
 * Orientation Utilities
 * Functions for managing orientation schedules, status, and formatting
 */

/**
 * Formats a timestamp into a readable date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a timestamp into a readable time string
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Determines the status of an orientation based on check-in/out times and schedule
 */
export const getOrientationStatus = (orientation: any): 'completed' | 'in_progress' | 'missed' | 'scheduled' => {
  if (orientation.checkInTime && orientation.checkOutTime) {
    return 'completed';
  } else if (orientation.checkInTime) {
    return 'in_progress';
  } else if (orientation.scheduleAt < Date.now()) {
    return 'missed';
  } else {
    return 'scheduled';
  }
};

/**
 * Gets the color associated with an orientation status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#10B981'; // success.main
    case 'in_progress':
      return '#F59E0B'; // warning.main
    case 'missed':
      return '#EF4444'; // error.main
    case 'scheduled':
      return '#3B82F6'; // primary.main
    default:
      return '#6B7280'; // text.secondary
  }
};

/**
 * Gets the human-readable text for an orientation status
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'missed':
      return 'Missed';
    case 'scheduled':
      return 'Scheduled';
    default:
      return 'Unknown';
  }
};