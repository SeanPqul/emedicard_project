import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
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

export const markNotificationAsRead = mutation({
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

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {},
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

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    formsId: v.optional(v.id("forms")),
    type: v.union(
      v.literal("MissingDoc"),
      v.literal("PaymentReceived"),
      v.literal("FormApproved"),
      v.literal("OrientationScheduled"),
      v.literal("CardIssue")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      formsId: args.formsId,
      type: args.type,
      message: args.message,
      read: false,
    });

    return notificationId;
  },
});

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

// Enhanced notification queries for real-time updates
export const getNotificationsByType = query({
  args: {
    type: v.optional(v.union(
      v.literal("MissingDoc"),
      v.literal("PaymentReceived"),
      v.literal("FormApproved"),
      v.literal("OrientationScheduled"),
      v.literal("CardIssue")
    ))
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        return [];
      }

      let query = ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id));

      if (args.type) {
        query = query.filter((q) => q.eq(q.field("type"), args.type));
      }

      const notifications = await query.order("desc").collect();
      return notifications;
    } catch (error) {
      console.error("Error getting notifications by type:", error);
      return [];
    }
  },
});

// Get recent notifications for real-time updates
export const getRecentNotifications = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        return [];
      }

      const limit = args.limit || 10;
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit);

      return notifications;
    } catch (error) {
      console.error("Error getting recent notifications:", error);
      return [];
    }
  },
});

// Bulk notification operations
export const createBulkNotifications = mutation({
  args: {
    notifications: v.array(v.object({
      userId: v.id("users"),
      formsId: v.optional(v.id("forms")),
      type: v.union(
        v.literal("MissingDoc"),
        v.literal("PaymentReceived"),
        v.literal("FormApproved"),
        v.literal("OrientationScheduled"),
        v.literal("CardIssue")
      ),
      message: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    try {
      const notificationIds = await Promise.all(
        args.notifications.map(async (notification) => {
          return await ctx.db.insert("notifications", {
            userId: notification.userId,
            formsId: notification.formsId,
            type: notification.type,
            message: notification.message,
            read: false,
          });
        })
      );

      return notificationIds;
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      throw new Error("Failed to create notifications. Please try again.");
    }
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Authentication required to delete notifications");
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
        throw new Error("You can only delete your own notifications");
      }

      await ctx.db.delete(args.notificationId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification. Please try again.");
    }
  },
});
