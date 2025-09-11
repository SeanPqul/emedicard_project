import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Delete a document using formDocuments schema (uses the client interface)
export const deleteDocumentUploadMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    storageFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify application exists and user owns it
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Not authorized to delete this document upload");
    }

    // Find the document upload to delete
    const documentUpload = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId))
      .unique();

    if (!documentUpload) {
      throw new Error("Document upload not found");
    }

    // Verify the storage ID matches (security check)
    if (documentUpload.storageFileId !== args.storageFileId) {
      throw new Error("Storage ID mismatch - unauthorized deletion attempt");
    }

    // Check if document can be deleted (business logic)
    if (documentUpload.reviewStatus === "Approved") {
      throw new Error("Cannot delete approved document uploads. Please contact administrator.");
    }

    // Delete the file from storage
    await ctx.storage.delete(documentUpload.storageFileId);

    // Delete the document record
    await ctx.db.delete(documentUpload._id);

    return { success: true };
  },
});


// @deprecated - Use deleteDocumentUploadMutation instead. This alias will be removed in a future release.
export const deleteDocument = deleteDocumentUploadMutation;
