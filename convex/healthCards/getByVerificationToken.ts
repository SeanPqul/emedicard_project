import { v } from "convex/values";
import { query } from "../_generated/server";

export const getByVerificationTokenQuery = query({
  args: { verificationToken: v.string() },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_verification_token", (q) => q.eq("verificationToken", args.verificationToken))
      .unique();

    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const application = await ctx.db.get(healthCard.applicationId);
    const user = application ? await ctx.db.get(application.userId) : null;
    const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;

    return {
      ...healthCard,
      application,
      user,
      jobCategory,
    };
  },
});
