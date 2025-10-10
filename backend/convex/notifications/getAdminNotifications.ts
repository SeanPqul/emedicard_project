import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

export const getAdminNotifications = query({
  args: {
    adminId: v.id("users"),
    notificationType: v.optional(v.string()), // Optional filter for notification type
  },
  handler: async (
    ctx: QueryCtx,
    args: { adminId: Id<"users">; notificationType?: string }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin || admin._id !== args.adminId) {
      throw new Error("Not authorized to view these notifications.");
    }

    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user", (q: any) => q.eq("userId", args.adminId));

    if (args.notificationType) {
      notificationsQuery = notificationsQuery.filter((q) =>
        q.eq(q.field("notificationType"), args.notificationType)
      );
    }

    let notifications = await notificationsQuery
      .order("desc") // Order by creation time, most recent first
      .take(20); // Limit to the 20 most recent notifications

    // If the admin has managed categories, filter notifications further
    if (admin.managedCategories && admin.managedCategories.length > 0) {
      const filteredNotifications = [];
      for (const notification of notifications) {
        if (notification.applicationId) {
          const application = await ctx.db.get(notification.applicationId);
          if (
            application &&
            admin.managedCategories.includes(application.jobCategoryId)
          ) {
            filteredNotifications.push(notification);
          }
        } else {
          // Include notifications not tied to a specific application (e.g., general admin notifications)
          filteredNotifications.push(notification);
        }
      }
      notifications = filteredNotifications;
    }

    return notifications;
  },
});
