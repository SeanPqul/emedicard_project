import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx: MutationCtx, args: { notificationId: Id<"notifications"> }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notification = await ctx.db.get(args.notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Ensure the user is authorized to mark this notification as read
    if (notification.userId !== user._id) {
      throw new Error("Not authorized to mark this notification as read.");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return { success: true };
  },
});
