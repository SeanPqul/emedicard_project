// convex/admin/reviewDocument.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { AdminRole } from "../users/roles";
import { requireWriteAccess } from "../users/permissions";
import { areAllDocumentsVerified } from "../lib/documentStatus";

export const review = mutation({
  args: {
    // This is now the ID of the documentUploads record
    documentUploadId: v.id("documentUploads"),
    status: v.union(v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()),
    extractedText: v.optional(v.string()), // New field
    fileType: v.optional(v.string()), // New field
  },
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");
    
    // Prevent system admins from modifying documents (read-only oversight)
    await requireWriteAccess(ctx);

    const identity = await ctx.auth.getUserIdentity();
    const adminUser = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", identity!.subject)).unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // Get document upload details for logging
    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) throw new Error("Document upload not found.");

    const application = await ctx.db.get(documentUpload.applicationId);
    if (!application) throw new Error("Application not found.");

    const applicant = await ctx.db.get(application.userId);
    const documentType = await ctx.db.get(documentUpload.documentTypeId);
    const docName = documentType?.name || "a document";

    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: args.status,
      adminRemarks: args.remarks,
      reviewedAt: Date.now(),
      reviewedBy: adminUser._id,
      extractedText: args.extractedText, // Save extracted text
      fileType: args.fileType, // Save file type
    });

    // Update rejection history status if this document was resubmitted
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", documentUpload.applicationId)
         .eq("documentTypeId", documentUpload.documentTypeId)
      )
      .filter((q) => q.eq(q.field("status"), "resubmitted"))
      .first();

    if (rejectionHistory) {
      // Update the status based on approval or rejection
      await ctx.db.patch(rejectionHistory._id, {
        status: args.status === "Approved" ? "approved" : "rejected",
      });
    }

    // Check if all documents are now verified and update application status if needed
    const allDocuments = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", application._id))
      .collect();
    
    const allVerified = areAllDocumentsVerified(allDocuments);
    
    if (allVerified) {
      const statusesThatNeedUpdate = ["For Document Verification", "Scheduled", "For Orientation", "Documents Need Revision"];
      
      if (statusesThatNeedUpdate.includes(application.applicationStatus)) {
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        const requiresOrientation = jobCategory?.requireOrientation === "Yes" || jobCategory?.requireOrientation === true;
        
        let newStatus = application.applicationStatus;
        let shouldUpdate = false;
        
        if (application.applicationStatus === "For Document Verification" || application.applicationStatus === "Documents Need Revision") {
          // Moving from document verification stage
          if (requiresOrientation && !application.orientationCompleted) {
            newStatus = "For Orientation";
          } else {
            newStatus = "Under Review";
          }
          shouldUpdate = true;
        } else if (application.applicationStatus === "Scheduled") {
          // Handle Scheduled status
          if (requiresOrientation && !application.orientationCompleted) {
            // Yellow card (Food Handler) - documents verified during orientation wait, stay as Scheduled
            shouldUpdate = false;
          } else {
            // Pink/Green card (no orientation required) OR orientation already completed - move to review
            newStatus = "Under Review";
            shouldUpdate = true;
          }
        } else if (application.applicationStatus === "For Orientation" && (!requiresOrientation || application.orientationCompleted)) {
          // Orientation not needed or already done, move to review
          newStatus = "Under Review";
          shouldUpdate = true;
        }
        
        if (shouldUpdate && newStatus !== application.applicationStatus) {
          await ctx.db.patch(application._id, {
            applicationStatus: newStatus,
            updatedAt: Date.now(),
          });
          
          // Notify user that documents are verified
          await ctx.db.insert("notifications", {
            userId: application.userId,
            title: "Documents Verified",
            message: "All your documents have been verified and approved!",
            notificationType: "status_update",
            isRead: false,
          });
        }
      }
    }

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "document_review",
      details: `${args.status} document '${docName}' for ${applicant?.fullname || "applicant"}. ${args.remarks ? `Remarks: ${args.remarks}` : ""}`,
      timestamp: Date.now(),
      documentUploadId: args.documentUploadId,
      applicationId: application._id,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true };
  },
});
