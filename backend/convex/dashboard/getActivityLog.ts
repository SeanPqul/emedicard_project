import { query } from "../_generated/server";
import { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Fetch recent document reviews
    const documentReviews = await ctx.db
      .query("documentUploads")
      .withIndex("by_application")
      .order("desc")
      .filter((q: any) => q.neq(q.field("reviewedAt"), undefined))
      .take(10);

    // Fetch recent application approvals
    const applicationApprovals = await ctx.db
      .query("applications")
      .order("desc")
      .filter((q: any) => q.neq(q.field("approvedAt"), undefined))
      .take(10);

    const populatedReviews = await Promise.all(
      documentReviews.map(async (review) => {
        if (!review.reviewedBy) return null;
        const admin = await ctx.db.get(review.reviewedBy);
        const application = await ctx.db.get(review.applicationId);
        if (!admin || !application) return null;
        const applicant = await ctx.db.get(application.userId);
        return {
          id: review._id,
          adminName: admin.fullname,
          applicantName: applicant?.fullname ?? "Unknown",
          action: `Reviewed Document (${review.reviewStatus})`,
          timestamp: review.reviewedAt,
        };
      })
    );

    const populatedApprovals = await Promise.all(
      applicationApprovals.map(async (approval) => {
        const application = await ctx.db.get(approval._id);
        if (!application) return null;
        const applicant = await ctx.db.get(application.userId);
        // Assuming the admin who approved is the one who last updated the application
        // This is a simplification. A more robust solution would store the admin's ID on the application record.
        const admin = identity.name;
        return {
          id: approval._id,
          adminName: admin,
          applicantName: applicant?.fullname ?? "Unknown",
          action: `Approved Application`,
          timestamp: approval.approvedAt,
        };
      })
    );

    const combinedActivities = [...populatedReviews, ...populatedApprovals]
      .filter((activity) => activity !== null && activity.timestamp !== undefined)
      .sort((a, b) => (b!.timestamp as number) - (a!.timestamp as number))
      .slice(0, 10);

    return combinedActivities;
  },
});
