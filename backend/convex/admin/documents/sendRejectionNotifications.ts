import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Sends a batch notification to the applicant for all rejected documents
 * that haven't been notified yet. Called when "Reject Application" is clicked.
 */
export const sendRejectionNotifications = internalMutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Verify admin permissions
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!admin) {
        throw new Error("User not found");
      }

      if (admin.role !== "admin" && admin.role !== "inspector") {
        throw new Error("Insufficient permissions. Only admins and inspectors can send notifications.");
      }

      // 2. Get application
      const application = await ctx.db.get(args.applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // 3. Get all rejection history records that haven't been notified yet
      // For backward compatibility: undefined = already notified (old records), false = pending notification
      const allRejections = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();
      
      const pendingRejections = allRejections.filter(
        (rejection) => rejection.notificationSent === false
      );

      if (pendingRejections.length === 0) {
        return {
          success: true,
          message: "No pending rejections to notify",
          notificationsSent: 0,
        };
      }

      // 4. Send individual notification for each rejected document with attempt warnings
      await Promise.all(
        pendingRejections.map(async (rejection) => {
          const docType = await ctx.db.get(rejection.documentTypeId);
          const documentName = docType?.name || "Unknown Document";
          
          // Format specific issues if present
          const specificIssuesText = rejection.specificIssues && rejection.specificIssues.length > 0 
            ? `\n\nSpecific Issues:\n${rejection.specificIssues.map(issue => `• ${issue}`).join('\n')}`
            : '';
          
          // Determine notification content based on attempt number
          let notificationTitle = "Document Rejected";
          let notificationMessage = `Your ${documentName} has been rejected.\n\nReason: ${rejection.rejectionReason}${specificIssuesText}\n\nThis is attempt ${rejection.attemptNumber} of 3.`;
          
          if (rejection.attemptNumber === 2) {
            // 2nd attempt - Warning
            notificationTitle = "⚠️ Document Rejected - Warning";
            notificationMessage = `⚠️ Your ${documentName} has been rejected.\n\nReason: ${rejection.rejectionReason}${specificIssuesText}\n\nThis is attempt ${rejection.attemptNumber} of 3.\n\n⚠️ Warning: You have 1 more attempt remaining. Please review the requirements carefully before resubmitting.`;
          } else if (rejection.attemptNumber === 3) {
            // 3rd attempt - FINAL WARNING (should rarely happen here since max attempts should be handled in rejectDocument)
            notificationTitle = "🚨 Final Attempt - Document Rejected";
            notificationMessage = `🚨 FINAL ATTEMPT: Your ${documentName} has been rejected.\n\nReason: ${rejection.rejectionReason}${specificIssuesText}\n\nThis is your LAST chance (attempt 3 of 3).\n\n⚠️ If this document is rejected again, your application will be permanently closed and you will need to create a new application.\n\nPlease ensure your document meets all requirements before resubmitting.`;
          }
          
          // Send notification
          await ctx.db.insert("notifications", {
            userId: application.userId,
            applicationId: args.applicationId,
            title: notificationTitle,
            message: notificationMessage,
            notificationType: "document_rejected",
            isRead: false,
            jobCategoryId: application.jobCategoryId,
            actionUrl: `/applications/${args.applicationId}/resubmit/${rejection.documentTypeId}`,
          });
        })
      );

      // 7. Mark all rejections as notified
      const currentTime = Date.now();
      await Promise.all(
        pendingRejections.map((rejection) =>
          ctx.db.patch(rejection._id, {
            notificationSent: true,
            notificationSentAt: currentTime,
          })
        )
      );

      // 8. Log activity
      await ctx.db.insert("adminActivityLogs", {
        adminId: admin._id,
        activityType: "rejection_notification_sent",
        details: `Sent batch rejection notification for ${pendingRejections.length} document(s) for application ${args.applicationId}`,
        applicationId: args.applicationId,
        jobCategoryId: application.jobCategoryId,
        timestamp: currentTime,
      });

      return {
        success: true,
        message: `Successfully sent notification for ${pendingRejections.length} rejected document(s)`,
        notificationsSent: pendingRejections.length,
      };
    } catch (error) {
      console.error("Error sending rejection notifications:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: `Failed to send notifications: ${message}`,
        notificationsSent: 0,
      };
    }
  },
});
