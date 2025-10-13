import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Helper function to extract file type from originalFileName
function getFileTypeFromFileName(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "unknown";
}

export const resubmitDocument = mutation({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    storageFileId: v.id("_storage"),
    originalFileName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Infer a basic file type from the original file name extension to satisfy schema
    const ext = args.originalFileName.split('.').pop()?.toLowerCase() || '';
    const inferredFileType =
      ext === 'jpg' || ext === 'jpeg' || ext === 'jpe' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'webp' ? 'image/webp'
      : ext === 'gif' ? 'image/gif'
      : ext === 'heic' || ext === 'heif' ? 'image/heic'
      : ext === 'pdf' ? 'application/pdf'
      : 'application/octet-stream';

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 1. Find the original rejected document upload
    const originalDocumentUpload = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) =>
        q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    if (!originalDocumentUpload) {
      throw new Error("Original document upload not found");
    }

    // 2. Find the corresponding rejection history
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) =>
        q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    if (!rejectionHistory) {
      throw new Error("Rejection history not found");
    }

    // 3. Create a new document upload record
    const newDocumentUploadId = await ctx.db.insert("documentUploads", {
      applicationId: args.applicationId,
      documentTypeId: args.documentTypeId,
      storageFileId: args.storageFileId,
      originalFileName: args.originalFileName,
      fileType: inferredFileType,
      reviewStatus: "Pending",
      uploadedAt: Date.now(),
      fileType: getFileTypeFromFileName(args.originalFileName), // Added fileType
    });

    // 4. Update the rejection history
    await ctx.db.patch(rejectionHistory._id, {
      wasReplaced: true,
      replacementUploadId: newDocumentUploadId,
      replacedAt: Date.now(),
    });

    // 5. Update the application status
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Pending", // Or another appropriate status
      updatedAt: Date.now(),
    });

    // 6. Notify admins
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    const documentType = await ctx.db.get(args.documentTypeId);

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        applicationId: args.applicationId,
        title: "Document Resubmitted",
        message: `A new document has been submitted for ${documentType?.name} by ${user.fullname}.`,
        notificationType: "DocumentResubmitted",
        isRead: false,
        actionUrl: `/dashboard/${args.applicationId}/doc_verif`,
        jobCategoryId: application.jobCategoryId,
      });
    }

    return { success: true, documentUploadId: newDocumentUploadId };
  },
});
