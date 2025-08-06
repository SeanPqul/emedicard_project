import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Create a link between a job category and a document requirement
export const createJobCategoryRequirement = mutation({
  args: {
    jobCategoryId: v.id("jobCategory"),
    documentRequirementId: v.id("documentRequirements"),
    required: v.boolean()
  },
  handler: async (ctx, args) => {
    const { jobCategoryId, documentRequirementId, required } = args;
    
    // Check if this combination already exists
    const existingRequirement = await ctx.db
      .query("jobCategoryRequirements")
      .withIndex("by_category", (q) => q.eq("jobCategoryId", jobCategoryId))
      .filter((q) => q.eq(q.field("documentRequirementId"), documentRequirementId))
      .unique();
    
    if (existingRequirement) {
      throw new Error("This document requirement is already linked to this job category");
    }
    
    const newRequirementId = await ctx.db.insert("jobCategoryRequirements", {
      jobCategoryId,
      documentRequirementId,
      required
    });
    return newRequirementId;
  },
});
