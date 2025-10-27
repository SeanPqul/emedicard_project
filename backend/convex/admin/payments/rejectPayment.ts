// convex/admin/payments/rejectPayment.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { AdminRole } from "../../users/roles";

/**
 * Reject a payment and add the rejection to the history
 * This is separate from document rejection but follows similar pattern
 */
export const rejectPayment = mutation({
  args: {
    applicationId: v.id("applications"),
    paymentId: v.id("payments"),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    // Security check - must be admin
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");

    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) throw new Error("Admin user not found.");

    // Get application details
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found.");

    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    // Get payment details
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found.");

    // 1. Update payment status to Failed
    await ctx.db.patch(args.paymentId, {
      paymentStatus: "Failed",
      failureReason: args.rejectionReason,
      updatedAt: Date.now(),
    });

    // 2. Update application status to Payment Rejected
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Payment Rejected",
      adminRemarks: args.rejectionReason,
      updatedAt: Date.now(),
      lastUpdatedBy: user._id,
    });

    // 3. Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      activityType: "payment_rejection",
      details: `Payment rejected for ${applicant.fullname}. Reason: ${args.rejectionReason}`,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    // 4. Create notification for applicant
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: "Payment Rejected",
      message: `Your payment has been rejected. Reason: ${args.rejectionReason}. Please resubmit your payment to continue with your application.`,
      notificationType: "payment_rejected",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });

    return { 
      success: true, 
      message: "Payment rejected and applicant notified." 
    };
  },
});
