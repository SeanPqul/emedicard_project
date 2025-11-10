import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { REJECTION_LIMITS, hasReachedMaxAttempts } from "../config/rejectionLimits";

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

    // 2. Find the most recent rejection/referral for this document
    // Check documentRejectionHistory for document issues
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();
    
    // Check documentReferralHistory for medical referrals (should not be resubmittable)
    const referralHistory = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    // Determine which history to use
    const historyEntry = rejectionHistory || referralHistory;
    const isRejection = !!rejectionHistory;

    if (!historyEntry) {
      throw new Error("No rejection found for this document");
    }

    if (historyEntry.wasReplaced) {
      throw new Error("This rejection has already been addressed with a new document");
    }

    // Only allow resubmission for document issues (from documentRejectionHistory), not medical referrals
    if (!isRejection && referralHistory?.issueType === "medical_referral") {
      throw new Error("Medical referrals cannot be resubmitted. Please consult with the designated doctor first.");
    }

    // 2.5. Check max attempts limit
    // Count all previous rejections for this document type
    const allRejections = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) =>
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .collect();
    
    const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;
    
    // Block if user has already been rejected more than MAX_ATTEMPTS times
    // With MAX_ATTEMPTS = 3:
    // - After 1st rejection (length=1): Can resubmit ✅ (Attempt #1)
    // - After 2nd rejection (length=2): Can resubmit ✅ (Attempt #2)
    // - After 3rd rejection (length=3): Can resubmit ✅ (Attempt #3 - FINAL)
    // - After 4th rejection (length=4): BLOCKED ❌ (Manual Review Required)
    if (allRejections.length > maxAttempts) {
      throw new Error(`You have reached the maximum number of resubmission attempts (${maxAttempts}). Please visit our office with your original documents for in-person verification. Check the Help Center in the app for venue location and office hours.`);
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

    // 4. Update rejection/referral history to mark as replaced and update status
    await ctx.db.patch(historyEntry._id, {
      wasReplaced: true,
      replacementUploadId: newUploadId,
      replacedAt: Date.now(),
      status: "resubmitted",
    });

    // 5. Check if all documents are now pending or approved
    const allDocumentUploads = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    // Check for documents that need revision (new terminology) or are rejected (old terminology)
    const hasRejectedDocuments = allDocumentUploads.some(
      doc => doc.reviewStatus === "Rejected" || doc.reviewStatus === "NeedsRevision"
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

    // 7. Notification handled by getRejectionHistoryNotifications query
    // No need to create duplicate notifications here since the rejection history
    // with wasReplaced=true will automatically show up as a notification

    // 8. Return success response
    return {
      success: true,
      uploadId: newUploadId,
      message: "Document resubmitted successfully",
      applicationStatus: hasRejectedDocuments ? "Documents Need Revision" : "Submitted",
    };
  },
});
