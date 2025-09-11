import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Delete a document using applications schema (uses the client interface)
export const deleteDocumentMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
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
      throw new Error("Not authorized to delete this document");
    }

    // Find the document requirement by fieldName
    const docRequirement = await ctx.db
      .query("documentTypes")
      .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", args.fieldName))
      .unique();
    
    if (!docRequirement) {
      throw new Error(`Document requirement not found for field: ${args.fieldName}`);
    }

    // Find the document to delete
    const document = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", docRequirement._id))
      .unique();

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify the storage ID matches (security check)
    if (document.storageFileId !== args.storageId) {
      throw new Error("Storage ID mismatch - unauthorized deletion attempt");
    }

    // Check if document can be deleted (business logic)
    if (document.reviewStatus === "Approved") {
      throw new Error("Cannot delete approved documents. Please contact administrator.");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.storageFileId);

    // Delete the document record
    await ctx.db.delete(document._id);

    return { success: true };
  },
});


// @deprecated - Use deleteDocumentMutation instead. This alias will be removed in a future release.
export const deleteDocument = deleteDocumentMutation;
