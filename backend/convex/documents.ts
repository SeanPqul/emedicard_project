import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

// Helper function to extract file type from originalFileName
function getFileTypeFromFileName(fileName: string): string {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return extension || "unknown";
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

    // 2. DUAL-READ: Find the corresponding referral/rejection history from both tables
    // Try new table first
    let referralHistory = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_document_type", (q) =>
        q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    // If not found, try old table
    let rejectionHistory = null;
    if (!referralHistory) {
      rejectionHistory = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId)
        )
        .order("desc")
        .first();
    }

    if (!referralHistory && !rejectionHistory) {
      throw new Error("Referral/rejection history not found");
    }

    // 3. Create a new document upload record
    const newDocumentUploadId = await ctx.db.insert("documentUploads", {
      applicationId: args.applicationId,
      documentTypeId: args.documentTypeId,
      storageFileId: args.storageFileId,
      originalFileName: args.originalFileName,
      reviewStatus: "Pending",
      uploadedAt: Date.now(),
      fileType: getFileTypeFromFileName(args.originalFileName), // Added fileType
    });

    // 4. DUAL-WRITE: Update history in BOTH tables (whichever exists)
    const replacedAt = Date.now();

    if (referralHistory) {
      // Update new table
      await ctx.db.patch(referralHistory._id, {
        wasReplaced: true,
        replacementUploadId: newDocumentUploadId,
        replacedAt: replacedAt,
      });

      // Also update corresponding old table record if it exists
      const oldRecord = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", args.applicationId).eq("documentTypeId", args.documentTypeId)
        )
        .order("desc")
        .first();

      if (oldRecord) {
        await ctx.db.patch(oldRecord._id, {
          wasReplaced: true,
          replacementUploadId: newDocumentUploadId,
          replacedAt: replacedAt,
        });
      }
    } else if (rejectionHistory) {
      // Update old table
      await ctx.db.patch(rejectionHistory._id, {
        wasReplaced: true,
        replacementUploadId: newDocumentUploadId,
        replacedAt: replacedAt,
      });
    }

    // 5. Update the application status to Under Review (document resubmitted)
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Under Review",
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
      // Check if admin manages this health card category
      const shouldNotify = !admin.managedCategories ||
        admin.managedCategories.length === 0 ||
        admin.managedCategories.includes(application.jobCategoryId);

      if (shouldNotify) {
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
    }

    return { success: true, documentUploadId: newDocumentUploadId };
  },
});

export const updateDocumentClassification = internalMutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    extractedText: v.string(),
    classification: v.string(),
  },
  handler: async (ctx, args) => {

    await ctx.db.patch(args.documentUploadId, {
      extractedText: args.extractedText,
      classification: args.classification,
      reviewedAt: Date.now(),
      reviewStatus: "Classified", // Assuming classification implies it's reviewed
    });

    return { success: true };
  },
});
