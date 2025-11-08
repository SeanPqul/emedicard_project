import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { REJECTION_LIMITS, hasReachedMaxAttempts } from "../../config/rejectionLimits";

/**
 * Refer Document for Medical Management or Flag for Document Issue
 *
 * This function replaces the outdated "reject" terminology with proper medical language:
 * - Medical documents with findings → "Referred for Medical Management"
 * - Non-medical documents with issues → "Flagged for Resubmission"
 *
 * Implements DUAL-WRITE pattern: writes to BOTH old (documentRejectionHistory)
 * and new (documentReferralHistory) tables during migration period.
 */
export const referDocument = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),

    // Issue Type: Medical or Non-Medical
    issueType: v.union(
      v.literal("medical_referral"),    // Medical finding - needs doctor consultation
      v.literal("document_issue")       // Non-medical - needs document resubmission
    ),

    // Medical Referral Category (required if issueType = "medical_referral")
    medicalReferralCategory: v.optional(v.union(
      v.literal("abnormal_xray"),
      v.literal("elevated_urinalysis"),
      v.literal("positive_stool"),
      v.literal("positive_drug_test"),
      v.literal("neuro_exam_failed"),
      v.literal("hepatitis_consultation"),
      v.literal("other_medical_concern")
    )),

    // Document Issue Category (required if issueType = "document_issue")
    documentIssueCategory: v.optional(v.union(
      v.literal("invalid_id"),
      v.literal("expired_id"),
      v.literal("blurry_photo"),
      v.literal("wrong_format"),
      v.literal("missing_info"),
      v.literal("quality_issue"),
      v.literal("wrong_document"),
      v.literal("expired_document"),
      v.literal("incomplete_document"),
      v.literal("invalid_document"),
      v.literal("format_issue"),
      v.literal("other")
    )),

    referralReason: v.string(), // User-friendly explanation
    specificIssues: v.array(v.string()), // Bullet points of specific issues
    doctorName: v.optional(v.string()), // Required for medical referrals
    clinicAddress: v.optional(v.string()), // Venue for medical consultation
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
        throw new Error("Insufficient permissions. Only admins and inspectors can refer/flag documents.");
      }

      // 2. Validate medical referral requirements
      if (args.issueType === "medical_referral") {
        if (!args.medicalReferralCategory) {
          throw new Error("Medical referral category is required for medical referrals");
        }
        if (!args.doctorName) {
          throw new Error("Doctor name is required for medical referrals");
        }
      }

      // 3. Validate document issue requirements
      if (args.issueType === "document_issue") {
        if (!args.documentIssueCategory) {
          throw new Error("Document issue category is required for document issues");
        }
      }

      // 4. Get document and application details
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

      // Check if document is already referred/flagged
      if (documentUpload.reviewStatus === "Rejected" ||
          documentUpload.reviewStatus === "Referred" ||
          documentUpload.reviewStatus === "NeedsRevision") {
        throw new Error("Document is already referred or flagged");
      }

      // 5. Count previous attempts for this document (check BOTH tables during migration)
      const previousRejectionsOld = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", documentUpload.applicationId)
           .eq("documentTypeId", documentUpload.documentTypeId)
        )
        .collect();

      const previousReferralsNew = await ctx.db
        .query("documentReferralHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", documentUpload.applicationId)
           .eq("documentTypeId", documentUpload.documentTypeId)
        )
        .collect();

      // Use the maximum to avoid counting issues
      const attemptNumber = Math.max(
        previousRejectionsOld.length,
        previousReferralsNew.length
      ) + 1;

      // 6. DUAL-WRITE: Create record in NEW table (documentReferralHistory)
      const referralHistoryId = await ctx.db.insert("documentReferralHistory", {
        applicationId: documentUpload.applicationId,
        documentTypeId: documentUpload.documentTypeId,
        documentUploadId: args.documentUploadId,

        // Preserved file data
        referredFileId: documentUpload.storageFileId,
        originalFileName: documentUpload.originalFileName,
        fileSize: file.size,
        fileType: file.contentType || "application/octet-stream",

        // Issue type and categories
        issueType: args.issueType,
        medicalReferralCategory: args.medicalReferralCategory,
        documentIssueCategory: args.documentIssueCategory,

        // Referral/issue information
        referralReason: args.referralReason,
        specificIssues: args.specificIssues,
        doctorName: args.doctorName,
        clinicAddress: args.clinicAddress,

        // Tracking
        referredBy: admin._id,
        referredAt: Date.now(),

        // Resubmission tracking
        wasReplaced: false,
        attemptNumber: attemptNumber,

        // Status flow tracking
        status: "pending",

        // Notification tracking
        notificationSent: false,
        notificationSentAt: undefined,

        // Audit fields
        ipAddress: undefined,
        userAgent: undefined,
      });

      // 7. DUAL-WRITE: Also write to OLD table for backward compatibility
      const oldRejectionCategory = args.issueType === "medical_referral"
        ? "other" // Map medical to "other" in old system
        : (args.documentIssueCategory || "other");

      await ctx.db.insert("documentRejectionHistory", {
        applicationId: documentUpload.applicationId,
        documentTypeId: documentUpload.documentTypeId,
        documentUploadId: args.documentUploadId,

        rejectedFileId: documentUpload.storageFileId,
        originalFileName: documentUpload.originalFileName,
        fileSize: file.size,
        fileType: file.contentType || "application/octet-stream",

        rejectionCategory: oldRejectionCategory as any,
        rejectionReason: args.referralReason,
        specificIssues: args.specificIssues,
        doctorName: args.doctorName,

        rejectedBy: admin._id,
        rejectedAt: Date.now(),

        wasReplaced: false,
        attemptNumber: attemptNumber,

        status: "pending",

        notificationSent: false,
        notificationSentAt: undefined,

        ipAddress: undefined,
        userAgent: undefined,
      });

      // 8. Update document status with new terminology
      const newReviewStatus = args.issueType === "medical_referral"
        ? "Referred"           // Medical finding
        : "NeedsRevision";     // Document issue

      const adminRemarksText = args.issueType === "medical_referral"
        ? `Medical Finding Detected - Please see ${args.doctorName} at ${args.clinicAddress || 'the designated clinic'}`
        : args.referralReason;

      await ctx.db.patch(args.documentUploadId, {
        reviewStatus: newReviewStatus,
        adminRemarks: adminRemarksText,
        reviewedBy: admin._id,
        reviewedAt: Date.now(),
      });

      // 9. Update application status with new terminology
      const newApplicationStatus = args.issueType === "medical_referral"
        ? "Referred for Medical Management"
        : "Documents Need Revision";

      await ctx.db.patch(documentUpload.applicationId, {
        applicationStatus: newApplicationStatus,
        updatedAt: Date.now(),
      });

      // 10. Send admin notification with new terminology
      const allAdmins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();

      const relevantAdmins = allAdmins.filter((adminUser) => {
        if (adminUser._id === admin._id) return false;
        if (!adminUser.managedCategories || adminUser.managedCategories.length === 0) {
          return true;
        }
        return adminUser.managedCategories.includes(application.jobCategoryId);
      });

      const applicant = await ctx.db.get(application.userId);
      const applicantName = applicant?.fullname || "Unknown Applicant";

      const notificationTypeOld = args.issueType === "medical_referral"
        ? "document_referral_medical"
        : "document_issue_flagged";

      const notificationTitle = args.issueType === "medical_referral"
        ? "Medical Referral Created"
        : "Document Issue Flagged";

      const notificationMessage = args.issueType === "medical_referral"
        ? `${admin.fullname || admin.email} has referred ${documentType.name} for ${applicantName}'s application to ${args.doctorName}. Finding: ${args.referralReason}`
        : `${admin.fullname || admin.email} has flagged ${documentType.name} for ${applicantName}'s application. Issue: ${args.referralReason}`;

      for (const targetAdmin of relevantAdmins) {
        await ctx.db.insert("notifications", {
          userId: targetAdmin._id,
          notificationType: notificationTypeOld,
          title: notificationTitle,
          message: notificationMessage,
          actionUrl: `/dashboard/${application._id}/doc_verif`,
          applicationId: application._id,
          jobCategoryId: application.jobCategoryId,
          isRead: false,
        });
      }

      // 11. Create admin activity log with new terminology
      const activityType = args.issueType === "medical_referral"
        ? "document_referral"
        : "document_issue";

      const activityDetails = args.issueType === "medical_referral"
        ? `Referred ${documentType.name} for application ${application._id} to ${args.doctorName}. Finding: ${args.referralReason}`
        : `Flagged ${documentType.name} for application ${application._id}. Issue: ${args.referralReason}`;

      await ctx.db.insert("adminActivityLogs", {
        adminId: admin._id,
        activityType: activityType,
        details: activityDetails.substring(0, 500),
        applicationId: application._id,
        jobCategoryId: application.jobCategoryId,
        timestamp: Date.now(),
      });

      // 12. Check if max attempts reached
      const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'document');
      const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;

      if (maxAttemptsReached) {
        // Max attempts reached - PERMANENTLY REJECT application
        const specificIssuesText = args.specificIssues.length > 0
          ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
          : '';

        const notificationTitle = "🚨 Application Rejected - Maximum Attempts Reached";
        const notificationMessage = args.issueType === "medical_referral"
          ? `Your application has been permanently rejected due to reaching the maximum number of referral attempts (${maxAttempts}) for ${documentType.name}.\n\nLast Finding: ${args.referralReason}${specificIssuesText}\n\n❌ This application can no longer be continued.\n\n✅ If you wish to obtain a Health Card, please complete your medical treatment and create a new application.\n\nFor assistance, please contact our support team.`
          : `Your application has been permanently rejected due to reaching the maximum number of resubmission attempts (${maxAttempts}) for ${documentType.name}.\n\nLast Issue: ${args.referralReason}${specificIssuesText}\n\n❌ This application can no longer be continued.\n\n✅ If you wish to obtain a Health Card, please create a new application and ensure all documents meet the requirements.\n\nFor assistance with document requirements, please contact our support team.`;

        const now = Date.now();

        await ctx.db.patch(application._id, {
          applicationStatus: "Rejected",
          adminRemarks: `Application permanently rejected: Maximum attempts (${maxAttempts}) reached for ${documentType.name}. Applicant must create new application.`,
          updatedAt: now,
        });

        const jobCategory = await ctx.db.get(application.jobCategoryId);

        const allReferralsNew = await ctx.db
          .query("documentReferralHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        const allRejectionsOld = await ctx.db
          .query("documentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        const totalDocumentIssues = Math.max(allReferralsNew.length, allRejectionsOld.length);

        const allRejectedPayments = await ctx.db
          .query("paymentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        await ctx.db.insert("applicationRejectionHistory", {
          applicationId: application._id,
          applicantName: applicant?.fullname || "Unknown",
          applicantEmail: applicant?.email || "N/A",
          jobCategoryId: application.jobCategoryId,
          jobCategoryName: jobCategory?.name || "Unknown",
          applicationType: application.applicationType,
          rejectionCategory: "max_attempts_reached",
          rejectionReason: `Maximum attempts (${maxAttempts}) reached for ${documentType.name}`,
          rejectionType: "automatic",
          triggerSource: "max_document_attempts",
          totalDocumentsRejected: totalDocumentIssues,
          totalPaymentsRejected: allRejectedPayments.length,
          rejectedBy: admin._id,
          rejectedByName: admin.fullname || admin.email,
          rejectedAt: now,
          notificationSent: true,
          notificationSentAt: now,
        });

        await ctx.db.insert("notifications", {
          userId: application.userId,
          applicationId: application._id,
          title: notificationTitle,
          message: notificationMessage,
          notificationType: "application_rejected_max_attempts",
          isRead: false,
          jobCategoryId: application.jobCategoryId,
        });

        await ctx.db.patch(referralHistoryId, {
          notificationSent: true,
          notificationSentAt: Date.now(),
        });

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

      // 13. Return success
      const successMessage = args.issueType === "medical_referral"
        ? `Document ${documentType.name} has been referred to ${args.doctorName} for medical management`
        : `Document ${documentType.name} has been flagged for resubmission`;

      return {
        success: true,
        referralId: referralHistoryId,
        message: successMessage,
        attemptNumber: attemptNumber,
        maxAttemptsReached: maxAttemptsReached,
        isFinalAttempt: attemptNumber === REJECTION_LIMITS.DOCUMENTS.FINAL_ATTEMPT_WARNING,
        remainingAttempts: Math.max(0, maxAttempts - attemptNumber),
        issueType: args.issueType,
      };
    } catch (error) {
      console.error("Error referring/flagging document:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: `Failed to refer/flag document: ${message}`,
      };
    }
  },
});
