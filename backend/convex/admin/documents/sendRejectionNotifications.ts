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

      // 4. Send individual notification for each rejected document
      await Promise.all(
        pendingRejections.map(async (rejection) => {
          const docType = await ctx.db.get(rejection.documentTypeId);
          const documentName = docType?.name || "Unknown Document";
          
          // Send individual notification for this rejected document
          await ctx.db.insert("notifications", {
            userId: application.userId,
            applicationId: args.applicationId,
            title: "Document Rejected",
            message: `Your ${documentName} has been rejected. Reason: ${rejection.rejectionReason}. Please upload a new document.`,
            notificationType: "DocumentRejection",
            isRead: false,
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
