import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { REJECTION_LIMITS, hasReachedMaxAttempts } from "../../config/rejectionLimits";

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
      
      // Status flow tracking
      status: "pending",
      
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

    // 7. Send admin notification to other admins managing this category
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    // Get the job category for this application
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    
    // Filter admins who manage this category (exclude the current admin who performed the action)
    const relevantAdmins = allAdmins.filter((adminUser) => {
      // Skip the current admin
      if (adminUser._id === admin._id) return false;
      
      // Super admin (no managed categories or empty array) can see all
      if (!adminUser.managedCategories || adminUser.managedCategories.length === 0) {
        return true;
      }
      
      // Regular admin - check if they manage this category
      return adminUser.managedCategories.includes(application.jobCategoryId);
    });

    // Get applicant info for notification
    const applicant = await ctx.db.get(application.userId);
    const applicantName = applicant?.fullname || "Unknown Applicant";

    // Send notification to each relevant admin
    for (const targetAdmin of relevantAdmins) {
      await ctx.db.insert("notifications", {
        userId: targetAdmin._id,
        notificationType: "document_rejection",
        title: "Document Rejected",
        message: `${admin.fullname || admin.email} has rejected ${documentType.name} for ${applicantName}'s application. Reason: ${args.rejectionReason}`,
        actionUrl: `/dashboard/${application._id}/doc_verif`,
        applicationId: application._id,
        jobCategoryId: application.jobCategoryId,
        isRead: false,
      });
    }

    // 8. Create admin activity log
    await ctx.db.insert("adminActivityLogs", {
      adminId: admin._id,
      activityType: "document_rejection",
      // Truncate if necessary
      details: `Rejected ${documentType.name} for application ${application._id}. Reason: ${args.rejectionReason}`.substring(0, 500),
      applicationId: application._id,
      jobCategoryId: application.jobCategoryId, // Add jobCategoryId for filtering
      timestamp: Date.now(),
    });

    // 9. Check if max attempts reached (ONLY send notification immediately if max attempts reached)
    const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'document');
    const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;
    
    if (maxAttemptsReached) {
      // Max attempts reached (3rd attempt) - PERMANENTLY REJECT application
      const specificIssuesText = args.specificIssues.length > 0 
        ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
        : '';
      
      const notificationTitle = "🚨 Application Rejected - Maximum Attempts Reached";
      const notificationMessage = `Your application has been permanently rejected due to reaching the maximum number of attempts (${maxAttempts}) for ${documentType.name}.\n\nLast Rejection Reason: ${args.rejectionReason}${specificIssuesText}\n\n❌ This application can no longer be continued.\n\n✅ If you wish to obtain a Health Card, please create a new application and ensure all documents meet the requirements.\n\nFor assistance with document requirements, please contact our support team.`;
      
      const now = Date.now();
      
      // Permanently reject the application (not locked, but rejected)
      await ctx.db.patch(application._id, {
        applicationStatus: "Rejected",
        adminRemarks: `Application permanently rejected: Maximum document rejection attempts (${maxAttempts}) reached for ${documentType.name}. Applicant must create new application.`,
        updatedAt: now,
      });
      
      // Get job category for history record
      const jobCategory = await ctx.db.get(application.jobCategoryId);
      
      // Count all rejected documents and payments
      const allRejectedDocs = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();
      
      const allRejectedPayments = await ctx.db
        .query("paymentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();
      
      // Create application rejection history record (automatic rejection)
      await ctx.db.insert("applicationRejectionHistory", {
        applicationId: application._id,
        applicantName: applicant?.fullname || "Unknown",
        applicantEmail: applicant?.email || "N/A",
        jobCategoryId: application.jobCategoryId,
        jobCategoryName: jobCategory?.name || "Unknown",
        applicationType: application.applicationType,
        rejectionCategory: "max_attempts_reached",
        rejectionReason: `Maximum document rejection attempts (${maxAttempts}) reached for ${documentType.name}`,
        rejectionType: "automatic",
        triggerSource: "max_document_attempts",
        totalDocumentsRejected: allRejectedDocs.length,
        totalPaymentsRejected: allRejectedPayments.length,
        rejectedBy: admin._id,
        rejectedByName: admin.fullname || admin.email,
        rejectedAt: now,
        notificationSent: true,
        notificationSentAt: now,
      });
      
      // Send immediate critical notification to applicant
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: notificationTitle,
        message: notificationMessage,
        notificationType: "application_rejected_max_attempts",
        isRead: false,
        jobCategoryId: application.jobCategoryId,
      });
      
      // Mark as notified immediately
      await ctx.db.patch(rejectionHistoryId, {
        notificationSent: true,
        notificationSentAt: Date.now(),
      });
      
      // Notify all admins about permanent rejection
      const allAdminsForMaxAlert = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      
      for (const adminUser of allAdminsForMaxAlert) {
        if (!adminUser.managedCategories || 
            adminUser.managedCategories.length === 0 || 
            adminUser.managedCategories.includes(application.jobCategoryId)) {
          await ctx.db.insert("notifications", {
            userId: adminUser._id,
            notificationType: "application_permanently_rejected",
            title: `🚨 Application Permanently Rejected - ${applicantName}`,
            message: `${applicantName}'s application has been permanently rejected after ${maxAttempts} failed attempts for ${documentType.name}. Applicant must create a new application.`,
            actionUrl: `/dashboard/${application._id}/doc_verif`,
            applicationId: application._id,
            jobCategoryId: application.jobCategoryId,
            isRead: false,
          });
        }
      }
    }
    
    // NOTE: For normal rejections (attempts 1-2), notifications will be queued and sent later
    // when admin clicks "Request Document Resubmission" button. This allows batching multiple
    // document rejections into one notification session.

    // 10. Return success with rejection ID and warning flags
    return {
      success: true,
      rejectionId: rejectionHistoryId,
      message: `Document ${documentType.name} has been rejected successfully`,
      attemptNumber: attemptNumber,
      maxAttemptsReached: maxAttemptsReached,
      isFinalAttempt: attemptNumber === REJECTION_LIMITS.DOCUMENTS.FINAL_ATTEMPT_WARNING,
      remainingAttempts: Math.max(0, maxAttempts - attemptNumber),
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
