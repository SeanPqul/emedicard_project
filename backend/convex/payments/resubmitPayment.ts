// convex/payments/resubmitPayment.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Resubmit a payment after rejection
 * This mutation handles the mobile-side payment resubmission process
 * It marks the previous rejection as replaced and creates a new payment record
 */
export const resubmitPayment = mutation({
  args: {
    applicationId: v.id("applications"),
    oldPaymentId: v.id("payments"), // The rejected payment
    newPaymentId: v.id("payments"), // The new payment being submitted
  },
  handler: async (ctx, args) => {
    // Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get application to verify ownership
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");
    
    if (application.userId !== user._id) {
      throw new Error("You can only resubmit payment for your own application");
    }

    // Get the old payment
    const oldPayment = await ctx.db.get(args.oldPaymentId);
    if (!oldPayment) throw new Error("Old payment not found");

    // Get the new payment
    const newPayment = await ctx.db.get(args.newPaymentId);
    if (!newPayment) throw new Error("New payment not found");

    // Find the rejection record for the old payment
    const rejectionRecord = await ctx.db
      .query("paymentRejectionHistory")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.oldPaymentId))
      .order("desc")
      .first();

    const now = Date.now();

    // Mark the rejection as replaced and update status if it exists
    if (rejectionRecord) {
      await ctx.db.patch(rejectionRecord._id, {
        wasReplaced: true,
        replacementPaymentId: args.newPaymentId,
        replacedAt: now,
        status: "resubmitted",
      });
    }

    // Update application status
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "For Payment Validation",
      updatedAt: now,
    });

    // Notification handled by getPaymentRejectionNotifications query
    // No need to create duplicate notifications here since the rejection history
    // with wasReplaced=true will automatically show up as a notification

    return {
      success: true,
      message: "Payment resubmitted successfully",
      newPaymentId: args.newPaymentId,
    };
  },
});
