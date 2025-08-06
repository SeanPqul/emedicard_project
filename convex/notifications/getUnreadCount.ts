import { query } from "../_generated/server";

export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return 0; // Return 0 instead of throwing error for unauthenticated users
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        return 0; // Return 0 for new users
      }

      const unreadNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("read"), false))
        .collect();

      return unreadNotifications.length;
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0; // Return 0 on error to prevent UI crashes
    }
  },
});
