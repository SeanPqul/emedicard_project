import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";

/**
 * Clear (delete) all read notifications for the current user
 * Implements Option A: Keep until read + manual delete functionality
 * 
 * Note: This respects role-based filtering. Admins can only clear their own notifications.
 */
export const clearReadNotificationsMutation = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    // Get all read notifications for this admin
    const readNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => 
        q.eq("userId", admin._id).eq("isRead", true)
      )
      .collect();

    // Delete each read notification
    const deletePromises = readNotifications.map((notification) =>
      ctx.db.delete(notification._id)
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      deletedCount: readNotifications.length,
      message: `Cleared ${readNotifications.length} read notification(s)`,
    };
  },
});

/**
 * Delete a specific notification (admin can delete any of their notifications)
 */
export const deleteNotificationMutation = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    // Verify the notification belongs to this admin
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== admin._id) {
      throw new Error("Unauthorized: This notification does not belong to you");
    }

    // Delete the notification
    await ctx.db.delete(args.notificationId);

    return {
      success: true,
      message: "Notification deleted successfully",
    };
  },
});

/**
 * Archive old notifications (for future use)
 * Can be run as a cron job to auto-archive notifications older than 90 days
 */
export const archiveOldNotificationsMutation = mutation({
  args: {
    daysOld: v.optional(v.number()), // Default 90 days
  },
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const daysOld = args.daysOld || 90;
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    // Only super admins can run this (managedCategories === "all" for super admins)
    const isSuperAdmin = admin.role === "admin" && 
      typeof admin.managedCategories === "string" && 
      admin.managedCategories === "all";
    
    if (!isSuperAdmin) {
      throw new Error("Unauthorized: Only super admins can archive old notifications");
    }

    // Get all old notifications
    const allNotifications = await ctx.db.query("notifications").collect();
    const oldNotifications = allNotifications.filter(
      (notif) => notif._creationTime < cutoffTime
    );

    // Delete old notifications
    const deletePromises = oldNotifications.map((notification) =>
      ctx.db.delete(notification._id)
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      archivedCount: oldNotifications.length,
      message: `Archived ${oldNotifications.length} notification(s) older than ${daysOld} days`,
    };
  },
});
