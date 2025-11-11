import { query } from "../_generated/server";
import { v } from "convex/values";

export const getNotificationByIdQuery = query({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const notification = await ctx.db.get(args.notificationId);

    // Verify the notification belongs to the user
    if (!notification || notification.userId !== user._id) {
      return null;
    }

    return notification;
  },
});

// Default export for convenience
export const getNotificationById = getNotificationByIdQuery;
