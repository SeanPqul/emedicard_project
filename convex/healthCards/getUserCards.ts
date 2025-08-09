import { query } from "../_generated/server";

export const getUserHealthCards = query({
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

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formIds = userForms.map((form) => form._id);

    const healthCards = await Promise.all(
      formIds.map(async (formId) => {
        const card = await ctx.db
          .query("healthCards")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return card;
      })
    );

    const cardsWithDetails = await Promise.all(
      healthCards.filter(Boolean).map(async (card) => {
        const form = await ctx.db.get(card!.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...card,
          form,
          jobCategory,
        };
      })
    );

    return cardsWithDetails;
  },
});
