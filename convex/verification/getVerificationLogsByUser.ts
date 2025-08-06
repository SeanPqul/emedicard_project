import { query } from "../_generated/server";
import { v } from "convex/values";

export const getVerificationLogsByUser = query({
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

    const cardIds = healthCards.filter(Boolean).map((card) => card!._id);

    const allLogs = await Promise.all(
      cardIds.map(async (cardId) => {
        const logs = await ctx.db
          .query("verificationLogs")
          .withIndex("by_healthcard", (q) => q.eq("healthCardId", cardId))
          .collect();
        return logs;
      })
    );

    const logsWithDetails = await Promise.all(
      allLogs.flat().map(async (log) => {
        const healthCard = await ctx.db.get(log.healthCardId);
        const form = healthCard ? await ctx.db.get(healthCard.formId) : null;
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...log,
          healthCard,
          form,
          jobCategory,
        };
      })
    );

    return logsWithDetails.sort((a, b) => b.scannedAt - a.scannedAt);
  },
});
