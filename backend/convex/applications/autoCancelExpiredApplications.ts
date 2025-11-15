import { internalMutation } from "../_generated/server";

/**
 * AUTO-CANCEL EXPIRED PENDING PAYMENT APPLICATIONS
 * 
 * Purpose: Automatically cancel applications that haven't been paid within 7 days
 * 
 * This runs as a scheduled cron job to:
 * 1. Find applications with status "Pending Payment"
 * 2. Check if paymentDeadline has passed
 * 3. Cancel the application and notify the user
 * 
 * Business Logic:
 * - Applications must be in "Pending Payment" status
 * - Payment deadline must have passed (current time > paymentDeadline)
 * - Users receive notification about cancellation
 * - Cancelled applications can be viewed in history but cannot be modified
 */

export const cancelExpiredApplications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all "Pending Payment" applications
    const pendingPaymentApps = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("applicationStatus"), "Pending Payment"))
      .collect();
    
    let cancelledCount = 0;
    const cancelled: string[] = [];
    
    for (const application of pendingPaymentApps) {
      // Check if payment deadline has passed
      if (application.paymentDeadline && now > application.paymentDeadline) {
        try {
          // Update application status to "Archived" (softer term than "Cancelled")
          await ctx.db.patch(application._id, {
            applicationStatus: "Archived",
            adminRemarks: "Application automatically archived due to non-payment within 7 days",
            updatedAt: now,
          });
          
          // Create notification for user
          await ctx.db.insert("notifications", {
            userId: application.userId,
            applicationId: application._id,
            title: "Application Archived - Payment Deadline Passed",
            message: "Your application has been archived because payment was not completed within 7 days. You can submit a new application anytime.",
            notificationType: "ApplicationUpdate",
            isRead: false,
          });
          
          cancelledCount++;
          cancelled.push(application._id);
          
          console.log(`[AUTO-ARCHIVE] Archived application ${application._id} - Payment deadline passed`);
        } catch (error) {
          console.error(`[AUTO-CANCEL] Failed to cancel application ${application._id}:`, error);
        }
      }
    }
    
    return {
      success: true,
      cancelledCount,
      cancelledApplications: cancelled,
      checkedCount: pendingPaymentApps.length,
      timestamp: now,
    };
  },
});
