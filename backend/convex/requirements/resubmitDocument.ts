import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const resubmitDocument = mutation({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.float64(),
  },
  handler: async (ctx, args) => {
    // 1. Verify user ownership
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

    // Verify the application belongs to the user
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.userId !== user._id) {
      throw new Error("You can only resubmit documents for your own applications");
    }

    // 2. Find the most recent rejection for this document
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    if (!rejectionHistory) {
      throw new Error("No rejection found for this document");
    }

    if (rejectionHistory.wasReplaced) {
      throw new Error("This rejection has already been addressed with a new document");
    }

    // 3. Find and update the existing document upload record (if exists)
    const existingUpload = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => 
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .first();

    let newUploadId;

    if (existingUpload) {
      // Update existing upload record
      await ctx.db.patch(existingUpload._id, {
        storageFileId: args.storageId,
        originalFileName: args.fileName,
        uploadedAt: Date.now(),
        reviewStatus: "Pending",
        adminRemarks: undefined,
        reviewedBy: undefined,
        reviewedAt: undefined,
      });
      newUploadId = existingUpload._id;
    } else {
      // Create new upload record (shouldn't normally happen, but handle it)
      newUploadId = await ctx.db.insert("documentUploads", {
        applicationId: args.applicationId,
        documentTypeId: args.documentTypeId,
        storageFileId: args.storageId,
        originalFileName: args.fileName,
        uploadedAt: Date.now(),
        reviewStatus: "Pending",
        fileType: ""
      });
    }

    // 4. Update rejection history to mark as replaced
    await ctx.db.patch(rejectionHistory._id, {
      wasReplaced: true,
      replacementUploadId: newUploadId,
      replacedAt: Date.now(),
    });

    // 5. Check if all documents are now pending or approved
    const allDocumentUploads = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const hasRejectedDocuments = allDocumentUploads.some(
      doc => doc.reviewStatus === "Rejected"
    );

    // 6. Update application status if no more rejected documents
    if (!hasRejectedDocuments) {
      // Get current application to check payment status
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .first();

      let newStatus: "Submitted" | "Under Review" = "Submitted";
      
      // If payment is complete, set to Under Review
      if (payment && payment.paymentStatus === "Complete") {
        newStatus = "Under Review";
      }

      await ctx.db.patch(args.applicationId, {
        applicationStatus: newStatus,
        updatedAt: Date.now(),
      });
    }

    // 7. Send notification to admin for re-review
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    const documentType = await ctx.db.get(args.documentTypeId);
    const documentTypeName = documentType ? documentType.name : "Document";

    // Notify only admins who manage this health card category
    for (const admin of admins) {
      // Check if admin manages this health card category
      const shouldNotify = !admin.managedCategories ||
        admin.managedCategories.length === 0 ||
        admin.managedCategories.includes(application.jobCategoryId);

      if (shouldNotify) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          applicationId: args.applicationId,
          jobCategoryId: application.jobCategoryId,
          title: "Document Resubmitted",
          message: `User ${user.fullname} has resubmitted their ${documentTypeName}. Please review.`,
          notificationType: "DocumentResubmission",
          isRead: false,
          actionUrl: `/admin/applications/${args.applicationId}/review`,
        });
      }
    }

    // 8. Return success response
    return {
      success: true,
      uploadId: newUploadId,
      message: "Document resubmitted successfully",
      applicationStatus: hasRejectedDocuments ? "Documents Need Revision" : "Submitted",
    };
  },
});
