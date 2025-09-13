import { query } from "../_generated/server";
import { v } from "convex/values";

export const getVerificationLogsByUserQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const userApplications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const applicationIds = userApplications.map((application) => application._id);

    const healthCards = await Promise.all(
      applicationIds.map(async (applicationId) => {
        const card = await ctx.db
          .query("healthCards")
          .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
          .unique();
        return card;
      })
    );

    const cardIds = healthCards.filter(Boolean).map((card) => card!._id);

    const allLogs = await Promise.all(
      cardIds.map(async (cardId) => {
        const logs = await ctx.db
          .query("verificationLogs")
          .withIndex("by_health_card", (q) => q.eq("healthCardId", cardId))
          .collect();
        return logs;
      })
    );

    const logsWithDetails = await Promise.all(
      allLogs.flat().map(async (log) => {
        const healthCard = await ctx.db.get(log.healthCardId);
        const application = healthCard ? await ctx.db.get(healthCard.applicationId) : null;
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        return {
          ...log,
          healthCard,
          application,
          jobCategory,
        };
      })
    );

    return logsWithDetails.sort((a, b) => b.scannedAt - a.scannedAt);
  },
});


// @deprecated - Use getVerificationLogsByUserQuery instead. This alias will be removed in a future release.
export const getVerificationLogsByUser = getVerificationLogsByUserQuery;
