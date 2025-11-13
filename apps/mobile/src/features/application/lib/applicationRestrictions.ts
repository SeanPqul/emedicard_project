/**
 * Application Restrictions Utilities
 * 
 * Helper functions for managing application creation restrictions
 * 
 * Uses WHITELIST approach: Only specific terminal states allow new applications.
 * All other statuses (including any future additions) will block by default.
 */

import { ApplicationStatus } from '@/src/entities/application';

/**
 * Terminal statuses that ALLOW a user to create a new application
 * 
 * These represent completed processes where the user can start fresh:
 * - Approved: User received their health card, can apply for renewal later
 * - Payment Rejected: Application ended, user can try again with valid payment
 * - Referred for Medical Management: Special case requiring external doctor consultation
 */
const TERMINAL_STATUSES: ApplicationStatus[] = [
  'Approved',
  'Payment Rejected',
  'Referred for Medical Management',
];

/**
 * Checks if an application status prevents creating a new application
 * 
 * Returns TRUE if the application is still in progress (blocking new applications)
 * Returns FALSE if the application reached a terminal state (allows new applications)
 * 
 * This uses a whitelist approach for security - any unknown status will block by default
 */
export function isUnresolvedStatus(status: ApplicationStatus): boolean {
  return !TERMINAL_STATUSES.includes(status);
}

/**
 * Checks if a user has any unresolved applications
 * @param applications - Array of user applications
 * @returns Object containing hasUnresolved flag and the unresolved application
 */
export function hasUnresolvedApplication(applications: any[]): {
  hasUnresolved: boolean;
  unresolvedApplication?: any;
} {
  if (!applications || applications.length === 0) {
    return { hasUnresolved: false };
  }

  const unresolvedApp = applications.find(app => 
    isUnresolvedStatus(app.status)
  );

  return {
    hasUnresolved: !!unresolvedApp,
    unresolvedApplication: unresolvedApp,
  };
}

/**
 * Gets a user-friendly message explaining why the user cannot create a new application
 * 
 * Provides context-specific messaging based on the current application status
 */
export function getRestrictionMessage(status: ApplicationStatus): string {
  switch (status) {
    case 'Pending Payment':
      return 'Please complete your payment first before applying again.';
    
    case 'For Payment Validation':
      return 'Your payment is being validated by CHO staff. Please wait for confirmation before applying again.';
    
    case 'For Orientation':
      return 'Please complete your food safety orientation first before applying again.';
    
    case 'Submitted':
      return 'Your application has been submitted and is awaiting review. Please wait for CHO staff to process it.';
    
    case 'Under Review':
      return 'Your application is currently being reviewed by CHO staff. Please wait for the result.';
    
    case 'Documents Need Revision':
      return 'Your documents need revision. Please update your current application before creating a new one.';
    
    // Catch-all for any other in-progress status (including future additions)
    default:
      return 'You have an application in progress. Please wait for it to be completed before applying again.';
  }
}
