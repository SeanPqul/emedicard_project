import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Deletes a storage file by storageId.
 * Used for cleanup during failed submission flows to prevent orphaned files.
 * 
 * Security:
 * - Checks if file is linked to a documentUpload
 * - If linked, verifies user owns the associated application
 * - If unlinked (orphaned), allows deletion for cleanup
 */
export const deleteStorageFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if this storage file is linked to any document
    const linkedDocument = await ctx.db
      .query("documentUploads")
      .filter((q) => q.eq(q.field("storageFileId"), args.storageId))
      .first();

    if (linkedDocument) {
      // File is linked to a document - verify ownership
      const application = await ctx.db.get(linkedDocument.applicationId);
      
      if (!application) {
        throw new Error("Associated application not found");
      }

      if (application.userId !== user._id) {
        throw new Error(
          "Not authorized to delete this file. It belongs to another user's application."
        );
      }

      // Additional safety: only allow deletion if application is Draft or if document is not Approved
      if (
        application.applicationStatus !== "Draft" &&
        linkedDocument.reviewStatus === "Approved"
      ) {
        throw new Error(
          "Cannot delete approved documents from submitted applications. Please contact administrator."
        );
      }
    }
    // If not linked, it's an orphaned file from failed upload - safe to delete

    // Delete the file from storage
    await ctx.storage.delete(args.storageId);

    return { success: true };
  },
});
