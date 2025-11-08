/**
 * Application Status Utility Functions
 * 
 * Helper functions for working with application statuses.
 * Phase 4 Migration: Supports new medical referral terminology.
 */

import { ApplicationStatus } from '../model/types';
import {
  ApplicationStatusColors,
  ApplicationStatusIcons,
  ApplicationStatusLabels,
  isMedicalReferralStatus,
  isDocumentIssueStatus,
  isActionRequiredStatus,
  isCompletedStatus,
  isRejectedStatus,
} from '../model/constants';

/**
 * Get the display label for an application status
 */
export function getStatusLabel(status: ApplicationStatus): string {
  return ApplicationStatusLabels[status] || status;
}

/**
 * Get the color for an application status
 */
export function getStatusColor(status: ApplicationStatus): string {
  return ApplicationStatusColors[status] || '#6B7280'; // Default gray
}

/**
 * Get the icon name for an application status
 */
export function getStatusIcon(status: ApplicationStatus): string {
  return ApplicationStatusIcons[status] || 'document';
}

/**
 * Check if status is a medical referral
 */
export function isStatusMedicalReferral(status: ApplicationStatus): boolean {
  return isMedicalReferralStatus(status);
}

/**
 * Check if status is a document issue
 */
export function isStatusDocumentIssue(status: ApplicationStatus): boolean {
  return isDocumentIssueStatus(status);
}

/**
 * Check if status requires user action
 */
export function isStatusActionRequired(status: ApplicationStatus): boolean {
  return isActionRequiredStatus(status);
}

/**
 * Check if status indicates completion
 */
export function isStatusCompleted(status: ApplicationStatus): boolean {
  return isCompletedStatus(status);
}

/**
 * Check if status indicates rejection
 */
export function isStatusRejected(status: ApplicationStatus): boolean {
  return isRejectedStatus(status);
}

/**
 * Get a user-friendly description for a status
 */
export function getStatusDescription(status: ApplicationStatus): string {
  switch (status) {
    case 'Pending Payment':
      return 'Payment required to proceed with your application';
    case 'Payment Rejected':
      return 'Payment was not accepted. Please resubmit payment';
    case 'For Payment Validation':
      return 'Your payment is being verified';
    case 'For Orientation':
      return 'Please attend the scheduled orientation';
    case 'Submitted':
      return 'Application submitted and awaiting review';
    case 'Under Review':
      return 'Your application is being reviewed';
    case 'Approved':
      return 'Application approved! Your health card is ready';
    case 'Rejected': // DEPRECATED
      return 'Application was rejected. Please check remarks';
    // Phase 4 Migration: New statuses
    case 'Documents Need Revision':
      return 'Some documents need to be corrected and resubmitted';
    case 'Referred for Medical Management':
      return 'Medical consultation required before proceeding';
    default:
      return 'Status unknown';
  }
}

/**
 * Get action text for a status (what the user should do)
 */
export function getStatusActionText(status: ApplicationStatus): string | null {
  switch (status) {
    case 'Pending Payment':
      return 'Pay Now';
    case 'Payment Rejected':
      return 'Resubmit Payment';
    case 'For Orientation':
      return 'View Schedule';
    case 'Documents Need Revision':
      return 'Fix Documents';
    case 'Referred for Medical Management':
      return 'View Doctor Info';
    default:
      return null;
  }
}

/**
 * Determine status priority for sorting (lower number = higher priority)
 */
export function getStatusPriority(status: ApplicationStatus): number {
  switch (status) {
    case 'Referred for Medical Management': return 1; // Highest priority
    case 'Documents Need Revision': return 2;
    case 'Payment Rejected': return 3;
    case 'Pending Payment': return 4;
    case 'For Orientation': return 5;
    case 'Under Review': return 6;
    case 'For Payment Validation': return 7;
    case 'Submitted': return 8;
    case 'Approved': return 9;
    case 'Rejected': return 10; // DEPRECATED
    default: return 99;
  }
}

/**
 * Check if two statuses are in the same category
 */
export function areSimilarStatuses(status1: ApplicationStatus, status2: ApplicationStatus): boolean {
  const category1 = getStatusCategory(status1);
  const category2 = getStatusCategory(status2);
  return category1 === category2;
}

/**
 * Get status category for grouping
 */
export function getStatusCategory(status: ApplicationStatus): 'action_required' | 'in_progress' | 'completed' | 'rejected' {
  if (isActionRequiredStatus(status)) return 'action_required';
  if (isCompletedStatus(status)) return 'completed';
  if (isRejectedStatus(status)) return 'rejected';
  return 'in_progress';
}
