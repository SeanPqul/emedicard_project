import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

// Upload a single document using the new documentUploads schema
export const uploadDocumentsMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    fieldIdentifier: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    reviewStatus: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    adminRemarks: v.optional(v.string()),
    // NEW: Optional argument for resubmission
    rejectedDocumentUploadId: v.optional(v.id("documentUploads")),
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
      throw new Error("Not authorized to upload documents for this application");
    }

    // Find the document type by fieldIdentifier
    const documentType = await ctx.db
      .query("documentTypes")
      .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", args.fieldIdentifier))
      .unique();
    
    if (!documentType) {
      throw new Error(`Document type not found for field: ${args.fieldIdentifier}`);
    }

    let newDocumentUploadId: Id<"documentUploads">;

    if (args.rejectedDocumentUploadId) {
      // This is a resubmission of a previously rejected document
      // Create a new documentUploads entry for the resubmitted document
      newDocumentUploadId = await ctx.db.insert("documentUploads", {
        applicationId: args.applicationId,
        documentTypeId: documentType._id,
        originalFileName: args.fileName,
        storageFileId: args.storageId,
        uploadedAt: Date.now(),
        reviewStatus: "Pending", // Resubmitted documents start as pending
        adminRemarks: undefined,
        reviewedBy: undefined,
        reviewedAt: undefined,
      });

      // Find the most recent rejection history entry for this document type and original upload
      const rejectionHistoryEntry = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", args.applicationId)
           .eq("documentTypeId", documentType._id)
        )
        .filter((q) => q.eq(q.field("documentUploadId"), args.rejectedDocumentUploadId))
        .order("desc") // Get the most recent one if multiple rejections for the same upload exist (unlikely but safe)
        .first();

      if (rejectionHistoryEntry) {
        await ctx.db.patch(rejectionHistoryEntry._id, {
          wasReplaced: true,
          replacementUploadId: newDocumentUploadId,
          replacedAt: Date.now(),
        });
      }

      // Notify admin about the resubmission
      const admins = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "admin")).collect();
      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          title: "Document Resubmitted",
          message: `Applicant ${user.fullname} has resubmitted '${documentType.name}' for application ${application._id}.`,
          notificationType: "document_resubmission",
          isRead: false,
          applicationId: application._id,
        });
      }

      // After resubmission, check if all documents for the application are now in a reviewable state
      // If so, update the application status to "Pending Review"
      const allDocuments = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();

      const allDocumentsReviewable = allDocuments.every(
        (doc) => doc.reviewStatus === "Pending" || doc.reviewStatus === "Approved"
      );

      if (allDocumentsReviewable && application.applicationStatus === "Documents Need Revision") {
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "Pending Review",
          updatedAt: Date.now(),
        });
      }

    } else {
      // This is an initial upload or an update to an existing non-rejected document
      const existingDoc = await ctx.db
        .query("documentUploads")
        .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", documentType._id))
        .unique();

      if (existingDoc) {
        // Update existing document
        await ctx.db.patch(existingDoc._id, {
          documentTypeId: documentType._id,
          originalFileName: args.fileName,
          storageFileId: args.storageId,
          uploadedAt: Date.now(),
          reviewStatus: args.reviewStatus || "Pending",
          adminRemarks: args.adminRemarks,
          reviewedBy: args.reviewedBy,
          reviewedAt: args.reviewedAt,
        });
        newDocumentUploadId = existingDoc._id;
      } else {
        // Create new document record
        newDocumentUploadId = await ctx.db.insert("documentUploads", {
          applicationId: args.applicationId,
          documentTypeId: documentType._id,
          originalFileName: args.fileName,
          storageFileId: args.storageId,
          uploadedAt: Date.now(),
          reviewStatus: args.reviewStatus || "Pending",
          adminRemarks: args.adminRemarks,
          reviewedBy: args.reviewedBy,
          reviewedAt: args.reviewedAt,
        });
      }
    }
    
    return {
      requirementId: documentType._id,
      fieldIdentifier: args.fieldIdentifier,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      reviewStatus: args.reviewStatus || "Pending", // This might need adjustment based on actual status after upload
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt,
      adminRemarks: args.adminRemarks,
      _id: newDocumentUploadId, // Return the ID of the new/updated document upload
    };
  },
});
