// convex/admin/documents/approveWithOnsiteVerification.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { AdminRole } from "../../users/roles";

/**
 * Approves a document after onsite verification (when applicant visits venue after treatment)
 * Updates referral history with verification details and approves the document
 */
export const approve = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    documentTypeId: v.id("documentTypes"),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check admin authorization
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");

    const identity = await ctx.auth.getUserIdentity();
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity!.subject))
      .unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // Get document upload details
    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) throw new Error("Document upload not found.");

    const application = await ctx.db.get(documentUpload.applicationId);
    if (!application) throw new Error("Application not found.");

    const documentType = await ctx.db.get(args.documentTypeId);
    const docName = documentType?.name || "a document";

    // Find the most recent referral history for this document
    const referralHistory = await ctx.db
      .query("documentReferralHistory")
      .withIndex("by_document_type", (q) =>
        q
          .eq("applicationId", documentUpload.applicationId)
          .eq("documentTypeId", args.documentTypeId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!referralHistory) {
      throw new Error(
        "No pending referral found for this document. The applicant may not have been referred to a doctor."
      );
    }

    // Update referral history with verification details
    await ctx.db.patch(referralHistory._id, {
      status: "cleared",
      verifiedBy: adminUser._id,
      verifiedAt: Date.now(),
      verificationNotes: args.verificationNotes,
    });

    // Approve the document
    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: "Approved",
      reviewedAt: Date.now(),
      reviewedBy: adminUser._id,
    });

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "onsite_verification_approval",
      details: `Approved document '${docName}' after onsite verification. ${
        args.verificationNotes
          ? `Verification notes: ${args.verificationNotes}`
          : "No additional notes provided."
      }`,
      timestamp: Date.now(),
      documentUploadId: args.documentUploadId,
      applicationId: application._id,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true };
  },
});
