// convex/admin/payments/rejectPayment.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { AdminRole } from "../../users/roles";
import { requireWriteAccess } from "../../users/permissions";
import { REJECTION_LIMITS, hasReachedMaxAttempts } from "../../config/rejectionLimits";

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
    
    // Prevent system admins from rejecting payments (read-only oversight)
    await requireWriteAccess(ctx);

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
      paymentLocation: payment.paymentLocation,
      amount: payment.amount,
      rejectionCategory: args.rejectionCategory as any,
      rejectionReason: args.rejectionReason,
      specificIssues: args.specificIssues,
      rejectedBy: user._id,
      rejectedAt: now,
      wasReplaced: false,
      attemptNumber,
      status: "pending",
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

    // 5. Create notification for applicant with attempt warnings
    const specificIssuesText = args.specificIssues.length > 0 
      ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
      : '';
    
    // Check if max attempts reached
    const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'payment');
    const maxAttempts = REJECTION_LIMITS.PAYMENTS.MAX_ATTEMPTS;
    
    let notificationMessage = `Your payment has been rejected.\n\nReason: ${args.rejectionReason}${specificIssuesText}\n\nThis is attempt ${attemptNumber} of ${maxAttempts}.`;
    let notificationTitle = "Payment Rejected";
    
    if (maxAttemptsReached) {
      // Max attempts reached - lock application and send critical notification
      notificationTitle = "Maximum Payment Attempts Reached";
      notificationMessage = `You have reached the maximum number of payment attempts (${maxAttempts}).\n\nYour application has been locked and will be reviewed by our support team.\n\nLast Rejection Reason: ${args.rejectionReason}${specificIssuesText}\n\nOur team will contact you within 48 hours. You may also contact support for immediate assistance.`;
      
      // Lock the application
      if (REJECTION_LIMITS.BEHAVIOR.AUTO_LOCK_APPLICATION) {
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "Under Administrative Review",
          adminRemarks: `Application requires manual review: Maximum payment submission attempts (${maxAttempts}) has been reached. Pending support team evaluation.`,
          updatedAt: Date.now(),
        });
      }
      
      // Notify all admins about max attempts
      const allAdminsForMaxAlert = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      
      for (const adminUser of allAdminsForMaxAlert) {
        // Notify all admins who manage this category
        if (!adminUser.managedCategories || 
            adminUser.managedCategories.length === 0 || 
            adminUser.managedCategories.includes(application.jobCategoryId)) {
          await ctx.db.insert("notifications", {
            userId: adminUser._id,
            notificationType: "max_attempts_reached",
            title: `Max Payment Attempts - ${applicant.fullname}`,
            message: `${applicant.fullname} has reached maximum payment attempts (${maxAttempts}). Application is locked and requires manual review.`,
            actionUrl: `/dashboard/${args.applicationId}/payment_validation`,
            applicationId: args.applicationId,
            jobCategoryId: application.jobCategoryId,
            isRead: false,
          });
        }
      }
    } else if (attemptNumber === REJECTION_LIMITS.PAYMENTS.FINAL_ATTEMPT_WARNING) {
      // Final attempt warning
      notificationTitle = "Final Payment Attempt Warning";
      notificationMessage = `FINAL ATTEMPT: This is your last chance to submit payment correctly.\n\nReason for rejection: ${args.rejectionReason}${specificIssuesText}\n\nAttempts: ${attemptNumber} of ${maxAttempts}\n\nPlease review the requirements carefully before resubmitting. If you need help, contact our support team.`;
    } else if (attemptNumber === REJECTION_LIMITS.PAYMENTS.WARNING_THRESHOLD) {
      // Warning threshold
      notificationMessage = `Your payment has been rejected.\n\nReason: ${args.rejectionReason}${specificIssuesText}\n\nAttempts: ${attemptNumber} of ${maxAttempts}\n\nWarning: You have ${maxAttempts - attemptNumber} attempt(s) remaining. Please review carefully before resubmitting.`;
    }
    
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: notificationTitle,
      message: notificationMessage,
      notificationType: maxAttemptsReached ? "payment_max_attempts" : "payment_rejected",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });

    // 6. Notify OTHER admins about the rejection (not the one who rejected)
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    
    // Filter: relevant admins who DIDN'T reject (excluding current admin)
    const otherRelevantAdmins = allAdmins.filter(admin => 
      admin._id !== user._id && ( // Exclude the rejecting admin
        !admin.managedCategories || 
        admin.managedCategories.length === 0 || 
        admin.managedCategories.includes(application.jobCategoryId)
      )
    );

    console.log('📢 Notifying', otherRelevantAdmins.length, 'other admins about rejection');

    // Notify other admins
    for (const admin of otherRelevantAdmins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        applicationId: args.applicationId,
        title: "Payment Rejected by Colleague",
        message: `${user.fullname} rejected payment for ${applicant.fullname}. Reason: ${args.rejectionReason}`,
        notificationType: "payment_rejection_info",
        isRead: false,
        jobCategoryId: application.jobCategoryId,
        actionUrl: `/dashboard/${args.applicationId}/payment_validation`,
      });
    }

    return { 
      success: true, 
      message: "Payment rejected and applicant notified.",
      attemptNumber,
      maxAttemptsReached: maxAttemptsReached,
      isFinalAttempt: attemptNumber === REJECTION_LIMITS.PAYMENTS.FINAL_ATTEMPT_WARNING,
      remainingAttempts: Math.max(0, maxAttempts - attemptNumber),
    };
  },
});
