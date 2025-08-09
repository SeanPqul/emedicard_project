import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const adminReviewDocument = mutation({
  args: {
    documentId: v.id("formDocuments"),
    status: v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    await ctx.db.patch(args.documentId, {
      status: args.status,
      remarks: args.remarks,
      reviewBy: currentUser._id,
      reviewAt: Date.now(),
    });

    return args.documentId;
  },
});
