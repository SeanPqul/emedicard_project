// convex/admin/reviewDocument.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { AdminRole } from "../users/roles";

export const review = mutation({
  args: {
    // This is now the ID of the documentUploads record
    documentUploadId: v.id("documentUploads"),
    status: v.union(v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()),
    extractedText: v.optional(v.string()), // New field
    fileType: v.optional(v.string()), // New field
  },
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");

    const identity = await ctx.auth.getUserIdentity();
    const adminUser = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", identity!.subject)).unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // Get document upload details for logging
    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) throw new Error("Document upload not found.");

    const application = await ctx.db.get(documentUpload.applicationId);
    if (!application) throw new Error("Application not found.");

    const applicant = await ctx.db.get(application.userId);
    const documentType = await ctx.db.get(documentUpload.documentTypeId);
    const docName = documentType?.name || "a document";

    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: args.status,
      adminRemarks: args.remarks,
      reviewedAt: Date.now(),
      reviewedBy: adminUser._id,
      extractedText: args.extractedText, // Save extracted text
      fileType: args.fileType, // Save file type
    });

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "document_review",
      details: `${args.status} document '${docName}' for ${applicant?.fullname || "applicant"}. ${args.remarks ? `Remarks: ${args.remarks}` : ""}`,
      timestamp: Date.now(),
      documentUploadId: args.documentUploadId,
      applicationId: application._id,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true };
  },
});
