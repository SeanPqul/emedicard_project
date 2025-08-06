import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Update an existing job category requirement
export const updateJobCategoryRequirement = mutation({
  args: {
    requirementId: v.id("jobCategoryRequirements"),
    required: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { requirementId, required } = args;
    
    const existingRequirement = await ctx.db.get(requirementId);
    if (!existingRequirement) {
      throw new Error("Job category requirement not found");
    }
    
    await ctx.db.patch(requirementId, { required });
    return requirementId;
  },
});
