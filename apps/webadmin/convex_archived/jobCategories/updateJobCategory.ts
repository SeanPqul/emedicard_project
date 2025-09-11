import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const updateJobCategoryMutation = mutation({
  args: {
    categoryId: v.id("jobCategories"),
    name: v.optional(v.string()),
    colorCode: v.optional(v.string()),
    requireOrientation: v.optional(v.union(v.boolean(), v.string())),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;
    
    const category = await ctx.db.get(categoryId) as Doc<"jobCategories"> | null;
    if (!category) {
      throw new Error("Job category not found");
    }

    await ctx.db.patch(categoryId, updates);
    return categoryId;
  },
});
