// convex/admin/payments/rejectPayment.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { AdminRole } from "../../users/roles";

/**
 * Reject a payment and add the rejection to the paymentRejectionHistory table
 * This follows the same pattern as document rejection with detailed tracking
 */
export const rejectPayment = mutation({
  args: {
    applicationId: v.id("applications"),
    paymentId: v.id("payments"),
    rejectionCategory: v.string(),
    rejectionReason: v.string(),
    specificIssues: v.array(v.string()),
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

    // Check for existing payment rejections to determine attempt number
    const existingRejections = await ctx.db
      .query("paymentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    
    const attemptNumber = existingRejections.length + 1;
    const now = Date.now();

    // 1. Create payment rejection history record
    await ctx.db.insert("paymentRejectionHistory", {
      applicationId: args.applicationId,
      paymentId: args.paymentId,
      rejectedReceiptId: payment.receiptStorageId,
      referenceNumber: payment.referenceNumber,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      rejectionCategory: args.rejectionCategory as any,
      rejectionReason: args.rejectionReason,
      specificIssues: args.specificIssues,
      rejectedBy: user._id,
      rejectedAt: now,
      wasReplaced: false,
      attemptNumber,
      notificationSent: true,
      notificationSentAt: now,
    });

    // 2. Update payment status to Failed
    await ctx.db.patch(args.paymentId, {
      paymentStatus: "Failed",
      failureReason: args.rejectionReason,
      updatedAt: now,
    });

    // 3. Update application status to Payment Rejected
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Payment Rejected",
      adminRemarks: args.rejectionReason,
      updatedAt: now,
      lastUpdatedBy: user._id,
    });

    // 4. Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      activityType: "payment_rejection",
      details: `Payment rejected for ${applicant.fullname}. Category: ${args.rejectionCategory}. Reason: ${args.rejectionReason}`,
      timestamp: now,
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
      action: "Payment Rejected",
    });

    // 5. Create notification for applicant
    const specificIssuesText = args.specificIssues.length > 0 
      ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
      : '';
    
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: "Payment Rejected",
      message: `Your payment has been rejected.\n\nReason: ${args.rejectionReason}${specificIssuesText}\n\nPlease resubmit your payment to continue with your application. This is attempt ${attemptNumber}.`,
      notificationType: "payment_rejected",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });

    return { 
      success: true, 
      message: "Payment rejected and applicant notified.",
      attemptNumber,
    };
  },
});
