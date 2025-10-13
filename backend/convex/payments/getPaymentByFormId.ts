import { v } from "convex/values";
import { query } from "../_generated/server";

export const getPaymentByApplicationIdQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    // Return the most recent payment for this application
    return await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .first();
  },
});
