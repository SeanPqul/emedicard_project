import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updatePaymentStatusMutation = mutation({
  args: {
    paymentId: v.id("payments"),
    paymentStatus: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Cancelled"),
      v.literal("Expired")
    ),
  },
  handler: async (ctx, { paymentId, paymentStatus }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found");
    await ctx.db.patch(paymentId, { paymentStatus, updatedAt: Date.now() });
    return paymentId;
  },
});


// @deprecated - Use updatePaymentStatusMutation instead. This alias will be removed in a future release.
export const updatePaymentStatus = updatePaymentStatusMutation;
