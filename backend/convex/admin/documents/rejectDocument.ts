import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const rejectDocument = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    rejectionCategory: v.union(
      v.literal("quality_issue"),
      v.literal("wrong_document"),
      v.literal("expired_document"),
      v.literal("incomplete_document"),
      v.literal("invalid_document"),
      v.literal("format_issue"),
      v.literal("other")
    ),
    rejectionReason: v.string(),
    specificIssues: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
    // 1. Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    if (admin.role !== "admin" && admin.role !== "inspector") {
      throw new Error("Insufficient permissions. Only admins and inspectors can reject documents.");
    }

    // 2. Get document and application details
    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) {
      throw new Error("Document upload not found");
    }

    const application = await ctx.db.get(documentUpload.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const documentType = await ctx.db.get(documentUpload.documentTypeId);
    if (!documentType) {
      throw new Error("Document type not found");
    }

    // Get file details from storage
    const file = await ctx.storage.getMetadata(documentUpload.storageFileId);
    if (!file) {
      throw new Error("File not found in storage");
    }

    // Check if document is already rejected
    if (documentUpload.reviewStatus === "Rejected") {
      throw new Error("Document is already rejected");
    }

    // 3. Count previous rejection attempts for this document
    const previousRejections = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", documentUpload.applicationId)
         .eq("documentTypeId", documentUpload.documentTypeId)
      )
      .collect();

    const attemptNumber = previousRejections.length + 1;

    // 4. Create rejection history record
    const rejectionHistoryId = await ctx.db.insert("documentRejectionHistory", {
      applicationId: documentUpload.applicationId,
      documentTypeId: documentUpload.documentTypeId,
      documentUploadId: args.documentUploadId,
      
      // Preserve file data
      rejectedFileId: documentUpload.storageFileId,
      originalFileName: documentUpload.originalFileName,
      fileSize: file.size,
      fileType: file.contentType || "application/octet-stream", // Provide a default if null
      
      // Rejection information
      rejectionCategory: args.rejectionCategory,
      rejectionReason: args.rejectionReason,
      specificIssues: args.specificIssues,
      
      // Tracking
      rejectedBy: admin._id,
      rejectedAt: Date.now(),
      
      // Resubmission tracking
      wasReplaced: false,
      attemptNumber: attemptNumber,
      
      // Notification tracking
      notificationSent: false,
      notificationSentAt: undefined,
      
      // Audit fields (can be enhanced later)
      ipAddress: undefined,
      userAgent: undefined,
    });

    // 5. Update document status
    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: "Rejected",
      adminRemarks: args.rejectionReason,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    // 6. Update application status to "Under Review" (document needs resubmission)
    await ctx.db.patch(documentUpload.applicationId, {
      applicationStatus: "Under Review",
      updatedAt: Date.now(),
    });

    // 7. Notification will be sent when "Reject Application" button is clicked
    // Skipping immediate notification to allow stacking multiple rejections

    // 8. Create admin activity log
    await ctx.db.insert("adminActivityLogs", {
      adminId: admin._id,
      activityType: "document_rejection",
      // Truncate if necessary
      details: `Rejected ${documentType.name} for application ${application._id}. Reason: ${args.rejectionReason}`.substring(0, 500),
      applicationId: application._id,
      timestamp: Date.now(),
    });

    // 9. Return success with rejection ID
    return {
      success: true,
      rejectionId: rejectionHistoryId,
      message: `Document ${documentType.name} has been rejected successfully`,
      attemptNumber: attemptNumber,
    };
    } catch (error) {
      console.error("Error rejecting document:", error);
      // Provide a more specific error message if possible
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: `Failed to reject document: ${message}`,
      };
    }
  },
});
