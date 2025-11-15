// convex/admin/resetDocumentVerification.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { AdminRole } from "../users/roles";

/**
 * RESET DOCUMENT VERIFICATION FOR AN APPLICATION
 * 
 * This mutation resets the document verification process for a specific application.
 * Use this when you need to start fresh due to bugs or test runs.
 * 
 * What it does:
 * 1. Resets all document uploads to "Pending" status
 * 2. Clears admin remarks and review information
 * 3. Deletes rejection/referral history records
 * 4. Resets application status to "Under Review"
 * 5. Logs the reset action
 */
export const resetDocumentVerification = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized. Admin privileges required.");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!adminUser) throw new Error("Admin user not found.");

    // Get application details
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found.");
    }

    const applicant = await ctx.db.get(application.userId);
    const applicantName = applicant?.fullname || "Unknown Applicant";

    console.log(`Starting document verification reset for application: ${args.applicationId}`);

    // Step 1: Find all document uploads for this application
    const documentUploads = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    console.log(`Found ${documentUploads.length} document uploads to reset`);

    // Step 2: Reset each document upload to Pending status
    let resetCount = 0;
    for (const doc of documentUploads) {
      await ctx.db.patch(doc._id, {
        reviewStatus: "Pending",
        adminRemarks: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
        extractedText: undefined,
      });
      resetCount++;
    }

    console.log(`Reset ${resetCount} document uploads to Pending status`);

    // Step 3: Delete all document rejection history records
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    for (const record of rejectionHistory) {
      await ctx.db.delete(record._id);
    }

    console.log(`Deleted ${rejectionHistory.length} rejection history records`);

    // Step 4: Delete all document referral history records
    const referralHistory = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    for (const record of referralHistory) {
      await ctx.db.delete(record._id);
    }

    console.log(`Deleted ${referralHistory.length} referral history records`);

    // Step 5: Reset application status to "Under Review"
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Under Review",
      adminRemarks: undefined,
      updatedAt: Date.now(),
      lastUpdatedBy: adminUser._id,
    });

    console.log(`Reset application status to "Under Review"`);

    // Step 6: Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "document_verification_reset",
      details: `Reset document verification for ${applicantName}. All ${resetCount} documents reset to Pending status. ${rejectionHistory.length} rejection records and ${referralHistory.length} referral records deleted.`,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    // Step 7: Notify the applicant
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: "Document Verification Reset",
      message: "Your document verification has been reset. An admin will review your documents shortly.",
      notificationType: "DocumentVerificationReset",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });

    return {
      success: true,
      message: `Successfully reset document verification for ${applicantName}`,
      stats: {
        documentsReset: resetCount,
        rejectionHistoryDeleted: rejectionHistory.length,
        referralHistoryDeleted: referralHistory.length,
      },
    };
  },
});
