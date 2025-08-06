import { v } from "convex/values";
import { query } from "../_generated/server";

export const getFormById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }
    
    const jobCategory = await ctx.db.get(form.jobCategory);
    return {
      ...form,
      jobCategory,
    };
  },
});
