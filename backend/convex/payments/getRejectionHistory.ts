// convex/payments/getRejectionHistory.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get payment rejection history for an application
 * Used by mobile app to show rejection reasons and history to applicants
 */
export const getRejectionHistory = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    // Get all payment rejection records for this application, ordered by most recent first
    const rejections = await ctx.db
      .query("paymentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    if (rejections.length === 0) {
      return [];
    }

    // Enrich with admin details
    const enrichedRejections = await Promise.all(
      rejections.map(async (rejection) => {
        const admin = await ctx.db.get(rejection.rejectedBy);

        return {
          _id: rejection._id,
          rejectionCategory: rejection.rejectionCategory,
          rejectionReason: rejection.rejectionReason,
          specificIssues: rejection.specificIssues || [],
          rejectedAt: rejection.rejectedAt,
          rejectedBy: rejection.rejectedBy,
          rejectedByName: admin?.fullname || "Admin",
          rejectedByEmail: admin?.email || "",
          attemptNumber: rejection.attemptNumber,
          wasReplaced: rejection.wasReplaced,
          replacedAt: rejection.replacedAt,
          replacementPaymentId: rejection.replacementPaymentId,
          status: rejection.status || "pending",
          // Include payment details for reference
          paymentMethod: rejection.paymentMethod,
          referenceNumber: rejection.referenceNumber,
          amount: rejection.amount,
        };
      })
    );

    return enrichedRejections;
  },
});
