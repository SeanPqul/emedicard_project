import { v } from "convex/values";
import { mutation } from "../_generated/server";

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
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      formsId: args.formsId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
    });

    return notificationId;
  },
});
