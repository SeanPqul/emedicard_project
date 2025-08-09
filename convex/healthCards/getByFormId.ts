import { v } from "convex/values";
import { query } from "../_generated/server";

export const getHealthCardByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    return healthCard;
  },
});
