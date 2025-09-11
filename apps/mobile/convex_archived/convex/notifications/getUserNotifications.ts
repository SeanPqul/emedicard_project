import { query } from "../_generated/server";

export const getUserNotificationsQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Return empty array instead of throwing error for new users
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return notifications;
  },
});


// @deprecated - Use getUserNotificationsQuery instead. This alias will be removed in a future release.
export const getUserNotifications = getUserNotificationsQuery;
