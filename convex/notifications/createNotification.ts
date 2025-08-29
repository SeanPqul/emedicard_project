import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createNotificationMutation = mutation({
  args: {
    userId: v.id("users"),
    applicationId: v.optional(v.id("applications")),
    notificationType: v.union(
      v.literal("MissingDoc"),
      v.literal("PaymentReceived"),
      v.literal("FormApproved"),
      v.literal("OrientationScheduled"),
      v.literal("CardIssue")
    ),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      applicationId: args.applicationId,
      notificationType: args.notificationType,
      title: args.title,
      message: args.message,
      isRead: false,
    });

    return notificationId;
  },
});
