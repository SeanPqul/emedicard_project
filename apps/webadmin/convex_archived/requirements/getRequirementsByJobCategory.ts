import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const getRequirementsByJobCategoryQuery = query({
  args: { jobCategoryId: v.id("jobCategories") },
  handler: async (ctx, args) => {
    const jobCategory = await ctx.db.get(args.jobCategoryId) as Doc<"jobCategories"> | null;
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Try to get requirements from database first
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    if (jobCategoryRequirements.length > 0) {
      // Get detailed document requirements for each junction record
      const transformedRequirements = await Promise.all(
        jobCategoryRequirements.map(async (junctionRecord) => {
          const docRequirement = await ctx.db.get(junctionRecord.documentTypeId) as Doc<"documentTypes"> | null;
          if (!docRequirement) {
            throw new Error(`Document requirement ${junctionRecord.documentTypeId} not found`);
          }
          return {
            name: docRequirement.name,
            description: docRequirement.description,
            icon: docRequirement.icon,
            isRequired: junctionRecord.isRequired, // From jobCategoryDocuments
            fieldIdentifier: docRequirement.fieldIdentifier // Changed from fieldName to fieldIdentifier
          };
        })
      );

      return {
        jobCategory,
        requirements: transformedRequirements,
        totalRequirements: jobCategoryRequirements.length
      };
    }

    // Return empty requirements array if no requirements are configured
    // This indicates that the job category needs to be properly configured with document requirements
    
    return {
      jobCategory,
      requirements: [],
      totalRequirements: 0
    };
  },
});
