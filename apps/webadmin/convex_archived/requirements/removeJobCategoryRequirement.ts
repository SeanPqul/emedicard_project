import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Delete a link between a job category and a document requirement
export const deleteJobCategoryRequirementMutation = mutation({
  args: {
    requirementId: v.id("jobCategoryDocuments")
  },
  handler: async (ctx, args) => {
    const { requirementId } = args;
    
    const existingRequirement = await ctx.db.get(requirementId) as Doc<"jobCategoryDocuments"> | null;
    if (!existingRequirement) {
      throw new Error("Job category requirement not found");
    }
    
    await ctx.db.delete(requirementId);
    return { success: true };
  },
});


// @deprecated - Use deleteJobCategoryRequirementMutation instead. This alias will be removed in a future release.
export const deleteJobCategoryRequirement = deleteJobCategoryRequirementMutation;
