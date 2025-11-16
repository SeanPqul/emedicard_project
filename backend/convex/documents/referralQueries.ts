import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Referral/Issue Queries with Dual-Read Pattern
 *
 * These queries read from BOTH old (documentRejectionHistory) and new (documentReferralHistory)
 * tables, merge the results, and deduplicate to handle the migration period.
 */

// Query to fetch all referral/issue history for an application
export const getReferralHistory = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Read only from new referralHistory table
    const referrals = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    // Enrich with document type and admin information
    const enrichedItems = await Promise.all(
      referrals.map(async (data) => {
        const documentType = await ctx.db.get(data.documentTypeId);
        const referredBy = await ctx.db.get(data.referredBy);

        // Get replacement document info if exists
        let replacementInfo = null;
        if (data.wasReplaced && data.replacementUploadId) {
          const replacementDoc = await ctx.db.get(data.replacementUploadId) as any;
          if (replacementDoc && "originalFileName" in replacementDoc) {
            replacementInfo = {
              uploadId: replacementDoc._id,
              fileName: replacementDoc.originalFileName,
              uploadedAt: replacementDoc.uploadedAt,
              reviewStatus: replacementDoc.reviewStatus,
            };
          }
        }

        const issueType = data.issueType;

        return {
          _id: data._id,
          applicationId: data.applicationId,
          documentTypeId: data.documentTypeId,
          documentTypeName: (documentType as any)?.name || "Unknown Document",
          documentTypeIcon: (documentType as any)?.icon,
          issueType: issueType,
          category: issueType === "medical_referral"
            ? data.medicalReferralCategory
            : data.documentIssueCategory,
          reason: data.referralReason,
          specificIssues: data.specificIssues,
          doctorName: data.doctorName,
          clinicAddress: data.clinicAddress,
          findingDescription: data.findingDescription, // Medical finding for referral details
          referredAt: data.referredAt,
          referredByName: (referredBy as any)?.fullname || "Admin",
          attemptNumber: data.attemptNumber,
          wasReplaced: data.wasReplaced,
          replacedAt: data.replacedAt,
          replacementInfo,
        };
      })
    );

    // Sort by referredAt descending
    enrichedItems.sort((a, b) => b.referredAt - a.referredAt);

    return enrichedItems;
  },
});

// Query to get detailed referral/issue information for a specific document
export const getDocumentReferralDetails = query({
  args: {
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
  },
  handler: async (ctx, args) => {
    // DUAL-READ: Try new table first, then old table
    let item: any = null;
    let source: 'new' | 'old' = 'new';

    const newReferral = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_document_type", (q) =>
        q.eq("applicationId", args.applicationId)
         .eq("documentTypeId", args.documentTypeId)
      )
      .order("desc")
      .first();

    if (newReferral) {
      item = newReferral;
      source = 'new';
    } else {
      const oldRejection = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_document_type", (q) =>
          q.eq("applicationId", args.applicationId)
           .eq("documentTypeId", args.documentTypeId)
        )
        .order("desc")
        .first();

      if (oldRejection) {
        item = oldRejection;
        source = 'old';
      }
    }

    if (!item) {
      return null;
    }

    // Get related data (using any to handle union types during migration)
    const documentType = await ctx.db.get(item.documentTypeId) as any;
    const referredBy = (source === 'new'
      ? await ctx.db.get(item.referredBy)
      : await ctx.db.get(item.rejectedBy)) as any;
    const originalUpload = await ctx.db.get(item.documentUploadId) as any;

    // Get file URL for the referred/rejected file
    const fileId = source === 'new' ? item.referredFileId : item.rejectedFileId;
    const fileUrl = await ctx.storage.getUrl(fileId);

    // Get replacement information if exists
    let replacementDetails = null;
    if (item.wasReplaced && item.replacementUploadId) {
      const replacementDoc = await ctx.db.get(item.replacementUploadId) as any;
      if (replacementDoc && replacementDoc.storageFileId) {
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

    // Determine issue type
    const issueType = source === 'new'
      ? item.issueType
      : (item.doctorName ? "medical_referral" : "document_issue");

    return {
      _id: item._id,
      applicationId: item.applicationId,
      issueType: issueType,
      documentType: {
        _id: documentType?._id,
        name: documentType?.name || "Unknown Document",
        description: documentType?.description,
        icon: documentType?.icon,
      },
      originalFile: {
        fileName: item.originalFileName,
        fileSize: item.fileSize,
        fileType: item.fileType,
        fileUrl: fileUrl,
        uploadedAt: originalUpload?.uploadedAt,
      },
      referral: {
        category: source === 'new'
          ? (issueType === "medical_referral" ? item.medicalReferralCategory : item.documentIssueCategory)
          : item.rejectionCategory,
        reason: source === 'new' ? item.referralReason : item.rejectionReason,
        specificIssues: item.specificIssues,
        doctorName: item.doctorName,
        clinicAddress: source === 'new' ? item.clinicAddress : undefined,
        findingDescription: source === 'new' ? item.findingDescription : undefined, // Medical finding for pre-filling lab form
        attemptNumber: item.attemptNumber,
        referredAt: source === 'new' ? item.referredAt : item.rejectedAt,
        referredBy: {
          _id: referredBy?._id,
          name: referredBy?.fullname || "Admin",
          email: referredBy?.email,
        },
      },
      resubmission: {
        wasReplaced: item.wasReplaced,
        replacedAt: item.replacedAt,
        replacementDetails,
      },
      source: source, // For debugging
    };
  },
});

// Query to get count of referred/flagged documents for a user
export const getReferredDocumentsCount = query({
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

    // DUAL-READ: Count from both tables and merge
    let totalIssues = 0;
    let pendingResubmission = 0;
    let medicalReferrals = 0;
    let documentIssues = 0;

    for (const appId of applicationIds) {
      // Get from new table
      const newReferrals = await ctx.db
        .query("documentReferralHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", appId))
        .collect();

      // Get from old table
      const oldRejections = await ctx.db
        .query("documentRejectionHistory")
        .withIndex("by_application", (q) => q.eq("applicationId", appId))
        .collect();

      // Deduplicate and count
      const documentTypeMap = new Map();

      for (const ref of newReferrals) {
        const key = `${ref.documentTypeId}_${ref.attemptNumber}`;
        documentTypeMap.set(key, { source: 'new', data: ref });
      }

      for (const rej of oldRejections) {
        const key = `${rej.documentTypeId}_${rej.attemptNumber}`;
        if (!documentTypeMap.has(key)) {
          documentTypeMap.set(key, { source: 'old', data: rej });
        }
      }

      totalIssues += documentTypeMap.size;

      for (const item of documentTypeMap.values()) {
        if (!item.data.wasReplaced) {
          pendingResubmission++;
        }

        // Count by type
        if (item.source === 'new') {
          if (item.data.issueType === 'medical_referral') {
            medicalReferrals++;
          } else {
            documentIssues++;
          }
        } else {
          if (item.data.doctorName) {
            medicalReferrals++;
          } else {
            documentIssues++;
          }
        }
      }
    }

    return {
      totalIssues,
      pendingResubmission,
      medicalReferrals,
      documentIssues,
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

    // DUAL-READ: Get replacements from both tables
    const oldResubmissions = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .take(50);

    const newResubmissions = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .take(50);

    // Merge and deduplicate
    const resubmissionMap = new Map();

    for (const item of [...newResubmissions, ...oldResubmissions]) {
      const key = `${item.applicationId}_${item.documentTypeId}_${item.attemptNumber}`;
      if (!resubmissionMap.has(key)) {
        resubmissionMap.set(key, item);
      }
    }

    // Filter for those with pending review status (using any for type safety during migration)
    const pendingReviews = [];
    for (const resubmission of resubmissionMap.values()) {
      if (resubmission.replacementUploadId) {
        const doc = await ctx.db.get(resubmission.replacementUploadId) as any;
        if (doc && doc.reviewStatus === "Pending") {
          const application = await ctx.db.get(resubmission.applicationId) as any;
          const applicant = application ? await ctx.db.get(application.userId) as any : null;
          const documentType = await ctx.db.get(resubmission.documentTypeId) as any;

          const reason = (resubmission as any).referralReason || (resubmission as any).rejectionReason;

          pendingReviews.push({
            _id: doc._id,
            applicationId: resubmission.applicationId,
            documentTypeId: resubmission.documentTypeId,
            documentTypeName: documentType?.name || "Unknown Document",
            applicantName: applicant?.fullname || "Unknown User",
            originalReason: reason,
            attemptNumber: resubmission.attemptNumber,
            resubmittedAt: resubmission.replacedAt,
            fileName: doc.originalFileName,
          });
        }
      }
    }

    // Sort by resubmission date
    pendingReviews.sort((a, b) => (b.resubmittedAt || 0) - (a.resubmittedAt || 0));

    return pendingReviews;
  },
});
