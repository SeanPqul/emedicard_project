import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markAsReadMutation = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || notification.userId !== user._id) {
      throw new Error("Not authorized to update this notification");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});


// @deprecated - Use markAsReadMutation instead. This alias will be removed in a future release.
export const markNotificationAsRead = markAsReadMutation;
