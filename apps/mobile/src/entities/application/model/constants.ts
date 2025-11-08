/**
 * Application Entity Constants
 * 
 * Constants for application status labels, colors, icons, and descriptions
 * Phase 4 Migration: Updated to support medical referral terminology
 */

import { ApplicationStatus } from './types';

// ===== STATUS LABELS =====
export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  'Pending Payment': 'Pending Payment',
  'Payment Rejected': 'Payment Rejected',
  'For Payment Validation': 'For Payment Validation',
  'For Orientation': 'For Orientation',
  'Submitted': 'Submitted',
  'Under Review': 'Under Review',
  'Approved': 'Approved',
  'Rejected': 'Rejected', // DEPRECATED - Permanent rejection only
  // NEW - Phase 4 Migration
  'Documents Need Revision': 'Documents Need Revision',
  'Referred for Medical Management': 'Medical Referral Required',
};

// ===== STATUS COLORS =====
export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  'Pending Payment': '#F59E0B', // Orange
  'Payment Rejected': '#EF4444', // Red
  'For Payment Validation': '#3B82F6', // Blue
  'For Orientation': '#8B5CF6', // Purple
  'Submitted': '#10B981', // Green
  'Under Review': '#3B82F6', // Blue
  'Approved': '#10B981', // Green
  'Rejected': '#EF4444', // Red - DEPRECATED
  // NEW - Phase 4 Migration
  'Documents Need Revision': '#F59E0B', // Orange - for document issues
  'Referred for Medical Management': '#3B82F6', // Blue - for medical referrals
};

// ===== STATUS ICONS =====
// Using Ionicons icon names
export const ApplicationStatusIcons: Record<ApplicationStatus, string> = {
  'Pending Payment': 'time-outline',
  'Payment Rejected': 'close-circle-outline',
  'For Payment Validation': 'card-outline',
  'For Orientation': 'calendar-outline',
  'Submitted': 'checkmark-circle-outline',
  'Under Review': 'eye-outline',
  'Approved': 'checkmark-done-outline',
  'Rejected': 'close-circle-outline', // DEPRECATED
  // NEW - Phase 4 Migration
  'Documents Need Revision': 'document-text-outline', // Orange theme for doc issues
  'Referred for Medical Management': 'medkit-outline', // Blue theme for medical
};

// ===== STATUS DESCRIPTIONS =====
export const ApplicationStatusDescriptions: Record<ApplicationStatus, string> = {
  'Pending Payment': 'Waiting for payment submission',
  'Payment Rejected': 'Payment validation failed',
  'For Payment Validation': 'Payment is being validated',
  'For Orientation': 'Scheduled for orientation',
  'Submitted': 'Application has been submitted',
  'Under Review': 'Application is being reviewed',
  'Approved': 'Application has been approved',
  'Rejected': 'Application has been rejected', // DEPRECATED
  // NEW - Phase 4 Migration
  'Documents Need Revision': 'Some documents need to be corrected and resubmitted',
  'Referred for Medical Management': 'Medical findings require doctor consultation before proceeding',
};

// ===== STATUS CATEGORIES =====
export enum ApplicationStatusCategory {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  NEEDS_ACTION = 'NEEDS_ACTION',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export const ApplicationStatusCategoryMap: Record<ApplicationStatus, ApplicationStatusCategory> = {
  'Pending Payment': ApplicationStatusCategory.PENDING,
  'Payment Rejected': ApplicationStatusCategory.REJECTED,
  'For Payment Validation': ApplicationStatusCategory.IN_PROGRESS,
  'For Orientation': ApplicationStatusCategory.IN_PROGRESS,
  'Submitted': ApplicationStatusCategory.IN_PROGRESS,
  'Under Review': ApplicationStatusCategory.IN_PROGRESS,
  'Approved': ApplicationStatusCategory.COMPLETED,
  'Rejected': ApplicationStatusCategory.REJECTED, // DEPRECATED
  // NEW - Phase 4 Migration
  'Documents Need Revision': ApplicationStatusCategory.NEEDS_ACTION,
  'Referred for Medical Management': ApplicationStatusCategory.NEEDS_ACTION,
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if status requires user action
 */
export function isActionRequiredStatus(status: ApplicationStatus): boolean {
  return ApplicationStatusCategoryMap[status] === ApplicationStatusCategory.NEEDS_ACTION;
}

/**
 * Check if status indicates completion
 */
export function isCompletedStatus(status: ApplicationStatus): boolean {
  return ApplicationStatusCategoryMap[status] === ApplicationStatusCategory.COMPLETED;
}

/**
 * Check if status indicates rejection
 */
export function isRejectedStatus(status: ApplicationStatus): boolean {
  return ApplicationStatusCategoryMap[status] === ApplicationStatusCategory.REJECTED;
}

/**
 * Check if status is medical referral (NEW - Phase 4)
 */
export function isMedicalReferralStatus(status: ApplicationStatus): boolean {
  return status === 'Referred for Medical Management';
}

/**
 * Check if status is document issue (NEW - Phase 4)
 */
export function isDocumentIssueStatus(status: ApplicationStatus): boolean {
  return status === 'Documents Need Revision';
}

/**
 * Get status configuration
 */
export function getStatusConfig(status: ApplicationStatus) {
  return {
    label: ApplicationStatusLabels[status],
    color: ApplicationStatusColors[status],
    icon: ApplicationStatusIcons[status],
    description: ApplicationStatusDescriptions[status],
    category: ApplicationStatusCategoryMap[status],
    isActionRequired: isActionRequiredStatus(status),
    isCompleted: isCompletedStatus(status),
    isRejected: isRejectedStatus(status),
    isMedicalReferral: isMedicalReferralStatus(status),
    isDocumentIssue: isDocumentIssueStatus(status),
  };
}
