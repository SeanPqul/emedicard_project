import { query } from "../_generated/server";
import { checkRenewalEligibility } from "./lib/renewalEligibility";

/**
 * Check if user is eligible for health card renewal
 * 
 * This query uses the centralized eligibility helper to ensure
 * consistent rules across both the frontend UX and backend enforcement.
 * 
 * Eligibility Criteria:
 * - User must have at least one approved application
 * - User must have an issued health card
 * - User cannot have a pending renewal application
 * - User cannot have an active application in progress
 * - Card must be expired OR within 30 days of expiry
 */
export const checkRenewalEligibilityQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isEligible: false,
        reason: "Not authenticated",
        previousCard: null,
        previousApplication: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        isEligible: false,
        reason: "User not found",
        previousCard: null,
        previousApplication: null,
      };
    }

    // Get all user applications (exclude deleted)
    const userApplications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Find most recent approved application
    const approvedApplications = userApplications
      .filter((app) => app.applicationStatus === "Approved")
      .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));

    if (approvedApplications.length === 0) {
      return {
        isEligible: false,
        reason: "No approved application found. Please apply for a new health card first.",
        previousCard: null,
        previousApplication: null,
      };
    }

    const mostRecentApprovedApp = approvedApplications[0]!; // Safe: we checked length above

    // Get health card for the approved application
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", mostRecentApprovedApp._id)
      )
      .first();

    // Use centralized eligibility helper
    const eligibilityResult = checkRenewalEligibility(
      userApplications,
      healthCard
    );

    if (!eligibilityResult.isEligible) {
      return {
        isEligible: false,
        reason: eligibilityResult.reason,
        previousCard: null,
        previousApplication: null,
      };
    }

    // Safety check: at this point eligibilityResult.isEligible is true, so we should have eligibleApplication
    if (!eligibilityResult.eligibleApplication) {
      return {
        isEligible: false,
        reason: "Application data not found",
        previousCard: null,
        previousApplication: null,
      };
    }

    // Get job category for continuity
    const jobCategory = await ctx.db.get(eligibilityResult.eligibleApplication.jobCategoryId);

    // Calculate additional card metadata
    const daysUntilExpiry = healthCard
      ? Math.ceil(
          (healthCard.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const isExpired = daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

    return {
      isEligible: true,
      reason: "Eligible for renewal",
      previousCard: healthCard
        ? {
            ...healthCard,
            jobCategory,
            isExpired,
            isExpiringSoon,
            daysUntilExpiry,
          }
        : null,
      previousApplication: {
        ...eligibilityResult.eligibleApplication,
        jobCategory,
      },
    };
  },
});
