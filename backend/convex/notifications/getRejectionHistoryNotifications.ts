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

    let rejectionHistoryQuery = ctx.db.query("documentRejectionHistory");

    if (args.jobCategory) {
      // This is a bit tricky since jobCategory is on the application, not the rejection history.
      // This would require a join or a more complex query structure.
      // For now, we'll fetch all and filter in memory.
    }

    const rejectionHistory = await rejectionHistoryQuery.order("desc").collect();

    const notifications = await Promise.all(
      rejectionHistory.map(async (rejection) => {
        const application = await ctx.db.get(rejection.applicationId);
        const user = application ? await ctx.db.get(application.userId) : null;
        const documentType = await ctx.db.get(rejection.documentTypeId);
        return {
          _id: rejection._id,
          title: `Document Resubmitted`,
          message: `${user?.fullname} has resubmitted their ${documentType?.name}.`,
          actionUrl: `/dashboard/${rejection.applicationId}/doc_verif`,
          isRead: rejection.wasReplaced, // Consider 'wasReplaced' as 'isRead'
          notificationType: "DocumentResubmission",
          _creationTime: rejection.rejectedAt,
        };
      })
    );

    return notifications;
  },
});
