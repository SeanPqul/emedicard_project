import { v } from "convex/values";
import { query } from "../_generated/server";

export const getHealthCardByVerificationToken = query({
  args: { verificationToken: v.string() },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_verificationToken", (q) => q.eq("verificationToken", args.verificationToken))
      .unique();

    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const form = await ctx.db.get(healthCard.formId);
    const user = form ? await ctx.db.get(form.userId) : null;
    const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;

    return {
      ...healthCard,
      form,
      user,
      jobCategory,
    };
  },
});
