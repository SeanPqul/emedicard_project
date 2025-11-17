// convex/admin/rejectApplicationFinal.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";
import { requireWriteAccess } from "../users/permissions";

/**
 * Permanently reject an application (for severe issues, fraud, or when admin determines
 * the application should not continue). This is different from document/payment rejection
 * which allows resubmission.
 */
export const rejectFinal = mutation({
  args: {
    applicationId: v.id("applications"),
    rejectionReason: v.string(),
    rejectionCategory: v.union(
      v.literal("fraud_suspected"),
      v.literal("incomplete_information"),
      v.literal("does_not_meet_requirements"),
      v.literal("duplicate_application"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check
    
    // Prevent system admins from permanently rejecting applications (read-only oversight)
    await requireWriteAccess(ctx);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");
    
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // Get application and applicant details
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found.");
    
    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");
    
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory) throw new Error("Job category not found.");
    
    const now = Date.now();

    // Update application status to permanently rejected
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Rejected",
      adminRemarks: `Application permanently rejected by ${adminUser.fullname || adminUser.email}. Category: ${args.rejectionCategory}. Reason: ${args.rejectionReason}`,
      updatedAt: now,
      lastUpdatedBy: adminUser._id,
    });
    
    // Count rejected documents and payments for statistics
    const rejectedDocs = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    
    const rejectedPayments = await ctx.db
      .query("paymentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    
    // Create application rejection history record
    await ctx.db.insert("applicationRejectionHistory", {
      applicationId: args.applicationId,
      applicantName: applicant.fullname,
      applicantEmail: applicant.email,
      jobCategoryId: application.jobCategoryId,
      jobCategoryName: jobCategory.name,
      applicationType: application.applicationType,
      rejectionCategory: args.rejectionCategory as any,
      rejectionReason: args.rejectionReason,
      rejectionType: "manual",
      triggerSource: undefined, // Can be enhanced later to track where rejection came from
      totalDocumentsRejected: rejectedDocs.length,
      totalPaymentsRejected: rejectedPayments.length,
      rejectedBy: adminUser._id,
      rejectedByName: adminUser.fullname || adminUser.email,
      rejectedAt: now,
      notificationSent: true,
      notificationSentAt: now,
    });

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "application_final_rejection",
      details: `Permanently rejected application for ${applicant.fullname}. Category: ${args.rejectionCategory}. Reason: ${args.rejectionReason}`,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    // Send notification to applicant
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: "Application Rejected",
      message: `Your application has been permanently rejected.\n\nReason: ${args.rejectionReason}\n\nThis application can no longer be continued.\n\nIf you wish to obtain a Health Card, please create a new application and ensure all requirements are met.\n\nFor assistance, please contact our support team.`,
      notificationType: "application_rejected_final",
      isRead: false,
      jobCategoryId: application.jobCategoryId,
    });

    // Notify other admins
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    
    const otherRelevantAdmins = allAdmins.filter(admin => 
      admin._id !== adminUser._id && (
        !admin.managedCategories || 
        admin.managedCategories.length === 0 || 
        admin.managedCategories.includes(application.jobCategoryId)
      )
    );

    for (const admin of otherRelevantAdmins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        applicationId: args.applicationId,
        title: "Application Permanently Rejected",
        message: `${adminUser.fullname || adminUser.email} permanently rejected ${applicant.fullname}'s application. Reason: ${args.rejectionReason}`,
        notificationType: "application_rejection_info",
        isRead: false,
        jobCategoryId: application.jobCategoryId,
        actionUrl: `/dashboard/${args.applicationId}/doc_verif`,
      });
    }

    return { success: true, message: "Application permanently rejected." };
  },
});
