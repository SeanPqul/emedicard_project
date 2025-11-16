import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get health card by ID
 */
export const get = query({
  args: {
    healthCardId: v.id("healthCards"),
  },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db.get(args.healthCardId);
    return healthCard;
  },
});

/**
 * Get health card for an application
 */
export const getByApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();

    return healthCard;
  },
});

/**
 * Get health card by registration number (for verification)
 */
export const getByRegistration = query({
  args: {
    registrationNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_registration", (q) => q.eq("registrationNumber", args.registrationNumber))
      .first();

    if (!healthCard) return null;

    // Check if expired
    const now = Date.now();
    const isExpired = now > healthCard.expiryDate;

    const application = await ctx.db.get(healthCard.applicationId);
    if (!application) return null;

    const user = await ctx.db.get(application.userId);
    if (!user) return null;

    // Get job category for display
    const jobCategory = await ctx.db.get(application.jobCategoryId);

    return {
      ...healthCard,
      isExpired,
      isValid: healthCard.status === "active" && !isExpired,
      applicantName: user.fullname,
      jobCategory: jobCategory ? { name: jobCategory.name } : undefined,
    };
  },
});
