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

    // Find admins who manage this job category to notify them
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    
    // Filter admins who manage this category or super admins (no managed categories)
    const relevantAdmins = allAdmins.filter(admin => 
      !admin.managedCategories || 
      admin.managedCategories.length === 0 || 
      admin.managedCategories.includes(application.jobCategoryId)
    );
    
    // Create notifications for relevant admins
    for (const admin of relevantAdmins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        applicationId: args.applicationId,
        title: "Payment Resubmitted",
        message: `${user.fullname} has resubmitted payment for their application after rejection. Please review the new payment submission.`,
        notificationType: "payment_resubmitted",
        isRead: false,
        jobCategoryId: application.jobCategoryId,
        actionUrl: `/dashboard/${args.applicationId}/payment_validation`,
      });
    }

    return {
      success: true,
      message: "Payment resubmitted successfully",
      newPaymentId: args.newPaymentId,
    };
  },
});
