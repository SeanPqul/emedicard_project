import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllJobCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategory").collect();
    return categories;
  },
});

export const createJobCategory = mutation({
  args: {
    name: v.string(),
    colorCode: v.string(),
    requireOrientation: v.string(),
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

export const getJobCategoryById = query({
  args: { categoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    return category;
  },
});

export const updateJobCategory = mutation({
  args: {
    categoryId: v.id("jobCategory"),
    name: v.optional(v.string()),
    colorCode: v.optional(v.string()),
    requireOrientation: v.optional(v.string()),
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

export const deleteJobCategory = mutation({
  args: { categoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
  },
});
