import { v } from "convex/values";
import { query } from "../_generated/server";

export const getByApplicationIdQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    return healthCard;
  },
});
