import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createJobCategory = mutation({
  args: {
    name: v.string(),
    colorCode: v.string(),
    requireOrientation: v.boolean(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("jobCategory", {
      name: args.name,
      colorCode: args.colorCode,
      requireOrientation: args.requireOrientation,
    });

    return categoryId;
  },
});
