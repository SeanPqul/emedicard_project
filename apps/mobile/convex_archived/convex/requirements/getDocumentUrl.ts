import { query } from "../_generated/server";
import { v } from "convex/values";

// Get document URL from storage
export const getDocumentUrlQuery = query({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Get file URL from storage
    const fileUrl = await ctx.storage.getUrl(document.storageFileId);
    
    return {
      documentId: args.documentId,
      fileName: document.originalFileName,
      url: fileUrl,
      reviewStatus: document.reviewStatus,
      uploadedAt: document.uploadedAt,
      remarks: document.adminRemarks,
    };
  },
});


