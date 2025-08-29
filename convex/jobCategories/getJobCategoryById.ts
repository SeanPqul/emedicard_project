import { v } from "convex/values";
import { query } from "../_generated/server";

export const getJobCategoryByIdQuery = query({
  args: { categoryId: v.id("jobCategories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    return category;
  },
});
