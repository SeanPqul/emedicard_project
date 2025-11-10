// convex/applications/getWithDocuments.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    // 1. Get the main application document
    const application = await ctx.db.get(args.id);
    if (!application) return null;

    // 2. Get the related user and job category
    const user = await ctx.db.get(application.userId);
    if (!user) {
      throw new Error(`User with ID ${application.userId} not found for application ${args.id}`);
    }
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory) {
      throw new Error(`Job Category with ID ${application.jobCategoryId} not found for application ${args.id}`);
    }

    // 3. Get the list of document requirements for this job category
    const requiredDocs = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", q => q.eq("jobCategoryId", application.jobCategoryId))
      .collect();

    // 4. Get all documents the user has actually uploaded for this application
    const uploadedDocs = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", q => q.eq("applicationId", application._id))
      .collect();

    // 5. THE MAGIC MERGE: Create a final checklist for the UI
    const checklist = await Promise.all(
      requiredDocs.map(async (req) => {
        const documentType = await ctx.db.get(req.documentTypeId);
        // Find the user's upload that matches this requirement
        const userUpload = uploadedDocs.find(up => up.documentTypeId === req.documentTypeId);

        let fileUrl = null;
        if (userUpload) {
          // If the user uploaded a file, get its public URL
          fileUrl = await ctx.storage.getUrl(userUpload.storageFileId);
        }

        // Check if this document was previously rejected and resubmitted
        let isResubmission = false;
        let attemptNumber = 0;
        let maxAttemptsReached = false;
        let remainingAttempts = 3;
        
        if (userUpload) {
          // Count all rejections for this document type
          const allRejections = await ctx.db
            .query("documentRejectionHistory")
            .withIndex("by_document_type", (q) => 
              q.eq("applicationId", application._id)
               .eq("documentTypeId", req.documentTypeId)
            )
            .collect();
          
          // Count all referrals for this document type
          const allReferrals = await ctx.db
            .query("documentReferralHistory")
            .withIndex("by_document_type", (q) => 
              q.eq("applicationId", application._id)
               .eq("documentTypeId", req.documentTypeId)
            )
            .collect();
          
          // Total attempt number is sum of both rejection and referral counts
          attemptNumber = allRejections.length + allReferrals.length;
          maxAttemptsReached = attemptNumber >= 4; // Block at 4th attempt
          remainingAttempts = Math.max(0, 3 - attemptNumber);
          
          // Check if this is a resubmission
          const rejectionHistory = await ctx.db
            .query("documentRejectionHistory")
            .withIndex("by_document_type", (q) => 
              q.eq("applicationId", application._id)
               .eq("documentTypeId", req.documentTypeId)
            )
            .order("desc")
            .first();
          
          // If there's a rejection history and it was replaced, this is a resubmission
          if (rejectionHistory && rejectionHistory.wasReplaced) {
            isResubmission = true;
          }
        }

        return {
          _id: req._id, // Add the requirement's ID
          requirementName: documentType?.name ?? "Unknown Requirement",
          isRequired: req.isRequired,
          fieldIdentifier: documentType?.fieldIdentifier, // Add fieldIdentifier for medical document detection
          // --- Data from the user's upload ---
          status: userUpload?.reviewStatus ?? "Missing", // Default to "Missing" if not uploaded
          fileUrl: fileUrl,
          uploadId: userUpload?._id, // The ID of the documentUploads record
          remarks: userUpload?.adminRemarks,
          extractedText: userUpload?.extractedText, // Include extractedText
          isResubmission: isResubmission, // Track if this is a resubmission
          // --- Attempt tracking fields ---
          attemptNumber: attemptNumber, // Current attempt count (0-4+)
          maxAttemptsReached: maxAttemptsReached, // True if >= 4 attempts
          remainingAttempts: remainingAttempts, // Remaining attempts (0-3)
        };
      })
    );

    // 6. Return everything in one neat package
    return {
      applicantName: user.fullname,
      jobCategoryName: jobCategory.name,
      checklist: checklist,
      // Additional applicant details from application table
      applicantDetails: {
        firstName: application.firstName,
        lastName: application.lastName,
        middleName: application.middleName,
        email: user.email,
        gender: application.gender,
        nationality: application.nationality,
        civilStatus: application.civilStatus,
        organization: application.organization,
      },
    };
  },
});
