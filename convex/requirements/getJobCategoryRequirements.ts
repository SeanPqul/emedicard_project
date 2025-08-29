import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all job category document requirements for a specific job category
export const getJobCategoryRequirementsQuery = query({
  args: { jobCategoryId: v.id("jobCategories") },
  handler: async (ctx, args) => {
    const jobCategoryDocuments = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    // Get detailed information for each requirement
    const detailedRequirements = await Promise.all(
      jobCategoryDocuments.map(async (junctionRecord) => {
        const documentType = await ctx.db.get(junctionRecord.documentTypeId);
        const jobCategory = await ctx.db.get(junctionRecord.jobCategoryId);
        
        return {
          _id: junctionRecord._id,
          jobCategory,
          documentType: documentType,
          isRequired: junctionRecord.isRequired
        };
      })
    );

    return detailedRequirements;
  },
});
