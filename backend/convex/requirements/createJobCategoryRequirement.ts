import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Create a link between a job category and a document requirement
export const createJobCategoryRequirementMutation = mutation({
  args: {
    jobCategoryId: v.id("jobCategories"),
    documentTypeId: v.id("documentTypes"),
    isRequired: v.boolean()
  },
  handler: async (ctx, args) => {
    const { jobCategoryId, documentTypeId, isRequired } = args;
    
    // Check if this combination already exists
    const existingRequirement = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", jobCategoryId))
      .filter((q) => q.eq(q.field("documentTypeId"), documentTypeId))
      .unique();
    
    if (existingRequirement) {
      throw new Error("This document requirement is already linked to this job category");
    }
    
    const newRequirementId = await ctx.db.insert("jobCategoryDocuments", {
      jobCategoryId,
      documentTypeId,
      isRequired
    });
    return newRequirementId;
  },
});


// @deprecated - Use createJobCategoryRequirementMutation instead. This alias will be removed in a future release.
export const createJobCategoryRequirement = createJobCategoryRequirementMutation;
