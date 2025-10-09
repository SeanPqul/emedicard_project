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
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!user || !jobCategory) return null;

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

        return {
          _id: req._id, // Add the requirement's ID
          requirementName: documentType?.name ?? "Unknown Requirement",
          isRequired: req.isRequired,
          // --- Data from the user's upload ---
          status: userUpload?.reviewStatus ?? "Missing", // Default to "Missing" if not uploaded
          fileUrl: fileUrl,
          uploadId: userUpload?._id, // The ID of the documentUploads record
          remarks: userUpload?.adminRemarks,
        };
      })
    );

    // 6. Return everything in one neat package
    return {
      applicantName: user.fullname,
      jobCategoryName: jobCategory.name,
      checklist: checklist,
    };
  },
});
