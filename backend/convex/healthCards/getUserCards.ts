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
        // Fetch ALL cards for this application and get the most recent one
        const allCards = await ctx.db
          .query("healthCards")
          .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
          .order("desc") // Order by _creationTime descending (newest first)
          .collect();
        
        // Return the most recent card (first in the array after ordering by desc)
        return allCards.length > 0 ? allCards[0] : null;
      })
    );

    // Filter out health cards that have been renewed (superseded by newer cards)
    // A card is superseded if another application has it as previousHealthCardId
    // We only need to check this user's applications since cards are user-specific
    const supersededCardIds = new Set(
      userApplications
        .map(app => app.previousHealthCardId)
        .filter(Boolean)
    );

    const cardsWithDetails = await Promise.all(
      healthCards.filter(Boolean).map(async (card) => {
        const application = await ctx.db.get(card!.applicationId);
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        
        // SERVER-SIDE expiry validation (tamper-proof)
        const now = Date.now();
        const isExpired = now > card!.expiryDate;
        
        return {
          ...card,
          application,
          jobCategory,
          // Add computed fields for security
          isExpired,
          isValid: card!.status === "active" && !isExpired,
        };
      })
    );

    // Filter out superseded cards (cards that have been renewed)
    const activeCards = cardsWithDetails.filter(
      card => !supersededCardIds.has(card._id)
    );

    return activeCards;
  },
});
