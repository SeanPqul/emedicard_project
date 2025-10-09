import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";

export const sendAdminNotification = mutation({
  args: {
    userId: v.id("users"),
    notificationType: v.string(),
    message: v.string(),
    title: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx: MutationCtx, args: {
    userId: Id<"users">;
    notificationType: string;
    message: string;
    title?: string;
    actionUrl?: string;
    applicationId?: Id<"applications">;
  }) => {
    const { userId, notificationType, message, title, actionUrl, applicationId } = args;

    // Optional: Add validation or authorization checks here
    // For example, ensure the user making this call is an admin.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to sendAdminNotification");
    }

    // You might want to fetch the sender's role to ensure they are an admin
    // const currentUser = await ctx.db
    //   .query("users")
    //   .withIndex("by_clerk_id", (q) =>
    //     q.eq("clerkId", identity.subject)
    //   )
    //   .first();

    // if (currentUser?.role !== "admin") {
    //   throw new Error("Unauthorized: Only admins can send notifications.");
    // }

    await ctx.db.insert("notifications", {
      userId,
      notificationType,
      message,
      title,
      actionUrl,
      applicationId,
      isRead: false,
    });
  },
});
