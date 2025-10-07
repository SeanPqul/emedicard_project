import { query } from "../_generated/server";
import { v } from "convex/values";

// Get form documents with comprehensive requirements info
// @deprecated - Use getApplicationDocumentsRequirementsQuery for better naming consistency
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
        // SECURITY: Don't expose direct storage URLs
        // Documents should be accessed through secure endpoint with time-limited tokens

        return {
          ...doc,
          documentType,
          // fileUrl is intentionally not included for security
          documentName: documentType?.name ?? "Unknown Document", // Add documentName
          hasFile: !!doc.storageFileId, // Indicate if file exists without exposing URL
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

// New secure version that includes requirement field for document viewer
export const getApplicationDocumentsRequirementsQuery = query({
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
          isRequired: junctionRecord.isRequired,
          required: junctionRecord.isRequired, // Add alias for compatibility
          junctionId: junctionRecord._id
        };
      })
    );

    // Map uploaded documents with their types and requirement info
    const documentsWithTypes = await Promise.all(
      uploadedDocuments.map(async (doc) => {
        const documentType = await ctx.db.get(doc.documentTypeId);
        
        // Find the requirement for this document
        const requirement = documentTypes.find(dt => dt._id === doc.documentTypeId) || null;
        
        return {
          ...doc,
          documentType,
          // SECURITY: Don't expose direct storage URLs
          // fileUrl is intentionally not included - use secure access endpoint instead
          hasFile: !!doc.storageFileId,
          documentName: documentType?.name ?? "Unknown Document",
          requirement: requirement ? {
            _id: requirement._id,
            name: requirement.name,
            description: requirement.description || '',
            icon: requirement.icon || 'document-text',
            isRequired: requirement.isRequired,
            fieldIdentifier: requirement.fieldIdentifier || '',
          } : null,
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
