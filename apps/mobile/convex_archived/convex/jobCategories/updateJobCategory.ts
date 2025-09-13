import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateJobCategoryMutation = mutation({
  args: {
    categoryId: v.id("jobCategories"),
    name: v.optional(v.string()),
    colorCode: v.optional(v.string()),
    requireOrientation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;
    
    const category = await ctx.db.get(categoryId);
    if (!category) {
      throw new Error("Job category not found");
    }

    await ctx.db.patch(categoryId, updates);
    return categoryId;
  },
});
