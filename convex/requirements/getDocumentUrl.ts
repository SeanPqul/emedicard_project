import { query } from "../_generated/server";
import { v } from "convex/values";

// Get document URL from storage
export const getDocumentUrl = query({
  args: {
    documentId: v.id("formDocuments"),
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
    const fileUrl = await ctx.storage.getUrl(document.fileId);
    
    return {
      documentId: args.documentId,
      fileName: document.fileName,
      url: fileUrl,
      status: document.status,
      uploadedAt: document.uploadedAt,
      remarks: document.remarks,
    };
  },
});
