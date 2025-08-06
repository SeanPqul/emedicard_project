import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all job category requirements for a specific job category
export const getJobCategoryRequirements = query({
  args: { jobCategoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryRequirements")
      .withIndex("by_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    // Get detailed information for each requirement
    const detailedRequirements = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentRequirementId);
        const jobCategory = await ctx.db.get(junctionRecord.jobCategoryId);
        
        return {
          _id: junctionRecord._id,
          jobCategory,
          documentRequirement: docRequirement,
          required: junctionRecord.required
        };
      })
    );

    return detailedRequirements;
  },
});
