import { mutation } from "../_generated/server";

export const markAllNotificationsAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Mark regular notifications as read
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    // Mark rejection history notifications as read (only for admins)
    if (user.role === "admin" || user.role === "inspector") {
      const unreadRejectionHistory = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
        .collect();

      // Filter those not read by current admin
      const toMarkAsRead = unreadRejectionHistory.filter(
        (rejection) => !rejection.adminReadBy?.includes(user._id)
      );

      await Promise.all(
        toMarkAsRead.map((rejection) => {
          const currentReadBy = rejection.adminReadBy || [];
          return ctx.db.patch(rejection._id, {
            adminReadBy: [...currentReadBy, user._id],
          });
        })
      );
    }

    return { success: true };
  },
});
