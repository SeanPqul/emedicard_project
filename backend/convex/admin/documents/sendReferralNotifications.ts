import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Sends referral/issue notifications to the applicant
 *
 * This function uses proper medical terminology:
 * - Medical findings → "Medical Finding Detected" + doctor referral information
 * - Document issues → "Document Needs Correction" + specific issues
 *
 * Implements DUAL-READ: reads from BOTH old (documentRejectionHistory)
 * and new (documentReferralHistory) tables during migration period.
 */
export const sendReferralNotifications = internalMutation({
  args: {
    applicationId: v.id("applications"),
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
        throw new Error("Insufficient permissions. Only admins and inspectors can send notifications.");
      }

      // 2. Get application
      const application = await ctx.db.get(args.applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // 3. DUAL-READ: Get pending referrals/issues from BOTH tables

      // Get from NEW table (documentReferralHistory)
      const allReferrals = await ctx.db
        .query("documentReferralHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();

      const pendingReferrals = allReferrals.filter(
        (referral) => referral.notificationSent === false
      );

      // Get from OLD table (documentRejectionHistory) - for backward compatibility
      const allRejections = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();

      const pendingRejections = allRejections.filter(
        (rejection) => rejection.notificationSent === false
      );

      // Combine and deduplicate (prefer new table if both exist for same document)
      const documentTypeIds = new Set();
      const combinedPending = [];

      // Add from new table first (preferred)
      for (const referral of pendingReferrals) {
        combinedPending.push({ source: 'new', data: referral });
        documentTypeIds.add(referral.documentTypeId);
      }

      // Add from old table only if not already in new table
      for (const rejection of pendingRejections) {
        if (!documentTypeIds.has(rejection.documentTypeId)) {
          combinedPending.push({ source: 'old', data: rejection });
        }
      }

      if (combinedPending.length === 0) {
        return {
          success: true,
          message: "No pending referrals/issues to notify",
          notificationsSent: 0,
        };
      }

      // 4. Send individual notification for each referral/issue
      const notificationResults = await Promise.all(
        combinedPending.map(async (item) => {
          const data = item.data;
          const docType = await ctx.db.get(data.documentTypeId);
          const documentName = docType?.name || "Unknown Document";

          // Format specific issues if present
          const specificIssuesText = data.specificIssues && data.specificIssues.length > 0
            ? `\n\nSpecific Issues:\n${data.specificIssues.map(issue => `• ${issue}`).join('\n')}`
            : '';

          // Determine issue type (check source)
          let issueType: "medical_referral" | "document_issue";
          let notificationTitle: string;
          let notificationMessage: string;

          if (item.source === 'new') {
            // NEW table - use issueType field
            const referral = data as any; // documentReferralHistory type
            issueType = referral.issueType;

            if (issueType === "medical_referral") {
              // MEDICAL REFERRAL - Patient-friendly messaging
              const doctorName = referral.doctorName || "the designated doctor";
              const clinicAddress = referral.clinicAddress || "the medical clinic";

              notificationTitle = "📋 Medical Finding Detected";
              notificationMessage = `Medical Finding: ${documentName}

Finding Detected:
${referral.referralReason}${specificIssuesText}

📍 What This Means:
Your ${documentName} shows results that require medical attention. This is a normal part of the health card application process and happens to many applicants.

🏥 Next Steps:
1. Visit ${doctorName} at:
   ${clinicAddress}

2. Complete the recommended medical consultation/treatment

3. Return for a re-check after treatment completion

4. Your application will continue once you receive medical clearance

⏰ Timeline:
After completing your medical consultation and any necessary treatment, schedule a re-check. Once cleared by the doctor, your application will proceed to the next step.

ℹ️ Important:
• Your application is NOT rejected
• This is attempt ${referral.attemptNumber} of 3
• You can continue your application after medical clearance

📞 Need Help?
Contact our support team if you have questions about the medical consultation process.`;

              // Add attempt warnings for medical referrals
              if (referral.attemptNumber === 2) {
                notificationMessage += `\n\n⚠️ Warning: This is attempt 2 of 3. Please ensure you complete the full medical consultation and treatment before your re-check.`;
              } else if (referral.attemptNumber === 3) {
                notificationMessage += `\n\n🚨 FINAL ATTEMPT: This is your last chance (attempt 3 of 3). If medical findings persist after this attempt, your application will be permanently closed and you will need to create a new application.`;
              }

            } else {
              // DOCUMENT ISSUE - Need resubmission
              notificationTitle = "📄 Document Needs Correction";
              notificationMessage = `Document Issue: ${documentName}

Issue Detected:
${referral.referralReason}${specificIssuesText}

📋 What's Wrong:
Your ${documentName} has quality or compliance issues that need to be corrected before your application can proceed.

✅ What You Need to Do:
Upload a corrected version of your ${documentName} that addresses all the issues mentioned above.

This is attempt ${referral.attemptNumber} of 3.

💡 Tips for Successful Upload:
• Ensure good lighting and clear image quality
• Check document is not expired
• Verify all required information is visible and legible
• Use correct file format (PDF, JPG, or PNG)
• Make sure the entire document fits in the frame

⏳ Timeline:
Your application is on hold until you submit a corrected document. Please resubmit as soon as possible to avoid delays.

📞 Need Help?
Contact our support team if you have questions about document requirements.`;

              // Add attempt warnings for document issues
              if (referral.attemptNumber === 2) {
                notificationMessage += `\n\n⚠️ Warning: You have 1 more attempt remaining. Please review the requirements carefully before resubmitting.`;
              } else if (referral.attemptNumber === 3) {
                notificationMessage += `\n\n🚨 FINAL ATTEMPT: This is your LAST chance (attempt 3 of 3). If this document is rejected again, your application will be permanently closed and you will need to create a new application.`;
              }
            }

          } else {
            // OLD table - infer type from doctorName presence
            const rejection = data as any; // documentRejectionHistory type
            issueType = rejection.doctorName ? "medical_referral" : "document_issue";

            if (issueType === "medical_referral") {
              // Medical referral (old format)
              const doctorName = rejection.doctorName || "the designated doctor";

              notificationTitle = "📋 Medical Finding Detected";
              notificationMessage = `Medical Finding: ${documentName}

Finding Detected:
${rejection.rejectionReason}${specificIssuesText}

🏥 Next Steps:
Please visit ${doctorName} for medical consultation.

This is attempt ${rejection.attemptNumber} of 3.

Your application will continue after medical clearance.`;

            } else {
              // Document issue (old format)
              notificationTitle = "📄 Document Needs Correction";
              notificationMessage = `Document Issue: ${documentName}

Issue Detected:
${rejection.rejectionReason}${specificIssuesText}

Please upload a corrected version of your ${documentName}.

This is attempt ${rejection.attemptNumber} of 3.`;
            }

            // Add attempt warnings for old format
            if (rejection.attemptNumber === 2) {
              notificationMessage += `\n\n⚠️ Warning: You have 1 more attempt remaining.`;
            } else if (rejection.attemptNumber === 3) {
              notificationMessage += `\n\n🚨 FINAL ATTEMPT: This is your LAST chance (attempt 3 of 3).`;
            }
          }

          // Send notification
          await ctx.db.insert("notifications", {
            userId: application.userId,
            applicationId: args.applicationId,
            title: notificationTitle,
            message: notificationMessage,
            notificationType: issueType === "medical_referral" ? "document_referred_medical" : "document_needs_correction",
            isRead: false,
            jobCategoryId: application.jobCategoryId,
            actionUrl: issueType === "medical_referral"
              ? `/applications/${args.applicationId}/medical-referral`
              : `/applications/${args.applicationId}/resubmit/${data.documentTypeId}`,
          });

          return { documentTypeId: data.documentTypeId, issueType };
        })
      );

      // 5. Mark all referrals/issues as notified in BOTH tables
      const currentTime = Date.now();

      // Update new table
      await Promise.all(
        pendingReferrals.map((referral) =>
          ctx.db.patch(referral._id, {
            notificationSent: true,
            notificationSentAt: currentTime,
          })
        )
      );

      // Update old table (only if not in new table)
      const newTableDocTypeIds = new Set(pendingReferrals.map(r => r.documentTypeId));
      const rejectionsToUpdate = pendingRejections.filter(
        rej => !newTableDocTypeIds.has(rej.documentTypeId)
      );

      await Promise.all(
        rejectionsToUpdate.map((rejection) =>
          ctx.db.patch(rejection._id, {
            notificationSent: true,
            notificationSentAt: currentTime,
          })
        )
      );

      // 6. Log activity with new terminology
      const medicalCount = notificationResults.filter(r => r.issueType === "medical_referral").length;
      const documentCount = notificationResults.filter(r => r.issueType === "document_issue").length;

      const activityDetails = medicalCount > 0 && documentCount > 0
        ? `Sent ${medicalCount} medical referral notification(s) and ${documentCount} document issue notification(s) for application ${args.applicationId}`
        : medicalCount > 0
        ? `Sent ${medicalCount} medical referral notification(s) for application ${args.applicationId}`
        : `Sent ${documentCount} document issue notification(s) for application ${args.applicationId}`;

      await ctx.db.insert("adminActivityLogs", {
        adminId: admin._id,
        activityType: "referral_notification_sent",
        details: activityDetails,
        applicationId: args.applicationId,
        jobCategoryId: application.jobCategoryId,
        timestamp: currentTime,
      });

      return {
        success: true,
        message: `Successfully sent ${combinedPending.length} notification(s) (${medicalCount} medical, ${documentCount} document issues)`,
        notificationsSent: combinedPending.length,
        medicalReferrals: medicalCount,
        documentIssues: documentCount,
      };
    } catch (error) {
      console.error("Error sending referral notifications:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: `Failed to send notifications: ${message}`,
        notificationsSent: 0,
      };
    }
  },
});
