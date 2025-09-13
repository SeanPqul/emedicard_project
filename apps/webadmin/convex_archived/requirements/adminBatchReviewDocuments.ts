import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Admin mutation to batch review multiple documents
export const adminBatchReviewDocumentUploadsMutation = mutation({
  args: {
    reviews: v.array(v.object({
      documentUploadId: v.id("documentUploads"),
      status: v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected")),
      remarks: v.optional(v.string()),
    })),
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

    const reviewedDocumentIds = [];
    const errors = [];

    for (const review of args.reviews) {
      try {
        const document = await ctx.db.get(review.documentUploadId);
        if (!document) {
          errors.push({ documentUploadId: review.documentUploadId, error: "Document upload not found" });
          continue;
        }

        await ctx.db.patch(review.documentUploadId, {
          reviewStatus: review.status,
          adminRemarks: review.remarks,
          reviewedBy: currentUser._id,
          reviewedAt: Date.now(),
        });

        reviewedDocumentIds.push(review.documentUploadId);
      } catch (error) {
        errors.push({
          documentUploadId: review.documentUploadId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: reviewedDocumentIds.length > 0,
      reviewedDocumentIds,
      totalReviewed: reviewedDocumentIds.length,
      errors,
    };
  },
});



// @deprecated - Use adminBatchReviewDocumentUploadsMutation instead. This alias will be removed in a future release.
export const adminBatchReviewDocuments = adminBatchReviewDocumentUploadsMutation;
