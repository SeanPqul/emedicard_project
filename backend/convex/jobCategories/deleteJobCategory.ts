import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const deleteJobCategoryMutation = mutation({
  args: { categoryId: v.id("jobCategories") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.categoryId, {
      deletedAt: Date.now(),
    });
  },
});
