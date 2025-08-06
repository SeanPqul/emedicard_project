import { query } from "../_generated/server";
import { v } from "convex/values";

export const getRequirementsByJobCategory = query({
  args: { jobCategoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const jobCategory = await ctx.db.get(args.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Try to get requirements from database first
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryRequirements")
      .withIndex("by_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    if (jobCategoryRequirements.length > 0) {
      // Get detailed document requirements for each junction record
      const transformedRequirements = await Promise.all(
        jobCategoryRequirements.map(async (junctionRecord) => {
          const docRequirement = await ctx.db.get(junctionRecord.documentRequirementId);
          if (!docRequirement) {
            throw new Error(`Document requirement ${junctionRecord.documentRequirementId} not found`);
          }
          return {
            name: docRequirement.name,
            description: docRequirement.description,
            icon: docRequirement.icon,
            required: junctionRecord.required, // From jobCategoryRequirements
            fieldName: docRequirement.fieldName
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

