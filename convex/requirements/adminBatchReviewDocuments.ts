import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Admin mutation to batch review multiple documents
export const adminBatchReviewDocuments = mutation({
  args: {
    reviews: v.array(v.object({
      documentId: v.id("formDocuments"),
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
        const document = await ctx.db.get(review.documentId);
        if (!document) {
          errors.push({ documentId: review.documentId, error: "Document not found" });
          continue;
        }

        await ctx.db.patch(review.documentId, {
          status: review.status,
          remarks: review.remarks,
          reviewBy: currentUser._id,
          reviewAt: Date.now(),
        });

        reviewedDocumentIds.push(review.documentId);
      } catch (error) {
        errors.push({
          documentId: review.documentId,
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

