import { query } from "../_generated/server";

export const getUserCardsQuery = query({
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

    const cardsWithDetails = await Promise.all(
      healthCards.filter(Boolean).map(async (card) => {
        const application = await ctx.db.get(card!.applicationId);
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        return {
          ...card,
          application,
          jobCategory,
        };
      })
    );

    return cardsWithDetails;
  },
});
