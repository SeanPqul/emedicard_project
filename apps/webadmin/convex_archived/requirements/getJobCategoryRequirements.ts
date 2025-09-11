import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

// Get all job category requirements for a specific job category
export const getJobCategoryRequirementsQuery = query({
  args: { jobCategoryId: v.id("jobCategories") },
  handler: async (ctx, args) => {
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    // Get detailed information for each requirement
    const detailedRequirements = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentTypeId) as Doc<"documentTypes"> | null;
        const jobCategory = await ctx.db.get(junctionRecord.jobCategoryId) as Doc<"jobCategories"> | null;
        
        return {
          _id: junctionRecord._id,
          jobCategory,
          documentRequirement: docRequirement,
          isRequired: junctionRecord.isRequired
        };
      })
    );

    return detailedRequirements;
  },
});
