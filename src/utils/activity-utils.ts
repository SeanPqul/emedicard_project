import { getColor } from '../styles/theme';

export interface Activity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued' | 'document_upload';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

export const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'application':
      return 'document-text-outline';
    case 'payment':
      return 'card-outline';
    case 'orientation':
      return 'calendar-outline';
    case 'card_issued':
      return 'shield-checkmark-outline';
    case 'document_upload':
      return 'cloud-upload-outline';
    default:
      return 'information-circle-outline';
  }
};

export const getActivityStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return getColor('success.main');
    case 'error':
      return getColor('error.main');
    case 'warning':
      return getColor('warning.main');
    default:
      return getColor('text.secondary');
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};