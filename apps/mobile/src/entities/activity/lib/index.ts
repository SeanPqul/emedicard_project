// Activity utility functions
import { ActivityType, ActivityStatus } from '../model/types';

/**
 * Get the appropriate icon name for an activity type
 */
export const getActivityIcon = (type: ActivityType): string => {
  switch (type) {
    case 'application':
      return 'document-text-outline';
    case 'payment':
      return 'card-outline';
    case 'orientation':
      return 'calendar-outline';
    case 'card_issued':
      return 'card-outline';
    case 'document_upload':
      return 'document-attach-outline';
    default:
      return 'information-circle-outline';
  }
};

/**
 * Get the color for an activity status
 */
export const getActivityStatusColor = (status: ActivityStatus): string => {
  switch (status) {
    case 'success':
      return '#10B981'; // Green
    case 'error':
      return '#EF4444'; // Red
    case 'warning':
      return '#F59E0B'; // Yellow
    case 'pending':
    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Format a timestamp for display
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};
