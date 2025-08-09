import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const deleteJobCategory = mutation({
  args: { categoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
  },
});
