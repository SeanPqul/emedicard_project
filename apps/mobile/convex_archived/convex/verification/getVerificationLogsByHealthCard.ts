import { query } from "../_generated/server";
import { v } from "convex/values";

export const getVerificationLogsByHealthCardQuery = query({
  args: { healthCardId: v.id("healthCards") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("verificationLogs")
      .withIndex("by_health_card", (q) => q.eq("healthCardId", args.healthCardId))
      .order("desc")
      .collect();

    return logs;
  },
});


