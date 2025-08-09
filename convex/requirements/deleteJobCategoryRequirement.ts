import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Delete a link between a job category and a document requirement
export const deleteJobCategoryRequirement = mutation({
  args: {
    requirementId: v.id("jobCategoryRequirements")
  },
  handler: async (ctx, args) => {
    const { requirementId } = args;
    
    const existingRequirement = await ctx.db.get(requirementId);
    if (!existingRequirement) {
      throw new Error("Job category requirement not found");
    }
    
    await ctx.db.delete(requirementId);
    return { success: true };
  },
});
