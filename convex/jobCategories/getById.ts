import { v } from "convex/values";
import { query } from "../_generated/server";

export const getJobCategoryById = query({
  args: { categoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    return category;
  },
});
