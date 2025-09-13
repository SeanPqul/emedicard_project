import { query } from "../_generated/server";
import { v } from "convex/values";

// Get form documents with comprehensive requirements info
export const getDocumentUploadsRequirementsQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Get uploaded documents
    const uploadedDocuments = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    // Get document types for this job category
    const jobCategoryDocuments = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", application.jobCategoryId))
      .collect();

    // Get detailed document types with junction data
    const documentTypes = await Promise.all(
      jobCategoryDocuments.map(async (junctionRecord) => {
        const documentType = await ctx.db.get(junctionRecord.documentTypeId);
        if (!documentType) {
          throw new Error(`Document type ${junctionRecord.documentTypeId} not found`);
        }
        return {
          ...documentType,
          isRequired: junctionRecord.isRequired, // Override with junction table's isRequired field
          junctionId: junctionRecord._id // Include junction record ID if needed
        };
      })
    );

    // Map uploaded documents with their types
    const documentsWithTypes = await Promise.all(
      uploadedDocuments.map(async (doc) => {
        const documentType = await ctx.db.get(doc.documentTypeId);
        const fileUrl = doc.storageFileId ? await ctx.storage.getUrl(doc.storageFileId) : null; // Fetch file URL

        return {
          ...doc,
          documentType,
          fileUrl, // Add fileUrl
          documentName: documentType?.name ?? "Unknown Document", // Add documentName
        };
      })
    );

    return {
      application,
      jobCategory,
      uploadedDocuments: documentsWithTypes,
      requiredDocuments: documentTypes,
      totalRequired: documentTypes.length,
      totalUploaded: uploadedDocuments.length,
    };
  },
});
