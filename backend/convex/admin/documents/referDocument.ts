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

      // 5. Count previous attempts for this document
      // Check appropriate history table based on issue type
      let attemptNumber = 1;
      let historyId: any;
      
      if (args.issueType === "medical_referral") {
        // Medical referrals go to documentReferralHistory
        const previousReferrals = await ctx.db
          .query("documentReferralHistory")
          .withIndex("by_document_type", (q) =>
            q.eq("applicationId", documentUpload.applicationId)
             .eq("documentTypeId", documentUpload.documentTypeId)
          )
          .collect();
        
        attemptNumber = previousReferrals.length + 1;
        
        // 6a. Create medical referral record
        historyId = await ctx.db.insert("documentReferralHistory", {
          applicationId: documentUpload.applicationId,
          documentTypeId: documentUpload.documentTypeId,
          documentUploadId: args.documentUploadId,

          // Preserved file data
          referredFileId: documentUpload.storageFileId,
          originalFileName: documentUpload.originalFileName,
          fileSize: file.size,
          fileType: file.contentType || "application/octet-stream",

          // Medical referral specific
          issueType: args.issueType,
          medicalReferralCategory: args.medicalReferralCategory,
          documentIssueCategory: undefined,

          // Referral information
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
      } else {
        // Document issues go to documentRejectionHistory
        const previousRejections = await ctx.db
          .query("documentRejectionHistory")
          .withIndex("by_document_type", (q) =>
            q.eq("applicationId", documentUpload.applicationId)
             .eq("documentTypeId", documentUpload.documentTypeId)
          )
          .collect();
        
        attemptNumber = previousRejections.length + 1;
        
        // 6b. Create document rejection record
        // Map extended documentIssueCategory to basic rejectionCategory
        const categoryMap: Record<string, "quality_issue" | "wrong_document" | "expired_document" | "incomplete_document" | "invalid_document" | "format_issue" | "other"> = {
          "invalid_id": "invalid_document",
          "expired_id": "expired_document",
          "blurry_photo": "quality_issue",
          "wrong_format": "format_issue",
          "missing_info": "incomplete_document",
          "quality_issue": "quality_issue",
          "wrong_document": "wrong_document",
          "expired_document": "expired_document",
          "incomplete_document": "incomplete_document",
          "invalid_document": "invalid_document",
          "format_issue": "format_issue",
          "other": "other"
        };
        
        historyId = await ctx.db.insert("documentRejectionHistory", {
          applicationId: documentUpload.applicationId,
          documentTypeId: documentUpload.documentTypeId,
          documentUploadId: args.documentUploadId,

          // Preserved file data
          rejectedFileId: documentUpload.storageFileId,
          originalFileName: documentUpload.originalFileName,
          fileSize: file.size,
          fileType: file.contentType || "application/octet-stream",

          // Document issue specific - map to basic category
          rejectionCategory: categoryMap[args.documentIssueCategory!] || "other",
          rejectionReason: args.referralReason,
          specificIssues: args.specificIssues,

          // Tracking
          rejectedBy: admin._id,
          rejectedAt: Date.now(),

          // Resubmission tracking
          wasReplaced: false,
          attemptNumber: attemptNumber,

          // Status tracking
          status: "pending",

          // Notification tracking
          notificationSent: false,
          notificationSentAt: undefined,

          // Audit fields
          ipAddress: undefined,
          userAgent: undefined,
        });
      }


      // 7. Check if max attempts reached BEFORE updating status
      const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'document');
      const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;
      
      // 8. Update document status with new terminology
      const newReviewStatus = maxAttemptsReached
        ? "ManualReviewRequired"  // Max attempts - needs in-person verification
        : args.issueType === "medical_referral"
        ? "Referred"              // Medical finding
        : "NeedsRevision";        // Document issue

      const adminRemarksText = maxAttemptsReached
        ? `Maximum resubmission attempts reached (${maxAttempts} attempts). In-person verification is now required. Please visit the City Health Office, Magsaysay Park Complex, Door 7, Davao City, with your original ${documentType.name}. Office hours: Monday-Friday, 8:00 AM - 5:00 PM. For appointment scheduling, contact us at 0926-686-1531.`
        : args.issueType === "medical_referral"
        ? `Medical Finding Detected - Please see ${args.doctorName} at ${args.clinicAddress || 'the designated clinic'}`
        : args.referralReason;

      await ctx.db.patch(args.documentUploadId, {
        reviewStatus: newReviewStatus,
        adminRemarks: adminRemarksText,
        reviewedBy: admin._id,
        reviewedAt: Date.now(),
      });

      // 9. Update application status with new terminology
      const newApplicationStatus = maxAttemptsReached
        ? "Onsite Verification Required"
        : args.issueType === "medical_referral"
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

      // 12. Send notifications if max attempts reached
      if (maxAttemptsReached) {
        // Max attempts reached - ONSITE VERIFICATION REQUIRED (Hybrid Approach)
        const specificIssuesText = args.specificIssues.length > 0
          ? `\n\nSpecific Issues:\n${args.specificIssues.map(issue => `• ${issue}`).join('\n')}`
          : '';

        const notificationTitle = "⚠️ Onsite Verification Required - Maximum Attempts Reached";
        const notificationMessage = args.issueType === "medical_referral"
          ? `Your ${documentType.name} requires in-person verification after ${maxAttempts} unsuccessful attempts.\n\nLast Finding: ${args.referralReason}${specificIssuesText}\n\n📍 Please visit the City Health Office for in-person verification:\n\n🏥 Venue: City Health Office, Magsaysay Park Complex, Door 7, Davao City\n🕐 Office Hours: Monday-Friday, 8:00 AM - 5:00 PM\n\n📋 What to Bring: Original ${documentType.name}\n\n💡 Our staff will verify your documents in person and may approve your application on the spot if everything is in order.\n\nFor appointment scheduling, contact: 0926-686-1531`
          : `Your ${documentType.name} requires in-person verification after ${maxAttempts} unsuccessful resubmissions.\n\nLast Issue: ${args.referralReason}${specificIssuesText}\n\n📍 Please visit the City Health Office for in-person verification:\n\n🏥 Venue: City Health Office, Magsaysay Park Complex, Door 7, Davao City\n🕐 Office Hours: Monday-Friday, 8:00 AM - 5:00 PM\n\n📋 What to Bring: Original ${documentType.name}\n\n💡 Our staff will verify your documents in person and may approve your application on the spot if everything is in order.\n\nFor appointment scheduling, contact: 0926-686-1531`;

        const now = Date.now();

        const jobCategory = await ctx.db.get(application.jobCategoryId);

        const allReferrals = await ctx.db
          .query("documentReferralHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        const allRejections = await ctx.db
          .query("documentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        // Add both counts (referrals + rejections)
        const totalDocumentIssues = allReferrals.length + allRejections.length;

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
          notificationType: "application_manual_review_required",
          isRead: false,
          jobCategoryId: application.jobCategoryId,
        });

        await ctx.db.patch(historyId, {
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
              notificationType: "application_manual_review_required_admin",
              title: `⚠️ Manual Review Required - ${applicantName}`,
              message: `${applicantName}'s application requires in-person verification after ${maxAttempts} failed attempts for ${documentType.name}. Applicant has been directed to visit the venue.`,
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
        referralId: historyId,
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
