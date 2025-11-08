// convex/admin/finalizeApplication.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";
import { internal } from "../_generated/api";

export const finalize = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Approved"), v.literal("Rejected")),
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // 1. Get all uploaded documents for this application to validate them.
    const uploadedDocs = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .collect();

    // 2. Perform validation on the backend for security.
    // Check for any documents still pending review
    if (uploadedDocs.some(doc => doc.reviewStatus === "Pending")) {
      throw new Error("Please review and assign a status (Approve, Refer, or Flag) to all documents before proceeding.");
    }

    // Check for documents that need referral/resubmission
    // "Rejected" (old), "Referred" (medical), "NeedsRevision" (document issue)
    const hasReferralsOrIssues = uploadedDocs.some(doc =>
      doc.reviewStatus === "Rejected" ||
      doc.reviewStatus === "Referred" ||
      doc.reviewStatus === "NeedsRevision"
    );

    if (args.newStatus === "Rejected" && !hasReferralsOrIssues) {
      throw new Error("To send referral notifications, at least one document must be referred or flagged.");
    }

    // Get application and applicant details for logging
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found.");
    
    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    // 3. THIS IS THE FIX: Determine the next status in the workflow.
    const nextApplicationStatus = args.newStatus === "Approved" 
      ? "Payment Validation" // If approved, move to payment validation.
      : "Rejected";           // If rejected, the process stops here.

    // 4. Update the application's overall status.
    await ctx.db.patch(args.applicationId, {
      applicationStatus: nextApplicationStatus,
      updatedAt: Date.now(),
      // We only set `approvedAt` at the very end of the whole process.
    });

    // 4.5. If sending referral/issue notifications, schedule batch notification
    if (args.newStatus === "Rejected") {
      // Schedule notifications for all pending referrals/issues
      // This will send proper medical terminology messages
      // @ts-ignore - Deep type instantiation limitation
      await ctx.scheduler.runAfter(0, internal.admin.documents.sendReferralNotifications.sendReferralNotifications, {
        applicationId: args.applicationId,
      });
    }

    // 5. Log admin activity with updated terminology
    const activityDetails = args.newStatus === "Approved"
      ? `Finalized document verification for ${applicant.fullname} - Approved and moved to ${nextApplicationStatus}`
      : `Sent referral/issue notifications for ${applicant.fullname}`;

    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: args.newStatus === "Approved" ? "application_finalization" : "referral_notifications_sent",
      details: activityDetails,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true, nextStatus: nextApplicationStatus };
  },
});
