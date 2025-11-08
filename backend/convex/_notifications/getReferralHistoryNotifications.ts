import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get Referral/Issue History Notifications with Dual-Read Pattern
 *
 * Reads from BOTH old (documentRejectionHistory) and new (documentReferralHistory)
 * tables to get all resubmitted documents for admin review.
 */
export const getReferralHistoryNotifications = query({
  args: {
    jobCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // DUAL-READ: Get from BOTH tables where documents were resubmitted
    const oldRejections = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .collect();

    const newReferrals = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .order("desc")
      .collect();

    // Merge and deduplicate (prefer new table)
    const historyMap = new Map();

    for (const referral of newReferrals) {
      const key = `${referral.applicationId}_${referral.documentTypeId}`;
      historyMap.set(key, { source: 'new', data: referral });
    }

    for (const rejection of oldRejections) {
      const key = `${rejection.applicationId}_${rejection.documentTypeId}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, { source: 'old', data: rejection });
      }
    }

    const history = Array.from(historyMap.values());

    // Filter by job category if provided
    let filteredHistory = history;
    if (args.jobCategory) {
      filteredHistory = await Promise.all(
        history.map(async (item) => {
          const application = await ctx.db.get(item.data.applicationId) as any;
          if (!application) return null;
          const jobCategory = await ctx.db.get(application.jobCategoryId) as any;
          return jobCategory?.name === args.jobCategory ? item : null;
        })
      ).then(results => results.filter(r => r !== null) as typeof history);
    }

    const notifications = await Promise.all(
      filteredHistory.map(async (item) => {
        const data = item.data;
        const application = await ctx.db.get(data.applicationId) as any;
        const user = application ? await ctx.db.get(application.userId) as any : null;
        const documentType = await ctx.db.get(data.documentTypeId) as any;

        // Check if current admin has read this notification
        const isReadByCurrentAdmin = data.adminReadBy?.includes(admin._id) || false;

        // Determine if medical or non-medical
        const issueType = item.source === 'new'
          ? (data as any).issueType
          : ((data as any).doctorName ? 'medical_referral' : 'document_issue');

        const title = issueType === 'medical_referral'
          ? `Medical Referral - Document Resubmitted`
          : `Document Resubmitted`;

        const message = issueType === 'medical_referral'
          ? `${user?.fullname || 'User'} has returned for re-check after medical consultation for ${documentType?.name || 'document'}. Please review.`
          : `${user?.fullname || 'User'} has resubmitted their ${documentType?.name || 'document'}. Please review.`;

        return {
          _id: data._id,
          title: title,
          message: message,
          actionUrl: `/dashboard/${data.applicationId}/doc_verif`,
          isRead: isReadByCurrentAdmin,
          notificationType: issueType === 'medical_referral' ? "MedicalReferralResubmission" : "DocumentResubmission",
          _creationTime: data.replacedAt || (item.source === 'new' ? (data as any).referredAt : (data as any).rejectedAt),
          issueType: issueType,
        };
      })
    );

    return notifications;
  },
});
