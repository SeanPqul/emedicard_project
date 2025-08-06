import { v } from "convex/values";
import { query } from "../_generated/server";

export const getPaymentByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();
    
    return payment;
  },
});
