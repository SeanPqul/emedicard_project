import { Doc } from "../../_generated/dataModel";

/**
 * Centralized Renewal Eligibility Helper
 * 
 * This helper ensures that renewal rules are consistent across:
 * - The eligibility query (for UI display)
 * - The renewal mutation (for server-side enforcement)
 * 
 * This prevents frontend bypasses and keeps all rules in one place.
 */

export interface RenewalEligibilityResult {
  isEligible: boolean;
  reason: string;
  eligibleApplication?: Doc<"applications">;
  eligibleCard?: Doc<"healthCards">;
}

/**
 * Check if a user is eligible to renew their health card
 * 
 * Eligibility Rules:
 * 1. User must have at least one approved application
 * 2. The approved application must have an issued health card
 * 3. User cannot have any pending/unresolved applications (including renewals)
 * 4. Card must be expired OR within 30 days of expiry (30-day rule)
 * 
 * @param applications - All user applications (must include deleted check)
 * @param healthCard - The health card to check for renewal eligibility
 * @returns Structured eligibility result
 */
export function checkRenewalEligibility(
  applications: Doc<"applications">[],
  healthCard: Doc<"healthCards"> | null
): RenewalEligibilityResult {
  // Rule 1: Must have applications
  if (!applications || applications.length === 0) {
    return {
      isEligible: false,
      reason: "No applications found. Please apply for a new health card first.",
    };
  }

  // Rule 2: Check for pending/unresolved applications
  const unresolvedStatuses = [
    "Submitted",
    "For Document Verification",
    "For Payment Validation",
    "For Orientation",
    "Scheduled",
    "For Attendance Validation",
    "Under Review",
    "Documents Need Revision",
    "Pending Payment",
  ];

  const pendingApplications = applications.filter(
    (app) => unresolvedStatuses.includes(app.applicationStatus)
  );

  if (pendingApplications.length > 0) {
    return {
      isEligible: false,
      reason: "You have an application in progress. Please complete or cancel it before renewing.",
    };
  }

  // Rule 3: Check for pending renewal applications specifically
  const pendingRenewal = applications.find(
    (app) =>
      app.applicationType === "Renew" &&
      unresolvedStatuses.includes(app.applicationStatus)
  );

  if (pendingRenewal) {
    return {
      isEligible: false,
      reason: "You already have a renewal application in progress.",
    };
  }

  // Rule 4: Find most recent approved application with health card
  const approvedApplications = applications
    .filter((app) => app.applicationStatus === "Approved")
    .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));

  if (approvedApplications.length === 0) {
    return {
      isEligible: false,
      reason: "No approved application found. Please apply for a new health card first.",
    };
  }

  const mostRecentApprovedApp = approvedApplications[0];

  // Rule 5: Must have a health card
  if (!healthCard) {
    return {
      isEligible: false,
      reason: "No health card found for your approved application. Please contact support.",
    };
  }

  // Rule 6: 30-day rule - Can only renew if expired OR within 30 days of expiry
  const daysUntilExpiry = Math.ceil(
    (healthCard.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 30) {
    return {
      isEligible: false,
      reason: `Your health card is still valid for ${daysUntilExpiry} days. You can renew within 30 days of expiry.`,
    };
  }

  // All checks passed
  return {
    isEligible: true,
    reason: "Eligible for renewal",
    eligibleApplication: mostRecentApprovedApp,
    eligibleCard: healthCard,
  };
}
