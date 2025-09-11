import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const adminReviewDocumentUploadMutation = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
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

    const document = await ctx.db.get(args.documentUploadId);
    if (!document) {
      throw new Error("Document upload not found");
    }

    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: args.status,
      adminRemarks: args.remarks,
      reviewedBy: currentUser._id,
      reviewedAt: Date.now(),
    });

    return args.documentUploadId;
  },
});


// @deprecated - Use adminReviewDocumentUploadMutation instead. This alias will be removed in a future release.
export const adminReviewDocument = adminReviewDocumentUploadMutation;
