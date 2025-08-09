import { v } from "convex/values";
import { query } from "../_generated/server";

export const getPaymentByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, { formId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_form_id", (q) => q.eq("formId", formId))
      .unique();
  },
});
