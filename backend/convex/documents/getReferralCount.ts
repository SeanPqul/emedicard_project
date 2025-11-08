import { query } from "../_generated/server";
import { v } from "convex/values";

// Query to count pending referrals for admin dashboard
export const getPendingReferralsCount = query({
  args: {
    managedCategories: v.optional(v.union(v.literal("all"), v.array(v.id("jobCategories")))),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "inspector")) {
      return 0;
    }

    // Get all document rejection history records where notifications haven't been sent yet
    // These are documents that have been referred but admin hasn't clicked "Send Referral Notification"
    const allRejections = await ctx.db
      .query("documentRejectionHistory")
      .collect();

    // Filter for pending notifications (notificationSent === false)
    const pendingReferrals = allRejections.filter(r => r.notificationSent === false);

    // If super admin, return all pending referrals
    if (args.managedCategories === "all" || !args.managedCategories) {
      return pendingReferrals.length;
    }

    // For regular admins, filter by managed categories
    let filteredCount = 0;
    for (const rejection of pendingReferrals) {
      const application = await ctx.db.get(rejection.applicationId);
      if (application && args.managedCategories.includes(application.jobCategoryId)) {
        filteredCount++;
      }
    }

    return filteredCount;
  },
});
