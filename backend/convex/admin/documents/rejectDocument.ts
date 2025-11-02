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

    // 9. Send notification to applicant about the rejection
    const specificIssuesText = args.specificIssues.length > 0 
      ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
      : '';
    
    // Check if max attempts reached
    const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'document');
    const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;
    
    let notificationMessage = `Your ${documentType.name} has been rejected.\n\nReason: ${args.rejectionReason}${specificIssuesText}\n\nThis is attempt ${attemptNumber} of ${maxAttempts}.`;
    let notificationTitle = "Document Rejected";
    
    if (maxAttemptsReached) {
      // Max attempts reached - lock application and send critical notification
      notificationTitle = "🚨 Maximum Attempts Reached";
      notificationMessage = `You have reached the maximum number of attempts (${maxAttempts}) for ${documentType.name}.\n\nYour application has been locked and will be reviewed by our support team.\n\nLast Rejection Reason: ${args.rejectionReason}${specificIssuesText}\n\nOur team will contact you within 48 hours. You may also contact support for immediate assistance.`;
      
      // Lock the application
      if (REJECTION_LIMITS.BEHAVIOR.AUTO_LOCK_APPLICATION) {
        await ctx.db.patch(application._id, {
          applicationStatus: "Locked - Max Attempts",
          adminRemarks: `Application locked: Maximum document rejection attempts (${maxAttempts}) reached for ${documentType.name}`,
          updatedAt: Date.now(),
        });
      }
      
      // Notify all admins (including super admins) about max attempts
      const allAdmins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      
      for (const adminUser of allAdmins) {
        // Notify all admins who manage this category
        if (!adminUser.managedCategories || 
            adminUser.managedCategories.length === 0 || 
            adminUser.managedCategories.includes(application.jobCategoryId)) {
          await ctx.db.insert("notifications", {
            userId: adminUser._id,
            notificationType: "max_attempts_reached",
            title: `⚠️ Max Attempts Reached - ${applicantName}`,
            message: `${applicantName} has reached maximum attempts (${maxAttempts}) for ${documentType.name}. Application is locked and requires manual review.`,
            actionUrl: `/dashboard/${application._id}/doc_verif`,
            applicationId: application._id,
            jobCategoryId: application.jobCategoryId,
            isRead: false,
          });
        }
      }
    } else if (attemptNumber === REJECTION_LIMITS.DOCUMENTS.FINAL_ATTEMPT_WARNING) {
      // Final attempt warning
      notificationTitle = "⚠️ Final Attempt Warning";
      notificationMessage = `🚨 FINAL ATTEMPT: This is your last chance to submit ${documentType.name} correctly.\n\nReason for rejection: ${args.rejectionReason}${specificIssuesText}\n\nAttempts: ${attemptNumber} of ${maxAttempts}\n\nPlease review the requirements carefully before resubmitting. If you need help, contact our support team.`;
    } else if (attemptNumber === REJECTION_LIMITS.DOCUMENTS.WARNING_THRESHOLD) {
      // Warning threshold
      notificationMessage = `⚠️ Your ${documentType.name} has been rejected.\n\nReason: ${args.rejectionReason}${specificIssuesText}\n\nAttempts: ${attemptNumber} of ${maxAttempts}\n\n⚠️ Warning: You have ${maxAttempts - attemptNumber} attempt(s) remaining. Please review carefully before resubmitting.`;
    }
    
    // Send notification to applicant
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: application._id,
      title: notificationTitle,
      message: notificationMessage,
      notificationType: maxAttemptsReached ? "document_max_attempts" : "document_rejected",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });
    
    // Update notification tracking in rejection history
    await ctx.db.patch(rejectionHistoryId, {
      notificationSent: true,
      notificationSentAt: Date.now(),
    });

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
