import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Update a document field (replacement document)
export const updateDocumentUploadFieldMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    storageFileId: v.id("_storage"),
    originalFileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    reviewStatus: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    adminRemarks: v.optional(v.string()),
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
      throw new Error("Not authorized to update document uploads for this application");
    }

    // Find existing document upload for this application and documentTypeId
    const existingDocUpload = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId))
      .unique();

    if (!existingDocUpload) {
      throw new Error("Document upload not found to update");
    }

    // Delete old file from storage
    await ctx.storage.delete(existingDocUpload.storageFileId);

    // Update document record
    await ctx.db.patch(existingDocUpload._id, {
      originalFileName: args.originalFileName,
      storageFileId: args.storageFileId,
      uploadedAt: Date.now(),
      reviewStatus: args.reviewStatus || "Pending",
      adminRemarks: args.adminRemarks,
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt,
    });

    return {
      documentTypeId: args.documentTypeId,
      originalFileName: args.originalFileName,
      storageFileId: args.storageFileId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      reviewStatus: args.reviewStatus || "Pending",
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt,
      adminRemarks: args.adminRemarks,
    };
  },
});
