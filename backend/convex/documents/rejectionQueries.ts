import { query } from "../_generated/server";
import { v } from "convex/values";

// Query to fetch all rejection history for an application
export const getRejectionHistory = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get all rejection records for this application
    const rejections = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    // Enrich with document type and admin information
    const enrichedRejections = await Promise.all(
      rejections.map(async (rejection) => {
        const documentType = await ctx.db.get(rejection.documentTypeId);
        const rejectedBy = await ctx.db.get(rejection.rejectedBy);
        
        // Get replacement document info if exists
        let replacementInfo = null;
        if (rejection.wasReplaced && rejection.replacementUploadId) {
          const replacementDoc = await ctx.db.get(rejection.replacementUploadId);
          if (replacementDoc) {
            replacementInfo = {
              uploadId: replacementDoc._id,
              fileName: replacementDoc.originalFileName,
              uploadedAt: replacementDoc.uploadedAt,
              reviewStatus: replacementDoc.reviewStatus,
            };
          }
        }

        return {
          _id: rejection._id,
          applicationId: rejection.applicationId,
          documentTypeId: rejection.documentTypeId,
          documentTypeName: documentType?.name || "Unknown Document",
          documentTypeIcon: documentType?.icon,
          rejectionCategory: rejection.rejectionCategory,
          rejectionReason: rejection.rejectionReason,
          specificIssues: rejection.specificIssues,
          rejectedAt: rejection.rejectedAt,
          rejectedByName: rejectedBy?.fullname || "Admin",
          attemptNumber: rejection.attemptNumber,
          wasReplaced: rejection.wasReplaced,
          replacedAt: rejection.replacedAt,
          replacementInfo,
        };
      })
    );

    return enrichedRejections;
  },
});

// Query to get detailed rejection information for a specific document
export const getDocumentRejectionDetails = query({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
  },
  handler: async (ctx, args) => {
    // Get the most recent rejection for this document type
    const rejection = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_document_type", (q) => 
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    if (!rejection) {
      return null;
    }

    // Get related data
    const documentType = await ctx.db.get(rejection.documentTypeId);
    const rejectedBy = await ctx.db.get(rejection.rejectedBy);
    const originalUpload = await ctx.db.get(rejection.documentUploadId);

    // Get file URL for the rejected file (if needed for preview)
    const rejectedFileUrl = await ctx.storage.getUrl(rejection.rejectedFileId);

    // Get replacement information if exists
    let replacementDetails = null;
    if (rejection.wasReplaced && rejection.replacementUploadId) {
      const replacementDoc = await ctx.db.get(rejection.replacementUploadId);
      if (replacementDoc) {
        const replacementFileUrl = await ctx.storage.getUrl(replacementDoc.storageFileId);
        replacementDetails = {
          uploadId: replacementDoc._id,
          fileName: replacementDoc.originalFileName,
          fileUrl: replacementFileUrl,
          uploadedAt: replacementDoc.uploadedAt,
          reviewStatus: replacementDoc.reviewStatus,
          adminRemarks: replacementDoc.adminRemarks,
          reviewedBy: replacementDoc.reviewedBy,
          reviewedAt: replacementDoc.reviewedAt,
        };
      }
    }

    return {
      _id: rejection._id,
      applicationId: rejection.applicationId,
      documentType: {
        _id: documentType?._id,
        name: documentType?.name || "Unknown Document",
        description: documentType?.description,
        icon: documentType?.icon,
      },
      originalFile: {
        fileName: rejection.originalFileName,
        fileSize: rejection.fileSize,
        fileType: rejection.fileType,
        fileUrl: rejectedFileUrl,
        uploadedAt: originalUpload?.uploadedAt,
      },
      rejection: {
        category: rejection.rejectionCategory,
        reason: rejection.rejectionReason,
        specificIssues: rejection.specificIssues,
        attemptNumber: rejection.attemptNumber,
        rejectedAt: rejection.rejectedAt,
        rejectedBy: {
          _id: rejectedBy?._id,
          name: rejectedBy?.fullname || "Admin",
          email: rejectedBy?.email,
        },
      },
      resubmission: {
        wasReplaced: rejection.wasReplaced,
        replacedAt: rejection.replacedAt,
        replacementDetails,
      },
    };
  },
});

// Query to get count of rejected documents for a user
export const getRejectedDocumentsCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all applications for the user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const applicationIds = applications.map(app => app._id);

    // Count rejected documents that haven't been replaced
    let totalRejected = 0;
    let pendingResubmission = 0;

    for (const appId of applicationIds) {
      const rejections = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", appId))
        .collect();

      const unreplacedRejections = rejections.filter(r => !r.wasReplaced);
      totalRejected += rejections.length;
      pendingResubmission += unreplacedRejections.length;
    }

    return {
      totalRejected,
      pendingResubmission,
      applications: applicationIds.length,
    };
  },
});

// Query for admins to see resubmissions needing review
export const getResubmissionQueue = query({
  args: {},
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "inspector")) {
      throw new Error("Insufficient permissions");
    }

    // Get all replacements that happened recently
    const recentResubmissions = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .take(50);

    // Filter for those with pending review status
    const pendingReviews = [];
    for (const resubmission of recentResubmissions) {
      if (resubmission.replacementUploadId) {
        const doc = await ctx.db.get(resubmission.replacementUploadId);
        if (doc && doc.reviewStatus === "Pending") {
          const application = await ctx.db.get(resubmission.applicationId);
          const applicant = application ? await ctx.db.get(application.userId) : null;
          const documentType = await ctx.db.get(resubmission.documentTypeId);

          pendingReviews.push({
            _id: doc._id,
            applicationId: resubmission.applicationId,
            documentTypeId: resubmission.documentTypeId,
            documentTypeName: documentType?.name || "Unknown Document",
            applicantName: applicant?.fullname || "Unknown User",
            originalRejectionReason: resubmission.rejectionReason,
            attemptNumber: resubmission.attemptNumber,
            resubmittedAt: resubmission.replacedAt,
            fileName: doc.originalFileName,
          });
        }
      }
    }

    return pendingReviews;
  },
});
