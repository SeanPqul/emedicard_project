import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get payment record by application ID
 * Returns the latest payment for an application
 */
export const getPaymentByApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Find the most recent payment for this application
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .first();
      
    return payment;
  },
});
