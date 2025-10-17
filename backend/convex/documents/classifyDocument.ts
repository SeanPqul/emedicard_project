import { v } from "convex/values";
import { api } from "../_generated/api";
import { action, mutation } from "../_generated/server";

export const classify = action({
  args: {
    documentUploadId: v.id("documentUploads"),
    storageFileId: v.id("_storage"),
    mimeType: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Classifying document:", args.documentUploadId);
    // Placeholder for actual classification logic
    // This would typically involve calling an external OCR service or AI model
    // For now, let's just simulate a classification and update the document.

    // Simulate classification result
    const simulatedClassification = "Passport"; // Example classification

    // Update the document classification in the database
    await ctx.runMutation(api.documents.classifyDocument.updateDocumentClassification, {
      documentUploadId: args.documentUploadId,
      classification: simulatedClassification,
    });

    return { success: true, classification: simulatedClassification };
  },
});

export const updateDocumentClassification = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    classification: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized to update document classification");
    }

    await ctx.db.patch(args.documentUploadId, {
      classification: args.classification,
      reviewedAt: Date.now(),
      reviewStatus: "Classified", // Assuming classification implies it's reviewed
    });

    return { success: true };
  },
});
