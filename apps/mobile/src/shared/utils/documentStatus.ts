/**
 * Document Status Utilities
 * Provides status information and formatting for document uploads
 */

export interface DocumentStatusInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export type DocumentUploadStatus = 'queued' | 'uploading' | 'completed' | 'failed' | 'verified';

// Flexible UploadState that works with existing component types
export interface UploadState {
  status?: DocumentUploadStatus;
  progress?: number;
  error?: string | null; // Support both null and undefined
  uploading?: boolean;
  uploadedAt?: string;
  success?: boolean;
  queued?: boolean;
}

/**
 * Get status information for a document
 * @param uploadState - Current upload state from useDocumentUpload
 * @param selectedAt - When the document was selected (for queued state)
 * @returns Status information with label, icon, color, and description
 */
export const getDocumentStatusInfo = (
  uploadState?: UploadState,
  selectedAt?: Date
): DocumentStatusInfo => {
  // Uploading state
  if (uploadState?.uploading || uploadState?.status === 'uploading') {
    return {
      label: 'Uploading...',
      icon: 'cloud-upload',
      color: '#F59E0B', // Orange
      description: uploadState?.progress
        ? `${uploadState.progress}% complete`
        : 'Upload in progress',
    };
  }

  // Upload completed
  if (uploadState?.status === 'completed') {
    return {
      label: 'Uploaded',
      icon: 'checkmark-circle',
      color: '#10B981', // Green
      description: uploadState.uploadedAt
        ? `Uploaded ${formatRelativeTime(uploadState.uploadedAt)}`
        : 'Upload successful',
    };
  }

  // Upload failed
  if (uploadState?.error || uploadState?.status === 'failed') {
    return {
      label: 'Upload failed',
      icon: 'alert-circle',
      color: '#EF4444', // Red
      description: uploadState?.error || 'Tap to retry',
    };
  }

  // Verified by admin
  if (uploadState?.status === 'verified') {
    return {
      label: 'Verified',
      icon: 'shield-checkmark',
      color: '#10B981', // Green
      description: 'Approved by admin',
    };
  }

  // Default: Queued/Ready to upload
  return {
    label: 'Ready to upload',
    icon: 'document-attach',
    color: '#6B7280', // Gray
    description: 'Document ready for submission',
  };
};

/**
 * Format relative time (e.g., "just now", "2 minutes ago")
 * @param date - Date string or Date object
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // Format as date if older than a week
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return then.toLocaleDateString('en-US', options);
  }
};

/**
 * Format file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.4 MB")
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Get document type display name
 * @param fieldName - Document field name (e.g., "medicalCertificate")
 * @param documentName - Full document name from requirements
 * @returns User-friendly display name
 */
export const getDocumentTypeLabel = (
  fieldName: string,
  documentName?: string
): string => {
  if (documentName) return documentName;

  // Fallback: Convert fieldName to readable format
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};
