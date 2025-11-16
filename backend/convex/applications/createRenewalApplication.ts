import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { checkRenewalEligibility } from "./lib/renewalEligibility";

/**
 * Create a renewal application
 * 
 * This mutation enforces eligibility checks server-side using the
 * centralized helper to prevent bypassing frontend restrictions.
 * 
 * Features:
 * - Links to previous health card
 * - Pre-populates data from previous application
 * - Enforces strict eligibility checks
 * - Calculates renewal count
 */
export const createRenewalApplicationMutation = mutation({
  args: {
    previousHealthCardId: v.id("healthCards"),
    jobCategoryId: v.id("jobCategories"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    suffix: v.optional(v.string()),
    age: v.optional(v.number()),
    nationality: v.optional(v.string()),
    gender: v.optional(
      v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the health card belongs to this user
    const previousCard = await ctx.db.get(args.previousHealthCardId);
    if (!previousCard) {
      throw new Error("Previous health card not found");
    }

    const previousApplication = await ctx.db.get(previousCard.applicationId);
    if (!previousApplication || previousApplication.userId !== user._id) {
      throw new Error("Previous health card does not belong to this user");
    }

    // Get all user applications for eligibility check
    const userApplications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // CRITICAL: Use centralized eligibility helper for server-side enforcement
    const eligibilityResult = checkRenewalEligibility(
      userApplications,
      previousCard
    );

    if (!eligibilityResult.isEligible) {
      throw new Error(eligibilityResult.reason);
    }

    // Calculate renewal count from previous approved renewals
    const previousRenewals = userApplications.filter(
      (app) =>
        app.applicationType === "Renew" &&
        app.applicationStatus === "Approved"
    );

    const renewalCount = previousRenewals.length + 1;

    // Create renewal application with pre-populated data
    const renewalApplicationId = await ctx.db.insert("applications", {
      userId: user._id,
      applicationType: "Renew",
      applicationStatus: "Draft",
      jobCategoryId: args.jobCategoryId,
      position: args.position,
      organization: args.organization,
      civilStatus: args.civilStatus,
      // Personal details - use provided or fallback to previous
      firstName: args.firstName || previousApplication.firstName,
      middleName: args.middleName || previousApplication.middleName,
      lastName: args.lastName || previousApplication.lastName,
      suffix: args.suffix || previousApplication.suffix,
      age: args.age || previousApplication.age,
      nationality: args.nationality || previousApplication.nationality,
      gender: args.gender || previousApplication.gender,
      // CRITICAL: Preserve securityGuard flag for document requirements
      securityGuard: previousApplication.securityGuard,
      // Renewal tracking fields
      previousHealthCardId: args.previousHealthCardId,
      isRenewal: true,
      renewalCount,
    });

    return renewalApplicationId;
  },
});
