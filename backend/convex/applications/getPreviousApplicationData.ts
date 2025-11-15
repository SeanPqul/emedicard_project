import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get previous application data for pre-population during renewal
 * 
 * This query fetches the application data associated with a specific health card
 * to pre-populate the renewal form.
 * 
 * Security:
 * - Verifies the health card belongs to the authenticated user
 * - Only returns sanitized data suitable for form pre-population
 */
export const getPreviousApplicationDataQuery = query({
  args: {
    healthCardId: v.id("healthCards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const healthCard = await ctx.db.get(args.healthCardId);
    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const application = await ctx.db.get(healthCard.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify ownership - CRITICAL security check
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Unauthorized access to health card data");
    }

    const jobCategory = await ctx.db.get(application.jobCategoryId);

    // Return sanitized application data for form pre-population
    return {
      application: {
        firstName: application.firstName,
        middleName: application.middleName,
        lastName: application.lastName,
        suffix: application.suffix,
        age: application.age,
        nationality: application.nationality,
        gender: application.gender,
        position: application.position,
        organization: application.organization,
        civilStatus: application.civilStatus,
        jobCategoryId: application.jobCategoryId,
      },
      jobCategory,
      healthCard: {
        _id: healthCard._id,
        registrationNumber: healthCard.registrationNumber,
        issuedDate: healthCard.issuedDate,
        expiryDate: healthCard.expiryDate,
        status: healthCard.status,
      },
    };
  },
});
