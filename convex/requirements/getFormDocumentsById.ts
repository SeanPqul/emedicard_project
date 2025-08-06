import { query } from "../_generated/server";
import { v } from "convex/values";

// Get form documents with requirements info
export const getFormDocumentsById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const jobCategory = await ctx.db.get(form.jobCategory);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Get uploaded documents
    const uploadedDocuments = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .collect();

    // Get document requirements for this job category
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryRequirements")
      .withIndex("by_category", (q) => q.eq("jobCategoryId", form.jobCategory))
      .collect();

    // Get detailed document requirements with junction data
    const documentRequirements = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentRequirementId);
        if (!docRequirement) {
          throw new Error(`Document requirement ${junctionRecord.documentRequirementId} not found`);
        }
        return {
          ...docRequirement,
          required: junctionRecord.required, // Override with junction table's required field
          junctionId: junctionRecord._id // Include junction record ID if needed
        };
      })
    );

    // Map uploaded documents with their requirements
    const documentsWithRequirements = await Promise.all(
      uploadedDocuments.map(async (doc) => {
        const requirement = await ctx.db.get(doc.documentRequirementId);
        return {
          ...doc,
          requirement,
        };
      })
    );

    return {
      form,
      jobCategory,
      uploadedDocuments: documentsWithRequirements,
      requiredDocuments: documentRequirements,
      totalRequired: documentRequirements.length,
      totalUploaded: uploadedDocuments.length,
    };
  },
});
