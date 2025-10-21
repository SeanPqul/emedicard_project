import { v } from "convex/values";
import { query } from "../_generated/server";

export const getRejectionHistoryNotifications = query({
  args: {
    jobCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // Only get rejection history where documents were actually resubmitted (wasReplaced = true)
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .collect();

    // Filter by job category if provided
    let filteredRejections = rejectionHistory;
    if (args.jobCategory) {
      filteredRejections = await Promise.all(
        rejectionHistory.map(async (rejection) => {
          const application = await ctx.db.get(rejection.applicationId);
          if (!application) return null;
          const jobCategory = await ctx.db.get(application.jobCategoryId);
          return jobCategory?.name === args.jobCategory ? rejection : null;
        })
      ).then(results => results.filter(r => r !== null) as typeof rejectionHistory);
    }

    const notifications = await Promise.all(
      filteredRejections.map(async (rejection) => {
        const application = await ctx.db.get(rejection.applicationId);
        const user = application ? await ctx.db.get(application.userId) : null;
        const documentType = await ctx.db.get(rejection.documentTypeId);
        
        // Check if current admin has read this notification
        const isReadByCurrentAdmin = rejection.adminReadBy?.includes(admin._id) || false;
        
        return {
          _id: rejection._id,
          title: `Document Resubmitted`,
          message: `${user?.fullname || 'User'} has resubmitted their ${documentType?.name || 'document'}. Please review.`,
          actionUrl: `/dashboard/${rejection.applicationId}/doc_verif`,
          isRead: isReadByCurrentAdmin,
          notificationType: "DocumentResubmission",
          _creationTime: rejection.replacedAt || rejection.rejectedAt, // Use replacedAt timestamp
        };
      })
    );

    return notifications;
  },
});
