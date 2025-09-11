import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

// Update an existing job category requirement
export const updateJobCategoryRequirementMutation = mutation({
  args: {
    requirementId: v.id("jobCategoryDocuments"),
    isRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { requirementId, isRequired } = args;
    
    const existingRequirement = await ctx.db.get(requirementId) as Doc<"jobCategoryDocuments"> | null;
    if (!existingRequirement) {
      throw new Error("Job category requirement not found");
    }
    
    await ctx.db.patch(requirementId, { isRequired });
    return requirementId;
  },
});
