import { query } from "../_generated/server";
import { v } from "convex/values";

export const getFormDocuments = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .collect();

    return documents;
  },
});
