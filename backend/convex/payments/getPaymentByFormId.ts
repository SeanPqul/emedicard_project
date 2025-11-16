import { v } from "convex/values";
import { query } from "../_generated/server";

export const getPaymentByApplicationIdQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    // Get all payments for this application
    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();
    
    if (allPayments.length === 0) return null;
    
    // Priority order: Complete > Processing > Pending > Failed > others
    // This ensures we return completed/successful payments over cancelled ones
    const priorityOrder: Record<string, number> = {
      "Complete": 1,
      "Processing": 2,
      "Pending": 3,
      "Failed": 4,
      "Refunded": 5,
      "Cancelled": 6,
      "Expired": 7,
    };
    
    // Sort by priority first, then by creation time (newest first)
    const sortedPayments = allPayments.sort((a, b) => {
      const priorityA = priorityOrder[a.paymentStatus] || 99;
      const priorityB = priorityOrder[b.paymentStatus] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return b._creationTime - a._creationTime;
    });
    
    return sortedPayments[0];
  },
});
