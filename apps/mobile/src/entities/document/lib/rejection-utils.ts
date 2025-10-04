import { EnrichedRejectionHistory, RejectionCategory } from '../model/rejection-types';

/**
 * Utility function to check if a document has active rejections
 */
export function hasActiveRejection(rejection: EnrichedRejectionHistory | null): boolean {
  return !!rejection && !rejection.wasReplaced;
}

/**
 * Utility function to calculate rejection rate
 */
export function calculateRejectionRate(
  totalDocuments: number,
  rejectedDocuments: number
): number {
  if (totalDocuments === 0) return 0;
  return Math.round((rejectedDocuments / totalDocuments) * 100);
}

/**
 * Utility function to format rejection date
 */
export function formatRejectionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Utility function to get rejection severity
 */
export function getRejectionSeverity(category: RejectionCategory): 'high' | 'medium' | 'low' {
  const highSeverity: RejectionCategory[] = [
    RejectionCategory.INVALID_DOCUMENT,
    RejectionCategory.WRONG_DOCUMENT,
    RejectionCategory.EXPIRED_DOCUMENT,
  ];
  
  const mediumSeverity: RejectionCategory[] = [
    RejectionCategory.INCOMPLETE_DOCUMENT,
    RejectionCategory.QUALITY_ISSUE,
  ];

  if (highSeverity.includes(category)) return 'high';
  if (mediumSeverity.includes(category)) return 'medium';
  return 'low';
}
