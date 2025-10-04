import { query } from "../_generated/server";
import { v } from "convex/values";

// Get application documents with comprehensive requirements info
export const getApplicationDocumentsRequirementsQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    // Get current user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Ensure the application belongs to the current user
    if (application.userId !== user._id) {
      throw new Error("Unauthorized: You can only view your own documents");
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

    // Get document requirements for this job category
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", application.jobCategoryId))
      .collect();

    // Get detailed document requirements with junction data
    const documentRequirements = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentTypeId);
        if (!docRequirement) {
          throw new Error(`Document requirement ${junctionRecord.documentTypeId} not found`);
        }
        return {
          ...docRequirement,
          required: junctionRecord.isRequired, // Override with junction table's required field
          junctionId: junctionRecord._id // Include junction record ID if needed
        };
      })
    );

    // Map uploaded documents with their requirements and storage URLs
    const documentsWithRequirements = await Promise.all(
      uploadedDocuments.map(async (doc) => {
        const requirement = await ctx.db.get(doc.documentTypeId);
        // Get the storage URL for the document
        const fileUrl = await ctx.storage.getUrl(doc.storageFileId);
        return {
          ...doc,
          requirement,
          fileUrl, // Include the URL for viewing
        };
      })
    );

    return {
      application,
      jobCategory,
      uploadedDocuments: documentsWithRequirements,
      requiredDocuments: documentRequirements,
      totalRequired: documentRequirements.length,
      totalUploaded: uploadedDocuments.length,
    };
  },
});

// Backward compatibility alias
export const getFormDocumentsRequirementsQuery = getApplicationDocumentsRequirementsQuery;
