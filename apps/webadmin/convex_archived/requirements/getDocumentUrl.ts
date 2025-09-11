import { query } from "../_generated/server";
import { v } from "convex/values";

// Get document URL from storage
export const getDocumentUploadUrlQuery = query({
  args: {
    documentUploadId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) {
      throw new Error("Document upload not found");
    }

    // Get file URL from storage
    const fileUrl = await ctx.storage.getUrl(documentUpload.storageFileId);
    
    return {
      documentUploadId: args.documentUploadId,
      fileName: documentUpload.originalFileName,
      url: fileUrl,
      status: documentUpload.reviewStatus,
      uploadedAt: documentUpload.uploadedAt,
      remarks: documentUpload.adminRemarks,
    };
  },
});


// @deprecated - Use getDocumentUploadUrlQuery instead. This alias will be removed in a future release.
export const queryDocumentUrl = getDocumentUploadUrlQuery;
